'use client';
import { RepoAnalysis } from '@/lib/types';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
} from 'recharts';

interface Props {
  analysis: RepoAnalysis;
  onClose: () => void;
}

const LANG_COLORS = ['#00d4ff','#b060ff','#00e5a0','#ffb347','#ff5f6d','#60c0ff','#ff80c0','#80ffb0'];

const fmtNum = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);
const fmtBytes = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}MB` : n >= 1000 ? `${(n/1000).toFixed(0)}KB` : `${n}B`;

const DIFF_COLOR: Record<string, string> = {
  Beginner: '#00e5a0',
  Intermediate: '#ffb347',
  Advanced: '#ff5f6d',
};

function StatItem({ label, value, color = 'var(--text)' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
      <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'Space Mono, monospace' }}>{value}</span>
    </div>
  );
}

export default function RepoDetailPanel({ analysis, onClose }: Props) {
  const { data, activityScore, complexityScore, difficulty } = analysis;
  if (!data) return null;

  const langData = Object.entries(data.languageBytes || {})
    .sort(([,a],[,b]) => b - a)
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const totalBytes = langData.reduce((s, d) => s + d.value, 0);

  const radialData = [
    { name: 'Activity', value: activityScore, fill: '#00d4ff' },
    { name: 'Complexity', value: complexityScore * 10, fill: '#ff5f6d' },
  ];

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${DIFF_COLOR[difficulty]}`,
      borderRadius: 14, padding: '32px 36px', marginBottom: 40,
      position: 'relative',
    }}>
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          color: 'var(--text2)', width: 32, height: 32, borderRadius: 8,
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >×</button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        {data.owner.avatar_url && (
          <img src={data.owner.avatar_url} alt="" width={52} height={52} style={{ borderRadius: 12, border: '2px solid var(--border2)' }} />
        )}
        <div>
          <a
            href={data.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', textDecoration: 'none', letterSpacing: '-0.5px' }}
          >
            {data.full_name}
          </a>
          {data.description && (
            <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4, lineHeight: 1.5 }}>{data.description}</p>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {data.topics?.slice(0, 6).map(t => (
              <span key={t} style={{
                fontSize: 11, padding: '3px 8px',
                background: 'rgba(176,96,255,0.1)', border: '1px solid rgba(176,96,255,0.25)',
                borderRadius: 4, color: '#b060ff', fontFamily: 'Space Mono, monospace',
              }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
          <span style={{
            fontSize: 14, fontWeight: 700, padding: '8px 18px',
            borderRadius: 8, fontFamily: 'Space Mono, monospace',
            color: DIFF_COLOR[difficulty],
            background: `${DIFF_COLOR[difficulty]}15`,
            border: `1px solid ${DIFF_COLOR[difficulty]}40`,
          }}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 24, marginBottom: 36 }}>
        <StatItem label="Stars" value={fmtNum(data.stargazers_count)} color="#ffb347" />
        <StatItem label="Forks" value={fmtNum(data.forks_count)} color="#b060ff" />
        <StatItem label="Watchers" value={fmtNum(data.watchers_count)} color="#00d4ff" />
        <StatItem label="Contributors" value={fmtNum(data.contributorsCount)} color="#00e5a0" />
        <StatItem label="Open Issues" value={data.openIssuesCount} color="#ffb347" />
        <StatItem label="Open PRs" value={data.openPRCount} color="#b060ff" />
        <StatItem label="Repo Size" value={`${(data.size / 1024).toFixed(1)}MB`} color="var(--text2)" />
        <StatItem label="License" value={data.license || 'None'} color="var(--text2)" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

        {/* Radial score chart */}
        <div>
          <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginBottom: 12, letterSpacing: '1px' }}>
            SCORE GAUGES
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'Activity', value: activityScore, max: 100, color: '#00d4ff' },
              { label: 'Complexity', value: complexityScore, max: 10, color: '#ff5f6d' },
            ].map(gauge => (
              <div key={gauge.label} style={{ flex: 1, textAlign: 'center' }}>
                <ResponsiveContainer width="100%" height={120}>
                  <RadialBarChart
                    cx="50%" cy="70%"
                    innerRadius="60%"
                    outerRadius="100%"
                    startAngle={180} endAngle={0}
                    data={[{ value: (gauge.value / gauge.max) * 100, fill: gauge.color }]}
                  >
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#1a2840' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ fontSize: 22, fontWeight: 800, color: gauge.color, fontFamily: 'Space Mono, monospace', marginTop: -20 }}>
                  {gauge.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginTop: 4 }}>
                  {gauge.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language pie */}
        {langData.length > 0 && (
          <div>
            <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginBottom: 12, letterSpacing: '1px' }}>
              LANGUAGE BREAKDOWN
            </p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={langData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {langData.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtBytes(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {langData.slice(0, 5).map((l, i) => (
                  <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: LANG_COLORS[i % LANG_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'Space Mono, monospace', flex: 1 }}>{l.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
                      {((l.value / totalBytes) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div style={{
        display: 'flex', gap: 24, flexWrap: 'wrap',
        padding: '16px 20px', background: 'var(--bg2)',
        borderRadius: 10, fontSize: 12, fontFamily: 'Space Mono, monospace', color: 'var(--text3)',
      }}>
        {data.language && <span>Primary: <strong style={{ color: 'var(--text2)' }}>{data.language}</strong></span>}
        {data.lastCommit && <span>Last commit: <strong style={{ color: 'var(--text2)' }}>{new Date(data.lastCommit).toLocaleDateString()}</strong></span>}
        <span>Created: <strong style={{ color: 'var(--text2)' }}>{new Date(data.created_at).getFullYear()}</strong></span>
        <a href={data.html_url} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--accent)', textDecoration: 'none', marginLeft: 'auto' }}>
          View on GitHub →
        </a>
      </div>

      {/* README Preview */}
      {data.readmeFull && (
        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace', marginBottom: 12, letterSpacing: '1px' }}>
            README PREVIEW
          </p>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '20px', maxHeight: 240, overflowY: 'auto',
            fontSize: 13, color: 'var(--text2)', lineHeight: 1.8,
            fontFamily: 'Space Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {data.readmeFull.slice(0, 1500)}{data.readmeFull.length > 1500 ? '\n\n[... truncated]' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
