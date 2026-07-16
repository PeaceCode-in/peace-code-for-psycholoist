import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Calendar, BookOpen } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useJournal, usePeers, addJournalItem, toggleJournalAttend, ME_ID } from "@/lib/peers-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/peers/journal-club")({
  component: JournalClub,
});

function JournalClub() {
  const hydrated = useHydrated();
  const journal = useJournal();
  const peers = usePeers();
  const pmap = useMemo(() => Object.fromEntries(peers.map((p) => [p.id, p])), [peers]);
  const [showNew, setShowNew] = useState(false);

  const upcoming = journal.filter((j) => j.discussionAt && j.discussionAt > Date.now());
  const past = journal.filter((j) => !j.discussionAt || j.discussionAt <= Date.now());

  if (!hydrated) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] max-w-xl" style={{ color: palette.muted }}>
          A monthly reading group. Add a paper, schedule the discussion, attach your reading notes. Attendance flows into your CPD reading log automatically.
        </p>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Plus className="h-3.5 w-3.5" /> Add paper
        </button>
      </div>

      <Section label="Upcoming" items={upcoming} pmap={pmap} />
      <div className="h-6" />
      <Section label="Past" items={past} pmap={pmap} />

      {showNew && <AddPaper onClose={() => setShowNew(false)} />}
    </div>
  );
}

function Section({ label, items, pmap }: { label: string; items: ReturnType<typeof useJournal>; pmap: Record<string, ReturnType<typeof usePeers>[number]> }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((j) => {
          const addedBy = pmap[j.addedBy];
          const attending = j.attendees.includes(ME_ID);
          return (
            <div key={j.id} className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
              <div className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <BookOpen className="h-3 w-3" /> {j.venue} · {j.year}
              </div>
              <h3 className="mt-2 text-[16px] leading-snug" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{j.paperTitle}</h3>
              <div className="text-[12px] mt-1" style={{ color: palette.muted }}>{j.authors}</div>
              {j.doi && <div className="text-[11px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>DOI: {j.doi}</div>}
              {j.discussionAt && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px]" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <Calendar className="h-3 w-3" /> {new Date(j.discussionAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </div>
              )}
              {j.notes && <p className="mt-3 text-[12px] italic" style={{ color: palette.muted }}>{j.notes}</p>}
              <div className="mt-4 flex items-center justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <span>added by {addedBy?.name ?? "—"} · {j.attendees.length} attending</span>
                <button onClick={() => toggleJournalAttend(j.id)} className="rounded-full px-3 py-1" style={{ background: attending ? palette.ink : "transparent", color: attending ? "#fff" : palette.muted, border: `1px solid ${palette.border}` }}>
                  {attending ? "Attending" : "Attend"}
                </button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-[12px] col-span-2" style={{ color: palette.muted }}>Nothing here.</p>}
      </div>
    </div>
  );
}

function AddPaper({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [venue, setVenue] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [doi, setDoi] = useState("");
  const [when, setWhen] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,20,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-[520px] rounded-3xl border p-6" style={{ borderColor: palette.border, background: "#fff" }} onClick={(e) => e.stopPropagation()}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Add paper</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Paper title" className="w-full border rounded-xl px-3 py-2 text-[13px] mb-2" style={{ borderColor: palette.border, fontFamily: "'Fraunces', serif" }} />
        <input value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="Authors" className="w-full border rounded-xl px-3 py-2 text-[12px] mb-2" style={{ borderColor: palette.border }} />
        <div className="grid grid-cols-3 gap-2 mb-2">
          <input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue" className="col-span-2 border rounded-xl px-3 py-2 text-[12px]" style={{ borderColor: palette.border }} />
          <input type="number" value={year} onChange={(e) => setYear(+e.target.value)} className="border rounded-xl px-3 py-2 text-[12px]" style={{ borderColor: palette.border }} />
        </div>
        <input value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="DOI (optional)" className="w-full border rounded-xl px-3 py-2 text-[12px] mb-2" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }} />
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[12px] mb-2" style={{ borderColor: palette.border }} />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reading notes / focus areas" rows={3} className="w-full border rounded-xl px-3 py-2 text-[12px] mb-3" style={{ borderColor: palette.border }} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5" style={{ color: palette.muted }}>Cancel</button>
          <button
            disabled={!title.trim()}
            onClick={() => {
              addJournalItem({ paperTitle: title.trim(), authors, venue, year, doi: doi || undefined, addedBy: ME_ID, notes, discussionAt: when ? new Date(when).getTime() : undefined });
              onClose();
            }}
            className="rounded-full px-4 py-1.5 text-[12px] disabled:opacity-40"
            style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}
          >Add</button>
        </div>
      </div>
    </div>
  );
}
