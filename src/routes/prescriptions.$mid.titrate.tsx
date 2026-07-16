import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveMed, titrateMed } from "@/lib/prescriptions-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/prescriptions/$mid/titrate")({
  component: Titrate,
});

function Titrate() {
  const { mid } = Route.useParams();
  const hydrated = useHydrated();
  const m = useLiveMed(mid);
  const nav = useNavigate();
  const [dose, setDose] = useState("");
  const [reason, setReason] = useState("");

  if (!hydrated) return null;
  if (!m) return <div className="max-w-2xl mx-auto px-5 py-16 text-[13px]" style={{ color: palette.muted }}>Not found.</div>;

  function save() {
    if (!dose.trim() || !reason.trim()) return;
    titrateMed(m!.id, dose.trim(), reason.trim());
    nav({ to: "/prescriptions/patient/$pid", params: { pid: m!.patientId } });
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-24">
      <Link to="/prescriptions/patient/$pid" params={{ pid: m.patientId }} className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Chart
      </Link>
      <div className="rounded-3xl border p-8" style={{ borderColor: palette.border, background: palette.glassStrong }}>
        <h2 className="text-[22px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Titrate {m.drugSnapshot.generic}</h2>
        <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>Current: <span style={{ color: palette.ink }}>{m.dose} · {m.frequency}</span></p>
        <div className="mt-6 grid gap-4">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>New dose</div>
            <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 20 mg" className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Reason</div>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full rounded-xl border p-3 text-[13px] outline-none" style={{ borderColor: palette.border, background: palette.solid, color: palette.ink }} />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={save} disabled={!dose || !reason} className="inline-flex items-center h-10 px-5 rounded-full text-[12.5px] disabled:opacity-40" style={{ background: palette.ink, color: "#fff" }}>Record titration</button>
        </div>
      </div>
    </div>
  );
}
