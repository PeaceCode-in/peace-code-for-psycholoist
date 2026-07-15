import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckSquare, Square, Lock, FileDown } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveNotes, signNote, markExported, noteExcerpt } from "@/lib/notes-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/notes/bulk")({
  component: BulkPage,
});

function BulkPage() {
  const hydrated = useHydrated();
  const notes = useLiveNotes();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [range, setRange] = useState<{ from: string; to: string }>(() => {
    const now = new Date();
    const from = new Date(now); from.setDate(from.getDate() - 30);
    return { from: from.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
  });

  const inRange = useMemo(() => notes.filter((n) => {
    const d = new Date(n.updatedAt).toISOString().slice(0, 10);
    return d >= range.from && d <= range.to;
  }), [notes, range]);

  if (!hydrated) return null;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }
  function toggleAll() {
    if (selected.size === inRange.length) setSelected(new Set());
    else setSelected(new Set(inRange.map((n) => n.id)));
  }
  function signAll() {
    let count = 0;
    selected.forEach((id) => {
      const n = notes.find((x) => x.id === id);
      if (n?.status === "draft") { signNote(id); count++; }
    });
    window.alert(`Signed ${count} draft${count === 1 ? "" : "s"}.`);
    setSelected(new Set());
  }
  function exportRange() {
    const rows = inRange.map((n) => {
      const p = getPatient(n.patientId);
      markExported(n.id);
      return `[${new Date(n.updatedAt).toLocaleDateString("en-IN")}] ${n.type} · ${p?.fullName ?? "—"}\n${n.sections.map((s) => `## ${s.label}\n${s.body || "—"}`).join("\n\n")}\n\n———\n`;
    }).join("\n");
    const blob = new Blob([rows], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `notes-${range.from}-to-${range.to}.md`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.16em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>From</div>
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} className="h-9 px-3 rounded-full border text-[12.5px]" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.16em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>To</div>
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} className="h-9 px-3 rounded-full border text-[12.5px]" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={signAll} disabled={selected.size === 0} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-[12px] disabled:opacity-40" style={{ borderColor: palette.border, color: palette.ink }}>
            <Lock className="h-3.5 w-3.5" /> Sign selected drafts
          </button>
          <button onClick={exportRange} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
            <FileDown className="h-3.5 w-3.5" /> Export range
          </button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)" }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: palette.border }}>
          <button onClick={toggleAll} className="inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: palette.muted }}>
            {selected.size === inRange.length && inRange.length > 0 ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            {selected.size} of {inRange.length} selected
          </button>
        </div>
        {inRange.length === 0 ? (
          <div className="p-8 text-center text-[12.5px]" style={{ color: palette.muted }}>No notes in this range.</div>
        ) : (
          <ul>
            {inRange.map((n) => {
              const p = getPatient(n.patientId);
              const on = selected.has(n.id);
              return (
                <li key={n.id} onClick={() => toggle(n.id)} className="flex items-start gap-3 px-4 py-3 border-b cursor-pointer" style={{ borderColor: palette.border }}>
                  {on ? <CheckSquare className="h-4 w-4 mt-0.5" style={{ color: palette.ink }} /> : <Square className="h-4 w-4 mt-0.5" style={{ color: palette.muted }} />}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {n.type} · {new Date(n.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} · {n.status}
                    </div>
                    <div className="text-[13.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{p?.fullName ?? "Unknown"}</div>
                    <div className="text-[12px] mt-0.5 line-clamp-1" style={{ color: palette.muted }}>{noteExcerpt(n, 140)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
