import { createFileRoute, Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import {
  getOutstanding, getOverdueCount, getRevenueThisMonth, getRevenueByMonth, getCollectionRate,
  getAvgDaysToPay, getInsuranceReimbursementRate, getAgingBuckets, getPaymentMix,
  useLiveInvoices, useLiveClaims, formatINR, METHOD_META, CHART_PALETTE,
} from "@/lib/billing-store";
import { getPatient } from "@/lib/patients-store";
import { CurrencyNumber, KPICell, StackedAreaChart, AgingBars, PaymentMixDonut, Sparkline, StatusPill } from "@/components/viz/billing";
import { AlertCircle, FileWarning, ArrowUpRight, CheckCircle2, IndianRupee } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/")({
  component: Overview,
});

function Overview() {
  const hydrated = useHydrated();
  const invoices = useLiveInvoices();
  const claims = useLiveClaims();
  if (!hydrated) return <div className="h-96" />;

  const outstanding = getOutstanding();
  const revenue = getRevenueThisMonth();
  const overdueCount = getOverdueCount();
  const revenueMonths = getRevenueByMonth(6);
  const collection = getCollectionRate(30);
  const avgDays = getAvgDaysToPay();
  const insurance = getInsuranceReimbursementRate();
  const aging = getAgingBuckets();
  const mix = getPaymentMix(30);
  const mixSegments = mix.map((m) => ({ label: METHOD_META[m.method].label, value: m.amount, color: METHOD_META[m.method].color }));
  const mixTotal = mix.reduce((s, m) => s + m.amount, 0);

  const serviceKeys = Array.from(new Set(revenueMonths.flatMap((m) => Object.keys(m.byService)))).slice(0, 6);
  const monthSpark = revenueMonths.map((m) => m.total);

  const overdueInvoices = invoices.filter((i) => i.status === "overdue").slice(0, 4);
  const pendingClaims = claims.filter((c) => c.status === "in_review" || c.status === "submitted").slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Band A — KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICell label="Revenue · this month" value={revenue.current} delta={revenue.delta} sparkline={monthSpark} />
        <KPICell label="Outstanding" value={outstanding.total} suffix="" />
        <KPICell label="Collection rate" value={collection} format="percent" />
        <KPICell label="Avg. days to pay" value={avgDays} format="number" suffix=" d" />
        <KPICell label="Insurance recovery" value={insurance} format="percent" />
      </div>

      {/* Band B — Revenue rhythm */}
      <section className="rounded-3xl p-5 sm:p-6" style={cardStyle}>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Revenue rhythm</h2>
            <p className="text-[11px]" style={{ color: palette.muted }}>Collected revenue by service · last 6 months</p>
          </div>
          <div className="hidden sm:flex items-baseline gap-2">
            <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Ytd</span>
            <CurrencyNumber value={revenueMonths.reduce((s, m) => s + m.total, 0)} size="md" />
          </div>
        </div>
        {serviceKeys.length > 0 ? (
          <>
            <StackedAreaChart data={revenueMonths} keys={serviceKeys} height={260} />
            <div className="flex flex-wrap gap-3 mt-4">
              {serviceKeys.map((k, i) => (
                <span key={k} className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: palette.muted }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                  {k}
                </span>
              ))}
            </div>
          </>
        ) : <div className="h-40 flex items-center justify-center text-[12px]" style={{ color: palette.muted }}>No revenue recorded yet.</div>}
      </section>

      {/* Band C — Aging + Payment mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-3xl p-5 sm:p-6" style={cardStyle}>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Aging buckets</h2>
              <p className="text-[11px]" style={{ color: palette.muted }}>Outstanding by days past due</p>
            </div>
            <CurrencyNumber value={outstanding.total} size="md" muted />
          </div>
          <AgingBars buckets={aging} />
        </section>
        <section className="rounded-3xl p-5 sm:p-6" style={cardStyle}>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Payment mix</h2>
              <p className="text-[11px]" style={{ color: palette.muted }}>How you got paid · last 30 days</p>
            </div>
          </div>
          {mixSegments.length > 0
            ? <PaymentMixDonut segments={mixSegments} centerLabel="Collected" centerValue={mixTotal} />
            : <div className="h-40 flex items-center justify-center text-[12px]" style={{ color: palette.muted }}>No payments recorded in the last 30 days.</div>}
        </section>
      </div>

      {/* Band D — Attention rail */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Needs attention</h2>
          <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Now</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {overdueInvoices.length === 0 && pendingClaims.length === 0 ? (
            <div className="rounded-2xl p-6 flex items-center gap-3" style={cardStyle}>
              <CheckCircle2 className="w-5 h-5" style={{ color: "#7BA88A" }} />
              <div>
                <div className="text-[13px]" style={{ color: palette.ink }}>Everything clean.</div>
                <div className="text-[11px]" style={{ color: palette.muted }}>No overdue invoices, no unattended claims.</div>
              </div>
            </div>
          ) : (
            <>
              {overdueInvoices.map((i) => (
                <Link key={i.id} to="/billing/invoices/$id" params={{ id: i.id }}
                  className="min-w-[260px] rounded-2xl p-4 hover:-translate-y-0.5 transition-transform"
                  style={cardStyle}>
                  <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em]" style={{ color: "#B6763A", fontFamily: "'Fraunces', serif" }}>
                    <FileWarning className="w-3 h-3" /> Overdue
                  </div>
                  <div className="text-[13px] mt-1" style={{ color: palette.ink }}>{getPatient(i.patientId)?.fullName ?? "—"}</div>
                  <div className="text-[10.5px] font-mono" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{i.id} · due {new Date(i.dueAt).toLocaleDateString()}</div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <CurrencyNumber value={i.balance} size="md" />
                    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: palette.primary }}>Resolve <ArrowUpRight className="w-3 h-3" /></span>
                  </div>
                </Link>
              ))}
              {pendingClaims.map((c) => (
                <Link key={c.id} to="/billing/claims/$id" params={{ id: c.id }}
                  className="min-w-[260px] rounded-2xl p-4 hover:-translate-y-0.5 transition-transform"
                  style={cardStyle}>
                  <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em]" style={{ color: "#B7935A", fontFamily: "'Fraunces', serif" }}>
                    <AlertCircle className="w-3 h-3" /> Claim in review
                  </div>
                  <div className="text-[13px] mt-1" style={{ color: palette.ink }}>{c.insurer}</div>
                  <div className="text-[10.5px] font-mono" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{c.id} · {getPatient(c.patientId)?.fullName}</div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <CurrencyNumber value={c.claimedAmount} size="md" />
                    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: palette.primary }}>Follow up <ArrowUpRight className="w-3 h-3" /></span>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.42)",
  backdropFilter: "blur(24px) saturate(140%)",
  border: `1px solid ${palette.border}`,
} as const;

// silence unused
void IndianRupee; void formatINR; void StatusPill; void Sparkline;
