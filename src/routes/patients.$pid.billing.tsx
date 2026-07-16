import { createFileRoute, Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { invoicesForPatient, paymentsForPatient, METHOD_META } from "@/lib/billing-store";
import { CurrencyNumber, StatusPill } from "@/components/viz/billing";
import { useHydrated } from "@/lib/use-hydrated";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/patients/$pid/billing")({
  head: () => ({ meta: [{ title: "Patient billing — PeaceCode", }, { name: "robots", content: "noindex" }] }),
  component: PatientBilling,
});

function PatientBilling() {
  const { pid } = Route.useParams();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-96" />;
  const invoices = invoicesForPatient(pid);
  const payments = paymentsForPatient(pid);
  const outstanding = invoices.reduce((s, i) => s + i.balance, 0);
  const ltv = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const billed = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Outstanding" value={outstanding} accent={outstanding > 0 ? "#B6763A" : undefined} />
        <StatBox label="Lifetime value" value={ltv} />
        <StatBox label="Total billed" value={billed} />
        <StatBox label="Invoices" value={invoices.length} format="count" />
      </div>

      <section className="rounded-3xl overflow-hidden" style={glass}>
        <div className="flex items-baseline justify-between px-5 py-3">
          <h3 className="text-[13.5px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Invoices</h3>
          <Link to="/billing/invoices/new" className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px]"
            style={{ background: palette.primary, color: "#fff" }}>
            <Plus className="w-3 h-3" /> New
          </Link>
        </div>
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-[12px]" style={{ color: palette.muted }}>No invoices yet.</div>
        ) : invoices.map((i) => (
          <Link key={i.id} to="/billing/invoices/$id" params={{ id: i.id }}
            className="grid grid-cols-[130px_1fr_110px_110px_100px] gap-3 px-5 py-3 items-center text-[12px]"
            style={{ borderTop: `1px solid ${palette.border}` }}>
            <span className="font-mono" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{i.id}</span>
            <span style={{ color: palette.muted }}>{new Date(i.issuedAt).toLocaleDateString()}</span>
            <span className="text-right"><CurrencyNumber value={i.total} size="sm" animate={false} /></span>
            <span className="text-right"><CurrencyNumber value={i.balance} size="sm" animate={false} muted={i.balance === 0} /></span>
            <span><StatusPill status={i.status} /></span>
          </Link>
        ))}
      </section>

      {payments.length > 0 && (
        <section className="rounded-3xl overflow-hidden" style={glass}>
          <h3 className="px-5 py-3 text-[13.5px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Payment history</h3>
          {payments.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_130px_140px_100px] gap-3 px-5 py-2.5 items-center text-[12px]"
              style={{ borderTop: `1px solid ${palette.border}` }}>
              <span style={{ color: palette.muted }}>{new Date(p.receivedAt).toLocaleDateString()}</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: METHOD_META[p.method].color }} />{METHOD_META[p.method].label}</span>
              <span className="font-mono text-[10.5px]" style={{ fontFamily: "'DM Mono', monospace", color: palette.muted }}>{p.reference ?? "—"}</span>
              <span className="text-right"><CurrencyNumber value={p.amount} size="sm" animate={false} /></span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function StatBox({ label, value, accent, format }: { label: string; value: number; accent?: string; format?: "count" }) {
  return (
    <div className="rounded-2xl p-4" style={glass}>
      <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        {format === "count"
          ? <span className="text-[22px] font-mono tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{value}</span>
          : <CurrencyNumber value={value} size="lg" />}
        {accent && <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />}
      </div>
    </div>
  );
}
const glass = { background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` } as const;
