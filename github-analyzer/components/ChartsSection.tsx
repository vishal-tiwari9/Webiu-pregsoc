'use client';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { RepoAnalysis } from '@/lib/types';

interface Props { details: RepoAnalysis[] }

const DIFF_COLORS: Record<string, string> = {
  Beginner: '#00e5a0',
  Intermediate: '#ffb347',
  Advanced: '#ff5f6d',
};
const LANG_COLORS = ['#00d4ff','#b060ff','#00e5a0','#ffb347','#ff5f6d','#60c0ff','#ff80c0','#80ffb0'];

const fmtNum = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);

function ChartCard({ title, subtitle, children, span = 1 }: { title: string; subtitle?: string; children: React.ReactNode; span?: number }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '24px 20px',
      gridColumn: span > 1 ? `span ${span}` : undefined,
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'Space Mono, monospace' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      fontFamily: 'Space Mono, monospace',
    }}>
      {label && <div style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{fmtNum(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

export default function ChartsSection({ details }: Props) {
  const valid = details.filter(d => d.data && !d.error);
  if (!valid.length) return null;

  // --- Data transforms ---
  const repoNames = valid.map(d => d.data!.full_name.split('/')[1] || d.data!.name);

  const starsForksData = valid.map((d, i) => ({
    name: repoNames[i],
    Stars: d.data!.stargazers_count,
    Forks: d.data!.forks_count,
    Watchers: d.data!.watchers_count,
  }));

  const diffPieData = [
    { name: 'Beginner', value: details.filter(d => d.difficulty === 'Beginner').length },
    { name: 'Intermediate', value: details.filter(d => d.difficulty === 'Intermediate').length },
    { name: 'Advanced', value: details.filter(d => d.difficulty === 'Advanced').length },
  ].filter(d => d.value > 0);

  const scoreData = valid.map((d, i) => ({
    name: repoNames[i],
    Activity: d.activityScore,
    Complexity: d.complexityScore * 10,
  }));

  const contribData = valid.map((d, i) => ({
    name: repoNames[i],
    Contributors: d.data!.contributorsCount,
    Issues: d.data!.openIssuesCount,
    PRs: d.data!.openPRCount,
  }));

  // Language aggregation across all repos
  const langMap: Record<string, number> = {};
  valid.forEach(d => {
    Object.entries(d.data!.languageBytes || {}).forEach(([lang, bytes]) => {
      langMap[lang] = (langMap[lang] || 0) + bytes;
    });
  });
  const langPieData = Object.entries(langMap)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Activity vs Complexity scatter
  const scatterData = valid.map((d, i) => ({
    x: d.activityScore,
    y: d.complexityScore,
    z: d.data!.stargazers_count,
    name: repoNames[i],
    diff: d.difficulty,
  }));

  // Radar data (first 4 repos or all if fewer)
  const radarRepos = valid.slice(0, 5);
  const radarData = [
    { metric: 'Stars', ...Object.fromEntries(radarRepos.map((d,i) => [repoNames[i], Math.min(d.data!.stargazers_count / 3000, 100)])) },
    { metric: 'Forks', ...Object.fromEntries(radarRepos.map((d,i) => [repoNames[i], Math.min(d.data!.forks_count / 1000, 100)])) },
    { metric: 'Activity', ...Object.fromEntries(radarRepos.map((d,i) => [repoNames[i], d.activityScore])) },
    { metric: 'Complexity', ...Object.fromEntries(radarRepos.map((d,i) => [repoNames[i], d.complexityScore * 10])) },
    { metric: 'Contributors', ...Object.fromEntries(radarRepos.map((d,i) => [repoNames[i], Math.min(d.data!.contributorsCount / 20, 100)])) },
    { metric: 'Issues', ...Object.fromEntries(radarRepos.map((d,i) => [repoNames[i], Math.min((d.data!.openIssuesCount || 0) / 5, 100)])) },
  ];
  const radarColors = ['#00d4ff','#b060ff','#00e5a0','#ffb347','#ff5f6d'];

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string;
  }) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {name}
      </text>
    );
  };

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 13, fontFamily: 'Space Mono, monospace', color: 'var(--text3)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Visual Analytics
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 20 }}>

        {/* Stars & Forks Bar Chart */}
        <ChartCard title="Stars & Forks Comparison" subtitle="Cross-repo engagement metrics">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={starsForksData} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" />
              <XAxis dataKey="name" tick={{ fill: '#7a9cc0', fontSize: 11 }} angle={-20} textAnchor="end" />
              <YAxis tickFormatter={fmtNum} tick={{ fill: '#7a9cc0', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#7a9cc0' }} />
              <Bar dataKey="Stars" fill="#00d4ff" radius={[4,4,0,0]} />
              <Bar dataKey="Forks" fill="#b060ff" radius={[4,4,0,0]} />
              <Bar dataKey="Watchers" fill="#00e5a0" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Difficulty Pie */}
        <ChartCard title="Difficulty Distribution" subtitle="Beginner / Intermediate / Advanced breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={diffPieData}
                cx="50%" cy="50%"
                outerRadius={100}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {diffPieData.map((entry) => (
                  <Cell key={entry.name} fill={DIFF_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#7a9cc0' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Activity vs Complexity */}
        <ChartCard title="Activity & Complexity Scores" subtitle="0–100 normalized scores per repo">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={scoreData} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" />
              <XAxis dataKey="name" tick={{ fill: '#7a9cc0', fontSize: 11 }} angle={-20} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fill: '#7a9cc0', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#7a9cc0' }} />
              <Bar dataKey="Activity" fill="#00d4ff" radius={[4,4,0,0]} />
              <Bar dataKey="Complexity" fill="#ff5f6d" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Language Bytes Pie */}
        {langPieData.length > 0 && (
          <ChartCard title="Language Distribution" subtitle="Aggregate bytes across all repos">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={langPieData}
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.04 ? `${name} ${(percent*100).toFixed(0)}%` : ''}
                >
                  {langPieData.map((_, idx) => (
                    <Cell key={idx} fill={LANG_COLORS[idx % LANG_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} formatter={(v: number) => `${(v/1000).toFixed(0)}k bytes`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Contributors / Issues / PRs */}
        <ChartCard title="Contributors & Open Issues" subtitle="Community engagement per repository">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={contribData} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" />
              <XAxis dataKey="name" tick={{ fill: '#7a9cc0', fontSize: 11 }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fill: '#7a9cc0', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#7a9cc0' }} />
              <Bar dataKey="Contributors" fill="#00e5a0" radius={[4,4,0,0]} />
              <Bar dataKey="Issues" fill="#ffb347" radius={[4,4,0,0]} />
              <Bar dataKey="PRs" fill="#b060ff" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar */}
        {radarRepos.length >= 2 && (
          <ChartCard title="Multi-Metric Radar" subtitle="Normalized comparison across key signals">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1a2840" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#7a9cc0', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#3d5570', fontSize: 9 }} />
                {radarRepos.map((_, i) => (
                  <Radar
                    key={i}
                    name={repoNames[i]}
                    dataKey={repoNames[i]}
                    stroke={radarColors[i]}
                    fill={radarColors[i]}
                    fillOpacity={0.1}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12, color: '#7a9cc0' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Activity Line Trend (sorted) */}
        <ChartCard title="Activity Score Trend" subtitle="Repos ranked by activity score">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={[...scoreData].sort((a, b) => a.Activity - b.Activity)}
              margin={{ top: 5, right: 10, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" />
              <XAxis dataKey="name" tick={{ fill: '#7a9cc0', fontSize: 11 }} angle={-20} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fill: '#7a9cc0', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Activity" stroke="#00d4ff" strokeWidth={2} dot={{ fill: '#00d4ff', r: 5 }} />
              <Line type="monotone" dataKey="Complexity" stroke="#ff5f6d" strokeWidth={2} dot={{ fill: '#ff5f6d', r: 5 }} strokeDasharray="5 5" />
              <Legend wrapperStyle={{ fontSize: 12, color: '#7a9cc0' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Scatter: Activity vs Complexity */}
        {scatterData.length >= 2 && (
          <ChartCard title="Activity vs Complexity Scatter" subtitle="Bubble size = star count">
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2840" />
                <XAxis type="number" dataKey="x" name="Activity" domain={[0, 100]} tick={{ fill: '#7a9cc0', fontSize: 11 }} label={{ value: 'Activity', position: 'insideBottom', offset: -10, fill: '#7a9cc0', fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Complexity" domain={[0, 10]} tick={{ fill: '#7a9cc0', fontSize: 11 }} label={{ value: 'Complexity', angle: -90, position: 'insideLeft', fill: '#7a9cc0', fontSize: 11 }} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                        <div style={{ color: 'var(--text)', fontWeight: 700 }}>{d.name}</div>
                        <div style={{ color: '#00d4ff' }}>Activity: {d.x}</div>
                        <div style={{ color: '#ff5f6d' }}>Complexity: {d.y}</div>
                        <div style={{ color: '#ffb347' }}>Stars: {fmtNum(d.z)}</div>
                        <div style={{ color: DIFF_COLORS[d.diff] }}>{d.diff}</div>
                      </div>
                    );
                  }}
                />
                {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <Scatter
                    key={diff}
                    name={diff}
                    data={scatterData.filter(d => d.diff === diff)}
                    fill={DIFF_COLORS[diff]}
                    opacity={0.85}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12, color: '#7a9cc0' }} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

      </div>
    </div>
  );
}
