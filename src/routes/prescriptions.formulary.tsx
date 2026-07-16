import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, EyeOff, Eye, Plus, Search } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveFormulary, toggleFavorite, toggleHidden, addCustomDrug, type DrugClass, type Frequency } from "@/lib/prescriptions-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/prescriptions/formulary")({
  component: Formulary,
});

function Formulary() {
  const hydrated = useHydrated();
  const drugs = useLiveFormulary();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [nGeneric, setNGeneric] = useState("");
  const [nBrand, setNBrand] = useState("");
  const [nClass, setNClass] = useState<DrugClass>("Other");
  const [nRange, setNRange] = useState("");

  const filtered = useMemo(() => drugs.filter((d) => !q || `${d.generic} ${d.brands.join(" ")} ${d.drugClass}`.toLowerCase().includes(q.toLowerCase())), [drugs, q]);
  const favorites = filtered.filter((d) => d.favorite);
  const rest = filtered.filter((d) => !d.favorite);

  if (!hydrated) return null;

  function saveCustom() {
    if (!nGeneric.trim()) return;
    addCustomDrug({ generic: nGeneric.trim().toLowerCase(), brands: nBrand.split(",").map((s) => s.trim()).filter(Boolean), drugClass: nClass, typicalRange: nRange || "as needed", defaultFrequency: "OD" as Frequency });
    setNGeneric(""); setNBrand(""); setNRange(""); setAdding(false);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search formulary" className="w-full h-9 pl-9 pr-3 rounded-full border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.ink }} />
        </div>
        <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" /> Add custom drug
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl border p-5 mb-5 grid sm:grid-cols-4 gap-3" style={{ borderColor: palette.border, background: palette.glassStrong }}>
          <input value={nGeneric} onChange={(e) => setNGeneric(e.target.value)} placeholder="Generic name" className="h-10 px-3 rounded-xl border text-[13px]" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
          <input value={nBrand} onChange={(e) => setNBrand(e.target.value)} placeholder="Brands (comma-sep)" className="h-10 px-3 rounded-xl border text-[13px]" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
          <select value={nClass} onChange={(e) => setNClass(e.target.value as DrugClass)} className="h-10 px-3 rounded-xl border text-[13px] bg-white" style={{ borderColor: palette.border, color: palette.ink }}>
            {["SSRI", "SNRI", "TCA", "Atypical AD", "Mood stabilizer", "Antipsychotic", "Benzodiazepine", "Z-drug", "ADHD stimulant", "ADHD non-stimulant", "Anxiolytic", "Beta-blocker", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <input value={nRange} onChange={(e) => setNRange(e.target.value)} placeholder="Typical range" className="flex-1 h-10 px-3 rounded-xl border text-[13px]" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
            <button onClick={saveCustom} className="h-10 px-4 rounded-xl text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>Add</button>
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <>
          <h3 className="text-[13px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Favorites</h3>
          <List rows={favorites} />
          <div className="h-6" />
        </>
      )}
      <h3 className="text-[13px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>All drugs · {rest.length}</h3>
      <List rows={rest} />
    </div>
  );
}

function List({ rows }: { rows: ReturnType<typeof useLiveFormulary> }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      {rows.map((d) => (
        <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 border-b text-[13px]" style={{ borderColor: palette.border, color: palette.ink }}>
          <button onClick={() => toggleFavorite(d.id)} className="grid place-items-center h-7 w-7 rounded-full" style={{ color: d.favorite ? palette.primary : palette.muted }}>
            <Star className="h-3.5 w-3.5" fill={d.favorite ? palette.primary : "none"} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "'Fraunces', serif" }}>{d.generic}</span>
              {d.custom && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: palette.surface2, color: palette.muted }}>custom</span>}
            </div>
            <div className="text-[11px]" style={{ color: palette.muted }}>{d.brands.join(" · ")} · {d.drugClass} · {d.typicalRange}</div>
          </div>
          <button onClick={() => toggleHidden(d.id)} className="grid place-items-center h-7 w-7 rounded-full" style={{ color: palette.muted }} title={d.hidden ? "Show" : "Hide"}>
            {d.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>
      ))}
    </div>
  );
}
