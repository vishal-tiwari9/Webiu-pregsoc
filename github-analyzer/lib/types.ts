export interface RepoData {
  id: number;
  full_name: string;
  name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  languages: string[];
  languageBytes: Record<string, number>;
  contributorsCount: number;
  openIssuesCount: number;
  openPRCount: number;
  lastCommit: string | null;
  license: string | null;
  readmeFull: string;
  fileCount: number;
  html_url: string;
  created_at: string;
  updated_at: string;
  topics: string[];
  size: number;
}

export interface RepoAnalysis {
  repo: string;
  data?: RepoData;
  activityScore: number;
  complexityScore: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  error?: string;
}

export interface AnalysisReport {
  timestamp: string;
  summary: {
    totalRepos: number;
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  details: RepoAnalysis[];
}
