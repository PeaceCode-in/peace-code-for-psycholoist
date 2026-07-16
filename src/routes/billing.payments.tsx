import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { palette } from "@/components/practice/palette";
import { useLivePayments, toggleReconciled, METHOD_META, formatINR } from "@/lib/billing-store";
import { getPatient } from "@/lib/patients-store";
import { CurrencyNumber } from "@/components/viz/billing";
import { Copy, Check } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/payments")({
  head: () => ({ meta: [{ title: "Payments — Billing · PeaceCode" }] }),
  component: PaymentLedger,
});

function PaymentLedger() {
  const hydrated = useHydrated();
  const payments = useLivePayments();
  const now = Date.now();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  const stats = useMemo(() => {
    const monthTotal = payments.filter((p) => p.receivedAt >= monthStart).reduce((s, p) => s + p.amount, 0);
    const awaiting = payments.filter((p) => !p.reconciled).reduce((s, p) => s + p.amount, 0);
    const reconciled = payments.filter((p) => p.reconciled).reduce((s, p) => s + p.amount, 0);
    return { monthTotal, awaiting, reconciled };
  }, [payments, monthStart]);

  // group by date
  const groups = useMemo(() => {
    const map = new Map<string, typeof payments>();
    for (const p of payments) {
      const key = new Date(p.receivedAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" });
      const arr = map.get(key) ?? [];
      arr.push(p); map.set(key, arr);
    }
    return [...map.entries()];
  }, [payments]);

  if (!hydrated) return <div className="h-96" />;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatPill label="Received · this month" value={stats.monthTotal} />
        <StatPill label="Awaiting reconciliation" value={stats.awaiting} accent="#B6763A" />
        <StatPill label="Reconciled" value={stats.reconciled} accent="#5C8F6B" />
      </div>

      <div className="rounded-3xl overflow-hidden" style={{ background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` }}>
        {groups.length === 0 && <div className="p-10 text-center text-[12px]" style={{ color: palette.muted }}>No payments yet.</div>}
        {groups.map(([date, rows]) => (
          <div key={date}>
            <div className="px-5 py-2 text-[10.5px] uppercase tracking-[0.14em] sticky top-0 z-10"
              style={{ background: "rgba(246,241,242,0.9)", backdropFilter: "blur(8px)", color: palette.muted, fontFamily: "'Fraunces', serif", borderBottom: `1px solid ${palette.border}` }}>
              {date}
            </div>
            {rows.map((p) => {
              const meta = METHOD_META[p.method];
              const patient = getPatient(p.patientId);
              return (
                <div key={p.id} className="grid grid-cols-[1fr_130px_170px_140px_28px_100px] gap-3 px-5 py-2.5 items-center text-[12px]"
                  style={{ borderBottom: `1px solid ${palette.border}` }}>
                  <span className="truncate" style={{ color: palette.ink }}>{patient?.fullName ?? "—"}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                    <span style={{ color: palette.muted }}>{meta.label}</span>
                  </span>
                  <button className="inline-flex items-center gap-1.5 font-mono text-[11px] group"
                    onClick={() => { if (p.reference) navigator.clipboard?.writeText(p.reference); }}
                    style={{ fontFamily: "'DM Mono', monospace", color: palette.muted }}>
                    {p.reference ?? "—"}
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                  </button>
                  <span className="text-right"><CurrencyNumber value={p.amount} size="sm" animate={false} /></span>
                  <button onClick={() => toggleReconciled(p.id)} title={p.reconciled ? "Reconciled" : "Mark reconciled"}
                    className="w-5 h-5 rounded-md inline-flex items-center justify-center"
                    style={{ background: p.reconciled ? "#E6F0E8" : "#fff", border: `1px solid ${p.reconciled ? "#7BA88A" : palette.border}` }}>
                    {p.reconciled && <Check className="w-3 h-3" style={{ color: "#5C8F6B" }} />}
                  </button>
                  <Link to="/billing/invoices/$id" params={{ id: p.invoiceId }} className="text-[10.5px] font-mono truncate hover:underline"
                    style={{ fontFamily: "'DM Mono', monospace", color: palette.primary }}>{p.invoiceId}</Link>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` }}>
      <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <CurrencyNumber value={value} size="lg" />
        {accent && <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />}
      </div>
    </div>
  );
}
void formatINR;
