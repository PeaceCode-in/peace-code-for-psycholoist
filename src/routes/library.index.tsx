import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Bookmark, Eye, Calendar, ExternalLink } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLivePieces, createPiece, toggleFeatured, readingTimeMin, excerpt,
  type PieceFormat, type PieceStatus, type PieceAudience,
} from "@/lib/library-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/library/")({ component: LibraryIndex });

const FORMAT_COLOR: Record<PieceFormat, { bg: string; fg: string }> = {
  Article: { bg: "#F1E9DA", fg: "#7A5A18" },
  Worksheet: { bg: "#E4EFE0", fg: "#3E6A2E" },
  Guide: { bg: "#EFE4F0", fg: "#5F3F60" },
  Video: { bg: "#F1C7D6", fg: "#7A2A46" },
  Podcast: { bg: "#EADFE2", fg: "#1E1418" },
  Talk: { bg: "#DDE6F0", fg: "#274865" },
  Presentation: { bg: "#F0E4D8", fg: "#6A4A28" },
  Announcement: { bg: "#F6F1F2", fg: "#7B6A70" },
};

const STATUS_LABEL: Record<PieceStatus, string> = {
  draft: "Draft", in_review: "In review", scheduled: "Scheduled", published: "Published", archived: "Archived",
};

function LibraryIndex() {
  const hydrated = useHydrated();
  const nav = useNavigate();
  const pieces = useLivePieces();
  const [q, setQ] = useState("");
  const [format, setFormat] = useState<PieceFormat | "all">("all");
  const [status, setStatus] = useState<PieceStatus | "all">("all");
  const [audience, setAudience] = useState<PieceAudience | "all">("all");
  const [chip, setChip] = useState<"all" | "drafts" | "published" | "featured" | "this-month" | "most-viewed">("all");
  const [sort, setSort] = useState<"recent" | "views" | "alpha" | "read">("recent");

  const filtered = useMemo(() => {
    const now = Date.now();
    const monthAgo = now - 30 * 86_400_000;
    let list = pieces.filter((p) => {
      if (format !== "all" && p.format !== format) return false;
      if (status !== "all" && p.status !== status) return false;
      if (audience !== "all" && p.audience !== audience) return false;
      if (chip === "drafts" && p.status !== "draft") return false;
      if (chip === "published" && p.status !== "published") return false;
      if (chip === "featured" && !p.featured) return false;
      if (chip === "this-month" && (p.publishedAt ?? p.updatedAt) < monthAgo) return false;
      if (chip === "most-viewed" && p.analytics.views < 1000) return false;
      if (q) {
        const ql = q.toLowerCase();
        if (!p.title.toLowerCase().includes(ql) && !(p.subtitle ?? "").toLowerCase().includes(ql) && !p.tags.some((t) => t.includes(ql))) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      if (sort === "views") return b.analytics.views - a.analytics.views;
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (sort === "read") return readingTimeMin(a.blocks) - readingTimeMin(b.blocks);
      return b.updatedAt - a.updatedAt;
    });
    return list;
  }, [pieces, q, format, status, audience, chip, sort]);

  const onNew = () => {
    const p = createPiece({ title: "Untitled piece", format: "Article", category: "Growth", audience: "public" });
    nav({ to: "/library/$pid", params: { pid: p.id } });
  };

  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading library…</div>;

  const chips: Array<{ v: typeof chip; label: string }> = [
    { v: "all", label: "All" }, { v: "drafts", label: "Drafts" }, { v: "published", label: "Published" },
    { v: "featured", label: "Featured" }, { v: "this-month", label: "This month" }, { v: "most-viewed", label: "Most viewed" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, subtitle, tag" className="w-full h-9 pl-9 pr-3 rounded-full border text-[13px] outline-none"
            style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.ink, fontFamily: "'DM Sans', sans-serif" }} />
        </div>
        <FilterPill label="Format" value={format} onChange={(v) => setFormat(v as PieceFormat | "all")}
          options={[{ v: "all", label: "All" }, ...(Object.keys(FORMAT_COLOR) as PieceFormat[]).map((k) => ({ v: k, label: k }))]} />
        <FilterPill label="Status" value={status} onChange={(v) => setStatus(v as PieceStatus | "all")}
          options={[{ v: "all", label: "All" }, ...(Object.keys(STATUS_LABEL) as PieceStatus[]).map((k) => ({ v: k, label: STATUS_LABEL[k] }))]} />
        <FilterPill label="Audience" value={audience} onChange={(v) => setAudience(v as PieceAudience | "all")}
          options={[{ v: "all", label: "All" }, { v: "public", label: "Public" }, { v: "patients", label: "Patients" }, { v: "students", label: "Students" }, { v: "team", label: "Team" }]} />
        <FilterPill label="Sort" value={sort} onChange={(v) => setSort(v as typeof sort)}
          options={[{ v: "recent", label: "Recent" }, { v: "views", label: "Most viewed" }, { v: "alpha", label: "A→Z" }, { v: "read", label: "Reading time" }]} />
        <button onClick={onNew} className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" /> New piece
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {chips.map((c) => (
          <button key={c.v} onClick={() => setChip(c.v)} className="rounded-full px-3 py-1 text-[11.5px] transition-all"
            style={{ background: chip === c.v ? palette.ink : "rgba(255,255,255,0.6)", color: chip === c.v ? "#fff" : palette.muted, border: `1px solid ${palette.border}` }}>
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border p-16 text-center" style={{ borderColor: palette.border, background: palette.glass }}>
          <p className="text-[17px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Nothing written yet.</p>
          <p className="text-[12.5px] mt-2" style={{ color: palette.muted }}>One good piece a month is a career.</p>
          <button onClick={onNew} className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
            <Plus className="h-3.5 w-3.5" /> Start the first one
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const fc = FORMAT_COLOR[p.format];
            const rt = readingTimeMin(p.blocks);
            const ex = excerpt(p.blocks, 140);
            const date = new Date(p.publishedAt ?? p.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
            return (
              <Link key={p.id} to="/library/$pid" params={{ pid: p.id }} className="group rounded-2xl border overflow-hidden transition-all duration-[180ms] hover:shadow-sm flex flex-col"
                style={{ borderColor: palette.border, background: palette.glassStrong }}>
                <div className="h-32 relative" style={{ background: p.coverImage ? `center/cover url(${p.coverImage})` : `linear-gradient(135deg, ${palette.soft}, ${palette.lavender})` }}>
                  {!p.coverImage && (
                    <div className="absolute inset-0 flex items-center justify-center p-5 text-center text-[13.5px] leading-tight italic"
                      style={{ fontFamily: "'Fraunces', serif", color: palette.primary, letterSpacing: "-0.01em" }}>
                      {p.title.split(" ").slice(0, 4).join(" ")}
                    </div>
                  )}
                  {p.featured && (
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center" style={{ background: palette.ink, color: "#fff" }}>
                      <Bookmark className="h-3 w-3" fill="#fff" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 h-5 rounded-full text-[10px]" style={{ background: fc.bg, color: fc.fg, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.format}</span>
                    <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>{STATUS_LABEL[p.status]}</span>
                  </div>
                  <div className="text-[15px] leading-tight mb-1.5" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.title}</div>
                  {ex && <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: palette.muted }}>{ex}</p>}
                  <div className="mt-3 pt-3 border-t flex items-center gap-3 text-[10.5px]" style={{ borderColor: palette.border, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    <span>{date}</span>
                    <span>·</span>
                    <span>{rt} min</span>
                    {p.status === "published" && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {p.analytics.views.toLocaleString()}</span>
                      </>
                    )}
                    <span className="ml-auto uppercase tracking-wider">{p.audience}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <div>{filtered.length} of {pieces.length} pieces</div>
        <div className="flex items-center gap-3">
          <Link to="/writing" target="_blank" className="inline-flex items-center gap-1 hover:underline"><ExternalLink className="h-3 w-3" /> View public /writing</Link>
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ v: string; label: string }> }) {
  return (
    <label className="inline-flex items-center gap-2 h-9 px-3 rounded-full border text-[12px]" style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      <span className="uppercase tracking-wider text-[10.5px]">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none text-[12px]" style={{ color: palette.ink }}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </label>
  );
}
