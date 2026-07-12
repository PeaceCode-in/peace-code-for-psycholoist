import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ResourceCard } from "@/components/resources/ResourceCard";
import {
  search as searchResources, FORMAT_LABELS, CATEGORIES, DIFFICULTIES, LANGUAGES,
  recentSearches, pushSearch, TRENDING_SEARCHES, type ResourceFormat, type CategorySlug, type Difficulty, type Language,
} from "@/lib/resources-store";
import { Search as SearchIcon, Mic, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "all").default("all"),
  format: fallback(z.string(), "all").default("all"),
  difficulty: fallback(z.string(), "all").default("all"),
  language: fallback(z.string(), "all").default("all"),
  sort: fallback(z.string(), "recommended").default("recommended"),
  saved: fallback(z.boolean(), false).default(false),
  completed: fallback(z.boolean(), false).default(false),
});

export const Route = createFileRoute("/resources/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Search — Resources" }] }),
  component: SearchPage,
});

const SORTS: { k: string; label: string }[] = [
  { k: "recommended", label: "Recommended" },
  { k: "trending", label: "Trending" },
  { k: "newest", label: "Newest" },
  { k: "views", label: "Most viewed" },
  { k: "likes", label: "Most liked" },
  { k: "rating", label: "Highest rated" },
  { k: "shortest", label: "Shortest" },
  { k: "longest", label: "Longest" },
  { k: "az", label: "A → Z" },
];

const FORMATS: ResourceFormat[] = Object.keys(FORMAT_LABELS) as ResourceFormat[];

function SearchPage() {
  const params = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(params.q);
  const [listening, setListening] = useState(false);

  useEffect(() => setQ(params.q), [params.q]);

  const results = useMemo(() => searchResources(params.q, {
    category: params.category as CategorySlug | "all",
    format: params.format as ResourceFormat | "all",
    difficulty: params.difficulty as Difficulty | "all",
    language: params.language as Language | "all",
    saved: params.saved,
    completed: params.completed,
    sort: params.sort as any,
  }), [params]);

  function submit(query: string) {
    pushSearch(query);
    navigate({ search: (p) => ({ ...p, q: query }) });
  }

  function startVoice() {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { alert("Voice search isn't supported on this device — try typing."); return; }
    const rec = new SR(); rec.lang = "en-IN"; rec.interimResults = false;
    setListening(true);
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setQ(t); submit(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  }

  const recents = recentSearches();

  return (
    <AppShell>
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Search bar */}
        <div className="rounded-3xl p-4 sm:p-5 flex items-center gap-3"
          style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-border)" }}>
          <SearchIcon className="w-5 h-5 opacity-60"/>
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(q); }}
            placeholder="Search articles, meditations, podcasts, worksheets…"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:opacity-40"
            style={{ color: "var(--pc-ink)" }} aria-label="Search resources"/>
          {q && <button onClick={() => { setQ(""); submit(""); }} aria-label="Clear"><X className="w-4 h-4 opacity-60"/></button>}
          <button onClick={startVoice} aria-label="Voice search"
            className="w-10 h-10 rounded-full flex items-center justify-center transition"
            style={{ background: listening ? "var(--pc-primary)" : "var(--pc-surface2)", color: listening ? "#fff" : "var(--pc-muted)" }}>
            <Mic className="w-4 h-4"/>
          </button>
        </div>

        {!params.q && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "var(--pc-muted)" }}>Recent</div>
              <div className="flex flex-wrap gap-2">
                {recents.length === 0 && <span className="text-[12px]" style={{ color: "var(--pc-muted)" }}>No recent searches yet.</span>}
                {recents.map(s => (
                  <button key={s} onClick={() => { setQ(s); submit(s); }} className="text-[12px] px-3 py-1.5 rounded-full"
                    style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-border)", color: "var(--pc-ink)" }}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "var(--pc-muted)" }}>Trending</div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map(s => (
                  <button key={s} onClick={() => { setQ(s); submit(s); }} className="text-[12px] px-3 py-1.5 rounded-full"
                    style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-border)", color: "var(--pc-ink)" }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Pill label="Category" value={params.category} options={[{ v: "all", l: "All" }, ...CATEGORIES.map(c => ({ v: c.slug, l: c.name }))]}
            onChange={v => navigate({ search: (p) => ({ ...p, category: v }) })}/>
          <Pill label="Format" value={params.format} options={[{ v: "all", l: "All" }, ...FORMATS.map(f => ({ v: f, l: FORMAT_LABELS[f] }))]}
            onChange={v => navigate({ search: (p) => ({ ...p, format: v }) })}/>
          <Pill label="Difficulty" value={params.difficulty} options={[{ v: "all", l: "Any" }, ...DIFFICULTIES.map(d => ({ v: d, l: d }))]}
            onChange={v => navigate({ search: (p) => ({ ...p, difficulty: v }) })}/>
          <Pill label="Language" value={params.language} options={[{ v: "all", l: "Any" }, ...LANGUAGES.map(l => ({ v: l, l }))]}
            onChange={v => navigate({ search: (p) => ({ ...p, language: v }) })}/>
          <Pill label="Sort" value={params.sort} options={SORTS.map(s => ({ v: s.k, l: s.label }))}
            onChange={v => navigate({ search: (p) => ({ ...p, sort: v }) })}/>
          <Toggle label="Saved" active={params.saved} onChange={v => navigate({ search: (p) => ({ ...p, saved: v }) })}/>
          <Toggle label="Completed" active={params.completed} onChange={v => navigate({ search: (p) => ({ ...p, completed: v }) })}/>
        </div>

        {/* Results */}
        <div className="mt-6 flex items-center justify-between mb-4">
          <div className="text-[13px]" style={{ color: "var(--pc-muted)" }}>
            {results.length} result{results.length === 1 ? "" : "s"}{params.q ? ` for "${params.q}"` : ""}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-3xl p-10 text-center" style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-border)" }}>
            <div className="text-4xl mb-3">🍃</div>
            <div className="font-serif text-[20px]" style={{ color: "var(--pc-ink)" }}>Nothing quite matches yet.</div>
            <p className="text-[13px] mt-2" style={{ color: "var(--pc-muted)" }}>Try a softer word, or browse <Link to="/resources/categories" className="underline">categories</Link>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map(r => <ResourceCard key={r.id} r={r}/>)}
          </div>
        )}
      </main>
    </AppShell>
  );
}

function Pill({ label, value, options, onChange }: { label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) {
  return (
    <label className="relative flex items-center rounded-full px-3 py-1.5 gap-2 text-[12px]"
      style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-border)", color: "var(--pc-ink)" }}>
      <span style={{ color: "var(--pc-muted)" }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-transparent outline-none pr-1">
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
function Toggle({ label, active, onChange }: { label: string; active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!active)} className="px-3 py-1.5 rounded-full text-[12px] transition"
      style={{ background: active ? "var(--pc-soft)" : "var(--pc-surface)", border: "1px solid var(--pc-border)", color: active ? "var(--pc-primary)" : "var(--pc-muted)" }}>
      {label}
    </button>
  );
}
