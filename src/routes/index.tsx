import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { analyze, parseRepoUrl, formatNumber } from "@/components/analyzer/api";
import type { AnalysisData } from "@/components/analyzer/types";
import {
  StatTile,
  LanguageDonut,
  ContributorOrbit,
  CommitPulse,
  FileExplorer,
  HealthGauge,
  TopicCloud,
  Timeline,
  ThemeToggle,
} from "@/components/analyzer/widgets";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { Terminal, TypingLine, OutputLine } from "@/components/ui/terminal";

export const Route = createFileRoute("/")({
  component: Index,
});

const SAMPLES = ["facebook/react", "vercel/next.js", "tanstack/router", "torvalds/linux"];

function Index() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  async function run(value: string) {
    const parsed = parseRepoUrl(value);
    if (!parsed) {
      setError("Enter a GitHub URL or owner/repo");
      return;
    }
    setError(null);
    setLoading(true);
    setData(null);
    try {
      const res = await analyze(parsed.owner, parsed.repo);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze repository");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen">
      {/* nav */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-hero-grad font-display text-sm font-bold text-white shadow-lg">
            ⌬
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-none">Octoscope</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              github · radiology
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden font-mono text-xs text-muted-foreground hover:text-foreground md:inline"
          >
            powered by github public api
          </a>
          <ThemeToggle />
        </div>
      </header>

      {/* hero */}
      <section className="relative px-6 pb-12 pt-6 md:px-10 md:pt-12">
        <div className="absolute inset-x-0 top-0 -z-10 grid-bg opacity-30" style={{ height: 500 }} />
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--magenta)]/40 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
            live analyzer
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            Read a repo like an <span className="text-grad">x‑ray</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Paste any GitHub link and Octoscope dissects it into languages, contributors, commit pulse, file
            anatomy and an instant health score.
          </p>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
            }}
            className="glass mx-auto mt-9 flex max-w-3xl items-center gap-2 rounded-2xl p-2 glow"
          >
            <span className="hidden h-10 items-center px-3 font-mono text-sm text-muted-foreground md:flex">
              github.com/
            </span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="owner/repo  or  https://github.com/owner/repo"
              className="h-12 flex-1 bg-transparent px-3 font-mono text-sm outline-none placeholder:text-muted-foreground/60"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-gold-grad px-6 font-display text-sm font-bold text-[var(--ink)] transition hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Scanning…" : "Analyze →"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground">try:</span>
            {SAMPLES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  run(s);
                }}
                className="rounded-full border border-[var(--magenta)]/30 px-3 py-1 font-mono text-xs transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                {s}
              </button>
            ))}
          </div>
          {error && <div className="mt-4 font-mono text-sm text-destructive">{error}</div>}
        </div>
      </section>

      {/* loading state */}
      {loading && (
        <section className="px-6 pb-20 md:px-10">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="glass h-40 animate-pulse rounded-2xl"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </section>
      )}

      {/* results */}
      {data && !loading && <Results data={data} />}

      {/* empty-state */}
      {!data && !loading && (
        <>
          {/* live terminal demo */}
          <section className="mx-auto max-w-3xl px-6 pb-16 md:px-10">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-2xl">live trace</h2>
              <span className="text-xs text-muted-foreground">simulation</span>
            </div>
            <Terminal title="octoscope ~ scan facebook/react">
              <TypingLine text="octoscope analyze facebook/react" />
              <OutputLine className="text-[#E8BCB9]/70">→ fetching repo metadata…</OutputLine>
              <TypingLine text="parse languages --weighted" prompt="›" delay={1400} />
              <OutputLine>
                JavaScript <span className="text-[#AE445A]">68.4%</span> · TypeScript{" "}
                <span className="text-[#AE445A]">21.0%</span> · CSS{" "}
                <span className="text-[#AE445A]">3.1%</span>
              </OutputLine>
              <TypingLine text="health --score --factors" prompt="›" delay={3200} />
              <OutputLine>
                octoscore: <span className="text-[#E8BCB9]">94</span> · status:{" "}
                <span className="text-[#E8BCB9]">healthy ✓</span>
              </OutputLine>
              <TypingLine text="done. paste any repo above ↑" prompt="✓" delay={4800} />
            </Terminal>
          </section>

          {/* features grid */}
          <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { t: "Language atlas", d: "Interactive donut breakdown by bytes, with hover focus." },
                { t: "Contributor orbit", d: "Top contributors arranged by gravity around the repo core." },
                { t: "Commit pulse", d: "30‑day spark heartbeat of recent activity." },
                { t: "Octoscore", d: "Composite health gauge across recency, docs, license, community." },
                { t: "Root explorer", d: "Top‑level files & folders sized by bytes." },
                { t: "Lifecycle timeline", d: "Creation, update and push checkpoints." },
              ].map((f, i) => (
                <div
                  key={f.t}
                  className="glass animate-float rounded-2xl p-6"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    0{i + 1}
                  </div>
                  <h3 className="mt-2 font-display text-lg">{f.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                </div>
              ))}
            </div>
          </section>

          {/* macbook scroll narrative */}
          <section className="overflow-hidden">
            <MacbookScroll
              title={
                <span>
                  ship‑ready insights, <span className="text-grad">on every scroll.</span>
                </span>
              }
            >
              <div className="grid h-full w-full place-items-center bg-hero-grad p-6 text-center text-white">
                <div>
                  <div className="font-display text-4xl">⌬ Octoscope</div>
                  <div className="mt-2 text-sm opacity-80">turning commit chaos into clone-worthy clarity.</div>
                </div>
              </div>
            </MacbookScroll>
          </section>
        </>
      )}

      <footer className="border-t border-border/40 px-6 py-6 text-center font-mono text-xs text-muted-foreground md:px-10">
        Octoscope · client‑side analysis using GitHub public REST API · unauthenticated requests are rate limited
      </footer>
    </main>
  );
}

function Results({ data }: { data: AnalysisData }) {
  const r = data.repo;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 md:px-10">
      {/* header card */}
      <div className="glass relative mb-6 overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-hero-grad opacity-30 blur-3xl" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={r.owner.avatar_url}
              alt={r.owner.login}
              className="h-16 w-16 rounded-2xl ring-2 ring-[var(--gold)]"
            />
            <div>
              <a
                href={r.html_url}
                target="_blank"
                rel="noreferrer"
                className="font-display text-2xl font-bold hover:text-[var(--magenta)]"
              >
                {r.full_name}
              </a>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{r.description || "No description."}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                {r.language && (
                  <span className="rounded-full bg-muted px-2 py-0.5">{r.language}</span>
                )}
                {r.license && (
                  <span className="rounded-full bg-muted px-2 py-0.5">{r.license.spdx_id || r.license.name}</span>
                )}
                <span>default · {r.default_branch}</span>
                {r.homepage && (
                  <a href={r.homepage} target="_blank" rel="noreferrer" className="text-[var(--magenta)] hover:underline">
                    homepage ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <StatTile label="Stars" value={formatNumber(r.stargazers_count)} accent />
        <StatTile label="Forks" value={formatNumber(r.forks_count)} />
        <StatTile label="Watchers" value={formatNumber(r.subscribers_count ?? r.watchers_count)} />
        <StatTile label="Open issues" value={formatNumber(r.open_issues_count)} />
        <StatTile label="Size" value={`${(r.size / 1024).toFixed(1)} MB`} />
        <StatTile label="Contributors" value={data.contributors.length || "—"} />
      </div>

      {/* main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LanguageDonut languages={data.languages} />
        </div>
        <HealthGauge data={data} />
        <ContributorOrbit contributors={data.contributors} />
        <div className="lg:col-span-2">
          <CommitPulse commits={data.commits} />
        </div>
        <div className="lg:col-span-2">
          <FileExplorer tree={data.tree} ownerRepo={r.full_name} />
        </div>
        <Timeline data={data} />
        <div className="glass rounded-2xl p-6 lg:col-span-3">
          <h3 className="font-display text-lg font-semibold">What this repo does</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        </div>
        {r.topics?.length > 0 && (
          <div className="lg:col-span-3">
            <TopicCloud topics={r.topics} />
          </div>
        )}
        {data.readme && (
          <div className="glass rounded-2xl p-6 lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">README excerpt</h3>
              <a
                href={`${r.html_url}#readme`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-[var(--magenta)] hover:underline"
              >
                read full ↗
              </a>
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-4 font-mono text-xs leading-relaxed">
              {data.readme}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
