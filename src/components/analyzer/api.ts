import type { AnalysisData, Repo, Contributor, Commit, FileNode } from "./types";

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Accept "owner/repo" shorthand
  const shorthand = trimmed.match(/^([\w.-]+)\/([\w.-]+?)(?:\.git)?$/);
  if (shorthand) return { owner: shorthand[1], repo: shorthand[2] };
  try {
    const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!/github\.com$/i.test(u.hostname)) return null;
    const parts = u.pathname.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { Accept: "application/vnd.github+json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Repository not found");
    if (res.status === 403) throw new Error("GitHub API rate limit reached. Try again in a few minutes.");
    throw new Error(`GitHub API error (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeRepo(repo: Repo, readme: string | null): string {
  const desc = (repo.description || "").trim();
  const cleaned = readme ? stripMarkdown(readme) : "";
  const firstSentence = cleaned
    .split(/(?<=[.!?])\s+/)
    .find((s) => s.length > 40 && s.length < 260 && /[a-zA-Z]/.test(s));

  const languageHints = Object.keys({ [repo.language || ""]: 1 })
    .filter(Boolean)
    .join(", ");

  if (desc && firstSentence) {
    return `${desc}. ${firstSentence}`;
  }
  if (desc) {
    return languageHints
      ? `${desc}. Primary stack appears to include ${languageHints}.`
      : `${desc}.`;
  }
  if (firstSentence) {
    return firstSentence;
  }
  return "No clear summary available from the repository metadata yet.";
}

export async function analyze(owner: string, repo: string): Promise<AnalysisData> {
  const repoData = await gh<Repo>(`/repos/${owner}/${repo}`);
  const [languages, contributors, commits, treeRes] = await Promise.all([
    gh<Record<string, number>>(`/repos/${owner}/${repo}/languages`).catch(() => ({})),
    gh<Contributor[]>(`/repos/${owner}/${repo}/contributors?per_page=12`).catch(() => []),
    gh<Commit[]>(`/repos/${owner}/${repo}/commits?per_page=30`).catch(() => []),
    gh<FileNode[]>(`/repos/${owner}/${repo}/contents/`).catch(() => []),
  ]);

  let readme: string | null = null;
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/README.md`);
    if (r.ok) readme = (await r.text()).slice(0, 4000);
  } catch {
    // ignore
  }

  const tree = Array.isArray(treeRes)
    ? treeRes
        .map((n) => ({
          name: n.name,
          path: n.path,
          type: n.type,
          size: n.size,
          html_url: n.html_url,
        }))
        .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "dir" ? -1 : 1))
    : [];

  const summary = summarizeRepo(repoData, readme);
  return { repo: repoData, languages, contributors, commits, tree, readme, summary };
}

// Derived metrics
export function healthScore(d: AnalysisData): number {
  const r = d.repo;
  const pushedRecency = Math.max(0, 1 - daysSince(r.pushed_at) / 365);
  const popularity = Math.min(1, Math.log10((r.stargazers_count || 0) + 1) / 4);
  const community = Math.min(1, d.contributors.length / 10);
  const docs = d.readme ? 1 : 0;
  const license = r.license ? 1 : 0;
  const issues = Math.max(0, 1 - r.open_issues_count / 200);
  const score = pushedRecency * 0.25 + popularity * 0.2 + community * 0.2 + docs * 0.15 + license * 0.1 + issues * 0.1;
  return Math.round(score * 100);
}

export function daysSince(iso: string): number {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function relativeTime(iso: string): string {
  const d = daysSince(iso);
  if (d < 1) return "today";
  if (d < 30) return `${Math.round(d)}d ago`;
  if (d < 365) return `${Math.round(d / 30)}mo ago`;
  return `${(d / 365).toFixed(1)}y ago`;
}
