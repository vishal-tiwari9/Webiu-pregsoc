import { NextResponse } from 'next/server';
import { analyzeRepos, generateReport } from '@/lib/analyzer';

export async function GET() {
  try {
    const results = await analyzeRepos([]);
    const report = await generateReport(results);
    return NextResponse.json(report);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
  }
}
