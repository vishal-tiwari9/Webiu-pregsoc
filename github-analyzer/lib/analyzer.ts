import NodeCache from 'node-cache';
import { getRepoData } from './api';
import { RepoData, RepoAnalysis, AnalysisReport } from './types';

const cache = new NodeCache({ stdTTL: 3600 });

const EXAMPLE_REPOS = [
  'expressjs/express',
  'freeCodeCamp/freeCodeCamp',
  'angular/angular',
  'tensorflow/tensorflow',
];

export function computeScores(data: RepoData): Pick<RepoAnalysis, 'activityScore' | 'complexityScore' | 'difficulty'> {
  const { stargazers_count: stars, forks_count: forks, languages, fileCount, contributorsCount = 0, openIssuesCount = 0, openPRCount = 0 } = data;
  const uniqueLangs = languages?.length ?? 0;

  let activity = 0;
  activity += Math.min((forks / 100) * 10, 20);
  activity += Math.min((stars / 1000) * 30, 30);
  activity += Math.min(contributorsCount * 0.5, 10);
  activity += Math.min((openIssuesCount + openPRCount) / 10, 10);
  activity = Math.min(activity, 100);

  let complexity = 0;
  complexity += Math.min(fileCount / 1000, 4);
  complexity += uniqueLangs * 0.4;
  complexity += (openIssuesCount + openPRCount) / 100;
  complexity += contributorsCount / 50;
  complexity = Math.min(Math.max(complexity, 0), 10);

  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  if (activity < 20 && complexity < 3) difficulty = 'Beginner';
  else if (complexity > 7 || activity > 80) difficulty = 'Advanced';
  else difficulty = 'Intermediate';

  return { activityScore: Math.round(activity), complexityScore: Math.round(complexity * 10) / 10, difficulty };
}

export async function analyzeRepos(repoUrls: string[]): Promise<RepoAnalysis[]> {
  const results: RepoAnalysis[] = [];
  const repos = repoUrls.length ? repoUrls : EXAMPLE_REPOS;

  for (const url of repos) {
    const slug = url.replace('https://github.com/', '').replace(/\/$/, '');
    const parts = slug.split('/').filter(Boolean);
    if (parts.length < 2) {
      results.push({ repo: url, activityScore: 0, complexityScore: 0, difficulty: 'Beginner', error: 'Invalid URL' });
      continue;
    }
    const [owner, repo] = parts.slice(-2);
    const cacheKey = `${owner}/${repo}`;
    let data = cache.get<RepoData>(cacheKey);

    if (!data) {
      const fetched = await getRepoData(owner, repo);
      if ('error' in fetched) {
        results.push({ repo: url, activityScore: 0, complexityScore: 0, difficulty: 'Beginner', error: fetched.error });
        continue;
      }
      data = fetched;
      cache.set(cacheKey, data);
    }

    const scores = computeScores(data);
    results.push({ repo: url, data, ...scores });
  }
  return results;
}

export async function generateReport(results: RepoAnalysis[]): Promise<AnalysisReport> {
  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalRepos: results.length,
      beginner: results.filter((r) => r.difficulty === 'Beginner').length,
      intermediate: results.filter((r) => r.difficulty === 'Intermediate').length,
      advanced: results.filter((r) => r.difficulty === 'Advanced').length,
    },
    details: results,
  };
}
