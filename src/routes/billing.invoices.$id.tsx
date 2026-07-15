import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { useLiveInvoice, recordPayment, sendReminder, updateInvoiceStatus, paymentsForInvoice, formatINR, type PaymentMethod } from "@/lib/billing-store";
import { getPatient, avatarUrl } from "@/lib/patients-store";
import { CurrencyNumber, PaymentRing, StatusPill } from "@/components/viz/billing";
import { Download, Send, Copy, XCircle, RotateCcw, FileText, ArrowLeft, Plus } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/invoices/$id")({
  head: () => ({ meta: [{ title: "Invoice — PeaceCode · Practice" }, { name: "robots", content: "noindex" }] }),
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const hydrated = useHydrated();
  const { id } = Route.useParams();
  const inv = useLiveInvoice(id);
  const nav = useNavigate();
  const [payOpen, setPayOpen] = useState(false);
  if (!hydrated) return <div className="h-96" />;
  if (!inv) return <div className="text-[12px]" style={{ color: palette.muted }}>Invoice not found.</div>;
  const patient = getPatient(inv.patientId);
  const payments = paymentsForInvoice(inv.id);

  return (
    <div>
      <Link to="/billing/invoices" className="inline-flex items-center gap-1 text-[11.5px] mb-3 hover:underline" style={{ color: palette.muted }}>
        <ArrowLeft className="w-3.5 h-3.5" /> All invoices
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-[62%_36%] gap-5">
        {/* Left — the invoice document */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <StatusPill status={inv.status} />
            <div className="text-right">
              <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Balance</div>
              <CurrencyNumber value={inv.balance} size="xl" />
            </div>
          </div>
          <article className="rounded-3xl p-8" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
            <header className="flex items-start justify-between mb-8">
              <div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-2" style={{ background: palette.primary, fontFamily: "'Fraunces', serif" }}>P</div>
                <div style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 16 }}>PeaceCode Practice</div>
                <div className="text-[10.5px]" style={{ color: palette.muted }}>Dr. Sharma · Clinical Psychologist</div>
              </div>
              <div className="text-right">
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Invoice</div>
                <div className="text-[16px] font-mono tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{inv.id}</div>
                <div className="text-[10.5px] mt-2" style={{ color: palette.muted }}>Issued {new Date(inv.issuedAt).toLocaleDateString()}</div>
                <div className="text-[10.5px]" style={{ color: palette.muted }}>Due {new Date(inv.dueAt).toLocaleDateString()}</div>
              </div>
            </header>

            <section className="mb-8">
              <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Bill to</div>
              <div className="text-[14px] mt-1" style={{ color: palette.ink }}>{patient?.fullName}</div>
              <div className="text-[11px]" style={{ color: palette.muted }}>{patient?.email}</div>
              {patient?.college && <div className="text-[11px]" style={{ color: palette.muted }}>{patient.college}</div>}
            </section>

            <table className="w-full text-[12px] mb-8">
              <thead>
                <tr style={{ borderBottom: `1px solid ${palette.border}` }}>
                  <th className="text-left py-2 text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Description</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>CPT</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Qty</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Rate</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.lineItems.map((li) => (
                  <tr key={li.id}>
                    <td className="py-3" style={{ color: palette.ink }}>{li.description}</td>
                    <td className="py-3 font-mono text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{li.cptCode ?? "—"}</td>
                    <td className="py-3 text-right font-mono tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{li.qty}</td>
                    <td className="py-3 text-right"><CurrencyNumber value={li.rate} size="sm" animate={false} /></td>
                    <td className="py-3 text-right"><CurrencyNumber value={li.amount} size="sm" animate={false} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-72 space-y-1.5 text-[12px]">
                <Row label="Subtotal" value={inv.subtotal} />
                {inv.discount > 0 && <Row label="Discount" value={-inv.discount} />}
                <Row label={`GST ${Math.round(inv.taxRate * 100)}%`} value={inv.taxAmount} />
                <div className="pt-2 mt-2 flex items-baseline justify-between" style={{ borderTop: `1px solid ${palette.border}` }}>
                  <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Total</span>
                  <CurrencyNumber value={inv.total} size="lg" />
                </div>
                {inv.amountPaid > 0 && <Row label="Paid" value={-inv.amountPaid} muted />}
                {inv.balance > 0 && (
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Balance due</span>
                    <CurrencyNumber value={inv.balance} size="md" />
                  </div>
                )}
              </div>
            </div>

            {inv.notes && (
              <footer className="mt-8 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Notes</div>
                <p className="text-[11.5px] mt-1" style={{ color: palette.muted }}>{inv.notes}</p>
              </footer>
            )}
          </article>
        </div>

        {/* Right — actions & activity */}
        <aside className="space-y-4">
          <div className="rounded-2xl p-5 flex flex-col items-center" style={glass}>
            <PaymentRing paid={inv.amountPaid} total={inv.total} />
            <div className="mt-3 flex items-baseline gap-2">
              <CurrencyNumber value={inv.amountPaid} size="sm" muted />
              <span className="text-[10.5px]" style={{ color: palette.muted }}>of</span>
              <CurrencyNumber value={inv.total} size="sm" muted />
            </div>
          </div>

          <div className="rounded-2xl p-3 space-y-1.5" style={glass}>
            <ActionBtn primary disabled={inv.balance === 0} onClick={() => setPayOpen(true)}><Plus className="w-3.5 h-3.5" /> Record payment</ActionBtn>
            <ActionBtn disabled={inv.balance === 0} onClick={() => { sendReminder(inv.id); alert("Reminder sent."); }}><Send className="w-3.5 h-3.5" /> Send reminder</ActionBtn>
            <ActionBtn onClick={() => alert("PDF export coming soon.")}><Download className="w-3.5 h-3.5" /> Download PDF</ActionBtn>
            <ActionBtn onClick={() => alert("Duplicated.")}><Copy className="w-3.5 h-3.5" /> Duplicate</ActionBtn>
            <ActionBtn onClick={() => alert("Claim drafted.")}><FileText className="w-3.5 h-3.5" /> Convert to claim</ActionBtn>
            <ActionBtn onClick={() => { if (confirm("Void this invoice?")) { updateInvoiceStatus(inv.id, "void"); nav({ to: "/billing/invoices" }); } }}><XCircle className="w-3.5 h-3.5" /> Void</ActionBtn>
            <ActionBtn onClick={() => { if (confirm("Refund and mark as refunded?")) updateInvoiceStatus(inv.id, "refunded"); }}><RotateCcw className="w-3.5 h-3.5" /> Refund</ActionBtn>
          </div>

          <div className="rounded-2xl p-4" style={glass}>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Activity</div>
            <ol className="relative pl-5 space-y-3">
              <span className="absolute left-1.5 top-1 bottom-1 w-px" style={{ background: palette.border }} />
              {[...inv.activity].reverse().map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-4 top-1 w-2 h-2 rounded-full" style={{ background: palette.primary }} />
                  <div className="text-[11.5px]" style={{ color: palette.ink }}>{eventLabel(ev.kind)}</div>
                  <div className="text-[10px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {new Date(ev.at).toLocaleString("en", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </div>
                  {ev.note && <div className="text-[10.5px] mt-0.5 font-mono" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{ev.note}</div>}
                </li>
              ))}
            </ol>
          </div>

          {payments.length > 0 && (
            <div className="rounded-2xl p-4" style={glass}>
              <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Payments received</div>
              {payments.map((p) => (
                <div key={p.id} className="flex items-baseline justify-between py-1.5 text-[11.5px]" style={{ borderTop: `1px solid ${palette.border}` }}>
                  <span style={{ color: palette.muted }}>{new Date(p.receivedAt).toLocaleDateString()} · {p.method.toUpperCase()}</span>
                  <span className="font-mono tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{formatINR(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl p-4" style={glass}>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Reminders</div>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px]" style={{ color: palette.ink }}>Sent</span>
              <span className="font-mono tabular-nums text-[13px]" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{inv.remindersSent}</span>
            </div>
          </div>
        </aside>
      </div>

      {payOpen && <RecordPaymentModal invoiceId={inv.id} balance={inv.balance} onClose={() => setPayOpen(false)} />}
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span style={{ color: palette.muted }}>{label}</span>
      <CurrencyNumber value={value} size="sm" animate={false} muted={muted} />
    </div>
  );
}

function ActionBtn({ children, primary, disabled, onClick }: { children: React.ReactNode; primary?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full inline-flex items-center gap-2 px-3 h-9 rounded-lg text-[12px] disabled:opacity-40 transition-colors"
      style={primary
        ? { background: palette.primary, color: "#fff" }
        : { background: "transparent", color: palette.ink }}
      onMouseOver={(e) => { if (!primary && !disabled) e.currentTarget.style.background = palette.surface2; }}
      onMouseOut={(e) => { if (!primary) e.currentTarget.style.background = "transparent"; }}>
      {children}
    </button>
  );
}

function RecordPaymentModal({ invoiceId, balance, onClose }: { invoiceId: string; balance: number; onClose: () => void }) {
  const [amount, setAmount] = useState(balance);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [ref, setRef] = useState("");
  function submit() {
    recordPayment({ invoiceId, amount, method, reference: ref });
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl p-6" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
        <h3 className="text-[18px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Record payment</h3>
        <div className="mt-4 space-y-3">
          <Field label="Amount">
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg text-[14px] font-mono tabular-nums" style={{ ...field, fontFamily: "'DM Mono', monospace" }} />
          </Field>
          <Field label="Method">
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full h-10 px-3 rounded-lg text-[13px]" style={field}>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Netbanking</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="insurance">Insurance</option>
            </select>
          </Field>
          <Field label="Reference / txn ID">
            <input value={ref} onChange={(e) => setRef(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-[12.5px] font-mono" style={{ ...field, fontFamily: "'DM Mono', monospace" }} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="h-9 px-4 rounded-full text-[12px]" style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>Cancel</button>
          <button onClick={submit} className="h-9 px-4 rounded-full text-[12px]" style={{ background: palette.primary, color: "#fff" }}>Record payment</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function eventLabel(kind: string) {
  switch (kind) {
    case "created": return "Invoice created";
    case "sent": return "Sent to patient";
    case "viewed": return "Patient viewed";
    case "reminder": return "Reminder sent";
    case "payment": return "Payment received";
    case "paid": return "Marked paid";
    case "voided": return "Voided";
    case "refunded": return "Refunded";
    case "converted_to_claim": return "Converted to claim";
    default: return kind;
  }
}

const glass = { background: "rgba(255,255,255,0.5)", backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` } as const;
const field = { background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink } as const;
void avatarUrl;
