// Waitlist — patients queued for intake. Convert / discharge / contact inline.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Mail, Phone, UserCheck, UserMinus, Clock, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLivePatients, updatePatient, dischargePatient, avatarUrl, RISK_META, type Patient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [
      { title: "Waitlist — PeaceCode · Practice" },
      { name: "description", content: "Prospective patients queued for intake, sorted by wait time and clinical urgency." },
    ],
  }),
  component: WaitlistPage,
});

const DAY = 86_400_000;

function WaitlistPage() {
  const hydrated = useHydrated();
  const list = useLivePatients({ status: "waitlist" });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"waited" | "risk" | "name">("waited");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = list.filter((p) => !needle || p.fullName.toLowerCase().includes(needle) || p.primaryConcern.toLowerCase().includes(needle) || p.college.toLowerCase().includes(needle));
    const riskRank = { crisis: 0, elevated: 1, monitor: 2, stable: 3 } as const;
    return out.sort((a, b) => {
      if (sort === "waited") return a.intakeDate - b.intakeDate;
      if (sort === "risk") return riskRank[a.risk] - riskRank[b.risk];
      return a.fullName.localeCompare(b.fullName);
    });
  }, [list, q, sort]);

  const avgDays = list.length ? Math.round(list.reduce((s, p) => s + (Date.now() - p.intakeDate) / DAY, 0) / list.length) : 0;
  const longest = list.length ? Math.round((Date.now() - Math.min(...list.map((p) => p.intakeDate))) / DAY) : 0;
  const urgent = list.filter((p) => p.risk === "crisis" || p.risk === "elevated").length;

  if (!hydrated) return <AppShell crumb="Waitlist"><div /></AppShell>;

  return (
    <AppShell crumb="Waitlist">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6 pb-16">
        <header className="mb-6">
          <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            Waitlist
          </h1>
          <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>
            {list.length} awaiting intake · avg wait {avgDays}d · longest {longest}d
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="In queue" value={String(list.length)} sub="prospective patients" />
          <Stat label="Urgent" value={String(urgent)} sub="crisis or elevated" tone={urgent ? "warn" : "ok"} />
          <Stat label="Avg wait" value={`${avgDays}d`} sub="from intake request" />
          <Stat label="Longest wait" value={`${longest}d`} sub="prioritize first" tone={longest > 30 ? "warn" : "ok"} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, concern or college" className="w-full pl-8 pr-3 py-2 rounded-full border text-[12.5px] bg-white/70 focus:outline-none focus:ring-2" style={{ borderColor: palette.border }} />
          </div>
          <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
            {(["waited", "risk", "name"] as const).map((k) => (
              <button key={k} onClick={() => setSort(k)} className="rounded-full px-3 py-1 text-[11px] capitalize" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: sort === k ? palette.ink : "transparent", color: sort === k ? "#fff" : palette.muted }}>
                {k === "waited" ? "Longest waited" : k}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-[13px]" style={{ color: palette.muted }}>Nothing on the waitlist{q ? " matches this search" : ""}.</div>
          ) : (
            filtered.map((p) => <Row key={p.id} p={p} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "ok" | "warn" }) {
  const accent = tone === "warn" ? "#B0384A" : palette.ink;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
      <div className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="tabular-nums leading-none mt-2" style={{ fontFamily: "'Fraunces', serif", color: accent, fontSize: 32 }}>{value}</div>
      {sub && <div className="text-[11.5px] mt-1" style={{ color: palette.muted }}>{sub}</div>}
    </div>
  );
}

function Row({ p }: { p: Patient }) {
  const waited = Math.max(0, Math.round((Date.now() - p.intakeDate) / DAY));
  const meta = RISK_META[p.risk];
  const urgent = waited > 30 || p.risk === "crisis" || p.risk === "elevated";

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 border-t" style={{ borderColor: palette.border }}>
      <img src={avatarUrl(p.id)} alt="" className="h-10 w-10 rounded-full object-cover" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link to="/patients/$pid" params={{ pid: p.id }} className="text-[14px] hover:underline" style={{ color: palette.ink }}>{p.preferredName ?? p.fullName}</Link>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em]" style={{ background: meta.softToken, color: meta.token, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
          <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: urgent ? "#B0384A" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <Clock className="h-3 w-3" /> {waited}d waiting
          </span>
        </div>
        <div className="text-[12px] mt-0.5 truncate" style={{ color: palette.muted }}>
          {p.primaryConcern} · {p.college}, {p.yearOfStudy}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <a href={`mailto:${p.email}`} title="Email" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}><Mail className="h-3.5 w-3.5" /></a>
        {p.phone && <a href={`tel:${p.phone}`} title="Call" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}><Phone className="h-3.5 w-3.5" /></a>}
        <button onClick={() => updatePatient(p.id, { status: "active" })} title="Convert to active" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: "#2F6A4A", color: "#fff" }}>
          <UserCheck className="h-3 w-3" /> Convert
        </button>
        <button onClick={() => { if (confirm(`Remove ${p.fullName} from waitlist?`)) dischargePatient(p.id, "waitlist declined"); }} title="Discharge" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}>
          <UserMinus className="h-3.5 w-3.5" />
        </button>
        <Link to="/patients/$pid" params={{ pid: p.id }} className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}><ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </div>
  );
}
