import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, FileDown, GitBranch } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveMed, useLiveLetter, upsertLetter, signLetter, amendLetter, clinicianIdentity,
} from "@/lib/prescriptions-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/prescriptions/$mid/letter")({
  component: LetterPage,
});

function defaultLetter(genericName: string, dose: string, freq: string, indication: string, patientName: string) {
  return `Dear Sir / Madam,

I have been consulting ${patientName} in my clinical practice. As part of the current treatment plan I have advised the following:

  ${genericName} — ${dose} ${freq}
  Indication: ${indication}

Refills: 1 (one) month at a time, up to 3 refills, subject to review.

Please contact my office for any clarifications.

Regards,`;
}

function LetterPage() {
  const { mid } = Route.useParams();
  const hydrated = useHydrated();
  const m = useLiveMed(mid);
  const existing = useLiveLetter(mid);
  const [body, setBody] = useState("");
  const [amendReason, setAmendReason] = useState("");
  const [showAmend, setShowAmend] = useState(false);

  useEffect(() => {
    if (existing) setBody(existing.body);
    else if (m) {
      const p = getPatient(m.patientId);
      setBody(defaultLetter(m.drugSnapshot.generic, m.dose, m.frequency, m.indication, p?.fullName ?? "the patient"));
    }
  }, [existing, m]);

  if (!hydrated) return null;
  if (!m) return <div className="max-w-2xl mx-auto px-5 py-16 text-[13px]" style={{ color: palette.muted }}>Not found.</div>;

  const patient = getPatient(m.patientId);
  const readOnly = existing?.status === "signed" || existing?.status === "amended";
  const clin = clinicianIdentity();

  function saveDraft() { upsertLetter(mid, body); }
  function sign() {
    upsertLetter(mid, body);
    const l = existing ?? upsertLetter(mid, body);
    if (window.confirm("Sign and lock this letter? Amendments only after signing.")) signLetter(l.id);
  }
  function submitAmend() {
    if (!amendReason.trim() || !existing) return;
    amendLetter(existing.id, amendReason.trim(), body);
    setShowAmend(false);
    setAmendReason("");
  }
  function exportPdf() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(renderPdf(body, patient?.fullName ?? "Patient", existing?.status ?? "draft", existing?.signedAt, existing?.signedBy ?? clin.name, clin.license));
    win.document.close();
    setTimeout(() => win.print(), 250);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
      <Link to="/prescriptions/patient/$pid" params={{ pid: m.patientId }} className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Chart
      </Link>

      <div className="rounded-3xl border p-8 lg:p-10" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.85)" }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Prescription letter</div>
            <h2 className="text-[22px] mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{m.drugSnapshot.generic} · {m.dose} {m.frequency}</h2>
            <div className="text-[12px] mt-0.5" style={{ color: palette.muted }}>For {patient?.fullName}</div>
          </div>
          <div className="flex gap-2">
            {!readOnly && <>
              <button onClick={saveDraft} className="inline-flex items-center h-8 px-3 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.ink }}>Save draft</button>
              <button onClick={sign} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}><Lock className="h-3.5 w-3.5" /> Sign & lock</button>
            </>}
            {readOnly && <>
              <button onClick={exportPdf} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.ink }}><FileDown className="h-3.5 w-3.5" /> PDF</button>
              <button onClick={() => setShowAmend(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}><GitBranch className="h-3.5 w-3.5" /> Amend</button>
            </>}
          </div>
        </div>

        <textarea value={body} onChange={(e) => setBody(e.target.value)} readOnly={readOnly} rows={16}
          className="mt-6 w-full rounded-xl border p-4 text-[13.5px] leading-[1.7] outline-none"
          style={{ borderColor: palette.border, background: "#fff", color: palette.ink, fontFamily: "'DM Sans', sans-serif" }} />

        {existing?.signedAt && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: palette.border }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Signed</div>
            <div className="text-[13.5px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{existing.signedBy}</div>
            <div className="text-[11.5px]" style={{ color: palette.muted }}>{clin.license} · {new Date(existing.signedAt).toLocaleString("en-IN")}</div>
          </div>
        )}

        {existing?.amendments.map((a) => (
          <div key={a.id} className="mt-4 rounded-xl p-4 border" style={{ borderColor: palette.border, background: "rgba(239,228,240,0.35)" }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1" style={{ color: "#5F3F60", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Amendment · {a.reason}</div>
            <pre className="text-[12.5px] whitespace-pre-wrap" style={{ color: palette.ink, fontFamily: "'DM Sans', sans-serif" }}>{a.body}</pre>
            <div className="text-[11px] mt-2" style={{ color: palette.muted }}>Signed {a.by} · {new Date(a.at).toLocaleString("en-IN")}</div>
          </div>
        ))}

        {showAmend && (
          <div className="mt-4 rounded-xl p-4 border" style={{ borderColor: palette.border, background: "#fff" }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Reason for amendment</div>
            <input value={amendReason} onChange={(e) => setAmendReason(e.target.value)} className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setShowAmend(false)} className="text-[12px] underline" style={{ color: palette.muted }}>Cancel</button>
              <button onClick={submitAmend} className="inline-flex items-center h-9 px-4 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}>Sign amendment</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderPdf(body: string, patientName: string, status: string, signedAt: number | undefined, by: string, license: string) {
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  return `<!doctype html><html><head><title>Rx · ${esc(patientName)}</title></head>
    <body style="max-width:640px;margin:40pt auto;padding:0 20pt;color:#1E1418;font-family:Georgia,serif">
      <div style="font-size:10pt;color:#7B6A70;text-transform:uppercase;letter-spacing:0.16em">Prescription</div>
      <h1 style="font-size:18pt;margin:4pt 0 4pt">${esc(patientName)}</h1>
      <div style="font-size:10pt;color:#7B6A70;margin-bottom:16pt">${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} · Status: ${esc(status)}</div>
      <pre style="white-space:pre-wrap;font-family:Georgia,serif;font-size:11pt;line-height:1.6">${esc(body)}</pre>
      ${signedAt ? `<div style="margin-top:24pt;padding-top:10pt;border-top:1px solid #ccc;font-size:10pt;color:#7B6A70">Signed ${esc(by)} · ${esc(license)} · ${new Date(signedAt).toLocaleString("en-IN")}</div>` : ""}
    </body></html>`;
}
