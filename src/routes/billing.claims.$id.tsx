import { createFileRoute, Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { useLiveClaim, updateClaimStatus, CLAIM_STATUS_META } from "@/lib/billing-store";
import { getPatient } from "@/lib/patients-store";
import { CurrencyNumber, StatusPill, ClaimStageWaterfall } from "@/components/viz/billing";
import { ArrowLeft, FileText, RotateCcw, CheckCircle2 } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/claims/$id")({
  head: () => ({ meta: [{ title: "Claim — Billing · PeaceCode" }, { name: "robots", content: "noindex" }] }),
  component: ClaimDetail,
});

function ClaimDetail() {
  const hydrated = useHydrated();
  const { id } = Route.useParams();
  const claim = useLiveClaim(id);
  if (!hydrated) return <div className="h-96" />;
  if (!claim) return <div className="text-[12px]" style={{ color: palette.muted }}>Claim not found.</div>;
  const patient = getPatient(claim.patientId);

  const steps = ["submitted", "in_review", "approved", "paid"].map((s) => {
    const hist = claim.history.find((h) => h.status === s);
    return { label: labelOf(s), at: hist?.at, done: !!hist, note: hist?.note };
  });

  return (
    <div>
      <Link to="/billing/claims" className="inline-flex items-center gap-1 text-[11.5px] mb-3 hover:underline" style={{ color: palette.muted }}>
        <ArrowLeft className="w-3.5 h-3.5" /> All claims
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-[62%_36%] gap-5">
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <StatusPill status={claim.status} kind="claim" />
            <div className="text-right">
              <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Claimed</div>
              <CurrencyNumber value={claim.claimedAmount} size="xl" />
            </div>
          </div>
          <article className="rounded-3xl p-8" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
            <header className="flex items-start justify-between mb-6">
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 18 }}>{claim.insurer}</div>
                <div className="text-[11px]" style={{ color: palette.muted }}>Policy · <span className="font-mono" style={{ fontFamily: "'DM Mono', monospace" }}>{claim.policyNumber}</span></div>
              </div>
              <div className="text-right">
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Claim</div>
                <div className="font-mono text-[15px]" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{claim.id}</div>
              </div>
            </header>
            <section className="mb-6">
              <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Insured</div>
              <div className="text-[14px]" style={{ color: palette.ink }}>{patient?.fullName}</div>
              <div className="text-[11px]" style={{ color: palette.muted }}>Invoice · <Link to="/billing/invoices/$id" params={{ id: claim.invoiceId }} className="font-mono hover:underline" style={{ fontFamily: "'DM Mono', monospace", color: palette.primary }}>{claim.invoiceId}</Link></div>
            </section>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <Metric label="Claimed" value={claim.claimedAmount} />
              <Metric label="Approved" value={claim.approvedAmount ?? 0} muted={claim.approvedAmount === undefined} />
              <Metric label="Paid" value={claim.paidAmount ?? 0} muted={claim.paidAmount === undefined} />
            </div>
            {claim.status === "denied" && (
              <div className="mt-6 rounded-2xl p-4" style={{ background: "#F1DCE4", border: `1px solid #E4C4CE` }}>
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: "#B0567A", fontFamily: "'Fraunces', serif" }}>Denied</div>
                <p className="text-[12px] mt-1" style={{ color: "#7A3D53" }}>{claim.denialReason}</p>
                <button className="mt-3 h-8 px-3 rounded-full text-[11.5px]" style={{ background: "#B0567A", color: "#fff" }}>Draft appeal</button>
              </div>
            )}
            <section className="mt-6 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
              <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Documents</div>
              <div className="space-y-1.5">
                {claim.documents.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-[12px]" style={{ color: palette.ink }}>
                    <FileText className="w-3.5 h-3.5" style={{ color: palette.muted }} />{d.name}
                    <span className="ml-auto text-[10px] uppercase tracking-[0.1em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{d.kind}</span>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl p-5" style={glass}>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Status waterfall</div>
            <ClaimStageWaterfall steps={steps} />
          </div>
          <div className="rounded-2xl p-3 space-y-1.5" style={glass}>
            <ActionBtn onClick={() => updateClaimStatus(claim.id, "submitted")}><RotateCcw className="w-3.5 h-3.5" /> Resubmit</ActionBtn>
            <ActionBtn primary onClick={() => updateClaimStatus(claim.id, "paid")}><CheckCircle2 className="w-3.5 h-3.5" /> Mark paid</ActionBtn>
            <ActionBtn onClick={() => updateClaimStatus(claim.id, "denied", "Written off")}>Write off</ActionBtn>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{label}</div>
      <div className="mt-1"><CurrencyNumber value={value} size="lg" muted={muted} /></div>
    </div>
  );
}
function ActionBtn({ children, primary, onClick }: { children: React.ReactNode; primary?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full inline-flex items-center gap-2 px-3 h-9 rounded-lg text-[12px] transition-colors"
      style={primary ? { background: palette.primary, color: "#fff" } : { background: "transparent", color: palette.ink }}
      onMouseOver={(e) => { if (!primary) e.currentTarget.style.background = palette.surface2; }}
      onMouseOut={(e) => { if (!primary) e.currentTarget.style.background = "transparent"; }}>{children}</button>
  );
}
function labelOf(s: string) {
  return ({ submitted: "Submitted", in_review: "In review", approved: "Approved", paid: "Paid" } as Record<string, string>)[s] ?? s;
}
const glass = { background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` } as const;
