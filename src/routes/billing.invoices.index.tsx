import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { useLiveInvoices, sendReminder, INVOICE_STATUS_META, type InvoiceStatus } from "@/lib/billing-store";
import { getPatient, avatarUrl } from "@/lib/patients-store";
import { CurrencyNumber, StatusPill } from "@/components/viz/billing";
import { Plus, MoreHorizontal, Search, MailPlus } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/invoices/")({
  head: () => ({ meta: [{ title: "Invoices — Billing · PeaceCode" }] }),
  component: InvoiceList,
});

const FILTERS: Array<{ key: InvoiceStatus | "all" | "outstanding"; label: string }> = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Pending" },
  { key: "overdue", label: "Overdue" },
  { key: "partial", label: "Partial" },
  { key: "paid", label: "Paid" },
];

function InvoiceList() {
  const hydrated = useHydrated();
  const [filter, setFilter] = useState<InvoiceStatus | "all" | "outstanding">("all");
  const [search, setSearch] = useState("");
  const invoices = useLiveInvoices({ status: filter === "outstanding" ? "all" : filter, search });
  const shown = filter === "outstanding" ? invoices.filter((i) => i.balance > 0) : invoices;

  if (!hydrated) return <div className="h-96" />;

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-full text-[11.5px] transition-colors"
              style={{
                background: filter === f.key ? palette.ink : "rgba(255,255,255,0.5)",
                color: filter === f.key ? "#fff" : palette.muted,
                border: `1px solid ${palette.border}`,
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2" style={{ color: palette.muted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or patient"
              className="pl-8 pr-3 h-8 rounded-full text-[11.5px] w-56"
              style={{ background: palette.glass, border: `1px solid ${palette.border}`, color: palette.ink }} />
          </div>
          <Link to="/billing/invoices/new"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px]"
            style={{ background: palette.primary, color: "#fff" }}>
            <Plus className="w-3.5 h-3.5" /> New invoice
          </Link>
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden" style={cardStyle}>
        <div className="grid grid-cols-[130px_1fr_100px_100px_110px_110px_100px_36px] gap-3 px-5 py-3 text-[10.5px] uppercase tracking-[0.14em]"
          style={{ color: palette.muted, fontFamily: "'Fraunces', serif", borderBottom: `1px solid ${palette.border}` }}>
          <span>Invoice</span><span>Patient</span><span>Issued</span><span>Due</span>
          <span className="text-right">Total</span><span className="text-right">Balance</span><span>Status</span><span />
        </div>
        {shown.length === 0 && (
          <div className="p-10 text-center text-[12px]" style={{ color: palette.muted }}>
            {filter === "overdue" ? "No overdue invoices. Nice." : "No invoices match."}
          </div>
        )}
        {shown.map((inv) => {
          const patient = getPatient(inv.patientId);
          const dueSoon = inv.balance > 0 && inv.dueAt - Date.now() < 3 * 86_400_000 && inv.dueAt >= Date.now();
          const overdue = inv.balance > 0 && inv.dueAt < Date.now();
          return (
            <Link key={inv.id} to="/billing/invoices/$id" params={{ id: inv.id }}
              className="group grid grid-cols-[130px_1fr_100px_100px_110px_110px_100px_36px] gap-3 px-5 py-3.5 items-center transition-colors"
              style={{ borderBottom: `1px solid ${palette.border}` }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(241,199,214,0.15)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
              <span className="text-[12px] font-mono truncate" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{inv.id}</span>
              <span className="flex items-center gap-2 min-w-0">
                <img src={avatarUrl(inv.patientId)} className="w-6 h-6 rounded-full" alt="" />
                <span className="text-[12.5px] truncate" style={{ color: palette.ink }}>{patient?.fullName ?? "—"}</span>
              </span>
              <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {new Date(inv.issuedAt).toLocaleDateString("en", { day: "numeric", month: "short" })}
              </span>
              <span className="text-[11px]" style={{ color: overdue ? "#B0567A" : dueSoon ? "#B6763A" : palette.muted, fontFamily: "'Fraunces', serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {new Date(inv.dueAt).toLocaleDateString("en", { day: "numeric", month: "short" })}
              </span>
              <span className="text-right"><CurrencyNumber value={inv.total} size="sm" animate={false} /></span>
              <span className="text-right"><CurrencyNumber value={inv.balance} size="sm" animate={false} muted={inv.balance === 0} /></span>
              <span><StatusPill status={inv.status} /></span>
              <button
                onClick={(e) => { e.preventDefault(); if (inv.balance > 0) { sendReminder(inv.id); toast("Reminder sent."); } }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                style={{ color: palette.muted }} title="Send reminder">
                <MailPlus className="w-3.5 h-3.5" />
              </button>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <span>{shown.length} invoice{shown.length === 1 ? "" : "s"}</span>
        <span>Page 1</span>
      </div>
    </div>
  );
}

const cardStyle = {
  background: palette.glass,
  backdropFilter: "blur(24px) saturate(140%)",
  border: `1px solid ${palette.border}`,
} as const;

void MoreHorizontal;
