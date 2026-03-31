import { Octokit } from '@octokit/rest';
import { RepoData } from './types';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
  userAgent: 'github-repo-analyzer/2.0.0',
});

export async function getRepoData(owner: string, repo: string): Promise<RepoData | { error: string }> {
  try {
    const [repoInfo, contributorsResp, languagesResp] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listContributors({ owner, repo, per_page: 100 }),
      octokit.rest.repos.listLanguages({ owner, repo }),
    ]);

    const contributors = (contributorsResp.data || []).filter(
      (c) => c && c.contributions > 0
    );

    const [issuesSearch, prSearch, commitsResp] = await Promise.all([
      octokit.rest.search.issuesAndPullRequests({
        q: `repo:${owner}/${repo} type:issue state:open`,
      }),
      octokit.rest.search.issuesAndPullRequests({
        q: `repo:${owner}/${repo} type:pr state:open`,
      }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 1 }),
    ]);

    let license: string | null = null;
    try {
      const licenseResp = await octokit.rest.licensing.getRepoLicense({ owner, repo });
      license = licenseResp.data?.license?.name || null;
    } catch {}

    let readme = '';
    try {
      const { data } = await octokit.rest.repos.getReadme({ owner, repo });
      readme = Buffer.from(data.content, 'base64').toString().slice(0, 3000);
    } catch {}

    const languageBytes = languagesResp.data as Record<string, number>;
    const languages = Object.keys(languageBytes);

    return {
      ...repoInfo.data,
      topics: repoInfo.data.topics || [],
      contributorsCount: contributors.length,
      openIssuesCount: issuesSearch.data.total_count,
      openPRCount: prSearch.data.total_count,
      lastCommit: commitsResp.data[0]?.commit?.author?.date || null,
      license,
      readmeFull: readme,
      languages,
      languageBytes,
      fileCount: 0,
    } as RepoData;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching ${owner}/${repo}:`, msg);
    return { error: msg };
  }
}
