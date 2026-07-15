import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Clock, PenLine, Lock, Users } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveConferences, REASON_META, type ConferenceStatus, type Conference } from "@/lib/conferences-store";
import { getPatient } from "@/lib/patients-store";
import { getMember } from "@/lib/team-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/case-conferences/")({
  component: ConferencesIndex,
});

const STATUS_META: Record<ConferenceStatus, { label: string; bg: string; fg: string; icon: React.ComponentType<{ className?: string }> }> = {
  upcoming:      { label: "Upcoming",    bg: "#E4EFE0", fg: "#3E6A2E", icon: Clock },
  draft:         { label: "Draft",       bg: "#F1E9DA", fg: "#7A5A18", icon: PenLine },
  "in-progress": { label: "In progress", bg: "#EFE4F0", fg: "#5F3F60", icon: Users },
  closed:        { label: "Closed",      bg: "#EADFE2", fg: "#1E1418", icon: Lock },
};

type Chip = "all" | "upcoming" | "draft" | "closed" | "mine" | "consulting";

function ConferencesIndex() {
  const hydrated = useHydrated();
  const all = useLiveConferences();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<Chip>("all");
  const me = "me";

  const filtered = useMemo(() => all.filter((c) => {
    if (c.peerReview) return false; // peer-review has its own subroute
    if (chip === "upcoming" && c.status !== "upcoming") return false;
    if (chip === "draft" && c.status !== "draft" && c.status !== "in-progress") return false;
    if (chip === "closed" && c.status !== "closed") return false;
    if (chip === "mine") {
      const lead = c.participants.find((p) => p.role === "lead");
      if (lead?.memberId !== me) return false;
    }
    if (chip === "consulting") {
      if (!c.participants.some((p) => p.memberId === me && p.role !== "lead")) return false;
    }
    if (!q) return true;
    const ql = q.toLowerCase();
    const patient = c.patientId ? getPatient(c.patientId) : undefined;
    return (patient?.fullName ?? "").toLowerCase().includes(ql)
      || c.presenting.toLowerCase().includes(ql)
      || REASON_META[c.reason].label.toLowerCase().includes(ql);
  }), [all, q, chip]);

  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading conferences…</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search patient, presenting concern, or reason"
            className="w-full h-9 pl-9 pr-3 rounded-full border text-[13px] outline-none"
            style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", color: palette.ink, fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <div className="inline-flex flex-wrap items-center gap-1.5">
          {(["all","upcoming","draft","closed","mine","consulting"] as Chip[]).map((c) => (
            <button key={c} onClick={() => setChip(c)}
              className="h-8 px-3 rounded-full border text-[11.5px] uppercase tracking-wider transition-all duration-[180ms]"
              style={{
                fontFamily: "'DM Mono', ui-monospace, monospace",
                borderColor: chip === c ? palette.ink : palette.border,
                background: chip === c ? palette.ink : "rgba(255,255,255,0.7)",
                color: chip === c ? "#fff" : palette.muted,
              }}>
              {c === "mine" ? "My cases" : c === "consulting" ? "Consulting on" : c}
            </button>
          ))}
        </div>
        <Link to="/case-conferences/new" className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
          <Plus className="h-3.5 w-3.5" /> New conference
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border p-16 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
          <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>No conferences yet.</p>
          <p className="text-[12.5px] mt-2" style={{ color: palette.muted }}>Some of the best clinical work happens when two people look at the same patient.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => <ConferenceRow key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}

function ConferenceRow({ c }: { c: Conference }) {
  const patient = c.patientId ? getPatient(c.patientId) : undefined;
  const label = c.anonymized && patient
    ? `${patient.fullName.split(" ").map((n) => n[0]).join("")} · ${patient.age}${patient.pronouns.startsWith("she") ? "F" : patient.pronouns.startsWith("he") ? "M" : "NB"}`
    : (patient?.fullName ?? "Unnamed peer case");
  const reason = REASON_META[c.reason];
  const status = STATUS_META[c.status];
  const StatusIcon = status.icon;
  const facilitator = getMember(c.facilitatorId);
  const date = new Date(c.scheduledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const time = new Date(c.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return (
    <Link to="/case-conferences/$cid" params={{ cid: c.id }}
      className="block rounded-2xl border transition-all duration-[180ms] hover:border-[color:var(--pcp-hover)]"
      style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", ["--pcp-hover" as string]: palette.ink }}>
      <div className="p-5 flex items-start gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: reason.tone, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{reason.label}</span>
            <span style={{ color: palette.muted }}>·</span>
            <span className="text-[11.5px]" style={{ color: palette.muted }}>{date} · {time}</span>
            {c.urgency !== "routine" && (
              <>
                <span style={{ color: palette.muted }}>·</span>
                <span className="text-[10.5px] uppercase tracking-wider" style={{ color: c.urgency === "urgent" ? palette.primary : "#B08444" }}>{c.urgency}</span>
              </>
            )}
          </div>
          <div className="text-[15.5px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{label}</div>
          <p className="text-[12.5px] mt-1.5 leading-relaxed line-clamp-2" style={{ color: palette.muted }}>{c.presenting}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {c.participants.slice(0, 4).map((p) => {
                const m = getMember(p.memberId);
                return (
                  <span key={p.memberId} className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 text-[9.5px]"
                    title={m?.fullName + " · " + p.role}
                    style={{ background: m?.tone ?? palette.muted, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace", ["--tw-ring-color" as string]: "#fff" } as React.CSSProperties}>
                    {m?.avatarInitials ?? "??"}
                  </span>
                );
              })}
              {c.participants.length > 4 && (
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 text-[9.5px]" style={{ background: palette.border, color: palette.muted } as React.CSSProperties}>+{c.participants.length - 4}</span>
              )}
            </div>
            <span className="text-[11px]" style={{ color: palette.muted }}>Facilitated by {facilitator?.preferredName ?? facilitator?.fullName ?? "—"}</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[10.5px]" style={{ background: status.bg, color: status.fg, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <StatusIcon className="h-3 w-3" /> {status.label}
        </div>
      </div>
    </Link>
  );
}
