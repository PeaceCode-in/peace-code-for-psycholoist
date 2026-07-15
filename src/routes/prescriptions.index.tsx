import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveMeds, type MedStatus } from "@/lib/prescriptions-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/prescriptions/")({
  component: Landing,
});

const STATUS_META: Record<MedStatus, { label: string; bg: string; fg: string }> = {
  active:       { label: "Active",       bg: "#E4EFE0", fg: "#3E6A2E" },
  titrating:    { label: "Titrating",    bg: "#F1E9DA", fg: "#7A5A18" },
  tapering:     { label: "Tapering",     bg: "#EFE4F0", fg: "#5F3F60" },
  discontinued: { label: "Discontinued", bg: "#EADFE2", fg: "#7B6A70" },
  completed:    { label: "Completed",    bg: "#E7ECEF", fg: "#324357" },
};

function Landing() {
  const hydrated = useHydrated();
  const meds = useLiveMeds();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<MedStatus | "all" | "reviewDue">("all");

  const byPatient = useMemo(() => {
    const filtered = meds.filter((m) => {
      if (filter === "reviewDue") {
        const days = m.lastReviewedAt ? (Date.now() - m.lastReviewedAt) / 86400_000 : Infinity;
        return days > 30 && m.status !== "discontinued";
      }
      if (filter !== "all" && m.status !== filter) return false;
      if (!q) return true;
      const p = getPatient(m.patientId);
      return `${p?.fullName ?? ""} ${m.drugSnapshot.generic} ${m.drugSnapshot.brands.join(" ")}`.toLowerCase().includes(q.toLowerCase());
    });
    const g = new Map<string, typeof filtered>();
    for (const m of filtered) {
      if (!g.has(m.patientId)) g.set(m.patientId, []);
      g.get(m.patientId)!.push(m);
    }
    return Array.from(g.entries());
  }, [meds, q, filter]);

  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted }}>Loading…</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient or drug" className="w-full h-9 pl-9 pr-3 rounded-full border text-[13px] outline-none" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", color: palette.ink }} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "active", "titrating", "tapering", "discontinued", "reviewDue"] as const).map((k) => {
            const on = filter === k;
            const label = k === "reviewDue" ? "Review due" : k[0].toUpperCase() + k.slice(1);
            return (
              <button key={k} onClick={() => setFilter(k)} className="h-8 px-3 rounded-full border text-[11.5px]" style={{ borderColor: palette.border, background: on ? palette.ink : "rgba(255,255,255,0.7)", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {label}
              </button>
            );
          })}
        </div>
        <Link to="/prescriptions/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" /> Add medication
        </Link>
      </div>

      {byPatient.length === 0 ? (
        <div className="rounded-3xl border p-16 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
          <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>No medications on record. That's fine — many good treatments don't need any.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {byPatient.map(([pid, items]) => {
            const p = getPatient(pid);
            const active = items.filter((m) => m.status !== "discontinued");
            const latestChange = Math.max(...items.map((m) => m.history.length ? m.history[m.history.length - 1].at : m.startedAt));
            return (
              <Link key={pid} to="/prescriptions/patient/$pid" params={{ pid }} className="block rounded-2xl border p-5 hover:shadow-sm transition-shadow" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
                <div className="flex items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15.5px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p?.fullName ?? "Unknown"}</div>
                    <div className="text-[11.5px] mt-0.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {active.length} active · {items.length} on record · last change {new Date(latestChange).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {items.slice(0, 4).map((m) => (
                        <span key={m.id} className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: STATUS_META[m.status].bg, color: STATUS_META[m.status].fg, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                          {m.drugSnapshot.generic} {m.dose}
                        </span>
                      ))}
                      {items.length > 4 && <span className="text-[10.5px]" style={{ color: palette.muted }}>+{items.length - 4}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
