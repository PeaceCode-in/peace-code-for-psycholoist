import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PortalShell, Card, portal } from "@/components/portal/PortalShell";
import { logMood, useMyHomework, useMyMoods, useMySessions } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/progress")({
  head: () => ({ meta: [{ title: "Your rhythm" }, { name: "robots", content: "noindex" }] }),
  component: Progress,
});

function Progress() {
  const moods = useMyMoods();
  const sessions = useMySessions();
  const homework = useMyHomework();
  const [today, setToday] = useState<number | null>(null);

  const attendedWeeks = new Set(sessions.filter(s => s.status === "completed").map(s => Math.floor(s.startsAt / (7 * 24 * 3600 * 1000)))).size;
  const doneHomework = homework.filter(h => h.done).length;

  const first = moods[0];
  const last = moods[moods.length - 1];
  const summary = moods.length >= 6 && first && last
    ? last.value > first.value + 0.5
      ? `Since ${new Date(first.at).toLocaleDateString("en-IN", { month: "long", day: "numeric" })}, your mood curve has drifted upward. Not a straight line — it never is — but there's more light in it.`
      : last.value < first.value - 0.5
        ? `The last two months have felt heavier than when you started. That's real. Bring it into your next session.`
        : `Your rhythm has been fairly steady since ${new Date(first.at).toLocaleDateString("en-IN", { month: "long", day: "numeric" })}. Steadiness is its own kind of progress.`
    : "Log a few days of mood to see your rhythm take shape.";

  return (
    <PortalShell title="Your rhythm" subtitle="A gentle picture of how you've been, in your own hand.">
      <Card className="mb-6">
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>Mood over the last 60 days</h2>
        <MoodChart values={moods.map(m => ({ x: m.at, y: m.value }))} />
        <p className="mt-4 text-[15px]">{summary}</p>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-[13px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Showing up</p>
          <p className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontSize: 34, letterSpacing: -0.4 }}>
            {attendedWeeks} <span className="text-[16px]" style={{ color: portal.muted }}>{attendedWeeks === 1 ? "week" : "weeks"}</span>
          </p>
          <p className="mt-1 text-[14px]" style={{ color: portal.muted }}>You've been present for sessions across {attendedWeeks} different weeks. That's the whole thing.</p>
        </Card>
        <Card>
          <p className="text-[13px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Between-session work</p>
          <p className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontSize: 34, letterSpacing: -0.4 }}>
            {doneHomework} <span className="text-[16px]" style={{ color: portal.muted }}>completed</span>
          </p>
          <p className="mt-1 text-[14px]" style={{ color: portal.muted }}>Practices, prompts, and readings you've closed.</p>
        </Card>
      </div>

      <Card>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>How are you today?</h2>
        <p className="mt-1 text-[14px]" style={{ color: portal.muted }}>One tap. No wrong answer.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map(v => (
            <button
              key={v}
              onClick={() => { setToday(v); logMood(v); }}
              className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl text-[13px]"
              style={{
                background: today === v ? portal.rose : portal.paper,
                color: today === v ? "#fff" : portal.ink,
                border: `1px solid ${today === v ? portal.rose : portal.border}`,
              }}
            >
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>{v}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[12px]" style={{ color: portal.muted }}>1 = very low · 7 = very good</p>
      </Card>
    </PortalShell>
  );
}

function MoodChart({ values }: { values: { x: number; y: number }[] }) {
  if (values.length < 2) return <p className="mt-4 text-[14px]" style={{ color: portal.muted }}>Log a few days to see this fill in.</p>;
  const w = 720, h = 200, padX = 12, padY = 16;
  const xs = values.map(v => v.x);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const rangeX = maxX - minX || 1;
  const minY = 1, maxY = 7;
  const rangeY = maxY - minY;
  const px = (x: number) => padX + ((x - minX) / rangeX) * (w - padX * 2);
  const py = (y: number) => h - padY - ((y - minY) / rangeY) * (h - padY * 2);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"} ${px(v.x).toFixed(1)} ${py(v.y).toFixed(1)}`).join(" ");
  const area = `${d} L ${px(maxX).toFixed(1)} ${h - padY} L ${px(minX).toFixed(1)} ${h - padY} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="mt-4" preserveAspectRatio="none">
      {[2, 4, 6].map(y => (
        <line key={y} x1={padX} x2={w - padX} y1={py(y)} y2={py(y)} stroke={portal.border} strokeWidth={0.5} strokeDasharray="2 4" />
      ))}
      <path d={area} fill={portal.soft} opacity={0.55} />
      <path d={d} fill="none" stroke={portal.rose} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={px(values[values.length - 1].x)} cy={py(values[values.length - 1].y)} r={3.5} fill={portal.roseDeep} />
    </svg>
  );
}
