import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ArrowUpRight, BookOpen, Headphones, FileText, BookMarked } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useReading, addReading, promoteReadingToCpd, type ReadingEntry } from "@/lib/cpd-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/cpd/reading")({
  component: CpdReading,
});

const KIND_ICON: Record<ReadingEntry["kind"], React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  paper: FileText,
  podcast: Headphones,
  chapter: BookMarked,
};

function CpdReading() {
  const hydrated = useHydrated();
  const nav = useNavigate();
  const items = useReading();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [kind, setKind] = useState<ReadingEntry["kind"]>("book");
  const [hours, setHours] = useState<number>(1);
  const [notes, setNotes] = useState("");

  function submit() {
    if (!title.trim()) return;
    addReading({ title: title.trim(), author: author.trim() || undefined, kind, hours, finishedAt: Date.now(), notes: notes.trim() || undefined });
    setTitle(""); setAuthor(""); setNotes(""); setHours(1);
  }

  if (!hydrated) return null;

  return (
    <div className="max-w-[960px] mx-auto px-5 sm:px-8 pb-16 space-y-6">
      <div>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 24 }}>Reading log</h2>
        <p className="text-[12px] mt-1" style={{ color: palette.muted }}>Books, papers, podcasts. Lighter than a full CPD entry. Promote any of them if you want to claim hours.</p>
      </div>

      <section className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <h3 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 18 }}>Add a reading</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid }} />
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author (optional)" className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid }} />
          <select value={kind} onChange={(e) => setKind(e.target.value as ReadingEntry["kind"])} className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid }}>
            <option value="book">Book</option>
            <option value="paper">Paper</option>
            <option value="podcast">Podcast</option>
            <option value="chapter">Chapter</option>
          </select>
          <input type="number" min={0.5} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} placeholder="Hours" className="rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid }} />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="One line of what stuck (optional)" className="md:col-span-2 rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: palette.solid, fontFamily: "'Fraunces', serif" }} rows={2} />
        </div>
        <button onClick={submit} className="mt-3 inline-flex items-center gap-1 rounded-full px-3 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}><Plus className="h-3.5 w-3.5" />Add reading</button>
      </section>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.solid }}>
        {items.map((r, i) => {
          const Icon = KIND_ICON[r.kind];
          return (
            <div key={r.id} className="grid grid-cols-[auto_1fr_auto] gap-3 items-baseline px-5 py-4" style={{ borderTop: i === 0 ? "none" : `1px solid ${palette.border}` }}>
              <Icon className="h-4 w-4 mt-1" />
              <div className="min-w-0">
                <div style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 15 }}>{r.title}</div>
                <div className="text-[11px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {r.author ?? "—"} · {new Date(r.finishedAt).toLocaleDateString()} · {r.hours ?? 1}h
                </div>
                {r.notes && <div className="text-[12px] mt-1" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{r.notes}</div>}
              </div>
              <div className="text-right">
                {r.promotedTo ? (
                  <span className="text-[11px] rounded-full px-2 py-1" style={{ background: "#E4EFE0", color: "#3E6A2E" }}>In CPD</span>
                ) : (
                  <button onClick={() => { const e = promoteReadingToCpd(r.id); if (e) void nav({ to: "/cpd/$eid", params: { eid: e.id } }); }}
                    className="inline-flex items-center gap-1 text-[11px] rounded-full px-3 py-1"
                    style={{ background: palette.ink, color: "#fff" }}>
                    <ArrowUpRight className="h-3 w-3" /> Promote to CPD
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div className="p-6 text-center text-[13px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Nothing logged yet.</div>}
      </div>
    </div>
  );
}
