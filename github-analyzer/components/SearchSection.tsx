'use client';
import { useState } from 'react';

interface Props {
  onAnalyze: (input: string, useExamples?: boolean) => void;
  loading: boolean;
}

export default function SearchSection({ onAnalyze, loading }: Props) {
  const [input, setInput] = useState('');

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(176,96,255,0.04))',
      border: '1px solid var(--border)',
      borderRadius: 16, padding: '32px 36px', marginBottom: 40,
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
        Analyze Repositories
      </h2>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Enter GitHub repo URLs (owner/repo or full URL), comma-separated
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && input.trim() && onAnalyze(input)}
          placeholder="e.g. facebook/react, vercel/next.js, microsoft/vscode"
          disabled={loading}
          style={{
            flex: 1, minWidth: 280,
            background: 'var(--bg2)', border: '1px solid var(--border2)',
            borderRadius: 10, padding: '14px 18px',
            color: 'var(--text)', fontSize: 14,
            fontFamily: 'Space Mono, monospace',
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border2)')}
        />
        <button
          onClick={() => input.trim() && onAnalyze(input)}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim()
              ? 'rgba(0,212,255,0.1)'
              : 'linear-gradient(135deg, #00d4ff, #0098cc)',
            border: 'none', borderRadius: 10,
            color: loading || !input.trim() ? 'var(--text3)' : '#070b11',
            padding: '14px 28px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
            letterSpacing: '0.5px', transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze →'}
        </button>
        <button
          onClick={() => onAnalyze('', true)}
          disabled={loading}
          style={{
            background: 'rgba(176,96,255,0.08)', border: '1px solid rgba(176,96,255,0.25)',
            borderRadius: 10, color: 'var(--purple)',
            padding: '14px 22px', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(176,96,255,0.15)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(176,96,255,0.08)')}
        >
          Load Examples
        </button>
      </div>
      <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
        Tip: Add GITHUB_TOKEN to .env.local for higher rate limits (5000 req/hr vs 60/hr unauthenticated)
      </p>
    </div>
  );
}
