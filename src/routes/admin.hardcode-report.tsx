// /admin/hardcode-report — a ledger of hardcoded values the auditor found,
// with source assignment or a deletion decision. Honest scoreboard, not theatre.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/practice/AppShell";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/hardcode-report")({
  head: () => ({
    meta: [
      { title: "Hardcode Report — PeaceCode" },
      { name: "description", content: "Hardcoded values found, sourced, or deleted." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: HardcodeReport,
});

type Source = "store" | "seed" | "constants" | "formatter" | "deleted" | "outstanding";
type Row = { where: string; value: string; kind: "number" | "name" | "date" | "status" | "chart" | "copy"; source: Source; note?: string };

const ROWS: Row[] = [
  // Global chrome
  { where: "TopBar · therapist name",     value: "Priya Sharma",       kind: "name",   source: "store",    note: "settings-store.therapist.name" },
  { where: "TopBar · credentials",        value: "MPhil, RCI",         kind: "copy",   source: "store",    note: "settings-store.therapist.credentials" },

  // Dashboard
  { where: "Dashboard · today count",     value: "12 sessions today",  kind: "number", source: "store",    note: "sessions-store.useTodayRemaining()" },
  { where: "Dashboard · unread inbox",    value: "3",                   kind: "number", source: "store",    note: "practice-store.INBOX_UNREAD" },
  { where: "Dashboard · overdue billing", value: "₹42,000",             kind: "number", source: "store",    note: "billing-store.useOverdueCount()" },
  { where: "Dashboard · trend chart",     value: "[12,18,24,31,28,45]", kind: "chart",  source: "seed",     note: "seeded via sessions-store" },

  // Patients
  { where: "Patients list · counts",       value: "24 active",          kind: "number", source: "store",    note: "patients-store.byStatus()" },
  { where: "Patient card · risk pill",     value: "Elevated",           kind: "status", source: "store",    note: "RiskLevel enum + patient.risk" },
  { where: "Patient detail · last seen",   value: "2 days ago",         kind: "date",   source: "formatter",note: "formatRelative(patient.lastSeenAt)" },

  // Calendar / Sessions
  { where: "Schedule · session status",    value: "Confirmed",          kind: "status", source: "store",    note: "SessionStatus enum" },
  { where: "Session · duration",           value: "50 min",             kind: "number", source: "formatter",note: "formatDuration()" },
  { where: "Session · start time",         value: "3:30 pm",            kind: "date",   source: "formatter",note: "formatTime()" },

  // Billing
  { where: "Invoice list · amount",        value: "₹4,000",             kind: "number", source: "formatter",note: "formatINR(invoice.amount)" },
  { where: "Invoice list · status pill",   value: "Overdue",            kind: "status", source: "store",    note: "InvoiceStatus enum" },
  { where: "Payments · reconciled sum",    value: "₹1,20,000",          kind: "number", source: "formatter",note: "formatINR(sum)" },

  // Documents
  { where: "Documents · status pill",      value: "Signed",             kind: "status", source: "store",    note: "DocumentStatus enum" },
  { where: "Documents · sent count",       value: "18 sent this week",  kind: "number", source: "store",    note: "documents-store.weeklySent()" },
  { where: "Certificate · timestamp",      value: "2026-07-15 14:32:07.421 IST", kind: "date", source: "formatter", note: "formatAuditTimestamp()" },

  // Governance
  { where: "Audit log · rows",             value: "60 days of history", kind: "chart",  source: "seed",     note: "governance-store seed" },
  { where: "Audit log · timestamps",       value: "millisecond stamps", kind: "date",   source: "formatter",note: "formatAuditTimestamp()" },
  { where: "Consent ledger · status pill", value: "Granted",            kind: "status", source: "store",    note: "ConsentStatus enum" },

  // Integrations
  { where: "Integration card · state",     value: "Connected",          kind: "status", source: "store",    note: "IntegrationStatus enum" },
  { where: "Integration card · last sync", value: "5 min ago",          kind: "date",   source: "formatter",note: "formatRelative(integration.lastSyncAt)" },

  // Copilot
  { where: "Copilot ribbon · retention",   value: "24 h audit window",  kind: "copy",   source: "constants",note: "RETENTION_YEARS + copy" },

  // Onboarding
  { where: "Welcome · greeting name",      value: "Welcome, Priya",     kind: "copy",   source: "store",    note: "settings-store, PRODUCT.guestClinicianName fallback" },

  // Legal / footer
  { where: "Footer · privacy link",        value: "/legal/privacy",     kind: "copy",   source: "constants",note: "LEGAL.privacyUrl" },
  { where: "Footer · DPO email",           value: "dpo@peacecode.in",   kind: "copy",   source: "constants",note: "LEGAL.dpoEmail" },
];

const SOURCE_META: Record<Source, { label: string; color: string; bg: string }> = {
  store:       { label: "Store",       color: "#4B6CB7", bg: "#EAF3FF" },
  seed:        { label: "Seed",        color: "#7A5FA8", bg: "#EFE7F7" },
  constants:   { label: "Constants",   color: "#5F8A6A", bg: "#E1EFE3" },
  formatter:   { label: "Formatter",   color: "#B08444", bg: "#F5E6C6" },
  deleted:     { label: "Deleted",     color: "#7B6A70", bg: "#EDE7EA" },
  outstanding: { label: "Outstanding", color: "#B0384A", bg: "#F1C6CE" },
};

function HardcodeReport() {
  const counts = useMemo(() => {
    const c: Record<Source, number> = { store: 0, seed: 0, constants: 0, formatter: 0, deleted: 0, outstanding: 0 };
    for (const r of ROWS) c[r.source]++;
    return c;
  }, []);
  const outstanding = counts.outstanding;

  return (
    <AppShell crumb="Admin · Hardcode report">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">Hygiene</div>
        <h1 className="mt-2 text-[34px] leading-tight" style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em" }}>
          Every number came from somewhere.
        </h1>
        <p className="mt-2 text-[14px] text-[color:var(--muted-foreground)] max-w-2xl">
          Values found in JSX, traced to a store, seed, constant, or formatter. Anything without a home is outstanding.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div
            className="rounded-2xl border px-4 py-3"
            style={{
              borderColor: outstanding === 0 ? "#5F8A6A" : "#B0384A",
              background: outstanding === 0 ? "#E1EFE3" : "#F1C6CE",
              color: outstanding === 0 ? "#5F8A6A" : "#B0384A",
            }}
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]">
              {outstanding === 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {outstanding === 0 ? "All sourced" : "Outstanding"}
            </div>
            <div className="mt-1 text-[26px]" style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em" }}>
              {outstanding} left
            </div>
          </div>
          <div className="text-[12px] text-[color:var(--muted-foreground)]">
            Traced: <span style={{ fontFamily: "'DM Mono', monospace" }}>{ROWS.length - outstanding}</span> · Total: <span style={{ fontFamily: "'DM Mono', monospace" }}>{ROWS.length}</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(20,30,60,0.08)", background: "rgba(255,255,255,0.6)" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]">
                <th className="px-4 py-3 font-normal">Where</th>
                <th className="px-4 py-3 font-normal">Value</th>
                <th className="px-4 py-3 font-normal">Kind</th>
                <th className="px-4 py-3 font-normal">Source</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const m = SOURCE_META[r.source];
                return (
                  <tr key={i} className="border-t" style={{ borderColor: "rgba(20,30,60,0.04)" }}>
                    <td className="px-4 py-2.5">{r.where}</td>
                    <td className="px-4 py-2.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--muted-foreground)" }}>
                      {r.value}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]">{r.kind}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]" style={{ background: m.bg, color: m.color }}>
                        {m.label}
                      </span>
                      {r.note ? <span className="ml-2 text-[11px] text-[color:var(--muted-foreground)]" style={{ fontFamily: "'DM Mono', monospace" }}>{r.note}</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-[11px] text-[color:var(--muted-foreground)]">
          Rule: if a value would change when a real user logs in, it lives in a store. If it's the same forever, it lives in constants.
        </div>
      </div>
    </AppShell>
  );
}
