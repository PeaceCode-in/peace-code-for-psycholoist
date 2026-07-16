import { createFileRoute, Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { useLiveSessions, MODALITY_META, STATUS_META } from "@/lib/sessions-store";
import { getPatient, RISK_META, avatarUrl } from "@/lib/patients-store";
import { DensityStrip } from "@/components/viz/DensityStrip";
import { useHydrated } from "@/lib/use-hydrated";
import { useMemo } from "react";

export const Route = createFileRoute("/sessions/day/$date")({
  head: () => ({ meta: [{ title: "Day focus — PeaceCode · Practice" }] }),
  component: DayView,
});

function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function fmtISODay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x.toISOString().slice(0, 10); }

function DayView() {
  const hydrated = useHydrated();
  const { date } = Route.useParams();
  const sessions = useLiveSessions();

  const day = useMemo(() => {
    const [y, m, d] = date.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    dt.setHours(0, 0, 0, 0);
    return dt;
  }, [date]);

  const daySessions = useMemo(() => sessions.filter((s) => fmtISODay(new Date(s.startsAt)) === fmtISODay(day)), [sessions, day]);

  if (!hydrated) return <div className="p-8 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading…</div>;

  return (
    <div className="max-w-[880px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Day focus</p>
          <h1 className="text-[clamp(1.5rem,2.2vw,1.9rem)] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            {day.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
          </h1>
        </div>
        <DensityStrip sessions={daySessions} width={160} height={64} />
      </div>

      {daySessions.length === 0 ? (
        <div className="rounded-3xl border p-12 text-center" style={{ background: palette.glass, borderColor: "rgba(255,255,255,0.55)" }}>
          <p className="text-[13px]" style={{ color: palette.muted }}>Nothing scheduled for this day.</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {daySessions.map((s) => {
            const p = getPatient(s.patientId);
            const risk = p?.risk ?? "stable";
            return (
              <li key={s.id}>
                <Link
                  to="/sessions/$id" params={{ id: s.id }}
                  className="group flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all hover:-translate-y-0.5"
                  style={{ background: palette.glass, borderColor: "rgba(255,255,255,0.6)" }}
                >
                  <span className="w-1 self-stretch rounded-full" style={{ background: RISK_META[risk].token }} />
                  <div className="w-16 shrink-0">
                    <div className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{fmtTime(s.startsAt)}</div>
                    <div className="text-[10.5px]" style={{ color: palette.muted }}>{s.durationMin}m</div>
                  </div>
                  <img src={avatarUrl(p?.id ?? s.patientId)} alt="" className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium truncate" style={{ color: palette.ink }}>{p?.fullName ?? "—"}</div>
                    <div className="text-[11px]" style={{ color: palette.muted }}>{s.service} · {MODALITY_META[s.modality].label}</div>
                  </div>
                  <span className="text-[10px] tracking-[0.12em] uppercase" style={{ color: STATUS_META[s.status].token }}>
                    {STATUS_META[s.status].label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
