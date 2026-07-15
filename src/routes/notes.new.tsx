import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLivePatients } from "@/lib/patients-store";
import { TEMPLATE_META, createNote, type NoteTemplate } from "@/lib/notes-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/notes/new")({
  component: NewNote,
});

function NewNote() {
  const hydrated = useHydrated();
  const patients = useLivePatients({ status: "active" });
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState<string>("");
  const [type, setType] = useState<NoteTemplate>("SOAP");

  if (!hydrated) return null;

  function start() {
    if (!patientId) return;
    const n = createNote({ patientId, type });
    navigate({ to: "/notes/$nid", params: { nid: n.id } });
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
      <Link to="/notes" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Back to notes
      </Link>

      <div className="rounded-3xl border p-8 lg:p-10" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)" }}>
        <h2 className="text-[24px] leading-tight tracking-tight mb-2" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          New note
        </h2>
        <p className="text-[12.5px]" style={{ color: palette.muted }}>Pick a patient and a template. You can change everything after.</p>

        <div className="mt-8 grid gap-6">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Patient</div>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border text-[13.5px] outline-none"
              style={{ borderColor: palette.border, background: "#fff", color: palette.ink }}>
              <option value="">Select a patient…</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} · {p.college}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Template</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {(Object.keys(TEMPLATE_META) as NoteTemplate[]).map((t) => {
                const meta = TEMPLATE_META[t];
                const on = type === t;
                return (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className="text-left rounded-xl border p-3 transition-all duration-[180ms]"
                    style={{ borderColor: on ? palette.ink : palette.border, background: on ? palette.ink : "#fff", color: on ? "#fff" : palette.ink }}>
                    <div className="text-[13px]" style={{ fontFamily: "'Fraunces', serif" }}>{meta.label}</div>
                    <div className="text-[11.5px] mt-0.5 opacity-80">{meta.blurb}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={start} disabled={!patientId}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-[13px] transition-opacity"
              style={{ background: palette.ink, color: "#fff", opacity: patientId ? 1 : 0.45 }}>
              Start writing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
