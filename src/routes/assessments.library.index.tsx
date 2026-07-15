import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Clock, Layers, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { palette } from "@/components/practice/palette";
import {
  useLiveInstruments, addCustomInstrument, DOMAIN_META, SEVERITY_META,
  type Instrument,
} from "@/lib/assessments-store";
import { SeveritySpectrum } from "@/components/viz/assessments/SeveritySpectrum";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/assessments/library/")({
  head: () => ({ meta: [{ title: "Instrument library — PeaceCode" }] }),
  component: LibraryPage,
});

const DOMAINS: Instrument["domain"][] = ["depression", "anxiety", "trauma", "function", "risk", "custom"];
const FREQS: Instrument["frequency"][] = ["intake", "weekly", "biweekly", "monthly", "adhoc"];

function LibraryPage() {
  const hydrated = useHydrated();
  const instruments = useLiveInstruments();
  const [selectedDomains, setDomains] = useState<Set<string>>(new Set());
  const [selectedFreqs, setFreqs] = useState<Set<string>>(new Set());
  const [customOnly, setCustomOnly] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  const filtered = useMemo(() => instruments.filter((i) => {
    if (customOnly && i.builtIn) return false;
    if (selectedDomains.size && !selectedDomains.has(i.domain)) return false;
    if (selectedFreqs.size && !selectedFreqs.has(i.frequency)) return false;
    return true;
  }), [instruments, selectedDomains, selectedFreqs, customOnly]);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8">
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Instrument library</p>
        <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] tracking-tight leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          Screeners &amp; scales
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        {/* Filter rail */}
        <aside className="space-y-6 text-[12px]">
          <FilterGroup title="Domain">
            {DOMAINS.map((d) => (
              <label key={d} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={selectedDomains.has(d)}
                  onChange={(e) => setDomains((prev) => { const n = new Set(prev); e.target.checked ? n.add(d) : n.delete(d); return n; })}
                  className="accent-[#B0567A]"
                />
                <span style={{ color: palette.ink }}>{DOMAIN_META[d]}</span>
              </label>
            ))}
          </FilterGroup>

          <FilterGroup title="Frequency">
            <div className="flex flex-wrap gap-1.5">
              {FREQS.map((f) => {
                const active = selectedFreqs.has(f);
                return (
                  <button
                    key={f}
                    onClick={() => setFreqs((prev) => { const n = new Set(prev); active ? n.delete(f) : n.add(f); return n; })}
                    className="text-[10.5px] px-2.5 py-1 rounded-full transition-colors"
                    style={{ background: active ? palette.ink : "rgba(255,255,255,0.6)", color: active ? "#fff" : palette.muted, border: `1px solid ${active ? palette.ink : palette.border}` }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </FilterGroup>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={customOnly} onChange={(e) => setCustomOnly(e.target.checked)} className="accent-[#B0567A]" />
            <span style={{ color: palette.ink }}>Show custom only</span>
          </label>
        </aside>

        {/* Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((inst) => <InstrumentTile key={inst.id} inst={inst} />)}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-3xl border p-10 text-center" style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.55)" }}>
              <p className="text-[13px]" style={{ color: palette.muted }}>No instruments match those filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setBuilderOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 h-12 pr-5 pl-4 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
        style={{ background: palette.primary, color: "#fff" }}
      >
        <Plus className="w-4 h-4" /> <span className="text-[12.5px]" style={{ fontFamily: "'Fraunces', serif" }}>New instrument</span>
      </button>

      {builderOpen && <CustomBuilder onClose={() => setBuilderOpen(false)} />}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.16em] uppercase mb-2 flex items-center gap-1" style={{ color: palette.muted }}>
        <Filter className="w-3 h-3" /> {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InstrumentTile({ inst }: { inst: Instrument }) {
  return (
    <div
      className="group rounded-3xl border p-5 min-h-[240px] flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-20px_rgba(30,20,24,0.35)]"
      style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(24px) saturate(140%)", borderColor: "rgba(255,255,255,0.55)" }}
    >
      <div>
        <div className="flex items-start justify-between">
          <h3 className="tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 42 }}>{inst.name}</h3>
          <span className="text-[10px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>{inst.builtIn ? "Built-in" : "Custom"}</span>
        </div>
        <p className="text-[12.5px] mt-2 leading-snug" style={{ color: palette.muted }}>{inst.fullName}</p>

        <div className="flex items-center gap-3 mt-4 text-[10.5px]" style={{ color: palette.muted }}>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: palette.soft, color: palette.ink }}>{DOMAIN_META[inst.domain]}</span>
          <span className="inline-flex items-center gap-1"><Layers className="w-3 h-3" />{inst.items.length}</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{inst.timeToComplete}m</span>
          <span className="text-[10px] tracking-[0.12em] uppercase">{inst.frequency}</span>
        </div>
      </div>

      <div className="mt-5">
        <SeveritySpectrum instrument={inst} height={22} compact showLabels />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link to="/assessments/library/$instrumentId" params={{ instrumentId: inst.id }} className="text-[11.5px] px-3 py-1.5 rounded-full transition-colors" style={{ background: "rgba(255,255,255,0.7)", color: palette.ink, border: `1px solid ${palette.border}` }}>
          Preview
        </Link>
        <button
          onClick={() => toast("Assignment drawer available from Assignments → Assign new")}
          className="text-[11.5px] px-3 py-1.5 rounded-full transition-colors"
          style={{ background: palette.ink, color: "#fff" }}
        >
          Assign
        </button>
      </div>
    </div>
  );
}

// ── Custom builder drawer ──────────────────────────────────
function CustomBuilder({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [domain, setDomain] = useState<Instrument["domain"]>("custom");
  const [items, setItems] = useState<string[]>([""]);

  function save() {
    const cleaned = items.map((p) => p.trim()).filter(Boolean);
    if (!name.trim() || cleaned.length === 0) { toast("Add a name and at least one item"); return; }
    const nItems = cleaned.length;
    const scale = [{ value: 0, label: "Not at all" }, { value: 1, label: "Rarely" }, { value: 2, label: "Sometimes" }, { value: 3, label: "Often" }];
    const maxScore = nItems * 3;
    const step = Math.ceil(maxScore / 5);
    const bands = [0, 1, 2, 3, 4].map((i) => {
      const min = i * step;
      const max = i === 4 ? maxScore : Math.min(maxScore, (i + 1) * step - 1);
      const sev = (["minimal", "mild", "moderate", "mod_severe", "severe"] as const)[i];
      return { min, max, severity: sev, label: SEVERITY_META[sev].label };
    });
    addCustomInstrument({
      name: name.trim(),
      fullName: fullName.trim() || name.trim(),
      domain,
      items: cleaned.map((p, i) => ({ id: `c_${i + 1}`, prompt: p, scale })),
      scoring: { method: "sum", ranges: bands },
      timeToComplete: Math.max(1, Math.round(nItems * 0.3)),
      frequency: "adhoc",
    });
    toast.success(`${name.trim()} added to your library`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(30,20,24,0.4)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-md p-4 animate-in slide-in-from-right duration-200">
        <div className="h-full rounded-3xl border p-6 flex flex-col overflow-y-auto" style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(255,255,255,0.6)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>New instrument</h2>
            <button onClick={onClose}><X className="w-4 h-4" style={{ color: palette.muted }} /></button>
          </div>

          <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Short name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sleep-7" className="mt-1 mb-4 h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none" style={{ borderColor: palette.border, color: palette.ink }} />

          <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Sleep Health Questionnaire" className="mt-1 mb-4 h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none" style={{ borderColor: palette.border, color: palette.ink }} />

          <label className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Domain</label>
          <select value={domain} onChange={(e) => setDomain(e.target.value as Instrument["domain"])} className="mt-1 mb-6 h-10 px-3 rounded-xl border bg-transparent text-[13px] outline-none" style={{ borderColor: palette.border, color: palette.ink }}>
            {DOMAINS.map((d) => <option key={d} value={d}>{DOMAIN_META[d]}</option>)}
          </select>

          <label className="text-[10.5px] tracking-[0.14em] uppercase mb-2" style={{ color: palette.muted }}>Items — one per line</label>
          <div className="flex-1 space-y-2">
            {items.map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-[11px] mt-2.5 tabular-nums w-4" style={{ color: palette.muted }}>{i + 1}</span>
                <textarea
                  value={p}
                  onChange={(e) => setItems((prev) => prev.map((x, j) => (i === j ? e.target.value : x)))}
                  placeholder="Prompt…"
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl border bg-transparent text-[13px] outline-none resize-none"
                  style={{ borderColor: palette.border, color: palette.ink }}
                />
                {items.length > 1 && (
                  <button onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} className="mt-1.5 text-[11px]" style={{ color: palette.muted }}>×</button>
                )}
              </div>
            ))}
            <button onClick={() => setItems((prev) => [...prev, ""])} className="text-[11.5px] mt-1" style={{ color: palette.primary }}>+ Add item</button>
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end gap-2" style={{ borderColor: palette.border }}>
            <button onClick={onClose} className="text-[12px] px-4 h-10 rounded-full" style={{ color: palette.ink }}>Cancel</button>
            <button onClick={save} className="text-[12px] px-5 h-10 rounded-full" style={{ background: palette.primary, color: "#fff" }}>Save instrument</button>
          </div>
        </div>
      </div>
    </div>
  );
}
