import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, GitBranch } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveNote, amendNote, type NoteSection } from "@/lib/notes-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/notes/$nid/amend")({
  component: AmendPage,
});

function AmendPage() {
  const { nid } = Route.useParams();
  const hydrated = useHydrated();
  const note = useLiveNote(nid);
  const navigate = useNavigate();

  const latest = note?.amendments.length ? note.amendments[note.amendments.length - 1].sections : note?.sections;
  const [sections, setSections] = useState<NoteSection[]>(latest?.map((s) => ({ ...s })) ?? []);
  const [reason, setReason] = useState("");

  if (!hydrated) return null;
  if (!note) return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-[13px]" style={{ color: palette.muted }}>Note not found.</p>
      <Link to="/notes" className="text-[12px] underline mt-3 inline-block" style={{ color: palette.ink }}>Back to notes</Link>
    </div>
  );
  if (note.status === "draft") return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-[13px]" style={{ color: palette.muted }}>Only signed notes can be amended. This one is still a draft.</p>
      <Link to="/notes/$nid" params={{ nid: note.id }} className="text-[12px] underline mt-3 inline-block" style={{ color: palette.ink }}>Open editor</Link>
    </div>
  );

  const patient = getPatient(note.patientId);

  function submit() {
    if (!reason.trim()) { window.alert("Please describe the reason for this amendment."); return; }
    amendNote(note!.id, reason.trim(), sections);
    navigate({ to: "/notes/$nid", params: { nid: note!.id } });
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
      <Link to="/notes/$nid" params={{ nid: note.id }} className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Back to note
      </Link>

      <div className="rounded-3xl border p-8 lg:p-10" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.85)" }}>
        <div className="inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-1 rounded-full mb-4" style={{ background: "#EFE4F0", color: "#5F3F60", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <GitBranch className="h-3 w-3" /> Amendment
        </div>
        <h2 className="text-[24px] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          Amend note · {patient?.fullName ?? "Patient"}
        </h2>
        <p className="text-[12.5px] mt-2 max-w-lg" style={{ color: palette.muted }}>
          The original stays visible in the record. Your amendment is appended below it with its own signature.
        </p>

        <div className="mt-6">
          <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Reason for amendment</div>
          <input
            value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Corrected date of prior session, added omitted risk info"
            className="w-full h-11 px-3 rounded-xl border text-[13.5px] outline-none"
            style={{ borderColor: palette.border, background: "#fff", color: palette.ink }}
          />
        </div>

        <div className="mt-8 space-y-6">
          {sections.map((s, idx) => (
            <section key={s.key}>
              <h3 className="text-[16px] leading-tight tracking-tight mb-2" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
                {s.label}
              </h3>
              <textarea
                value={s.body}
                onChange={(e) => setSections(sections.map((x, i) => i === idx ? { ...x, body: e.target.value } : x))}
                rows={Math.max(3, Math.ceil((s.body.length || 40) / 80))}
                className="w-full resize-y outline-none bg-white rounded-xl border p-3 text-[13.5px] leading-[1.6]"
                style={{ borderColor: palette.border, color: palette.ink, fontFamily: "'DM Sans', sans-serif" }}
              />
            </section>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <Link to="/notes/$nid" params={{ nid: note.id }} className="inline-flex items-center h-10 px-4 rounded-full border text-[12.5px]" style={{ borderColor: palette.border, color: palette.ink }}>
            Cancel
          </Link>
          <button onClick={submit} className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
            Sign amendment
          </button>
        </div>
      </div>
    </div>
  );
}
