import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarHeart, ChevronRight, ClipboardCheck, FileSignature, NotebookPen, Receipt, Sparkles, Video } from "lucide-react";
import { PortalShell, Card, SoftCard, Chip, portal } from "@/components/portal/PortalShell";
import { fmtDateWarm, fmtRelative, useCurrentClient, useMyMoods, useMyThreads, useNextSession, useWaitingOnYou } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/")({
  head: () => ({ meta: [{ title: "Your portal" }, { name: "robots", content: "noindex" }] }),
  component: Home,
});

function Home() {
  const client = useCurrentClient();
  const next = useNextSession();
  const waiting = useWaitingOnYou();
  const threads = useMyThreads();
  const moods = useMyMoods();

  if (!client) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const latestMessage = threads
    .flatMap(t => t.messages.map(m => ({ ...m, subject: t.subject, threadId: t.id })))
    .sort((a, b) => b.sentAt - a.sentAt)[0];

  const recentMoods = moods.slice(-14);
  const moodAvg = recentMoods.length ? recentMoods.reduce((s, m) => s + m.value, 0) / recentMoods.length : 0;

  return (
    <PortalShell>
      <div className="mb-8">
        <p className="text-[15px]" style={{ color: portal.muted }}>{greeting},</p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.05 }}>
          {client.firstName}.
        </h1>
      </div>

      {/* Next session — hero */}
      {next ? (
        <SoftCard className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[13px] uppercase tracking-wide" style={{ color: portal.roseDeep, letterSpacing: 1.2 }}>Your next session</p>
              <p className="mt-3" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, letterSpacing: -0.4, lineHeight: 1.15 }}>
                {fmtDateWarm(next.startsAt)}
              </p>
              <p className="mt-1 text-[14px]" style={{ color: portal.muted }}>
                {next.modality === "telehealth" ? "Telehealth with " : "In-person with "}
                {client.therapistName}{next.location ? ` · ${next.location}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {next.joinUrl ? (
                <a href={next.joinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-medium" style={{ background: portal.rose, color: "#fff" }}>
                  <Video className="h-4 w-4" strokeWidth={1.6} /> Join room
                </a>
              ) : null}
              <Link to="/portal/sessions" className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>
                All sessions <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </SoftCard>
      ) : (
        <Card className="mb-6">
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22 }}>No session scheduled yet.</p>
          <p className="mt-1 text-[14px]" style={{ color: portal.muted }}>Your therapist will reach out to book your next time.</p>
        </Card>
      )}

      {/* Waiting on you */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400 }}>Waiting on you</h2>
          {waiting.length ? <span className="text-[13px]" style={{ color: portal.muted }}>{waiting.length} {waiting.length === 1 ? "thing" : "things"}</span> : null}
        </div>
        {waiting.length === 0 ? (
          <Card>
            <p style={{ color: portal.muted }}>Nothing pending. Take a breath — you're up to date.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {waiting.map(w => {
              const Icon = w.kind === "assessment" ? ClipboardCheck : w.kind === "homework" ? NotebookPen : w.kind === "document" ? FileSignature : Receipt;
              return (
                <Link key={w.id} to={w.href} className="flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-[#FDF9F7]" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: portal.soft, color: portal.roseDeep }}>
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px]">{w.title}</p>
                    <p className="truncate text-[13px]" style={{ color: portal.muted }}>{w.meta}{w.dueAt ? ` · due ${fmtDateWarm(w.dueAt).toLowerCase()}` : ""}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0" style={{ color: portal.muted }} strokeWidth={1.5} />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Two-up glance */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Latest message */}
        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>Latest message</h3>
            <Link to="/portal/messages" className="text-[13px]" style={{ color: portal.roseDeep }}>Open →</Link>
          </div>
          {latestMessage ? (
            <div>
              <p className="text-[13px]" style={{ color: portal.muted }}>
                {latestMessage.from === "therapist" ? client.therapistName : "You"} · {fmtRelative(latestMessage.sentAt)}
              </p>
              <p className="mt-2 line-clamp-3 text-[15px]">{latestMessage.body}</p>
            </div>
          ) : (
            <p style={{ color: portal.muted }}>No messages yet.</p>
          )}
        </Card>

        {/* Progress glance */}
        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>How you're doing</h3>
            <Link to="/portal/progress" className="text-[13px]" style={{ color: portal.roseDeep }}>See more →</Link>
          </div>
          {recentMoods.length >= 3 ? (
            <>
              <MiniSpark values={recentMoods.map(m => m.value)} />
              <p className="mt-3 text-[14px]" style={{ color: portal.ink }}>
                <Sparkles className="mr-1 inline h-3.5 w-3.5" style={{ color: portal.rose }} strokeWidth={1.6} />
                {trend(recentMoods.map(m => m.value))}
              </p>
              <p className="mt-1 text-[13px]" style={{ color: portal.muted }}>Mood average across the last two weeks: {moodAvg.toFixed(1)} of 7.</p>
            </>
          ) : (
            <p style={{ color: portal.muted }}>Log a mood on the Progress page to start seeing your rhythm.</p>
          )}
        </Card>
      </div>
    </PortalShell>
  );
}

function trend(v: number[]): string {
  if (v.length < 4) return "Early days — keep checking in.";
  const first = v.slice(0, Math.floor(v.length / 2));
  const last = v.slice(-Math.floor(v.length / 2));
  const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
  const delta = avg(last) - avg(first);
  if (delta > 0.4) return "Things have felt a little lighter this week than the week before.";
  if (delta < -0.4) return "A dip this week compared to last. Worth naming it in session.";
  return "Fairly steady week over week — steadiness counts too.";
}

function MiniSpark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 260, h = 60, pad = 4;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => [pad + i * step, h - pad - ((v - min) / range) * (h - pad * 2)] as const);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-1" aria-hidden>
      <path d={d} fill="none" stroke={portal.rose} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} fill={portal.roseDeep} />
    </svg>
  );
}
