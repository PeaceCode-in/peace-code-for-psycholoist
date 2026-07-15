import { createFileRoute, Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { useLiveMeds, markReviewed } from "@/lib/prescriptions-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/prescriptions/reviews")({
  component: Reviews,
});

function Reviews() {
  const hydrated = useHydrated();
  const meds = useLiveMeds().filter((m) => m.status !== "discontinued");
  if (!hydrated) return null;

  const bucket = (days: number) => meds.filter((m) => {
    const d = m.lastReviewedAt ? (Date.now() - m.lastReviewedAt) / 86400_000 : Infinity;
    return d >= days;
  });

  const groups = [
    { label: "90+ days", items: bucket(90) },
    { label: "60–89 days", items: bucket(60).filter((m) => !bucket(90).includes(m)) },
    { label: "30–59 days", items: bucket(30).filter((m) => !bucket(60).includes(m)) },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <p className="text-[12.5px] mb-6 max-w-xl" style={{ color: palette.muted }}>
        Medications that haven't been reviewed in a while. Reviewing marks them as freshly evaluated.
      </p>
      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.label}>
            <h3 className="text-[13px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{g.label} · {g.items.length}</h3>
            {g.items.length === 0 ? (
              <div className="text-[12px]" style={{ color: palette.muted }}>Nothing here.</div>
            ) : (
              <ul className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.75)" }}>
                {g.items.map((m) => {
                  const p = getPatient(m.patientId);
                  return (
                    <li key={m.id} className="flex items-center justify-between px-4 py-3 border-b text-[13px]" style={{ borderColor: palette.border, color: palette.ink }}>
                      <div>
                        <Link to="/prescriptions/patient/$pid" params={{ pid: m.patientId }} style={{ fontFamily: "'Fraunces', serif" }} className="hover:underline">{p?.fullName ?? "Unknown"}</Link>
                        <span className="ml-3 text-[11.5px]" style={{ color: palette.muted }}>{m.drugSnapshot.generic} {m.dose} · last reviewed {m.lastReviewedAt ? new Date(m.lastReviewedAt).toLocaleDateString("en-IN") : "never"}</span>
                      </div>
                      <button onClick={() => markReviewed(m.id)} className="inline-flex items-center h-8 px-3 rounded-full border text-[11.5px]" style={{ borderColor: palette.border, color: palette.ink }}>Mark reviewed</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
