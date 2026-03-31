'use client';

interface Props {
  summary: { totalRepos: number; beginner: number; intermediate: number; advanced: number };
  timestamp: string;
}

export default function SummaryCards({ summary, timestamp }: Props) {
  const cards = [
    { label: 'Total Repos', value: summary.totalRepos, color: '#00d4ff', icon: '⬡' },
    { label: 'Beginner', value: summary.beginner, color: '#00e5a0', icon: '◆' },
    { label: 'Intermediate', value: summary.intermediate, color: '#ffb347', icon: '◈' },
    { label: 'Advanced', value: summary.advanced, color: '#ff5f6d', icon: '◉' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontFamily: 'Space Mono, monospace', color: 'var(--text3)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Analysis Summary
        </h3>
        <span style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: 'var(--text3)' }}>
          {new Date(timestamp).toLocaleString()}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '24px 28px',
            borderLeft: `3px solid ${card.color}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 32px ${card.color}18`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, letterSpacing: '0.5px' }}>{card.label}</span>
              <span style={{ color: card.color, fontSize: 16 }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
