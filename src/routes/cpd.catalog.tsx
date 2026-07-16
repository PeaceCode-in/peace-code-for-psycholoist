import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Check, ExternalLink, MapPin, IndianRupee } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useCatalog, toggleBookmark, markRegistered, completeCatalogItem, CATEGORY_LABEL, FORMAT_LABEL, type CpdCategory, type CpdFormat } from "@/lib/cpd-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/cpd/catalog")({
  component: CpdCatalog,
});

function CpdCatalog() {
  const hydrated = useHydrated();
  const catalog = useCatalog();
  const nav = useNavigate();
  const [cat, setCat] = useState<CpdCategory | "">("");
  const [fmt, setFmt] = useState<CpdFormat | "">("");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const filtered = useMemo(() => catalog.filter((c) =>
    (!cat || c.category === cat) && (!fmt || c.format === fmt) && (!onlyBookmarked || c.bookmarked)
  ), [catalog, cat, fmt, onlyBookmarked]);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="mb-4">
        <h2 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 24 }}>Training catalog</h2>
        <p className="text-[12px] mt-1" style={{ color: palette.muted }}>Verified providers + peer-submitted opportunities. Never a ranked list — just a calendar.</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <FilterChip on={cat === ""} onClick={() => setCat("")}>All categories</FilterChip>
        {(Object.keys(CATEGORY_LABEL) as CpdCategory[]).map((c) => (
          <FilterChip key={c} on={cat === c} onClick={() => setCat(c === cat ? "" : c)}>{CATEGORY_LABEL[c]}</FilterChip>
        ))}
        <span className="mx-2 self-center text-[11px]" style={{ color: palette.muted }}>·</span>
        <FilterChip on={fmt === ""} onClick={() => setFmt("")}>Any format</FilterChip>
        {(Object.keys(FORMAT_LABEL) as CpdFormat[]).map((f) => (
          <FilterChip key={f} on={fmt === f} onClick={() => setFmt(f === fmt ? "" : f)}>{FORMAT_LABEL[f]}</FilterChip>
        ))}
        <span className="mx-2 self-center text-[11px]" style={{ color: palette.muted }}>·</span>
        <FilterChip on={onlyBookmarked} onClick={() => setOnlyBookmarked(!onlyBookmarked)}>Bookmarked only</FilterChip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)" }}>
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{CATEGORY_LABEL[c.category]} · {FORMAT_LABEL[c.format]}</div>
                <h3 className="mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 18 }}>{c.title}</h3>
                <div className="text-[12px] mt-1" style={{ color: palette.muted }}>{c.provider}</div>
              </div>
              <button onClick={() => toggleBookmark(c.id)} className="p-1.5 rounded-full" title="Bookmark">
                {c.bookmarked ? <BookmarkCheck className="h-4 w-4" style={{ color: palette.primary }} /> : <Bookmark className="h-4 w-4" style={{ color: palette.muted }} />}
              </button>
            </div>
            <p className="text-[13px] mt-3" style={{ color: palette.ink, fontFamily: "'Fraunces', serif", lineHeight: 1.6 }}>{c.description}</p>
            <div className="grid grid-cols-3 gap-2 text-[11px] mt-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <div>{new Date(c.startAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}{c.endAt !== c.startAt && ` – ${new Date(c.endAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`}</div>
              <div className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.city ?? "online"}</div>
              <div className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{c.priceInr ? c.priceInr.toLocaleString("en-IN") : "free"}</div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-[11px] rounded-full px-2 py-1" style={{ background: palette.surface2, color: palette.ink }}>{c.hoursAwarded}h awarded</span>
              {c.registered ? (
                <span className="inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-1" style={{ background: "#E4EFE0", color: "#3E6A2E" }}><Check className="h-3 w-3" />Registered</span>
              ) : (
                <button onClick={() => markRegistered(c.id)} className="inline-flex items-center gap-1 text-[11px] rounded-full px-3 py-1" style={{ background: palette.ink, color: "#fff" }}>
                  <ExternalLink className="h-3 w-3" />Register
                </button>
              )}
              {c.registered && (
                <button
                  onClick={() => {
                    const e = completeCatalogItem(c.id);
                    if (e) void nav({ to: "/cpd/$eid", params: { eid: e.id } });
                  }}
                  className="text-[11px] rounded-full px-3 py-1 border"
                  style={{ borderColor: palette.border, color: palette.ink }}
                >
                  Mark attended → CPD
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
          <p style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 18 }}>Nothing in this filter. Try widening.</p>
        </div>
      )}

      <div className="mt-8 text-[11px]" style={{ color: palette.muted }}>
        Missing a training? Suggest it in <Link to="/cpd/providers" className="underline">/cpd/providers</Link>.
      </div>
    </div>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="text-[11px] px-2.5 py-1 rounded-full border transition-all duration-[150ms]"
      style={{ borderColor: on ? palette.ink : palette.border, background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {children}
    </button>
  );
}
