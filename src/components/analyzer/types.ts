export interface Repo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  owner: { login: string; avatar_url: string; html_url: string };
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  subscribers_count?: number;
  open_issues_count: number;
  size: number;
  default_branch: string;
  language: string | null;
  topics: string[];
  license: { name: string; spdx_id: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  network_count?: number;
}

export interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface Commit {
  sha: string;
  html_url: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
  author?: { login: string; avatar_url: string } | null;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  html_url: string;
}

export interface AnalysisData {
  repo: Repo;
  languages: Record<string, number>;
  contributors: Contributor[];
  commits: Commit[];
  tree: FileNode[];
  readme: string | null;
  summary: string;
}
