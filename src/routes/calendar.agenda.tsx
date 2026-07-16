import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { palette } from "@/components/practice/palette";
import { CalendarShell } from "@/components/practice/calendar/CalendarShell";
import { useLiveSessions, MODALITY_META, STATUS_META } from "@/lib/sessions-store";
import { getPatient } from "@/lib/patients-store";
import { SESSION_TYPE_COLOR } from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/calendar/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Calendar · PeaceCode" }] }),
  component: AgendaView,
});

function AgendaView() {
  const hydrated = useHydrated();
  const sessions = useLiveSessions();
  const [cursor, setCursor] = useState(0);

  const upcoming = useMemo(() => sessions.filter((s) => s.status !== "cancelled" && new Date(s.startsAt).getTime() > Date.now() - 86_400_000), [sessions]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName?.match(/INPUT|TEXTAREA/)) return;
      if (e.key === "j") setCursor((c) => Math.min(upcoming.length - 1, c + 1));
      else if (e.key === "k") setCursor((c) => Math.max(0, c - 1));
      else if (e.key === "Enter" && upcoming[cursor]) window.location.assign(`/sessions/${upcoming[cursor].id}`);
    };
    window.addEventListener("keydown", on); return () => window.removeEventListener("keydown", on);
  }, [upcoming, cursor]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof upcoming>();
    for (const s of upcoming) {
      const k = new Date(s.startsAt).toDateString();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return Array.from(map.entries());
  }, [upcoming]);

  if (!hydrated) return <CalendarShell><div style={{ color: palette.muted }}>Loading…</div></CalendarShell>;

  let idx = -1;
  return (
    <CalendarShell title="Agenda" subtitle="Quiet, keyboard-first. j/k to move · Enter to open.">
      <div className="rounded-2xl border" style={{ borderColor: palette.border, background: palette.glass }}>
        {grouped.map(([day, list]) => (
          <div key={day}>
            <div className="px-5 pt-4 pb-2 flex items-baseline gap-3">
              <h2 className="text-[18px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
                {new Date(day).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{list.length} session{list.length===1?"":"s"}</span>
            </div>
            <div className="h-px" style={{ background: palette.border }} />
            <div>
              {list.map((s) => {
                idx++;
                const i = idx;
                const p = getPatient(s.patientId);
                const c = SESSION_TYPE_COLOR[s.service].hex;
                const on = i === cursor;
                return (
                  <a
                    key={s.id}
                    href={`/sessions/${s.id}`}
                    className="grid items-center gap-3 px-5 py-3 transition-all duration-[180ms] hover:bg-white/70"
                    style={{
                      gridTemplateColumns: "72px 1fr 160px 120px 100px",
                      borderBottom: `1px solid ${palette.border}`,
                      background: on ? "rgba(176,86,122,0.05)" : "transparent",
                    }}
                  >
                    <span className="text-[12.5px]" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>
                      {new Date(s.startsAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2 w-2 rounded-full" style={{ background: c }} />
                      <span className="truncate text-[14px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p?.preferredName ?? p?.fullName ?? "Client"}</span>
                    </div>
                    <span className="text-[12px]" style={{ color: palette.muted }}>{s.service}</span>
                    <span className="text-[12px]" style={{ color: palette.muted }}>{MODALITY_META[s.modality].label}</span>
                    <span className="text-[10.5px] justify-self-end px-2 py-0.5 rounded-full" style={{ background: STATUS_META[s.status].softToken, color: STATUS_META[s.status].token }}>{STATUS_META[s.status].label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
        {!grouped.length && <div className="p-10 text-center text-[13px]" style={{ color: palette.muted }}>Nothing upcoming.</div>}
      </div>
    </CalendarShell>
  );
}
