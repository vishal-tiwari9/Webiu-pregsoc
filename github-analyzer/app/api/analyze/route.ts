import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepos, generateReport } from '@/lib/analyzer';

export async function POST(req: NextRequest) {
  try {
    const { repos } = await req.json();
    if (!repos || !Array.isArray(repos) || repos.length === 0)
      return NextResponse.json({ error: 'Provide repos array' }, { status: 400 });
    const results = await analyzeRepos(repos);
    const report = await generateReport(results);
    return NextResponse.json(report);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
