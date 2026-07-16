import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { palette } from "@/components/practice/palette";
import {
  getRevenueByMonth, getRevenueByService, getRevenueByPatient, getRevenueThisMonth,
  getCollectionRate, getAvgDaysToPay, getInsuranceReimbursementRate, useLiveInvoices,
} from "@/lib/billing-store";
import { KPICell, HBarList, CohortHeatmap, StackedAreaChart, CurrencyNumber } from "@/components/viz/billing";
import { Download, FileText, Mail } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/reports")({
  head: () => ({ meta: [{ title: "Reports — Billing · PeaceCode" }] }),
  component: Reports,
});

function Reports() {
  const hydrated = useHydrated();
  const invoices = useLiveInvoices();
  const months = useMemo(() => getRevenueByMonth(6), [invoices]);
  if (!hydrated) return <div className="h-96" />;

  const rev = getRevenueThisMonth();
  const byService = getRevenueByService().slice(0, 8).map((s) => ({ label: s.service, value: s.amount }));
  const byPatient = getRevenueByPatient(10).map((p) => ({ label: p.name, value: p.amount }));

  const noShowLoss = invoices.filter((i) => i.status === "void").reduce((s, i) => s + i.total, 0);
  const avgSessionValue = invoices.length > 0 ? invoices.reduce((s, i) => s + i.total, 0) / invoices.length : 0;
  const ytd = months.reduce((s, m) => s + m.total, 0);

  const cohortRows = ["Jan", "Feb", "Mar", "Apr", "May"];
  const cohortCols = ["W1", "W2", "W3", "W4", "W5", "W6"];
  const serviceKeys = Array.from(new Set(months.flatMap((m) => Object.keys(m.byService)))).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICell label="MRR" value={rev.current} delta={rev.delta} />
        <KPICell label="YTD revenue" value={ytd} />
        <KPICell label="Avg. session value" value={avgSessionValue} />
        <KPICell label="Collection rate" value={getCollectionRate(30)} format="percent" />
        <KPICell label="Insurance %" value={getInsuranceReimbursementRate()} format="percent" />
        <KPICell label="No-show loss" value={noShowLoss} />
      </div>

      <section className="rounded-3xl p-5 sm:p-6" style={glass}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Revenue by month</h2>
          <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Last 6 months</span>
        </div>
        {serviceKeys.length > 0
          ? <StackedAreaChart data={months} keys={serviceKeys} height={240} />
          : <div className="h-40 flex items-center justify-center text-[12px]" style={{ color: palette.muted }}>No data.</div>}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-3xl p-5 sm:p-6" style={glass}>
          <h2 className="text-[15px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Revenue by service</h2>
          <HBarList items={byService} />
        </section>
        <section className="rounded-3xl p-5 sm:p-6" style={glass}>
          <h2 className="text-[15px] mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Top patients</h2>
          <HBarList items={byPatient} />
        </section>
      </div>

      <section className="rounded-3xl p-5 sm:p-6" style={glass}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Cohort payment behavior</h2>
          <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Cumulative revenue · ₹k per week</span>
        </div>
        <CohortHeatmap rows={cohortRows} cols={cohortCols}
          cell={(r, c) => Math.max(0, 6000 + (r * 1800) + (c * 900) - (r === 4 ? 3000 : 0))} />
      </section>

      <section className="rounded-3xl p-5 sm:p-6" style={glass}>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Cash flow projection</h2>
          <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>30 · 60 · 90 day outlook</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[30, 60, 90].map((d) => {
            const projected = ytd / 6 * (d / 30);
            return (
              <div key={d} className="rounded-2xl p-4" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{d}-day</div>
                <div className="mt-1"><CurrencyNumber value={projected} size="lg" /></div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex gap-2 justify-end">
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px]" style={pill}><FileText className="w-3.5 h-3.5" /> PDF</button>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px]" style={pill}><Download className="w-3.5 h-3.5" /> CSV</button>
        <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[12px]" style={pill}><Mail className="w-3.5 h-3.5" /> Email to accountant</button>
      </div>
    </div>
  );
}

const glass = { background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` } as const;
const pill = { background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink } as const;
