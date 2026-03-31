'use client';
import { RepoAnalysis } from '@/lib/types';

interface Props {
  details: RepoAnalysis[];
  selected: RepoAnalysis | null;
  onSelect: (a: RepoAnalysis | null) => void;
}

const DIFF_COLOR: Record<string, string> = {
  Beginner: '#00e5a0',
  Intermediate: '#ffb347',
  Advanced: '#ff5f6d',
};

const fmtNum = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: 'Space Mono, monospace', color: 'var(--text2)', minWidth: 28, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

export default function RepoTable({ details, selected, onSelect }: Props) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 13, fontFamily: 'Space Mono, monospace', color: 'var(--text3)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Repository Details
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
          Click a row for details
        </span>
      </div>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 80px 80px 80px 100px 120px 120px 110px',
          gap: 0,
          padding: '12px 20px',
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          fontSize: 11, fontFamily: 'Space Mono, monospace',
          color: 'var(--text3)', letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          <div>Repository</div>
          <div style={{ textAlign: 'right' }}>Stars</div>
          <div style={{ textAlign: 'right' }}>Forks</div>
          <div style={{ textAlign: 'right' }}>Contribs</div>
          <div>Languages</div>
          <div>Activity</div>
          <div>Complexity</div>
          <div>Difficulty</div>
        </div>

        {/* Rows */}
        {details.map((d, i) => {
          const isSelected = selected?.repo === d.repo;
          const isError = !!d.error;
          return (
            <div
              key={d.repo}
              onClick={() => !isError && onSelect(isSelected ? null : d)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 80px 80px 80px 100px 120px 120px 110px',
                gap: 0,
                padding: '16px 20px',
                borderBottom: i < details.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: isError ? 'default' : 'pointer',
                background: isSelected ? 'rgba(0,212,255,0.05)' : 'transparent',
                transition: 'background 0.15s',
                alignItems: 'center',
              }}
              onMouseEnter={e => { if (!isSelected && !isError) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(0,212,255,0.05)' : 'transparent'; }}
            >
              {/* Repo name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {d.data?.owner?.avatar_url && (
                    <img src={d.data.owner.avatar_url} alt="" width={20} height={20} style={{ borderRadius: '50%', opacity: 0.8 }} />
                  )}
                  <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                    {d.data?.full_name || d.repo}
                  </span>
                  {isSelected && <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'Space Mono, monospace' }}>▼</span>}
                </div>
                {isError ? (
                  <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'Space Mono, monospace' }}>⚠ {d.error}</span>
                ) : d.data?.description ? (
                  <span style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>
                    {d.data.description}
                  </span>
                ) : null}
              </div>

              {/* Stars */}
              <div style={{ fontSize: 13, fontFamily: 'Space Mono, monospace', color: '#ffb347', textAlign: 'right' }}>
                {d.data ? fmtNum(d.data.stargazers_count) : '—'}
              </div>

              {/* Forks */}
              <div style={{ fontSize: 13, fontFamily: 'Space Mono, monospace', color: '#b060ff', textAlign: 'right' }}>
                {d.data ? fmtNum(d.data.forks_count) : '—'}
              </div>

              {/* Contributors */}
              <div style={{ fontSize: 13, fontFamily: 'Space Mono, monospace', color: '#00e5a0', textAlign: 'right' }}>
                {d.data ? fmtNum(d.data.contributorsCount) : '—'}
              </div>

              {/* Languages */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {d.data?.languages?.slice(0, 3).map(lang => (
                  <span key={lang} style={{
                    fontSize: 10, padding: '2px 6px',
                    background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                    borderRadius: 4, color: '#00d4ff', fontFamily: 'Space Mono, monospace',
                  }}>{lang}</span>
                ))}
              </div>

              {/* Activity */}
              <div style={{ paddingRight: 8 }}>
                <ScoreBar value={d.activityScore} max={100} color="#00d4ff" />
              </div>

              {/* Complexity */}
              <div style={{ paddingRight: 8 }}>
                <ScoreBar value={d.complexityScore} max={10} color="#ff5f6d" />
              </div>

              {/* Difficulty badge */}
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px',
                  borderRadius: 6, fontFamily: 'Space Mono, monospace',
                  color: DIFF_COLOR[d.difficulty],
                  background: `${DIFF_COLOR[d.difficulty]}18`,
                  border: `1px solid ${DIFF_COLOR[d.difficulty]}40`,
                }}>
                  {d.difficulty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
