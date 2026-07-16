import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, FileSignature, CheckCircle2, Circle } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useContracts, getSupervisor } from "@/lib/supervision-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/supervision/contracts/")({
  component: Contracts,
});

function Contracts() {
  const hydrated = useHydrated();
  const contracts = useContracts();

  if (!hydrated) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] max-w-xl" style={{ color: palette.muted }}>
          Written supervision contracts with dual e-signature and full audit trail. Renewal at expiry, exportable as PDF-ready statement for regulator submissions.
        </p>
        <Link to="/supervision/supervisors" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Plus className="h-3.5 w-3.5" /> Draft new contract
        </Link>
      </div>

      <div className="space-y-3">
        {contracts.map((c) => {
          const sv = getSupervisor(c.supervisorId);
          return (
            <Link key={c.id} to="/supervision/contracts/$cid" params={{ cid: c.id }} className="block rounded-2xl border p-5 hover:border-[var(--ink)] transition-all duration-[180ms]" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)", ["--ink" as string]: palette.ink }}>
              <div className="flex items-center justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <span className="inline-flex items-center gap-1.5"><FileSignature className="h-3 w-3" /> Contract · {c.status}</span>
                <span>{new Date(c.startedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} → {new Date(c.endsAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
              </div>
              <div className="mt-2 text-[16px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{sv?.name} — {sv?.credentials}</div>
              <div className="text-[12px] mt-1" style={{ color: palette.muted }}>{c.focus}</div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <Field label="Cadence" value={c.cadence} />
                <Field label="Hours / month" value={String(c.hoursPerMonth)} />
                <Sig label="Supervisee" ok={!!c.signedBySupervisee} />
                <Sig label="Supervisor" ok={!!c.signedBySupervisor} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="uppercase tracking-[0.14em]" style={{ color: palette.muted }}>{label}</div>
      <div className="mt-0.5" style={{ color: palette.ink }}>{value}</div>
    </div>
  );
}
function Sig({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div>
      <div className="uppercase tracking-[0.14em]" style={{ color: palette.muted }}>{label}</div>
      <div className="mt-0.5 inline-flex items-center gap-1" style={{ color: ok ? palette.ink : palette.muted }}>
        {ok ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />} {ok ? "signed" : "pending"}
      </div>
    </div>
  );
}
