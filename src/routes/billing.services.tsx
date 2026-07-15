import { createFileRoute } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { useLiveServices } from "@/lib/billing-store";
import { CurrencyNumber } from "@/components/viz/billing";
import { Plus, Pencil } from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/billing/services")({
  head: () => ({ meta: [{ title: "Services — Billing · PeaceCode" }] }),
  component: Services,
});

function Services() {
  const hydrated = useHydrated();
  const services = useLiveServices();
  if (!hydrated) return <div className="h-96" />;
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Rate card</h2>
        <p className="text-[11px]" style={{ color: palette.muted }}>Standard rates flow directly into invoices.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="group relative rounded-3xl p-5 transition-transform hover:-translate-y-0.5"
            style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` }}>
            <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full"
              style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.muted }}>
              <Pencil className="w-3 h-3" />
            </button>
            <div className="text-[13.5px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{s.service}</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                style={{ background: palette.surface2, color: palette.muted, fontFamily: "'Fraunces', serif" }}>{s.duration} min</span>
              {s.cptCode && <span className="text-[10.5px] font-mono" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>CPT {s.cptCode}</span>}
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-[26px] font-mono tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>
                <CurrencyNumber value={s.standardRate} size="lg" animate={false} />
              </span>
            </div>
            {s.slidingScaleRates && s.slidingScaleRates.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.slidingScaleRates.map((t) => (
                  <span key={t.tier} className="text-[10.5px] px-2 py-0.5 rounded-full font-mono"
                    style={{ background: palette.surface2, color: palette.muted, fontFamily: "'DM Mono', monospace" }}>
                    {t.tier} · ₹ {t.rate}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        <button className="rounded-3xl p-5 flex flex-col items-center justify-center text-[12px] transition-colors"
          style={{ border: `1.5px dashed ${palette.border}`, color: palette.muted, minHeight: 140 }}>
          <Plus className="w-5 h-5 mb-1" /> New service
        </button>
      </div>
    </div>
  );
}
