import { useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisData, Contributor, Commit, FileNode } from "./types";
import { formatBytes, formatNumber, relativeTime, healthScore } from "./api";

const PALETTE = ["#FFCC00", "#B13BFF", "#471396", "#090040", "#E879F9", "#7C3AED", "#F59E0B", "#A855F7"];

// ───────────────────────── Stat Tile ─────────────────────────
export function StatTile({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass relative overflow-hidden rounded-2xl p-5 transition-transform hover:-translate-y-1 ${
        accent ? "glow-gold" : ""
      }`}
    >
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${accent ? "text-grad" : "text-foreground"}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      <div className="pointer-events-none absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-[var(--magenta)] opacity-10 blur-2xl" />
    </div>
  );
}

// ───────────────────── Language Donut (interactive) ─────────────────────
export function LanguageDonut({ languages }: { languages: Record<string, number> }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  let acc = 0;
  const r = 70;
  const c = 2 * Math.PI * r;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">Language atlas</h3>
        <span className="font-mono text-xs text-muted-foreground">{entries.length} detected</span>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No language data available.</p>
      ) : (
        <div className="grid items-center gap-6 md:grid-cols-2">
          <div className="relative mx-auto h-48 w-48">
            <svg viewBox="0 0 200 200" className="-rotate-90">
              <circle cx="100" cy="100" r={r} fill="none" stroke="var(--muted)" strokeWidth="22" />
              {entries.map(([name, bytes], i) => {
                const frac = bytes / total;
                const dash = frac * c;
                const offset = -acc * c;
                acc += frac;
                const color = PALETTE[i % PALETTE.length];
                const active = hover === name;
                return (
                  <circle
                    key={name}
                    cx="100"
                    cy="100"
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={active ? 28 : 22}
                    strokeDasharray={`${dash} ${c - dash}`}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-width 200ms" }}
                    onMouseEnter={() => setHover(name)}
                    onMouseLeave={() => setHover(null)}
                  />
                );
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {hover ? (
                <>
                  <span className="font-display text-2xl font-bold text-grad">
                    {((languages[hover] / total) * 100).toFixed(1)}%
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{hover}</span>
                </>
              ) : (
                <>
                  <span className="font-display text-2xl font-bold">{entries.length}</span>
                  <span className="font-mono text-xs text-muted-foreground">langs</span>
                </>
              )}
            </div>
          </div>
          <ul className="space-y-2">
            {entries.slice(0, 8).map(([name, bytes], i) => (
              <li
                key={name}
                onMouseEnter={() => setHover(name)}
                onMouseLeave={() => setHover(null)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm transition ${
                  hover === name ? "bg-[color-mix(in_oklab,var(--magenta)_15%,transparent)]" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span className="font-medium">{name}</span>
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {((bytes / total) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────── Contributor Orbit (experimental) ───────────────────
export function ContributorOrbit({ contributors }: { contributors: Contributor[] }) {
  const top = contributors.slice(0, 10);
  const max = top[0]?.contributions || 1;
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">Contributor orbit</h3>
        <span className="font-mono text-xs text-muted-foreground">top {top.length}</span>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        {/* concentric rings */}
        <div className="absolute inset-0 animate-spin-slow">
          {[0.95, 0.7, 0.45].map((s) => (
            <div
              key={s}
              className="absolute left-1/2 top-1/2 rounded-full border border-dashed"
              style={{
                width: `${s * 100}%`,
                height: `${s * 100}%`,
                transform: "translate(-50%, -50%)",
                borderColor: "color-mix(in oklab, var(--magenta) 30%, transparent)",
              }}
            />
          ))}
        </div>
        {/* core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-hero-grad text-xs font-bold text-white animate-pulse-glow">
            CORE
          </div>
        </div>
        {/* avatars */}
        {top.map((c, i) => {
          const angle = (i / top.length) * Math.PI * 2;
          const radius = 35 + (1 - c.contributions / max) * 12; // % of container
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          const size = 28 + (c.contributions / max) * 28;
          return (
            <a
              key={c.login}
              href={c.html_url}
              target="_blank"
              rel="noreferrer"
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <img
                src={c.avatar_url}
                alt={c.login}
                style={{ width: size, height: size }}
                className="rounded-full ring-2 ring-[var(--magenta)] transition-transform hover:scale-125"
                loading="lazy"
              />
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--ink)] px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                {c.login} · {c.contributions}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────── Commit Pulse (sparkline + list) ───────────────────
export function CommitPulse({ commits }: { commits: Commit[] }) {
  const buckets = useMemo(() => {
    const days = 30;
    const arr = new Array(days).fill(0);
    const now = Date.now();
    commits.forEach((c) => {
      const d = Math.floor((now - new Date(c.commit.author.date).getTime()) / 86_400_000);
      if (d >= 0 && d < days) arr[days - 1 - d] += 1;
    });
    return arr;
  }, [commits]);
  const max = Math.max(...buckets, 1);
  const points = buckets
    .map((v, i) => `${(i / (buckets.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(" ");
  const area = `0,100 ${points} 100,100`;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">Commit pulse</h3>
        <span className="font-mono text-xs text-muted-foreground">last {commits.length} commits</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-32 w-full">
        <defs>
          <linearGradient id="pulse-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#B13BFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#B13BFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#pulse-fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#FFCC00"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        {buckets.map((v, i) =>
          v > 0 ? (
            <circle
              key={i}
              cx={(i / (buckets.length - 1)) * 100}
              cy={100 - (v / max) * 100}
              r="0.9"
              fill="#FFCC00"
            />
          ) : null,
        )}
      </svg>
      <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
        {commits.slice(0, 8).map((c) => (
          <li key={c.sha} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50">
            {c.author?.avatar_url ? (
              <img src={c.author.avatar_url} alt="" className="h-7 w-7 rounded-full" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <a
                href={c.html_url}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-sm font-medium hover:text-[var(--magenta)]"
              >
                {c.commit.message.split("\n")[0]}
              </a>
              <div className="font-mono text-[11px] text-muted-foreground">
                {c.author?.login || c.commit.author.name} · {relativeTime(c.commit.author.date)} · {c.sha.slice(0, 7)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────── File Tree explorer ───────────────────
export function FileExplorer({ tree, ownerRepo }: { tree: FileNode[]; ownerRepo: string }) {
  const maxSize = Math.max(...tree.filter((n) => n.type === "file").map((n) => n.size), 1);
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">Root explorer</h3>
        <span className="font-mono text-xs text-muted-foreground">{ownerRepo}</span>
      </div>
      <ul className="grid gap-1 md:grid-cols-2">
        {tree.map((n) => (
          <li key={n.path}>
            <a
              href={n.html_url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-[color-mix(in_oklab,var(--magenta)_12%,transparent)]"
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded ${
                  n.type === "dir" ? "bg-gold-grad text-[var(--ink)]" : "bg-muted text-muted-foreground"
                } text-xs font-bold`}
              >
                {n.type === "dir" ? "▸" : "·"}
              </span>
              <span className="flex-1 truncate font-mono text-sm">{n.name}</span>
              {n.type === "file" && (
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full bg-gold-grad"
                      style={{ width: `${(n.size / maxSize) * 100}%` }}
                    />
                  </span>
                  <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">
                    {formatBytes(n.size)}
                  </span>
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────── Health Gauge ───────────────────
export function HealthGauge({ data }: { data: AnalysisData }) {
  const score = healthScore(data);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setShown(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const r = 64;
  const c = Math.PI * r; // half circle
  const dash = (shown / 100) * c;
  const label = score >= 80 ? "Healthy" : score >= 55 ? "Solid" : score >= 30 ? "Mixed" : "At risk";
  const factors = [
    { label: "Recently pushed", ok: (Date.now() - new Date(data.repo.pushed_at).getTime()) / 86_400_000 < 90 },
    { label: "Has README", ok: !!data.readme },
    { label: "Has license", ok: !!data.repo.license },
    { label: "Multiple contributors", ok: data.contributors.length > 1 },
    { label: "Has topics", ok: (data.repo.topics?.length || 0) > 0 },
    { label: "Issues under control", ok: data.repo.open_issues_count < 50 },
  ];

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold">Repo health</h3>
        <span className="font-mono text-xs text-muted-foreground">octoscore</span>
      </div>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 160 90" className="w-full max-w-[260px]">
          <defs>
            <linearGradient id="gauge" x1="0" x2="1">
              <stop offset="0%" stopColor="#471396" />
              <stop offset="60%" stopColor="#B13BFF" />
              <stop offset="100%" stopColor="#FFCC00" />
            </linearGradient>
          </defs>
          <path d={`M 16 80 A ${r} ${r} 0 0 1 144 80`} fill="none" stroke="var(--muted)" strokeWidth="12" strokeLinecap="round" />
          <path
            d={`M 16 80 A ${r} ${r} 0 0 1 144 80`}
            fill="none"
            stroke="url(#gauge)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ transition: "stroke-dasharray 200ms" }}
          />
        </svg>
        <div className="-mt-6 text-center">
          <div className="font-display text-5xl font-bold text-grad">{shown}</div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-1.5 text-xs">
        {factors.map((f) => (
          <li key={f.label} className="flex items-center gap-2">
            <span
              className={`grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold ${
                f.ok ? "bg-gold-grad text-[var(--ink)]" : "bg-muted text-muted-foreground"
              }`}
            >
              {f.ok ? "✓" : "·"}
            </span>
            <span className={f.ok ? "" : "text-muted-foreground line-through"}>{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────── Topic cloud ───────────────────
export function TopicCloud({ topics }: { topics: string[] }) {
  if (!topics?.length)
    return null;
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="mb-3 font-display text-lg font-semibold">Topic field</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((t, i) => (
          <span
            key={t}
            className="cursor-default rounded-full border border-[var(--magenta)]/40 px-3 py-1 font-mono text-xs transition hover:bg-gold-grad hover:text-[var(--ink)]"
            style={{ fontSize: `${0.75 + Math.max(0, 6 - i) * 0.04}rem` }}
          >
            #{t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────── Lifecycle timeline ───────────────────
export function Timeline({ data }: { data: AnalysisData }) {
  const items = [
    { label: "Created", date: data.repo.created_at },
    { label: "Last updated", date: data.repo.updated_at },
    { label: "Last push", date: data.repo.pushed_at },
  ];
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="mb-4 font-display text-lg font-semibold">Lifecycle</h3>
      <div className="relative">
        <div className="absolute left-3 top-0 h-full w-px bg-gradient-to-b from-[var(--violet)] via-[var(--magenta)] to-[var(--gold)]" />
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.label} className="relative pl-10">
              <span className="absolute left-1.5 top-1 grid h-4 w-4 place-items-center rounded-full bg-gold-grad ring-2 ring-background" />
              <div className="text-sm font-semibold">{i.label}</div>
              <div className="font-mono text-xs text-muted-foreground">
                {new Date(i.date).toLocaleDateString()} · {relativeTime(i.date)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────── Theme toggle ───────────────────
export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);
  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="glass grid h-10 w-10 place-items-center rounded-full text-sm transition hover:scale-110"
      aria-label="Toggle theme"
    >
      {dark ? "☼" : "☾"}
    </button>
  );
}

// ─────────────────── Helpers exports ───────────────────
export { formatBytes, formatNumber, relativeTime };
