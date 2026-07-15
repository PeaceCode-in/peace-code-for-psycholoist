import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Download, FileText } from "lucide-react";
import { PortalShell, Card, Chip, portal } from "@/components/portal/PortalShell";
import { fmtDateWarm, fmtMoney, markInvoicePaid, useMyInvoices } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/billing")({
  head: () => ({ meta: [{ title: "Billing" }, { name: "robots", content: "noindex" }] }),
  component: Billing,
});

function Billing() {
  const invoices = useMyInvoices();
  const outstanding = invoices.filter(i => i.status !== "paid");
  const paid = invoices.filter(i => i.status === "paid");
  const total = outstanding.reduce((s, i) => s + i.amount, 0);
  const [autopay, setAutopay] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [card, setCard] = useState<{ brand: string; last4: string } | null>({ brand: "HDFC Visa", last4: "4218" });

  return (
    <PortalShell title="Billing" subtitle="Invoices, receipts, and how you're paying.">
      {outstanding.length > 0 && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[13px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Balance due</p>
              <p className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontSize: 36, letterSpacing: -0.5 }}>{fmtMoney(total)}</p>
              <p className="text-[13px]" style={{ color: portal.muted }}>{outstanding.length} invoice{outstanding.length === 1 ? "" : "s"} awaiting payment</p>
            </div>
            <button
              onClick={() => outstanding.forEach(i => markInvoicePaid(i.id))}
              className="rounded-full px-5 py-2.5 text-[14px]"
              style={{ background: portal.rose, color: "#fff" }}
            >Pay {fmtMoney(total)}</button>
          </div>
        </Card>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Invoices</h2>
        <div className="flex flex-col gap-2">
          {invoices.map(i => (
            <div key={i.id} className="flex flex-wrap items-center gap-4 rounded-2xl p-4" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
              <div className="min-w-0 flex-1">
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>{i.number}</p>
                <p className="text-[13px]" style={{ color: portal.muted }}>{fmtDateWarm(i.issuedAt)}</p>
              </div>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20, letterSpacing: -0.2 }}>{fmtMoney(i.amount)}</p>
              <Chip tone={i.status === "paid" ? "calm" : i.status === "overdue" ? "elevated" : "attend"}>
                {i.status === "paid" ? "Paid" : i.status === "overdue" ? "Overdue" : "Due"}
              </Chip>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>
                  <Download className="h-3 w-3" /> Receipt
                </button>
                <button className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>
                  <FileText className="h-3 w-3" /> Superbill
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Card className="mb-6">
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>Payment method</h3>
        {card ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-14 place-items-center rounded-lg" style={{ background: portal.soft, color: portal.roseDeep }}>
                <CreditCard className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-[14.5px]">{card.brand}</p>
                <p className="text-[13px]" style={{ color: portal.muted }}>ending in {card.last4}</p>
              </div>
            </div>
            {confirmRemove ? (
              <div className="flex items-center gap-2">
                <span className="text-[13px]" style={{ color: portal.muted }}>Remove this card?</span>
                <button onClick={() => setConfirmRemove(false)} className="rounded-full px-3 py-1.5 text-[12px]" style={{ color: portal.muted }}>Keep</button>
                <button onClick={() => { setCard(null); setConfirmRemove(false); }} className="rounded-full px-3 py-1.5 text-[12px]" style={{ background: portal.roseDeep, color: "#fff" }}>Remove</button>
              </div>
            ) : (
              <button onClick={() => setConfirmRemove(true)} className="text-[13px]" style={{ color: portal.muted }}>Remove</button>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <button onClick={() => setCard({ brand: "HDFC Visa", last4: "4218" })} className="rounded-full px-4 py-2 text-[13px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>
              Add a card
            </button>
          </div>
        )}

        <label className="mt-6 flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: portal.border }}>
          <div>
            <p className="text-[14.5px]">Autopay</p>
            <p className="text-[13px]" style={{ color: portal.muted }}>Charge my card on file after each session.</p>
          </div>
          <button
            onClick={() => setAutopay(v => !v)}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ background: autopay ? portal.rose : "#E4D7DA" }}
            aria-pressed={autopay}
          >
            <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: autopay ? 22 : 2 }} />
          </button>
        </label>
      </Card>

      <Card>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>Insurance</h3>
        <p className="mt-1 text-[13px]" style={{ color: portal.muted }}>Superbills are provided in a format most Indian insurers accept for reimbursement.</p>
        <button className="mt-4 rounded-full px-4 py-2 text-[13px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>Upload insurance card</button>
      </Card>
    </PortalShell>
  );
}
