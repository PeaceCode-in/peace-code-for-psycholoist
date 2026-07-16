import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileSignature, CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { getContract, getSupervisor, signContract, endContract, useContracts } from "@/lib/supervision-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/supervision/contracts/$cid")({
  loader: ({ params }) => {
    const c = getContract(params.cid);
    if (!c) throw notFound();
    return { cid: params.cid };
  },
  component: ContractDetail,
  notFoundComponent: () => <div className="p-8 text-[13px]" style={{ color: palette.muted }}>Contract not found.</div>,
});

function ContractDetail() {
  const { cid } = Route.useParams();
  const hydrated = useHydrated();
  useContracts();
  const c = getContract(cid);

  if (!hydrated) return null;
  if (!c) return null;
  const sv = getSupervisor(c.supervisorId);

  return (
    <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
      <Link to="/supervision/contracts" className="inline-flex items-center gap-1 text-[11px] mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <ArrowLeft className="h-3 w-3" /> Contracts
      </Link>

      <div className="rounded-3xl border p-8" style={{ borderColor: palette.border, background: "#fff" }}>
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] pb-4 border-b" style={{ color: palette.muted, borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <span className="inline-flex items-center gap-1.5"><FileSignature className="h-3.5 w-3.5" /> Supervision contract · {c.status}</span>
          <span>{c.id}</span>
        </div>

        <h1 className="mt-5 text-[26px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          Between {c.superviseeName} & {sv?.name}
        </h1>
        <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>
          A written agreement for regular clinical supervision, with mutual expectations, confidentiality, and termination provisions.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4 text-[13px]">
          <Row label="Term" value={`${new Date(c.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} → ${new Date(c.endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`} />
          <Row label="Cadence" value={`${c.cadence} — ${c.hoursPerMonth} hrs/month`} />
          <Row label="Focus" value={c.focus} />
          <Row label="Fee" value={c.fee} />
          <Row label="Cancellation" value={c.cancellation} />
          <Row label="Confidentiality" value={c.confidentiality} />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 pt-6 border-t" style={{ borderColor: palette.border }}>
          <Signature label="Supervisee" name={c.superviseeName} sig={c.signedBySupervisee} onSign={() => signContract(c.id, "supervisee")} />
          <Signature label="Supervisor" name={sv?.name ?? ""} sig={c.signedBySupervisor} onSign={() => signContract(c.id, "supervisor")} />
        </div>

        {c.status === "active" && (
          <div className="mt-6 pt-4 border-t" style={{ borderColor: palette.border }}>
            <button onClick={() => endContract(c.id)} className="text-[12px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>End contract</button>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
        <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <ShieldCheck className="h-3.5 w-3.5" /> Audit trail
        </div>
        <div className="space-y-1.5">
          {c.auditTrail.map((a, i) => (
            <div key={i} className="grid grid-cols-[140px_120px_1fr] gap-3 text-[12px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <span style={{ color: palette.muted }}>{new Date(a.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
              <span style={{ color: palette.muted }}>{a.who}</span>
              <span style={{ color: palette.ink }}>{a.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1" style={{ color: palette.ink }}>{value}</div>
    </div>
  );
}

function Signature({ label, name, sig, onSign }: { label: string; name: string; sig?: { at: number; ipHash: string }; onSign: () => void }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-2 h-16 border-b" style={{ borderColor: palette.ink, fontFamily: "'Fraunces', italic serif", fontStyle: "italic", color: palette.ink, fontSize: 22, paddingTop: 6 }}>
        {sig ? name : ""}
      </div>
      <div className="mt-2 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        {sig ? (
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {new Date(sig.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {sig.ipHash}</span>
        ) : (
          <button onClick={onSign} className="inline-flex items-center gap-1 rounded-full px-3 py-0.5" style={{ background: palette.ink, color: "#fff" }}><Circle className="h-3 w-3" /> Sign</button>
        )}
      </div>
    </div>
  );
}
