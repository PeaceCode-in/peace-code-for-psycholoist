import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLiveCanned, upsertCanned, deleteCanned, interpolate, type CannedResponse } from "@/lib/messages-store";
import { listPatients } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/messages/canned")({
  head: () => ({ meta: [{ title: "Canned Responses — Messages · PeaceCode" }] }),
  component: CannedPage,
});

const CATS: Array<{ id: CannedResponse["category"]; label: string }> = [
  { id: "scheduling", label: "Scheduling" },
  { id: "clinical", label: "Clinical" },
  { id: "billing", label: "Billing" },
  { id: "warmth", label: "Warmth" },
];

function CannedPage() {
  const canned = useLiveCanned();
  const [activeCat, setActiveCat] = useState<CannedResponse["category"]>("scheduling");
  const [editing, setEditing] = useState<Partial<CannedResponse> | null>(null);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    canned.forEach((x) => { c[x.category] = (c[x.category] ?? 0) + 1; });
    return c;
  }, [canned]);

  const visible = canned.filter((c) => c.category === activeCat);

  return (
    <AppShell>
      <div className="min-h-[calc(100dvh-32px)] p-6" style={{ background: palette.surface2 }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link to="/messages" className="flex items-center gap-1.5 text-[12px]" style={{ color: palette.muted }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Inbox
              </Link>
              <h1 className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontSize: "26px", color: palette.ink }}>Canned responses</h1>
            </div>
            <button onClick={() => setEditing({ category: activeCat, shortcut: "/", title: "", body: "" })}
              className="h-8 px-3 rounded-full text-white text-[12px] flex items-center gap-1.5" style={{ background: palette.primary }}>
              <Plus className="w-3.5 h-3.5" /> New template
            </button>
          </div>

          <div className="flex gap-6">
            <aside className="w-[200px] shrink-0">
              {CATS.map((c) => (
                <button key={c.id} onClick={() => setActiveCat(c.id)}
                  className="w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center justify-between"
                  style={{ background: activeCat === c.id ? palette.surface : "transparent", color: activeCat === c.id ? palette.ink : palette.muted, border: `1px solid ${activeCat === c.id ? palette.border : "transparent"}` }}>
                  <span style={{ fontSize: "13px" }}>{c.label}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: palette.muted }}>{counts[c.id] ?? 0}</span>
                </button>
              ))}
            </aside>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3">
              {visible.map((c) => (
                <div key={c.id} className="rounded-xl p-4" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded" style={{ background: palette.surface2, fontFamily: "'DM Mono', monospace", fontSize: "11px", color: palette.primary }}>{c.shortcut}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing(c)} aria-label="Edit"><Pencil className="w-3.5 h-3.5" style={{ color: palette.muted }} /></button>
                      <button onClick={() => { if (confirm(`Delete "${c.title}"?`)) deleteCanned(c.id); }} aria-label="Delete"><Trash2 className="w-3.5 h-3.5" style={{ color: palette.muted }} /></button>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: "15px", color: palette.ink }}>{c.title}</div>
                  <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap" style={{ fontSize: "12.5px", color: palette.muted, lineHeight: 1.5 }}>{c.body}</p>
                  <div className="mt-2" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10.5px", color: palette.muted }}>Used {c.useCount}×</div>
                </div>
              ))}
              {visible.length === 0 && (
                <div className="col-span-full text-center py-12" style={{ color: palette.muted, fontSize: "13px" }}>No templates in this category.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editing && <TemplateEditor draft={editing} onClose={() => setEditing(null)} onSave={(d) => { upsertCanned({ id: d.id, category: d.category!, shortcut: d.shortcut!, title: d.title!, body: d.body! }); setEditing(null); }} />}
    </AppShell>
  );
}

function TemplateEditor({ draft, onClose, onSave }: { draft: Partial<CannedResponse>; onClose: () => void; onSave: (d: Partial<CannedResponse>) => void }) {
  const [d, setD] = useState<Partial<CannedResponse>>(draft);
  const hydrated = useHydrated();
  const samplePatient = hydrated ? listPatients()[0] : undefined;
  const vars = ["patient.firstName", "patient.fullName", "next_session.date", "clinic.address", "therapist.signature"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl w-full max-w-3xl flex" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
        <div className="flex-1 p-5 border-r" style={{ borderColor: palette.border }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "16px", color: palette.ink }}>{d.id ? "Edit template" : "New template"}</span>
            <button onClick={onClose}><X className="w-4 h-4" style={{ color: palette.muted }} /></button>
          </div>
          <label className="block text-[10.5px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>SHORTCUT</label>
          <div className="flex items-center h-9 mb-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${palette.border}` }}>
            <span className="px-2 h-full flex items-center" style={{ background: palette.surface2, color: palette.primary, fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>/</span>
            <input value={(d.shortcut ?? "/").replace(/^\//, "")} onChange={(e) => setD({ ...d, shortcut: "/" + e.target.value.replace(/\s/g, "") })} className="flex-1 h-full px-2 outline-none" style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }} />
          </div>
          <label className="block text-[10.5px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>TITLE</label>
          <input value={d.title ?? ""} onChange={(e) => setD({ ...d, title: e.target.value })} className="w-full h-9 px-2 mb-3 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontFamily: "'Fraunces', serif", fontSize: "14px" }} />
          <label className="block text-[10.5px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>CATEGORY</label>
          <select value={d.category} onChange={(e) => setD({ ...d, category: e.target.value as CannedResponse["category"] })} className="w-full h-9 px-2 mb-3 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontSize: "13px" }}>
            {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <label className="block text-[10.5px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>BODY</label>
          <textarea value={d.body ?? ""} onChange={(e) => setD({ ...d, body: e.target.value })} rows={7} className="w-full px-2 py-2 rounded-lg outline-none resize-none mb-2" style={{ border: `1px solid ${palette.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: "13px", lineHeight: 1.5 }} />
          <div className="flex flex-wrap gap-1 mb-3">
            {vars.map((v) => (
              <button key={v} onClick={() => setD({ ...d, body: `${d.body ?? ""}{{${v}}}` })} className="px-1.5 py-0.5 rounded" style={{ background: palette.surface2, fontFamily: "'DM Mono', monospace", fontSize: "10.5px", color: palette.muted }}>{`{{${v}}}`}</button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="h-8 px-3 rounded-full text-[12px]" style={{ color: palette.muted }}>Cancel</button>
            <button onClick={() => onSave(d)} disabled={!d.title || !d.body} className="h-8 px-4 rounded-full text-white text-[12px] disabled:opacity-50" style={{ background: palette.primary }}>Save</button>
          </div>
        </div>
        <div className="w-[300px] p-5" style={{ background: palette.surface2 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: palette.muted, marginBottom: "8px" }}>PREVIEW</div>
          <div className="rounded-lg p-3 whitespace-pre-wrap" style={{ background: "#fff", border: `1px solid ${palette.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: palette.ink, lineHeight: 1.55, minHeight: "200px" }}>
            {interpolate(d.body ?? "", samplePatient)}
          </div>
        </div>
      </div>
    </div>
  );
}
