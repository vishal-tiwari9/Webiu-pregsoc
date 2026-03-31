'use client';
import { useState } from 'react';
import { AnalysisReport, RepoAnalysis } from '@/lib/types';
import SearchSection from '@/components/SearchSection';
import SummaryCards from '@/components/SummaryCards';
import ChartsSection from '@/components/ChartsSection';
import RepoTable from '@/components/RepoTable';
import RepoDetailPanel from '@/components/RepoDetailPanel';

export default function Home() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<RepoAnalysis | null>(null);

  async function analyze(input: string, useExamples = false) {
    setLoading(true); setError(''); setReport(null); setSelected(null);
    try {
      let res;
      if (useExamples) {
        res = await fetch('/api/examples');
      } else {
        const repos = input.split(',').map(s => s.trim()).filter(Boolean);
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repos }),
        });
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(0,212,255,0.04) 0%, transparent 100%)',
        padding: '28px 40px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: 'linear-gradient(135deg, #00d4ff22, #b060ff22)',
          border: '1px solid rgba(0,212,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>⬡</div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            GitHub Repo Intelligence
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'Space Mono, monospace', marginTop: 2 }}>
            ACTIVITY · COMPLEXITY · DIFFICULTY
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontSize: 11, fontFamily: 'Space Mono, monospace',
            color: 'var(--text3)', padding: '4px 10px',
            border: '1px solid var(--border)', borderRadius: 4,
          }}>v2.0 · Next.js + TypeScript</span>
        </div>
      </header>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 100px' }}>
        <SearchSection onAnalyze={analyze} loading={loading} />

        {error && (
          <div style={{
            background: 'rgba(255,95,109,0.08)', border: '1px solid rgba(255,95,109,0.25)',
            borderRadius: 10, padding: '14px 18px', color: 'var(--red)',
            marginTop: 20, fontFamily: 'Space Mono, monospace', fontSize: 13,
          }}>
            ⚠ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 48, height: 48,
              border: '2px solid rgba(0,212,255,0.1)',
              borderTop: '2px solid var(--accent)',
              borderRadius: '50%', margin: '0 auto 20px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text2)', fontFamily: 'Space Mono, monospace', fontSize: 13 }}>
              Fetching repository intelligence...
            </p>
          </div>
        )}

        {!loading && !report && (
          <EmptyState onLoadExamples={() => analyze('', true)} />
        )}

        {!loading && report && (
          <div className="fade-up">
            <SummaryCards summary={report.summary} timestamp={report.timestamp} />
            <ChartsSection details={report.details} />
            <RepoTable details={report.details} selected={selected} onSelect={setSelected} />
            {selected && <RepoDetailPanel analysis={selected} onClose={() => setSelected(null)} />}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onLoadExamples }: { onLoadExamples: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 56, marginBottom: 24, opacity: 0.4 }}>⬡</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>No repositories analyzed yet</h2>
      <p style={{ color: 'var(--text2)', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px', lineHeight: 1.7, fontSize: 15 }}>
        Enter GitHub repo URLs above (comma-separated), or load example repositories to see charts and insights.
      </p>
      <button onClick={onLoadExamples} style={{
        background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
        color: 'var(--accent)', padding: '12px 28px', borderRadius: 8, cursor: 'pointer',
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.5px',
        transition: 'all 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.15)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')}
      >
        Load Example Repos
      </button>
    </div>
  );
}
