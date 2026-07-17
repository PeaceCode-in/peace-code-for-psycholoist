import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { MentalHealthIllustration } from "@/components/practice/MentalHealthIllustration";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing — PeaceCode · Practice" }, { name: "description", content: "Invoices, payments, insurance claims and financial reports." }] }),
  component: BillingLayout,
});

const TABS = [
  { to: "/billing", label: "Overview", exact: true },
  { to: "/billing/invoices", label: "Invoices" },
  { to: "/billing/payments", label: "Payments" },
  { to: "/billing/claims", label: "Claims" },
  { to: "/billing/services", label: "Services" },
  { to: "/billing/reports", label: "Reports" },
];

function BillingLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell crumb="Billing">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-6">
        <div className="relative flex items-baseline justify-between flex-wrap gap-3 overflow-hidden">
          <MentalHealthIllustration kind="coin" color={palette.primary} size={150} className="-right-2 -top-4 hidden sm:block" />
          <div className="relative">
            <h1 className="text-[clamp(1.6rem,2.4vw,2rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
              Billing
            </h1>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>Revenue, receivables, and reimbursements — at a glance.</p>
          </div>
        </div>
        <nav className="mt-5 flex gap-1 overflow-x-auto scrollbar-none" style={{ borderBottom: `1px solid ${palette.border}` }}>
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to}
                className="px-4 py-2.5 text-[12.5px] whitespace-nowrap transition-colors"
                style={{
                  color: active ? palette.ink : palette.muted,
                  borderBottom: `2px solid ${active ? palette.primary : "transparent"}`,
                  marginBottom: -1,
                }}>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
        <Outlet />
      </div>
    </AppShell>
  );
}
