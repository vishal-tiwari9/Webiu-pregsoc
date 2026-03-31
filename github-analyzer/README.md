# GitHub Repo Intelligence Analyzer v2 — Next.js + TypeScript

A full-stack Next.js 14 app that analyzes GitHub repositories for activity, complexity, and learning difficulty — with rich Recharts visualizations.

## Features
- **8 chart types**: Bar charts, Pie charts, Radar, Line, Scatter, Radial gauge, Donut
- Stars, Forks, Watchers comparisons
- Language distribution pie (aggregate + per-repo)
- Activity & Complexity score bars
- Contributors / Issues / PRs breakdown
- Multi-metric Radar overlay
- Activity vs Complexity Scatter (bubble = star count)
- Per-repo detail panel with README preview

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add API Key
Copy `.env.local.example` to `.env.local` and fill in:
```
GITHUB_TOKEN=your_token_here
```

**Get a token at:** https://github.com/settings/tokens  
**Required scopes:** `public_repo`, `read:user`

> Without a token: 60 req/hr unauthenticated  
> With a token: 5000 req/hr

### 3. Run
```bash
npm run dev       # http://localhost:3000
npm run build     # Production build
npm start         # Serve production
```

## API Keys Required

| Key | Where to get | Required? |
|-----|-------------|-----------|
| `GITHUB_TOKEN` | https://github.com/settings/tokens | Recommended (else rate limited) |

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Recharts** for all visualizations
- **@octokit/rest** GitHub API client
- **node-cache** 1hr TTL caching
