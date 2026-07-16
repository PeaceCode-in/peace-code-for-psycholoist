import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { palette } from "@/components/practice/palette";
import { useLiveClaims, updateClaimStatus, CLAIM_STATUS_META, type ClaimStatus, getInsuranceReimbursementRate } from "@/lib/billing-store";
import { getPatient } from "@/lib/patients-store";
import { CurrencyNumber, HBarList } from "@/components/viz/billing";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/claims/")({
  head: () => ({ meta: [{ title: "Claims — Billing · PeaceCode" }] }),
  component: ClaimsBoard,
});

const COLUMNS: Array<{ key: ClaimStatus; label: string; accepts: ClaimStatus[] }> = [
  { key: "not_submitted", label: "Ready to submit", accepts: ["not_submitted"] },
  { key: "submitted",     label: "Submitted",       accepts: ["submitted"] },
  { key: "in_review",     label: "In review",       accepts: ["in_review", "approved", "partial"] },
  { key: "paid",          label: "Settled",         accepts: ["paid", "partial", "denied"] },
];

function ClaimsBoard() {
  const hydrated = useHydrated();
  const claims = useLiveClaims();

  const byInsurer = useMemo(() => {
    const map = new Map<string, { claimed: number; paid: number }>();
    for (const c of claims) {
      const cur = map.get(c.insurer) ?? { claimed: 0, paid: 0 };
      map.set(c.insurer, { claimed: cur.claimed + c.claimedAmount, paid: cur.paid + (c.paidAmount ?? 0) });
    }
    return [...map.entries()].map(([insurer, v]) => ({
      label: insurer,
      value: v.claimed > 0 ? v.paid / v.claimed : 0,
      sublabel: `${Math.round((v.claimed > 0 ? v.paid / v.claimed : 0) * 100)}%`,
    }));
  }, [claims]);

  if (!hydrated) return <div className="h-96" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const items = claims.filter((c) => col.accepts.includes(c.status));
          return (
            <div key={col.key} className="rounded-3xl p-3 min-w-[240px]"
              style={{ background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}`, minHeight: 400 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/plain");
                if (id) { updateClaimStatus(id, col.key); }
              }}>
              <div className="flex items-baseline justify-between px-2 mb-3">
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{col.label}</div>
                <span className="text-[10.5px] font-mono" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((c) => {
                  const meta = CLAIM_STATUS_META[c.status];
                  const daysIn = c.submittedAt ? Math.floor((Date.now() - c.submittedAt) / 86_400_000) : 0;
                  const daysColor = daysIn > 30 ? "#B0567A" : daysIn > 14 ? "#B6763A" : palette.muted;
                  return (
                    <Link key={c.id} to="/billing/claims/$id" params={{ id: c.id }}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                      className="block rounded-xl p-3 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform"
                      style={{ background: palette.solid, border: `1px solid ${palette.border}`, borderLeft: `3px solid ${meta.color}` }}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10.5px] font-mono" style={{ fontFamily: "'DM Mono', monospace", color: palette.muted }}>{c.id}</span>
                        <span className="text-[10.5px]" style={{ color: daysColor, fontFamily: "'Fraunces', serif", letterSpacing: "0.08em" }}>{daysIn}d</span>
                      </div>
                      <div className="text-[12.5px] mt-1" style={{ color: palette.ink }}>{getPatient(c.patientId)?.fullName}</div>
                      <div className="text-[10.5px] mt-0.5" style={{ color: palette.muted }}>{c.insurer}</div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <CurrencyNumber value={c.claimedAmount} size="sm" animate={false} />
                        <span className="text-[9.5px] uppercase tracking-[0.12em]" style={{ color: meta.color, fontFamily: "'Fraunces', serif" }}>{meta.label}</span>
                      </div>
                    </Link>
                  );
                })}
                {items.length === 0 && <div className="py-8 text-center text-[11px]" style={{ color: palette.muted }}>—</div>}
              </div>
            </div>
          );
        })}
      </div>

      <aside className="space-y-3">
        <div className="rounded-2xl p-4" style={{ background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` }}>
          <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>Overall reimbursement</div>
          <div className="font-mono tabular-nums text-[26px]" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>
            {Math.round(getInsuranceReimbursementRate() * 100)}%
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: palette.glass, backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` }}>
          <div className="text-[10.5px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>By insurer</div>
          <HBarList items={byInsurer} format="number" />
        </div>
      </aside>
    </div>
  );
}
