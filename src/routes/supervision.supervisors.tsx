import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, ShieldCheck, Plus } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useSupervisors, createContract, type Supervisor } from "@/lib/supervision-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/supervision/supervisors")({
  component: SupervisorsDirectory,
});

function SupervisorsDirectory() {
  const hydrated = useHydrated();
  const supervisors = useSupervisors();
  const [drafting, setDrafting] = useState<Supervisor | null>(null);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <p className="text-[13px] mb-5 max-w-xl" style={{ color: palette.muted }}>
        Verified supervisors — RCI Cat A, IAP Fellows, BABCP-accredited. Draft a contract to begin.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {supervisors.map((s) => (
          <div key={s.id} className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-[14px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'Fraunces', serif" }}>{s.avatarInitials}</div>
              <div>
                <div className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{s.name}</div>
                <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{s.credentials}</div>
              </div>
            </div>
            <div className="mt-3 text-[12px] inline-flex items-center gap-1" style={{ color: palette.muted }}><MapPin className="h-3 w-3" /> {s.city} · {s.yearsSupervising} yrs</div>
            <p className="mt-2 text-[12px]" style={{ color: palette.muted }}>{s.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {s.focus.map((f) => <span key={f} className="text-[10px] rounded-full border px-2 py-0.5" style={{ borderColor: palette.border, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{f}</span>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {s.accreditations.map((a) => <span key={a} className="inline-flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5" style={{ background: "rgba(0,0,0,0.04)", color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}><ShieldCheck className="h-2.5 w-2.5" /> {a}</span>)}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[13px]" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>₹{s.rateInr.toLocaleString("en-IN")} / hr</div>
              <button onClick={() => setDrafting(s)} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <Plus className="h-3 w-3" /> Draft contract
              </button>
            </div>
          </div>
        ))}
      </div>

      {drafting && <DraftContract supervisor={drafting} onClose={() => setDrafting(null)} />}
    </div>
  );
}

function DraftContract({ supervisor, onClose }: { supervisor: Supervisor; onClose: () => void }) {
  const nav = useNavigate();
  const [cadence, setCadence] = useState<"weekly" | "fortnightly" | "monthly">("fortnightly");
  const [hoursPerMonth, setHoursPerMonth] = useState(4);
  const [focus, setFocus] = useState("");
  const [durationMonths, setDurationMonths] = useState(12);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,20,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-[560px] rounded-3xl border p-6" style={{ borderColor: palette.border, background: "#fff" }} onClick={(e) => e.stopPropagation()}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Draft contract with {supervisor.name}</div>

        <label className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Cadence</label>
        <select value={cadence} onChange={(e) => setCadence(e.target.value as "weekly" | "fortnightly" | "monthly")} className="w-full border rounded-xl px-3 py-2 text-[13px] mb-3 mt-1" style={{ borderColor: palette.border }}>
          <option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option>
        </select>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Hours / month</label>
            <input type="number" value={hoursPerMonth} onChange={(e) => setHoursPerMonth(+e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[13px] mt-1" style={{ borderColor: palette.border }} />
          </div>
          <div>
            <label className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Term (months)</label>
            <input type="number" value={durationMonths} onChange={(e) => setDurationMonths(+e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[13px] mt-1" style={{ borderColor: palette.border }} />
          </div>
        </div>

        <label className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Focus</label>
        <textarea value={focus} onChange={(e) => setFocus(e.target.value)} rows={3} placeholder="Clinical focus, cases, development goals" className="w-full border rounded-xl px-3 py-2 text-[13px] mb-3 mt-1" style={{ borderColor: palette.border }} />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5" style={{ color: palette.muted }}>Cancel</button>
          <button
            disabled={!focus.trim()}
            onClick={() => {
              const now = Date.now();
              const c = createContract({
                supervisorId: supervisor.id,
                superviseeName: "Dr. Aditi Rao",
                startedAt: now,
                endsAt: now + durationMonths * 30 * 24 * 60 * 60 * 1000,
                cadence, hoursPerMonth, focus,
                fee: `₹${supervisor.rateInr.toLocaleString("en-IN")} per 60 min session, invoiced monthly.`,
                cancellation: "48 hours notice required. Late cancellations charged in full.",
                confidentiality: "All shared content confidential. Both parties may keep private notes not accessible to the other.",
                status: "draft",
              });
              nav({ to: "/supervision/contracts/$cid", params: { cid: c.id } });
            }}
            className="rounded-full px-4 py-1.5 text-[12px] disabled:opacity-40"
            style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}
          >Draft</button>
        </div>
      </div>
    </div>
  );
}
