// First-run checklist drawer. Opens from AppShell top bar (⌘.).
// Progress is real — reads getChecklist() from onboarding store.
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { dismissChecklist, dismissChecklistItem, useChecklist, useOnboarding, clearSampleData } from "@/lib/onboarding-store";
import { X, ListChecks } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useHydrated } from "@/lib/use-hydrated";

export function ChecklistDrawer() {
  const items = useChecklist();
  const s = useOnboarding();
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === ".") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (hydrated && s.checklistDismissed) return null;

  const done = hydrated ? items.filter((i) => i.done).length : 0;
  const total = hydrated ? items.length : 6;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="First-run checklist (⌘.)"
        className="hidden md:flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] transition-all duration-150 hover:bg-white/60"
        style={{ background: palette.glass, border: `1px solid ${palette.border}`, color: palette.ink }}
      >
        <ListChecks className="h-3.5 w-3.5" style={{ color: palette.primary }} />
        <span>First week</span>
        <span style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em" }}>{done}/{total}</span>
      </button>

      {hydrated && open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} style={{ background: "rgba(30,20,24,0.28)", backdropFilter: "blur(6px)" }}>
          <aside
            onClick={(e) => e.stopPropagation()}
            className="absolute right-6 top-16 w-[380px] rounded-2xl p-5"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,247,250,0.94) 100%)",
              border: `1px solid ${palette.border}`,
              boxShadow: "0 30px 60px -20px rgba(30,20,24,0.35)",
              animation: "pc-drawer 220ms cubic-bezier(.4,0,.2,1)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div style={{ color: palette.muted, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Your first week</div>
                <div className="text-[16px] mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>Small rituals, real progress.</div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-black/5"><X className="h-3.5 w-3.5" /></button>
            </div>

            <div className="h-1 rounded-full mb-4" style={{ background: "rgba(0,0,0,0.06)" }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(done / Math.max(items.length, 1)) * 100}%`, background: `linear-gradient(90deg, ${palette.primary}, ${palette.soft})` }} />
            </div>

            <ul className="space-y-1.5">
              {items.map((it) => (
                <li key={it.id} className="group flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-black/[0.03]">
                  <div
                    className="mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: it.done ? palette.primary : "transparent", border: `1px solid ${it.done ? palette.primary : palette.border}` }}
                  >
                    {it.done && <svg width="8" height="6" viewBox="0 0 10 8"><path d="M1 4.2 L3.4 6.6 L9 1" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <Link
                    to={it.href}
                    onClick={() => setOpen(false)}
                    className="flex-1"
                    style={{ color: it.done ? palette.muted : palette.ink, textDecoration: it.done ? "line-through" : "none" }}
                  >
                    <div className="text-[13.5px]">{it.label}</div>
                    <div className="text-[11.5px] mt-0.5" style={{ color: palette.muted }}>{it.hint}</div>
                  </Link>
                  <button onClick={() => dismissChecklistItem(it.id)} className="opacity-0 group-hover:opacity-100 text-[11px]" style={{ color: palette.muted }}>hide</button>
                </li>
              ))}
              {items.length === 0 && (
                <li className="py-8 text-center text-[13px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>
                  You've closed the checklist. The practice is yours now.
                </li>
              )}
            </ul>

            {hydrated && s.sampleDataMode && (
              <div className="mt-4 rounded-xl p-3 text-[12px] flex items-center justify-between" style={{ background: "rgba(176,86,122,0.06)", border: `1px solid ${palette.border}` }}>
                <span style={{ color: palette.muted }}>Sample patients active</span>
                <button onClick={clearSampleData} className="underline underline-offset-2" style={{ color: palette.primary }}>clear</button>
              </div>
            )}

            <div className="mt-4 pt-3 flex items-center justify-between text-[11px]" style={{ borderTop: `1px solid ${palette.border}`, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <span>⌘.  to toggle</span>
              <button onClick={() => { dismissChecklist(); setOpen(false); }} className="underline underline-offset-2">dismiss forever</button>
            </div>

            <style>{`@keyframes pc-drawer { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </aside>
        </div>
      )}
    </>
  );
}
