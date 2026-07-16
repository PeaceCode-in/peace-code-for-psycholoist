import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { palette } from "@/components/practice/palette";
import {
  listServices, createInvoice, updateInvoiceStatus, type PaymentTerms, type LineItem,
} from "@/lib/billing-store";
import { listPatients, getPatient, avatarUrl } from "@/lib/patients-store";
import { CurrencyNumber } from "@/components/viz/billing";
import { Plus, X, ChevronDown } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/invoices/new")({
  head: () => ({ meta: [{ title: "New invoice — Billing · PeaceCode" }] }),
  component: NewInvoice,
});

type Draft = Omit<LineItem, "id" | "amount">;

function NewInvoice() {
  const hydrated = useHydrated();
  const nav = useNavigate();
  const [patientId, setPatientId] = useState("");
  const [patientOpen, setPatientOpen] = useState(false);
  const [lines, setLines] = useState<Draft[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0.18);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState<PaymentTerms>("net15");

  const services = hydrated ? listServices() : [];
  const patients = hydrated ? listPatients({ status: "active" }) : [];
  const patient = getPatient(patientId);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.qty * l.rate, 0), [lines]);
  const tax = Math.round((subtotal - discount) * taxRate);
  const total = subtotal - discount + tax;

  function addService(sid: string) {
    const s = services.find((x) => x.id === sid);
    if (!s) return;
    setLines((ls) => [...ls, { description: `${s.service} — ${s.duration} min`, qty: 1, rate: s.standardRate, cptCode: s.cptCode }]);
  }
  function updateLine(idx: number, patch: Partial<Draft>) {
    setLines((ls) => ls.map((l, i) => i === idx ? { ...l, ...patch } : l));
  }
  function removeLine(idx: number) { setLines((ls) => ls.filter((_, i) => i !== idx)); }

  function save(status: "draft" | "sent") {
    if (!patientId || lines.length === 0) return;
    const inv = createInvoice({ patientId, lineItems: lines, discount, taxRate, notes, paymentTerms: terms, status });
    if (status === "sent") updateInvoiceStatus(inv.id, "sent");
    nav({ to: "/billing/invoices/$id", params: { id: inv.id } });
  }

  if (!hydrated) return <div className="h-96" />;

  return (
    <div className="max-w-[760px] mx-auto space-y-5">
      <h1 className="text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Create invoice</h1>

      {/* Patient picker */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <label className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Patient</label>
        <div className="relative mt-2">
          <button onClick={() => setPatientOpen((v) => !v)}
            className="w-full flex items-center justify-between h-11 px-3 rounded-xl text-[13px]"
            style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: patient ? palette.ink : palette.muted }}>
            <span className="flex items-center gap-2">
              {patient && <img src={avatarUrl(patient.id)} className="w-6 h-6 rounded-full" alt="" />}
              {patient ? patient.fullName : "Select a patient"}
            </span>
            <ChevronDown className="w-4 h-4" style={{ color: palette.muted }} />
          </button>
          {patientOpen && (
            <div className="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-xl"
              style={{ background: palette.solid, border: `1px solid ${palette.border}`, boxShadow: "0 12px 32px rgba(30,20,24,0.08)" }}>
              {patients.map((p) => (
                <button key={p.id} onClick={() => { setPatientId(p.id); setPatientOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] hover:bg-black/[0.03]" style={{ color: palette.ink }}>
                  <img src={avatarUrl(p.id)} className="w-6 h-6 rounded-full" alt="" />
                  <span className="flex-1 text-left">{p.fullName}</span>
                  <span className="text-[10.5px]" style={{ color: palette.muted }}>{p.college}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-2xl p-4" style={cardStyle}>
        <div className="flex items-baseline justify-between mb-3">
          <label className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Line items</label>
          <div className="relative">
            <select onChange={(e) => { if (e.target.value) { addService(e.target.value); e.target.value = ""; } }}
              className="text-[11.5px] pr-6 pl-3 h-8 rounded-full appearance-none cursor-pointer"
              style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}>
              <option value="">+ Add from catalog</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.service} · ₹ {s.standardRate}</option>)}
            </select>
          </div>
        </div>
        {lines.length === 0 ? (
          <div className="py-6 text-center text-[11.5px]" style={{ color: palette.muted }}>Add a service to begin.</div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_80px_60px_100px_100px_28px] gap-2 text-[10px] uppercase tracking-[0.12em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>
              <span>Description</span><span>CPT</span><span>Qty</span><span className="text-right">Rate</span><span className="text-right">Amount</span><span />
            </div>
            {lines.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_60px_100px_100px_28px] gap-2 items-center">
                <input value={l.description} onChange={(e) => updateLine(i, { description: e.target.value })}
                  className="h-9 px-2 rounded-lg text-[12px]" style={fieldStyle} />
                <input value={l.cptCode ?? ""} onChange={(e) => updateLine(i, { cptCode: e.target.value })}
                  className="h-9 px-2 rounded-lg text-[11.5px] font-mono" style={{ ...fieldStyle, fontFamily: "'DM Mono', monospace" }} />
                <input type="number" value={l.qty} onChange={(e) => updateLine(i, { qty: Number(e.target.value) })}
                  className="h-9 px-2 rounded-lg text-[12px] font-mono tabular-nums text-right" style={{ ...fieldStyle, fontFamily: "'DM Mono', monospace" }} />
                <input type="number" value={l.rate} onChange={(e) => updateLine(i, { rate: Number(e.target.value) })}
                  className="h-9 px-2 rounded-lg text-[12px] font-mono tabular-nums text-right" style={{ ...fieldStyle, fontFamily: "'DM Mono', monospace" }} />
                <div className="h-9 flex items-center justify-end pr-2 text-[12px] font-mono tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>
                  <CurrencyNumber value={l.qty * l.rate} size="sm" animate={false} />
                </div>
                <button onClick={() => removeLine(i)} className="p-1" style={{ color: palette.muted }}><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Payment terms</label>
              <select value={terms} onChange={(e) => setTerms(e.target.value as PaymentTerms)}
                className="mt-1 w-full h-9 px-3 rounded-lg text-[12px]" style={fieldStyle}>
                <option value="immediate">Immediate</option>
                <option value="net7">Net 7</option>
                <option value="net15">Net 15</option>
                <option value="net30">Net 30</option>
              </select>
            </div>
            <div>
              <label className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Discount (₹)</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] font-mono" style={{ ...fieldStyle, fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div>
              <label className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Tax rate</label>
              <input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="mt-1 w-full h-9 px-3 rounded-lg text-[12px] font-mono" style={{ ...fieldStyle, fontFamily: "'DM Mono', monospace" }} />
            </div>
            <div>
              <label className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg text-[12px]" style={fieldStyle} />
            </div>
          </div>
          <div className="space-y-2 text-[12.5px]">
            <TotalRow label="Subtotal" value={subtotal} />
            <TotalRow label="Discount" value={-discount} muted />
            <TotalRow label={`GST ${Math.round(taxRate * 100)}%`} value={tax} muted />
            <div className="border-t pt-3 mt-2" style={{ borderColor: palette.border }}>
              <div className="flex items-baseline justify-between">
                <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Total due</span>
                <CurrencyNumber value={total} size="lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="sticky bottom-4 flex justify-end gap-2 rounded-2xl p-3" style={{ ...cardStyle, background: palette.glassStrong }}>
        <button onClick={() => save("draft")} disabled={!patientId || lines.length === 0}
          className="h-9 px-4 rounded-full text-[12px] disabled:opacity-40"
          style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}>
          Save draft
        </button>
        <button onClick={() => save("sent")} disabled={!patientId || lines.length === 0}
          className="h-9 px-4 rounded-full text-[12px] disabled:opacity-40 inline-flex items-center gap-1.5"
          style={{ background: palette.primary, color: "#fff" }}>
          Send invoice
        </button>
      </div>
    </div>
  );
}

function TotalRow({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[11.5px]" style={{ color: palette.muted }}>{label}</span>
      <CurrencyNumber value={value} size="sm" animate muted={muted} />
    </div>
  );
}

const cardStyle = { background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` } as const;
const fieldStyle = { background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink } as const;

void Plus;
