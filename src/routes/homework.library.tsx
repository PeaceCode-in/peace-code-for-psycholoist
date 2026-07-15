import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveTemplates, type Modality } from "@/lib/homework-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/homework/library")({
  component: LibraryPage,
});

const MODALITIES: Modality[] = ["CBT", "DBT", "ACT", "Mindfulness", "Behavioral", "Reflective"];

function LibraryPage() {
  const hydrated = useHydrated();
  const templates = useLiveTemplates();
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const m = new Map<Modality, typeof templates>();
    for (const mod of MODALITIES) m.set(mod, []);
    for (const t of templates) {
      if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q.toLowerCase())) continue;
      m.get(t.modality)!.push(t);
    }
    return m;
  }, [templates, q]);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates" className="w-full h-9 pl-9 pr-3 rounded-full border text-[13px] outline-none" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", color: palette.ink }} />
        </div>
        <Link to="/homework/library/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" /> New template
        </Link>
      </div>

      <div className="space-y-10">
        {MODALITIES.map((mod) => {
          const items = grouped.get(mod) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={mod}>
              <h3 className="text-[13px] uppercase tracking-[0.16em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{mod}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((t) => (
                  <Link key={t.id} to="/homework/assign" className="rounded-2xl border p-5 hover:shadow-sm transition-shadow block" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)" }}>
                    <div className="text-[15px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{t.name}</div>
                    <p className="text-[12px] mt-1.5" style={{ color: palette.muted }}>{t.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.fields.slice(0, 4).map((f) => (
                        <span key={f.key} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: palette.surface2, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{f.label}</span>
                      ))}
                      {t.fields.length > 4 && <span className="text-[10px]" style={{ color: palette.muted }}>+{t.fields.length - 4}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
