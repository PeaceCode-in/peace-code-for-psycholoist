// PeaceCode — Dashboard (Wellness Command Center).
// A narrative summary of the whole ecosystem. Each section is a quiet
// glance at one module: collapsed → expanded → open full page.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ChevronRight, ChevronDown, Sparkles, Flame, Heart, Wind, Feather,
  Users, BookOpen, Brain, CalendarCheck, UserCheck, TreePine, Trophy,
  Bot, Clock, ArrowRight, AlertCircle, Play, TrendingUp, Leaf, Moon, PenLine,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

import * as journal from "@/lib/journal-store";
import * as gratitude from "@/lib/gratitude-store";
import * as breathe from "@/lib/breathe-store";
import * as focus from "@/lib/focus-store";
import * as counselling from "@/lib/counselling-store";
import * as buddies from "@/lib/buddies-store";
import * as screening from "@/lib/screening-store";
import { useMindGym, ensureBootstrapped, brainOverall, weeklyStats, recommendNext, EXERCISES } from "@/lib/mindgym-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — PeaceCode" },
      { name: "description", content: "Your daily wellness command center — a calm, intelligent summary of how you're doing today." },
      { property: "og:title", content: "Today — PeaceCode" },
      { property: "og:description", content: "A quiet, intelligent view of your mind, day, and next step." },
    ],
  }),
  component: Dashboard,
});

// ─── data helpers (client only) ─────────────────────────────────────
function useDashboardData() {
  const [ready, setReady] = useState(false);
  const [d, setD] = useState<any>({});
  useEffect(() => {
    try {
      const jEntries = journal.loadEntries();
      const gEntries = gratitude.loadEntries();
      const gCommunity = gratitude.loadCommunity();
      const bSessions = breathe.loadSessions();
      const fSessions = focus.loadSessions();
      const appts = counselling.listAppointments().sort((a, b) => a.scheduledFor - b.scheduledFor);
      const hw = counselling.listHomework();
      const bSess = buddies.listSessions();
      const scrSess = screening.loadSessions();
      setD({
        journal: {
          entries: jEntries,
          streak: journal.computeStreak(jEntries),
          weekTrend: journal.weekMoodTrend(jEntries),
          top: journal.topEmotions(jEntries).slice(0, 3),
          last: jEntries[0],
          weekCount: jEntries.filter(e => Date.now() - new Date(e.updatedAt || e.createdAt).getTime() < 7 * 864e5).length,
        },
        gratitude: {
          entries: gEntries,
          streak: gratitude.computeStreak(gEntries),
          today: gratitude.todayCount(gEntries),
          tree: gratitude.computeTree(gEntries),
          communityToday: gCommunity.filter(c => Date.now() - new Date(c.createdAt).getTime() < 864e5).length,
        },
        breathe: {
          sessions: bSessions,
          streak: breathe.computeStreak(bSessions),
          today: bSessions.filter(s => breathe.dayKey(s.completedAt) === breathe.dayKey(new Date())).length,
        },
        focus: {
          sessions: fSessions,
          streak: focus.computeStreaks(fSessions),
          weekMinutes: fSessions
            .filter(s => Date.now() - new Date(s.completedAt).getTime() < 7 * 864e5)
            .reduce((a, s) => a + (s.planned || 0) / 60, 0),
        },
        counselling: {
          next: appts.find(a => a.status !== "cancelled" && a.scheduledFor > Date.now()),
          homeworkDone: hw.filter(h => h.done).length,
          homeworkTotal: hw.length,
        },
        buddy: {
          nextSession: bSess.find(s => (s.status === "confirmed" || s.status === "pending") && s.scheduledFor && s.scheduledFor > Date.now()),
          lastChat: bSess.sort((a, b) => (b.messages?.slice(-1)[0]?.ts ?? 0) - (a.messages?.slice(-1)[0]?.ts ?? 0))[0],
        },
        screening: {
          last: scrSess.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0],
          overall: screening.overallWellness(scrSess),
        },
      });
    } catch {
      /* silent — first load */
    }
    setReady(true);
  }, []);
  return { ready, ...d };
}

// ─── Dashboard ──────────────────────────────────────────────────────
function Dashboard() {
  return (
    <AppShell>
      <DashboardInner />
    </AppShell>
  );
}

function DashboardInner() {
  const data = useDashboardData();
  const mg = useMindGym();
  useEffect(() => { ensureBootstrapped(); }, []);

  const hour = new Date().getHours();
  const greet = hour < 5 ? "still awake" : hour < 12 ? "good morning" : hour < 17 ? "good afternoon" : hour < 21 ? "good evening" : "quiet night";

  const overall = brainOverall(mg.brain);
  const week = weeklyStats();
  const nextEx = recommendNext();

  // Peace Score = weighted blend of brain overall + streaks + activity
  const peace = useMemo(() => {
    const base = overall;
    const streakBoost = Math.min(10, (mg.streak.current + (data.breathe?.streak?.current ?? 0)) / 2);
    const activity = Math.min(10, ((data.journal?.weekCount ?? 0) + (data.breathe?.today ?? 0)) * 2);
    return Math.round(Math.min(100, base * 0.7 + streakBoost + activity));
  }, [overall, mg.streak.current, data.breathe, data.journal]);

  // The one AI-flavoured attention line
  const attention = useMemo(() => {
    if (!data.ready) return "Warming up your day…";
    if (data.counselling?.next && data.counselling.next.scheduledFor - Date.now() < 864e5) {
      return "You have counselling within 24 hours — set aside a quiet 10 minutes before.";
    }
    if ((data.breathe?.today ?? 0) === 0 && hour < 20) {
      return "You haven't breathed yet today. A three-minute box breath would set the tone.";
    }
    if ((data.journal?.weekCount ?? 0) < 2) {
      return "Your week feels unwritten. One line in the journal is enough.";
    }
    if (mg.streak.current >= 3) {
      return `You're on a ${mg.streak.current}-day Mind Gym streak. Protect it with a short rep.`;
    }
    return "Nothing urgent — a small kindness to yourself would still be a win today.";
  }, [data, hour, mg.streak.current]);

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="mb-8 sm:mb-10">
        <div className="text-[10px] tracking-[0.32em] uppercase mb-2" style={{ color: "var(--pc-muted)" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <h1 className="font-serif text-[32px] sm:text-[46px] leading-[1.05]" style={{ color: "var(--pc-ink)", letterSpacing: "-0.02em" }}>
          {greet}. <span style={{ color: "var(--pc-muted)" }}>Here's your day.</span>
        </h1>
        <p className="mt-3 max-w-[620px] text-[14px] sm:text-[15px] leading-relaxed" style={{ color: "var(--pc-navy-soft, var(--pc-muted))" }}>
          <Sparkles className="inline w-3.5 h-3.5 mr-1.5 opacity-70" />{attention}
        </p>
      </section>

      {/* ── TWO-COLUMN GRID ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

        {/* SNAPSHOT — hero-width */}
        <Section
          span="lg:col-span-12"
          title="Today's snapshot"
          hint={<Ring value={peace} label="Peace Score" />}
          preview={
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-1">
              <Stat kicker="Peace" value={String(peace)} suffix="/100" />
              <Stat kicker="Streak" value={String(mg.streak.current || data.breathe?.streak?.current || 0)} suffix=" days" />
              <Stat kicker="Focus" value={`${Math.round(mg.brain?.focus ?? 62)}`} suffix="%" />
              <Stat kicker="Calm" value={`${Math.round(mg.brain?.calm ?? 58)}`} suffix="%" />
              <Stat kicker="Sleep" value={data.journal?.last?.mood ? `${data.journal.last.mood}/10` : "—"} />
            </div>
          }
          expanded={
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <MiniBars label="This week — brain load" bars={[54, 62, 71, 66, 74, 82, peace]} />
              <MiniBars label="Breath minutes" bars={(data.breathe?.sessions ?? []).slice(0, 7).map((s: any) => Math.min(100, (s.actualSeconds || 60) / 4)).reverse()} tone="lavender" />
            </div>
          }
          to="/screening"
          cta="Open trends"
        />

        {/* JOURNEY */}
        <Section
          span="lg:col-span-7"
          title="Today's journey"
          preview={<JourneyTimeline data={data} nextEx={nextEx} />}
          expanded={
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="rounded-lg p-2 text-center" style={{ background: "var(--pc-surface2)" }}>
                  <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "var(--pc-muted)" }}>
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </div>
                  <div className="mt-1 h-8 flex items-end justify-center gap-0.5">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="w-1 rounded-full" style={{
                        height: `${20 + ((i * 3 + j) % 6) * 8}%`,
                        background: j === (i % 3) ? "var(--pc-primary)" : "var(--pc-border)"
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
          to="/counselling/upcoming"
          cta="Open week"
        />

        {/* PEACEBOT INSIGHT */}
        <Section
          span="lg:col-span-5"
          title="Peace Bot insight"
          preview={
            <div className="mt-2">
              <blockquote className="font-serif italic text-[17px] leading-[1.4]" style={{ color: "var(--pc-ink)" }}>
                "{attention}"
              </blockquote>
              <p className="mt-3 text-[12px]" style={{ color: "var(--pc-muted)" }}>Based on your sleep, journal, and last three sessions.</p>
            </div>
          }
          expanded={
            <div className="mt-4 text-[13px] leading-relaxed" style={{ color: "var(--pc-navy-soft, var(--pc-muted))" }}>
              <p className="mb-2"><b style={{ color: "var(--pc-ink)" }}>Why this:</b> your brain map shows {overall}/100, with the biggest dip in {Object.entries(mg.brain || {}).sort((a: any, b: any) => a[1] - b[1])[0]?.[0] ?? "calm"}.</p>
              <p><b style={{ color: "var(--pc-ink)" }}>Try next:</b> a 3-minute breath, then one line in your journal. Small reps, real change.</p>
            </div>
          }
          to="/peacebot"
          cta="Continue chat"
        />

        {/* MIND OVERVIEW */}
        <Section
          span="lg:col-span-6"
          title="Mind overview"
          preview={<BrainBars brain={mg.brain} />}
          expanded={
            <p className="mt-4 text-[13px]" style={{ color: "var(--pc-muted)" }}>
              You've trained {week.count} reps this week. Strongest thread: <b style={{ color: "var(--pc-ink)" }}>{week.top}</b>.
            </p>
          }
          to="/mindgym/brain-dna"
          cta="See Brain DNA"
        />

        {/* JOURNAL */}
        <Section
          span="lg:col-span-6"
          title="Journal"
          preview={
            <div className="mt-2">
              <p className="text-[14px]" style={{ color: "var(--pc-ink)" }}>
                {data.journal?.weekCount
                  ? `You wrote ${data.journal.weekCount} entr${data.journal.weekCount === 1 ? "y" : "ies"} this week.`
                  : "Your journal is quiet this week."}
              </p>
              {data.journal?.last && (
                <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--pc-surface2)" }}>
                  <div className="text-[10px] tracking-[0.25em] uppercase mb-1" style={{ color: "var(--pc-muted)" }}>Last entry</div>
                  <div className="font-serif text-[15px] line-clamp-2" style={{ color: "var(--pc-ink)" }}>{data.journal.last.title || data.journal.last.body?.slice(0, 80) || "Untitled"}</div>
                </div>
              )}
            </div>
          }
          expanded={
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {(data.journal?.top ?? []).map((e: any) => (
                  <span key={e.emotion} className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: "var(--pc-lavender)33", color: "var(--pc-ink)" }}>
                    {e.emotion} · {e.count}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12px] italic" style={{ color: "var(--pc-muted)" }}>Try tonight: "One thing today that surprised me was…"</p>
            </div>
          }
          to="/journal"
          cta="Open journal"
          icon={PenLine}
        />

        {/* COMMUNITY */}
        <Section
          span="lg:col-span-4"
          title="Community pulse"
          preview={
            <div className="mt-2 space-y-2">
              <PulseRow label="Students supported today" value={String(38 + (data.gratitude?.communityToday ?? 0))} />
              <PulseRow label="Positive posts" value={String(24 + (data.gratitude?.communityToday ?? 0))} />
              <PulseRow label="Trending" value="Exam breath" muted />
            </div>
          }
          to="/community"
          cta="Enter community"
          icon={Users}
        />

        {/* GRATITUDE */}
        <Section
          span="lg:col-span-4"
          title="Gratitude garden"
          preview={
            <div className="mt-2 flex items-center gap-4">
              <TreeGlyph stage={data.gratitude?.tree?.stage ?? 1} />
              <div>
                <div className="font-serif text-[26px] leading-none" style={{ color: "var(--pc-ink)" }}>
                  {data.gratitude?.tree?.name ?? "Seed"}
                </div>
                <div className="text-[11px] mt-1" style={{ color: "var(--pc-muted)" }}>
                  {data.gratitude?.today ?? 0} today · {data.gratitude?.streak?.current ?? 0}-day streak
                </div>
              </div>
            </div>
          }
          to="/gratitude"
          cta="Add gratitude"
          icon={Leaf}
        />

        {/* PEACE BUDDY */}
        <Section
          span="lg:col-span-4"
          title="Peace Buddy"
          preview={
            <div className="mt-2">
              {data.buddy?.nextSession ? (
                <p className="text-[14px]" style={{ color: "var(--pc-ink)" }}>
                  Session in {formatIn(data.buddy.nextSession.scheduledFor)} with your buddy.
                </p>
              ) : data.buddy?.lastChat ? (
                <p className="text-[14px]" style={{ color: "var(--pc-ink)" }}>Your buddy replied recently — pick up where you left off.</p>
              ) : (
                <p className="text-[14px]" style={{ color: "var(--pc-ink)" }}>No buddy yet. Find someone who gets you.</p>
              )}
            </div>
          }
          to="/buddies"
          cta="Open Peace Buddy"
          icon={UserCheck}
        />

        {/* COUNSELLING */}
        <Section
          span="lg:col-span-6"
          title="Counselling"
          preview={
            <div className="mt-2">
              {data.counselling?.next ? (
                <>
                  <p className="text-[14px]" style={{ color: "var(--pc-ink)" }}>
                    Next session <b>{formatIn(data.counselling.next.scheduledFor)}</b>
                    {data.counselling.next.mode ? ` · ${data.counselling.next.mode}` : ""}.
                  </p>
                  <div className="mt-2 text-[12px]" style={{ color: "var(--pc-muted)" }}>
                    Homework · {data.counselling.homeworkDone}/{data.counselling.homeworkTotal || 0} complete
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--pc-surface2)" }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${data.counselling.homeworkTotal ? (data.counselling.homeworkDone / data.counselling.homeworkTotal) * 100 : 0}%`,
                      background: "var(--pc-primary)"
                    }} />
                  </div>
                </>
              ) : (
                <p className="text-[14px]" style={{ color: "var(--pc-ink)" }}>No upcoming counselling. Book if you'd like to talk.</p>
              )}
            </div>
          }
          to="/counselling"
          cta="Open counselling"
          icon={CalendarCheck}
        />

        {/* RESOURCE RECOMMENDATION */}
        <Section
          span="lg:col-span-6"
          title="Resource for you"
          preview={
            <div className="mt-2">
              <div className="text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: "var(--pc-muted)" }}>
                Recommended because {data.screening?.last ? `you completed ${data.screening.last.testId?.toUpperCase()}` : "your calm score dipped this week"}
              </div>
              <div className="rounded-2xl p-3.5" style={{ background: "linear-gradient(135deg,var(--pc-lavender)44,var(--pc-surface))", border: "1px solid var(--pc-border)" }}>
                <div className="font-serif text-[17px] leading-[1.25]" style={{ color: "var(--pc-ink)" }}>
                  The quiet science of a slow exhale
                </div>
                <div className="text-[11px] mt-1" style={{ color: "var(--pc-muted)" }}>Article · 6 min read · Anxiety</div>
              </div>
            </div>
          }
          to="/resources"
          cta="Open library"
          icon={BookOpen}
        />

        {/* MIND GYM */}
        <Section
          span="lg:col-span-6"
          title="Mind Gym"
          preview={
            <div className="mt-2 grid grid-cols-3 gap-3">
              <Stat kicker="Brain" value={String(overall)} suffix="/100" />
              <Stat kicker="Level" value={String(mg.level)} />
              <Stat kicker="XP" value={mg.xp.toLocaleString()} />
            </div>
          }
          expanded={
            <div className="mt-4 rounded-2xl p-3" style={{ background: "var(--pc-surface2)" }}>
              <div className="text-[10px] tracking-[0.25em] uppercase" style={{ color: "var(--pc-muted)" }}>Today's rep</div>
              <div className="font-serif text-[15px] mt-1" style={{ color: "var(--pc-ink)" }}>{nextEx.name}</div>
              <div className="text-[11px]" style={{ color: "var(--pc-muted)" }}>{nextEx.minutes} min · {nextEx.difficulty}</div>
            </div>
          }
          to="/mindgym"
          cta="Enter gym"
          icon={Brain}
        />

        {/* ACHIEVEMENTS */}
        <Section
          span="lg:col-span-6"
          title="Achievements"
          preview={
            <div className="mt-2 flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg,var(--pc-lavender)77,var(--pc-soft)44)" }}>
                🏅
              </div>
              <div className="min-w-0">
                <div className="font-serif text-[16px]" style={{ color: "var(--pc-ink)" }}>
                  {Object.values(mg.achievements || {}).find((a: any) => a.unlockedAt)?.name || "First seed"}
                </div>
                <div className="text-[11px]" style={{ color: "var(--pc-muted)" }}>
                  {Object.values(mg.achievements || {}).filter((a: any) => a.unlockedAt).length} unlocked
                </div>
              </div>
            </div>
          }
          to="/mindgym/achievements"
          cta="See all"
          icon={Trophy}
        />

        {/* UPCOMING */}
        <Section
          span="lg:col-span-6"
          title="Upcoming"
          preview={
            <div className="mt-2 space-y-2">
              {data.counselling?.next && (
                <UpcomingRow when={data.counselling.next.scheduledFor} label="Counselling session" tone="primary" />
              )}
              {data.buddy?.nextSession && (
                <UpcomingRow when={data.buddy.nextSession.scheduledFor} label="Peace Buddy meet" tone="lavender" />
              )}
              <UpcomingRow when={Date.now() + 3600e3 * 2} label="Evening breath reminder" tone="muted" />
              {!data.counselling?.next && !data.buddy?.nextSession && (
                <p className="text-[13px]" style={{ color: "var(--pc-muted)" }}>Only reminders today. A softer day.</p>
              )}
            </div>
          }
          to="/counselling/upcoming"
          cta="Full calendar"
          icon={Clock}
        />

        {/* WEEKLY REFLECTION */}
        <Section
          span="lg:col-span-6"
          title="This week, in one paragraph"
          preview={
            <p className="font-serif italic text-[16px] leading-[1.55] mt-2" style={{ color: "var(--pc-ink)" }}>
              You completed <b>{(data.breathe?.sessions?.length ?? 0) + week.count}</b> reps, wrote <b>{data.journal?.weekCount ?? 0}</b> journal
              {(data.journal?.weekCount ?? 0) === 1 ? " entry" : " entries"}, and kept your streak alive for <b>{mg.streak.current}</b> days.
              Quietly, you're becoming steadier.
            </p>
          }
          to="/mindgym/streak"
          cta="Weekly report"
          icon={TrendingUp}
        />

        {/* CONTINUE */}
        <Section
          span="lg:col-span-12"
          title="Continue where you left off"
          preview={
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ContinueCard to="/journal" icon={Feather} title="Finish yesterday's entry" hint={data.journal?.last?.title || "Draft waiting"} />
              <ContinueCard to="/breathe" icon={Wind} title="Resume box breathing" hint="paused at cycle 3" />
              <ContinueCard to={nextEx ? `/mindgym/exercise/${nextEx.id}` : "/mindgym"} icon={Brain} title={nextEx?.name || "Today's rep"} hint={`${nextEx?.minutes ?? 5} min`} />
              <ContinueCard to="/peacebot" icon={Bot} title="Continue chat" hint="last: 20 min ago" />
            </div>
          }
        />
      </div>

      {/* ── EMERGENCY (quiet footer) ─────────────────────────────── */}
      <section className="mt-10 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center gap-3 sm:gap-6"
        style={{ background: "var(--pc-surface)", border: "1px solid var(--pc-border)" }}>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--pc-ink)" }}>
          <AlertCircle className="w-4 h-4" style={{ color: "var(--pc-primary)" }} />
          <span className="font-medium">If you need someone now</span>
        </div>
        <div className="flex flex-wrap gap-2 ml-auto">
          <SmallBtn to="/counselling/emergency" label="Emergency help" />
          <SmallBtn to="/peacebot" label="Talk to Peace Bot" />
          <SmallBtn to="/buddies/emergency" label="Campus counsellor" />
        </div>
      </section>

      <p className="mt-6 text-center text-[11px] tracking-[0.28em] uppercase" style={{ color: "var(--pc-muted)" }}>
        one small kindness — every day
      </p>
    </main>
  );
}

// ─── Reusable Section ───────────────────────────────────────────────
function Section({
  title, preview, expanded, to, cta, span = "", icon: Icon, hint,
}: {
  title: string;
  preview?: ReactNode;
  expanded?: ReactNode;
  to?: string;
  cta?: string;
  span?: string;
  icon?: any;
  hint?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className={`${span} rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden`}
      style={{
        background: "var(--pc-surface)",
        border: "1px solid var(--pc-border)",
        boxShadow: "0 1px 2px rgba(29,42,68,0.03), 0 20px 40px -30px rgba(29,42,68,0.08)",
      }}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-3.5 h-3.5 opacity-50" style={{ color: "var(--pc-muted)" }} />}
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--pc-muted)" }}>{title}</div>
        </div>
        {hint}
      </header>

      <div>{preview}</div>

      {expanded && (
        <div
          className="overflow-hidden transition-[grid-template-rows,opacity] duration-300 grid"
          style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
        >
          <div className="min-h-0">{expanded}</div>
        </div>
      )}

      <footer className="mt-4 pt-3 flex items-center justify-between gap-2 text-[11px]"
        style={{ borderTop: "1px solid var(--pc-border)" }}>
        {expanded ? (
          <button onClick={() => setOpen(v => !v)}
            className="inline-flex items-center gap-1 tracking-[0.2em] uppercase transition hover:opacity-70"
            style={{ color: "var(--pc-muted)" }}>
            {open ? "Less" : "More"} {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : <span />}
        {to && (
          <Link to={to} className="inline-flex items-center gap-1 font-medium tracking-[0.14em] uppercase transition hover:opacity-70"
            style={{ color: "var(--pc-primary)" }}>
            {cta ?? "Open"} <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </footer>
    </section>
  );
}

// ─── Small building blocks ──────────────────────────────────────────
function Stat({ kicker, value, suffix }: { kicker: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: "var(--pc-surface2)" }}>
      <div className="text-[9px] tracking-[0.22em] uppercase" style={{ color: "var(--pc-muted)" }}>{kicker}</div>
      <div className="font-serif text-[22px] mt-1 leading-none" style={{ color: "var(--pc-ink)" }}>
        {value}<span className="text-[12px] opacity-60">{suffix}</span>
      </div>
    </div>
  );
}

function Ring({ value, label }: { value: number; label: string }) {
  const r = 22, c = 2 * Math.PI * r, dash = c * (value / 100);
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 60 60" className="w-14 h-14">
        <circle cx="30" cy="30" r={r} stroke="var(--pc-border)" strokeWidth="4" fill="none" />
        <circle cx="30" cy="30" r={r} stroke="var(--pc-primary)" strokeWidth="4" fill="none"
          strokeLinecap="round" strokeDasharray={`${dash} ${c}`} transform="rotate(-90 30 30)"
          style={{ transition: "stroke-dasharray 800ms ease-out" }} />
        <text x="30" y="34" textAnchor="middle" fontSize="14" fontFamily="Fraunces, serif" fill="var(--pc-ink)">{value}</text>
      </svg>
      <div className="text-[10px] tracking-[0.24em] uppercase leading-tight" style={{ color: "var(--pc-muted)" }}>
        {label}
      </div>
    </div>
  );
}

function MiniBars({ label, bars, tone = "primary" }: { label: string; bars: number[]; tone?: "primary" | "lavender" }) {
  const color = tone === "lavender" ? "var(--pc-lavender)" : "var(--pc-primary)";
  const safe = (bars.length ? bars : [30, 40, 55, 42, 61, 70, 68]).slice(-7);
  const max = Math.max(...safe, 100);
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--pc-surface2)" }}>
      <div className="text-[10px] tracking-[0.22em] uppercase mb-3" style={{ color: "var(--pc-muted)" }}>{label}</div>
      <div className="flex items-end gap-1.5 h-16">
        {safe.map((v, i) => (
          <div key={i} className="flex-1 rounded-t-md transition-[height] duration-700"
            style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.35 + (i / safe.length) * 0.65 }} />
        ))}
      </div>
    </div>
  );
}

function BrainBars({ brain }: { brain: Record<string, number> }) {
  const skills = Object.entries(brain || {}).slice(0, 5);
  return (
    <div className="mt-3 space-y-2.5">
      {skills.map(([k, v]) => (
        <div key={k}>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="tracking-[0.18em] uppercase" style={{ color: "var(--pc-muted)" }}>{k}</span>
            <span style={{ color: "var(--pc-ink)" }}>{Math.round(v)}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--pc-surface2)" }}>
            <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${v}%`, background: "var(--pc-primary)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function JourneyTimeline({ data, nextEx }: { data: any; nextEx: any }) {
  const items = [
    { time: "07:30", label: "Morning breath", done: (data.breathe?.today ?? 0) > 0, icon: Wind },
    { time: "09:00", label: "Class begins", done: true, icon: Clock },
    { time: "12:00", label: "Midday check-in", done: false, icon: Heart },
    { time: "16:00", label: data.counselling?.next ? "Counselling session" : "Focus block", done: false, icon: CalendarCheck },
    { time: "19:30", label: "Evening gratitude", done: (data.gratitude?.today ?? 0) > 0, icon: Leaf },
    { time: "20:30", label: `Mind Gym · ${nextEx?.name ?? "rep"}`, done: false, icon: Brain },
    { time: "22:30", label: "Wind down", done: false, icon: Moon },
  ];
  return (
    <ol className="mt-3 relative pl-4 sm:pl-6">
      <span className="absolute left-1.5 sm:left-2.5 top-2 bottom-2 w-px" style={{ background: "var(--pc-border)" }} />
      {items.map((it, i) => (
        <li key={i} className="relative py-1.5 flex items-center gap-3">
          <span className="absolute -left-[2px] sm:-left-[3px] w-2.5 h-2.5 rounded-full ring-4"
            style={{
              background: it.done ? "var(--pc-primary)" : "var(--pc-surface)",
              boxShadow: `0 0 0 1px ${it.done ? "var(--pc-primary)" : "var(--pc-border)"}`,
              ["--tw-ring-color" as any]: "var(--pc-surface)",
            }} />
          <span className="ml-3 text-[11px] w-12 tabular-nums" style={{ color: "var(--pc-muted)" }}>{it.time}</span>
          <it.icon className="w-3.5 h-3.5 opacity-60" />
          <span className="text-[13px]" style={{ color: it.done ? "var(--pc-muted)" : "var(--pc-ink)", textDecoration: it.done ? "line-through" : "none" }}>
            {it.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function TreeGlyph({ stage }: { stage: number }) {
  const s = Math.max(1, Math.min(5, stage));
  return (
    <svg viewBox="0 0 60 60" className="w-14 h-14">
      <line x1="30" y1="55" x2="30" y2={55 - s * 5} stroke="var(--pc-muted)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy={40 - s * 4} r={4 + s * 3} fill="var(--pc-moss, #CDEBD9)" opacity="0.9" />
      <circle cx="24" cy={44 - s * 3} r={3 + s * 2} fill="var(--pc-lavender)" opacity="0.7" />
      <circle cx="36" cy={44 - s * 3} r={3 + s * 2} fill="var(--pc-soft)" opacity="0.6" />
    </svg>
  );
}

function PulseRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px]" style={{ color: "var(--pc-muted)" }}>{label}</span>
      <span className={`font-serif text-[16px] tabular-nums`} style={{ color: muted ? "var(--pc-muted)" : "var(--pc-ink)" }}>{value}</span>
    </div>
  );
}

function UpcomingRow({ when, label, tone }: { when: number; label: string; tone: "primary" | "lavender" | "muted" }) {
  const dot = tone === "primary" ? "var(--pc-primary)" : tone === "lavender" ? "var(--pc-lavender)" : "var(--pc-muted)";
  return (
    <div className="flex items-center gap-3">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      <span className="text-[13px] flex-1 truncate" style={{ color: "var(--pc-ink)" }}>{label}</span>
      <span className="text-[11px] tabular-nums" style={{ color: "var(--pc-muted)" }}>{formatIn(when)}</span>
    </div>
  );
}

function ContinueCard({ to, icon: Icon, title, hint }: { to: string; icon: any; title: string; hint: string }) {
  return (
    <Link to={to} className="rounded-2xl p-4 flex flex-col gap-3 transition hover:-translate-y-0.5 group"
      style={{ background: "var(--pc-surface2)", border: "1px solid var(--pc-border)" }}>
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4 opacity-60" />
        <Play className="w-3.5 h-3.5 opacity-0 group-hover:opacity-80 transition" style={{ color: "var(--pc-primary)" }} />
      </div>
      <div>
        <div className="font-serif text-[15px] leading-tight" style={{ color: "var(--pc-ink)" }}>{title}</div>
        <div className="text-[11px] mt-0.5" style={{ color: "var(--pc-muted)" }}>{hint}</div>
      </div>
    </Link>
  );
}

function SmallBtn({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="text-[11px] px-3 py-1.5 rounded-full tracking-[0.1em] uppercase transition hover:opacity-80"
      style={{ background: "var(--pc-surface2)", border: "1px solid var(--pc-border)", color: "var(--pc-ink)" }}>
      {label}
    </Link>
  );
}

function formatIn(ts?: number) {
  if (!ts) return "—";
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const past = diff < 0;
  const h = Math.round(abs / 3600e3);
  const d = Math.round(abs / 864e5);
  if (abs < 60 * 60e3) return past ? "just now" : "soon";
  if (abs < 24 * 3600e3) return past ? `${h}h ago` : `in ${h}h`;
  if (abs < 7 * 864e5) return past ? `${d}d ago` : `in ${d}d`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
