import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, PenLine, Lock, GitBranch } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveNotes, noteExcerpt, TEMPLATE_META, type NoteStatus, type NoteTemplate } from "@/lib/notes-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/notes/")({
  component: NotesIndex,
});

const STATUS_META: Record<NoteStatus, { label: string; bg: string; fg: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: "Draft", bg: "#F1E9DA", fg: "#7A5A18", icon: PenLine },
  signed: { label: "Signed", bg: "#E4EFE0", fg: "#3E6A2E", icon: Lock },
  amended: { label: "Amended", bg: "#EFE4F0", fg: "#5F3F60", icon: GitBranch },
  locked: { label: "Locked", bg: "#EADFE2", fg: "#1E1418", icon: Lock },
};

function NotesIndex() {
  const hydrated = useHydrated();
  const notes = useLiveNotes();
  const [q, setQ] = useState("");
  const [type, setType] = useState<NoteTemplate | "all">("all");
  const [status, setStatus] = useState<NoteStatus | "all">("all");

  const filtered = useMemo(() => notes.filter((n) => {
    if (type !== "all" && n.type !== type) return false;
    if (status !== "all" && n.status !== status) return false;
    if (!q) return true;
    const ql = q.toLowerCase();
    const p = getPatient(n.patientId);
    return (p?.fullName ?? "").toLowerCase().includes(ql) ||
      n.sections.some((s) => s.body.toLowerCase().includes(ql));
  }), [notes, q, type, status]);

  if (!hydrated) return <LoadingRail />;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search patient or note text"
            className="w-full h-9 pl-9 pr-3 rounded-full border text-[13px] outline-none"
            style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.ink, fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <FilterPill label="Type" value={type} onChange={(v) => setType(v as NoteTemplate | "all")} options={[{ v: "all", label: "All" }, ...Object.keys(TEMPLATE_META).map((k) => ({ v: k, label: k }))]} />
        <FilterPill label="Status" value={status} onChange={(v) => setStatus(v as NoteStatus | "all")} options={[{ v: "all", label: "All" }, { v: "draft", label: "Draft" }, { v: "signed", label: "Signed" }, { v: "amended", label: "Amended" }]} />
        <Link to="/notes/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" /> New note
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border p-16 text-center" style={{ borderColor: palette.border, background: palette.glass }}>
          <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Nothing written today. That's a rare thing.</p>
          <p className="text-[12.5px] mt-2" style={{ color: palette.muted }}>Start a new note when a session ends, or from a specific patient.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((n) => <NoteRow key={n.id} note={n} />)}
        </div>
      )}
    </div>
  );
}

function LoadingRail() {
  return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading notes…</div>;
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

function NoteRow({ note }: { note: ReturnType<typeof useLiveNotes>[number] }) {
  const p = getPatient(note.patientId);
  const meta = STATUS_META[note.status];
  const Icon = meta.icon;
  const date = new Date(note.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <Link to="/notes/$nid" params={{ nid: note.id }} className="block rounded-2xl border transition-all duration-[180ms] hover:shadow-sm" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      <div className="p-5 flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{note.type}</span>
            <span style={{ color: palette.muted }}>·</span>
            <span className="text-[11.5px]" style={{ color: palette.muted }}>{date}</span>
            {note.amendments.length > 0 && (
              <>
                <span style={{ color: palette.muted }}>·</span>
                <span className="text-[11px]" style={{ color: palette.muted }}>{note.amendments.length} amendment{note.amendments.length > 1 ? "s" : ""}</span>
              </>
            )}
          </div>
          <div className="text-[15.5px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            {p?.fullName ?? "Unknown patient"}
          </div>
          <p className="text-[12.5px] mt-2 leading-relaxed line-clamp-2" style={{ color: palette.muted }}>
            {noteExcerpt(note, 200) || "No content yet."}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[10.5px]" style={{ background: meta.bg, color: meta.fg, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Icon className="h-3 w-3" /> {meta.label}
        </div>
      </div>
    </Link>
  );
}
