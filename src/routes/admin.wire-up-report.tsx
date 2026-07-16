// /admin/wire-up-report — a matrix of interactive elements × wire status.
// This is honest infrastructure: rows list what the auditor has walked.
// New routes must be walked and added here as they land.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/practice/AppShell";
import { CheckCircle2, AlertTriangle, XCircle, Ghost } from "lucide-react";

export const Route = createFileRoute("/admin/wire-up-report")({
  head: () => ({
    meta: [
      { title: "Wire-up Report — PeaceCode" },
      { name: "description", content: "Every interactive element × wire status." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WireUpReport,
});

type Status = "wired" | "half" | "dead" | "ghost";
type Row = { route: string; element: string; status: Status; note?: string };

const ROWS: Row[] = [
  // Global chrome
  { route: "global",          element: "Sidebar categories",            status: "wired" },
  { route: "global",          element: "Search (⌘K)",                    status: "wired" },
  { route: "global",          element: "Bell peek",                      status: "wired" },
  { route: "global",          element: "Copilot pill",                   status: "wired" },
  { route: "global",          element: "Checklist drawer (⌘.)",         status: "wired" },
  { route: "global",          element: "Shortcuts overlay (?)",         status: "wired" },
  { route: "global",          element: "Data handling sheet (⌘⇧D)",    status: "wired" },
  { route: "global",          element: "Emergency dialog",              status: "wired" },
  { route: "global",          element: "Quick-add menu",                 status: "wired" },
  { route: "global",          element: "Sign out",                       status: "wired" },

  // Today
  { route: "/dashboard",      element: "Today ribbon",                   status: "wired" },
  { route: "/dashboard",      element: "\"See all\" on cards",           status: "wired" },
  { route: "/inbox",          element: "Triage actions",                 status: "wired" },
  { route: "/alerts",         element: "Dismiss / snooze",               status: "wired" },
  { route: "/copilot",        element: "Draft SOAP / risk / translate",  status: "wired" },

  // Patients
  { route: "/patients",       element: "Filter chips",                   status: "wired" },
  { route: "/patients/$pid",  element: "Tabs (Overview → Documents)",    status: "wired" },
  { route: "/waitlist",       element: "Move to active",                 status: "wired" },
  { route: "/groups",         element: "New group",                      status: "wired" },
  { route: "/referrals",      element: "Accept / decline",               status: "wired" },

  // Calendar
  { route: "/calendar",       element: "Day / Week / Month toggles",     status: "wired" },
  { route: "/calendar/availability", element: "Slot editor",             status: "wired" },
  { route: "/calendar/booking-link", element: "Copy link",               status: "wired" },

  // Clinical
  { route: "/sessions/$id",   element: "Wrap flow (SOAP → ratify)",      status: "wired" },
  { route: "/assessments",    element: "Assign instrument",              status: "wired" },
  { route: "/treatment-plans",element: "Suggest intervention",           status: "wired" },
  { route: "/notes",          element: "Filter by patient",              status: "wired" },

  // Billing
  { route: "/billing/invoices", element: "Send / mark paid",             status: "wired" },
  { route: "/billing/payments", element: "Reconcile",                     status: "wired" },
  { route: "/billing/claims",   element: "Submit / track",                 status: "wired" },

  // Documents
  { route: "/documents",           element: "Library search",             status: "wired" },
  { route: "/documents/new",       element: "Send flow",                  status: "wired" },
  { route: "/portal/documents/$t", element: "Signature ceremony",         status: "wired" },

  // Governance
  { route: "/governance",              element: "Sub-nav (11 tabs)",      status: "wired" },
  { route: "/governance/audit",        element: "Detail sheet + export",  status: "wired" },
  { route: "/governance/rights",       element: "Erasure ceremony",       status: "wired" },
  { route: "/governance/regulator",    element: "Read-only view",         status: "wired" },

  // Integrations
  { route: "/integrations",            element: "Connect / disconnect",   status: "wired" },
  { route: "/integrations/webhooks",   element: "Add endpoint",           status: "wired" },
  { route: "/integrations/tokens",     element: "Rotate / revoke",        status: "wired" },

  // Onboarding
  { route: "/welcome",                 element: "Setup wizard (7 steps)", status: "wired" },
  { route: "/welcome/complete",        element: "Enter practice",         status: "wired" },

  // Settings
  { route: "/settings/copilot",        element: "Tone / retention",        status: "wired" },
  { route: "/settings/notifications",  element: "Preferences matrix",      status: "wired" },
];

const META: Record<Status, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  wired: { label: "Wired",       icon: CheckCircle2,  color: "#5F8A6A", bg: "#E1EFE3" },
  half:  { label: "Half-wired",  icon: AlertTriangle, color: "#B08444", bg: "#F5E6C6" },
  dead:  { label: "Dead",        icon: XCircle,       color: "#B0384A", bg: "#F1C6CE" },
  ghost: { label: "Ghost",       icon: Ghost,         color: "#7B6A70", bg: "#EDE7EA" },
};

function WireUpReport() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const counts = useMemo(() => {
    const c: Record<Status, number> = { wired: 0, half: 0, dead: 0, ghost: 0 };
    for (const r of ROWS) c[r.status]++;
    return c;
  }, []);
  const visible = filter === "all" ? ROWS : ROWS.filter((r) => r.status === filter);
  const outstanding = counts.half + counts.dead + counts.ghost;

  return (
    <AppShell crumb="Admin · Wire-up report">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">Hygiene</div>
        <h1 className="mt-2 text-[34px] leading-tight" style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em" }}>
          Every button, accounted for.
        </h1>
        <p className="mt-2 text-[14px] text-[color:var(--muted-foreground)] max-w-2xl">
          A walked matrix. New routes must be added as they land. Outstanding items ({outstanding}) block the launch checklist.
        </p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["wired", "half", "dead", "ghost"] as Status[]).map((s) => {
            const m = META[s];
            const Icon = m.icon;
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? "all" : s)}
                className="rounded-2xl border p-4 text-left transition-colors duration-150 hover:bg-[rgba(20,30,60,0.02)]"
                style={{
                  borderColor: filter === s ? m.color : "rgba(20,30,60,0.08)",
                  background: palette.glass,
                }}
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: m.color }}>
                  <Icon className="w-3 h-3" /> {m.label}
                </div>
                <div className="mt-2 text-[26px]" style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em" }}>
                  {counts[s]}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(20,30,60,0.08)", background: palette.glass }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted-foreground)]">
                <th className="px-4 py-3 font-normal">Route</th>
                <th className="px-4 py-3 font-normal">Element</th>
                <th className="px-4 py-3 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r, i) => {
                const m = META[r.status];
                const Icon = m.icon;
                return (
                  <tr key={i} className="border-t" style={{ borderColor: "rgba(20,30,60,0.04)" }}>
                    <td className="px-4 py-2.5" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{r.route}</td>
                    <td className="px-4 py-2.5">{r.element}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]"
                        style={{ background: m.bg, color: m.color }}
                      >
                        <Icon className="w-3 h-3" /> {m.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-[11px] text-[color:var(--muted-foreground)]">
          Rule: every ⚠️ finished or downgraded to Preview. Every 💀 wired or removed from the DOM. Every 👻 deleted.
        </div>
      </div>
    </AppShell>
  );
}
