import { createFileRoute, Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { useLiveMeds } from "@/lib/prescriptions-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/prescriptions/refills")({
  component: Refills,
});

function Refills() {
  const hydrated = useHydrated();
  const meds = useLiveMeds().filter((m) => m.status !== "discontinued" && m.supplyDays);
  if (!hydrated) return null;

  const rows = meds.map((m) => {
    const daysSince = (Date.now() - m.startedAt) / 86400_000;
    const cyclesElapsed = Math.floor(daysSince / (m.supplyDays ?? 30));
    const nextRefillAt = m.startedAt + (cyclesElapsed + 1) * (m.supplyDays ?? 30) * 86400_000;
    const daysUntil = Math.round((nextRefillAt - Date.now()) / 86400_000);
    return { m, nextRefillAt, daysUntil };
  }).sort((a, b) => a.nextRefillAt - b.nextRefillAt);

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <p className="text-[12.5px] mb-6 max-w-xl" style={{ color: palette.muted }}>
        Estimated refill dates based on start date and days-of-supply. Adjust supply on the medication itself.
      </p>
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glassStrong }}>
        {rows.length === 0 && <div className="p-8 text-center text-[12.5px]" style={{ color: palette.muted }}>Nothing due.</div>}
        {rows.map(({ m, nextRefillAt, daysUntil }) => {
          const p = getPatient(m.patientId);
          const soon = daysUntil <= 7;
          return (
            <Link key={m.id} to="/prescriptions/patient/$pid" params={{ pid: m.patientId }} className="flex items-center justify-between px-4 py-3 border-b text-[13px] hover:bg-white/60" style={{ borderColor: palette.border, color: palette.ink }}>
              <div>
                <span style={{ fontFamily: "'Fraunces', serif" }}>{p?.fullName}</span>
                <span className="ml-3 text-[11.5px]" style={{ color: palette.muted }}>{m.drugSnapshot.generic} {m.dose} · {m.supplyDays}d supply</span>
              </div>
              <div className="text-[11.5px]" style={{ color: soon ? "#8A2E4E" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {daysUntil < 0 ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? "due today" : `in ${daysUntil}d`} · {new Date(nextRefillAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
