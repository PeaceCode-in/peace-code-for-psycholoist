import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Shield } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { createConference, REASON_META, type ConferenceReason, type ConferenceUrgency, type ConferenceFormat } from "@/lib/conferences-store";
import { useLivePatients } from "@/lib/patients-store";
import { useMembers } from "@/lib/team-store";
import { useHydrated } from "@/lib/use-hydrated";
import { z } from "zod";

const search = z.object({ peer: z.string().optional() });

export const Route = createFileRoute("/case-conferences/new")({
  validateSearch: (s) => search.parse(s),
  head: () => ({ meta: [{ title: "New conference — PeaceCode · Practice" }] }),
  component: NewConference,
});

function NewConference() {
  const hydrated = useHydrated();
  const nav = useNavigate();
  const { peer } = Route.useSearch();
  const patients = useLivePatients();
  const members = useMembers();

  const [step, setStep] = useState(1);
  const [peerReview, setPeer] = useState(peer === "1");
  const [patientId, setPatientId] = useState<string>("");
  const [anonymized, setAnon] = useState(false);
  const [presenting, setPresenting] = useState("");
  const [reason, setReason] = useState<ConferenceReason>(peer === "1" ? "peer-review" : "diagnostic-clarity");
  const [urgency, setUrgency] = useState<ConferenceUrgency>("routine");
  const [participantIds, setParticipants] = useState<string[]>(["me"]);
  const [when, setWhen] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(15, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [format, setFormat] = useState<ConferenceFormat>("video");
  const [durationMin, setDuration] = useState(45);

  if (!hydrated) return null;

  const canNext =
    step === 1 ? (peerReview || !!patientId) :
    step === 2 ? presenting.trim().length > 5 :
    step === 3 ? participantIds.length >= 2 : true;

  const toggleParticipant = (id: string) => {
    setParticipants((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const submit = () => {
    const c = createConference({
      patientId: peerReview ? undefined : patientId,
      peerReview,
      anonymized: peerReview || anonymized,
      presenting: presenting.trim(),
      reason,
      urgency,
      facilitatorId: participantIds[0],
      participantIds,
      scheduledAt: new Date(when).getTime(),
      durationMin,
      format,
    });
    nav({ to: "/case-conferences/$cid", params: { cid: c.id } });
  };

  return (
    <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex items-center gap-2 mb-6 mt-2">
        {[1,2,3,4].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full text-[11px]"
              style={{ background: n <= step ? palette.ink : palette.surface2, color: n <= step ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{n}</span>
            {n < 4 && <span className="h-px w-8" style={{ background: palette.border }} />}
          </div>
        ))}
        <span className="ml-3 text-[11.5px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          {["Patient","Reason","Participants","Schedule"][step - 1]}
        </span>
      </div>

      <div className="rounded-3xl border p-7" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        {step === 1 && (
          <div>
            <h2 className="text-[20px] mb-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Who is this about?</h2>
            <p className="text-[12.5px] mb-5" style={{ color: palette.muted }}>Pick a patient, or start a peer-review case with no patient link.</p>
            <label className="flex items-start gap-3 p-3 rounded-xl border mb-4" style={{ borderColor: palette.border, background: peerReview ? palette.lavender + "60" : "transparent" }}>
              <input type="checkbox" checked={peerReview} onChange={(e) => setPeer(e.target.checked)} className="mt-1" />
              <div>
                <div className="text-[13px]" style={{ color: palette.ink }}>Peer-review case (CPD)</div>
                <div className="text-[11.5px] mt-0.5" style={{ color: palette.muted }}>De-identified. No patient link. Structured for feedback.</div>
              </div>
            </label>
            {!peerReview && (
              <>
                <select value={patientId} onChange={(e) => setPatientId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border text-[13px] outline-none mb-3"
                  style={{ borderColor: palette.border, background: "#fff", color: palette.ink }}>
                  <option value="">— Select patient —</option>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} · {p.primaryConcern}</option>)}
                </select>
                <label className="inline-flex items-center gap-2 text-[12.5px]" style={{ color: palette.muted }}>
                  <input type="checkbox" checked={anonymized} onChange={(e) => setAnon(e.target.checked)} />
                  <Shield className="h-3.5 w-3.5" /> Anonymize for participants (initials + age)
                </label>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-[20px] mb-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Why are we meeting?</h2>
            <p className="text-[12.5px] mb-5" style={{ color: palette.muted }}>One sentence of presenting concern, plus the reason and urgency.</p>
            <textarea value={presenting} onChange={(e) => setPresenting(e.target.value)} rows={3}
              placeholder="e.g. Six months in, symptom scores flat. Diagnostic reformulation warranted."
              className="w-full p-3 rounded-xl border text-[13px] outline-none mb-4"
              style={{ borderColor: palette.border, background: "#fff", color: palette.ink, fontFamily: "'DM Sans', sans-serif" }} />
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(Object.keys(REASON_META) as ConferenceReason[]).filter((r) => peerReview ? r === "peer-review" : r !== "peer-review").map((r) => {
                const m = REASON_META[r];
                const on = reason === r;
                return (
                  <button key={r} type="button" onClick={() => setReason(r)}
                    className="text-left p-3 rounded-xl border transition-all"
                    style={{ borderColor: on ? palette.ink : palette.border, background: on ? palette.surface2 : "#fff" }}>
                    <div className="text-[12.5px]" style={{ color: m.tone, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{m.label}</div>
                    <div className="text-[11.5px] mt-0.5" style={{ color: palette.muted }}>{m.blurb}</div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {(["routine","elevated","urgent"] as ConferenceUrgency[]).map((u) => (
                <button key={u} type="button" onClick={() => setUrgency(u)}
                  className="h-8 px-3 rounded-full border text-[11.5px] uppercase tracking-wider"
                  style={{ borderColor: urgency === u ? palette.ink : palette.border, background: urgency === u ? palette.ink : "transparent", color: urgency === u ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{u}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-[20px] mb-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Who is in the room?</h2>
            <p className="text-[12.5px] mb-5" style={{ color: palette.muted }}>First selected is the lead (locks the record). At least two participants required.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {members.map((m) => {
                const on = participantIds.includes(m.id);
                const isLead = participantIds[0] === m.id;
                return (
                  <button key={m.id} type="button" onClick={() => toggleParticipant(m.id)}
                    className="flex items-center gap-3 p-3 rounded-xl border text-left"
                    style={{ borderColor: on ? palette.ink : palette.border, background: on ? palette.surface2 : "#fff" }}>
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full text-[10.5px] text-white" style={{ background: m.tone, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{m.avatarInitials}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px]" style={{ color: palette.ink }}>{m.fullName}</div>
                      <div className="text-[11px]" style={{ color: palette.muted }}>{m.role}{m.credentials ? " · " + m.credentials : ""}</div>
                    </div>
                    {isLead && <span className="text-[9.5px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Lead</span>}
                    {on && !isLead && <Check className="h-3.5 w-3.5" style={{ color: palette.ink }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-[20px] mb-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>When and how?</h2>
            <p className="text-[12.5px] mb-5" style={{ color: palette.muted }}>Async-only skips the video link and works entirely in the Discussion tab.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Date & time</span>
                <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-xl border text-[13px]" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Duration (min)</span>
                <input type="number" min={15} max={180} step={15} value={durationMin} onChange={(e) => setDuration(Number(e.target.value))}
                  className="mt-1.5 w-full h-11 px-3 rounded-xl border text-[13px]" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {(["in-person","video","async-only"] as ConferenceFormat[]).map((f) => (
                <button key={f} type="button" onClick={() => setFormat(f)}
                  className="h-9 px-3.5 rounded-full border text-[12px] uppercase tracking-wider"
                  style={{ borderColor: format === f ? palette.ink : palette.border, background: format === f ? palette.ink : "transparent", color: format === f ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{f}</button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex items-center justify-between">
          <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px] disabled:opacity-40"
            style={{ color: palette.muted }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          {step < 4 ? (
            <button type="button" onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] disabled:opacity-40"
              style={{ background: palette.ink, color: "#fff" }}>
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" onClick={submit}
              className="inline-flex items-center gap-1.5 h-9 px-5 rounded-full text-[12.5px]"
              style={{ background: palette.primary, color: "#fff" }}>
              Create conference <Check className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
