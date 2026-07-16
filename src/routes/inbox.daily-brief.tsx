import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useNotifs, useTasks } from "@/lib/notifications-store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/inbox/daily-brief")({
  head: () => ({
    meta: [
      { title: "Daily Brief — PeaceCode · Practice" },
      { name: "description", content: "A preview of the 7am email that lands each morning." },
    ],
  }),
  component: DailyBriefPage,
});

function DailyBriefPage() {
  const { items } = useNotifs();
  const tasks = useTasks();

  const now = Date.now();
  const HOUR = 3_600_000;
  const isToday = (ts: number) => new Date(ts).toDateString() === new Date().toDateString();

  const todaySessions = items.filter((n) => n.category === "sessions" && isToday(n.timestamp));
  const needs = items.filter((n) => !n.readAt && !n.archivedAt && n.type === "patient_message");
  const followUps = items.filter((n) => n.type === "assessment_submitted" && now - n.timestamp < 48 * HOUR).slice(0, 3);
  const risks = items.filter((n) => n.severity === "urgent" && now - n.timestamp < 48 * HOUR);
  const openTasks = tasks.filter((t) => !t.doneAt).slice(0, 4);

  const today = new Date();

  return (
    <AppShell crumb="Daily Brief">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/inbox" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-8"
          style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <ArrowLeft className="w-3 h-3" /> Back to inbox
        </Link>

        {/* Envelope preview */}
        <div className="rounded-3xl overflow-hidden" style={{ background: palette.solid, border: `1px solid ${palette.border}`, boxShadow: "0 20px 80px rgba(30,20,24,0.06)" }}>
          <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: palette.border, background: "#FCF9FA" }}>
            <div>
              <div className="uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
                delivered · 07:00 · asia/kolkata
              </div>
              <div className="mt-1 text-[13px]" style={{ color: palette.ink }}>
                <span style={{ color: palette.muted }}>from</span> PeaceCode &lt;brief@peacecode.in&gt;
              </div>
            </div>
            <div className="uppercase text-right" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
              preview only
            </div>
          </div>

          <article className="px-10 py-12">
            <div className="uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.2em", color: palette.muted }}>
              {today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 44, lineHeight: 1.05, color: palette.ink, letterSpacing: "-0.02em", marginTop: 12 }}>
              Good morning, Dr. Sharma.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
              A soft roadmap for the day. Nothing here is urgent — the urgent things already reached you.
            </p>

            <Section title="Today's sessions" count={todaySessions.length}>
              {todaySessions.length === 0
                ? <Muted>No sessions on the books today. A rare open day — protect a piece of it.</Muted>
                : todaySessions.slice(0, 4).map((s) => <BriefRow key={s.id} title={s.title} meta={s.preview} />)}
            </Section>

            <Section title="Waiting on a reply" count={needs.length}>
              {needs.length === 0
                ? <Muted>No unanswered messages. Rare and precious.</Muted>
                : needs.slice(0, 4).map((s) => <BriefRow key={s.id} title={s.source} meta={`"${s.preview}"`} />)}
            </Section>

            <Section title="Follow-ups" count={followUps.length}>
              {followUps.length === 0
                ? <Muted>No new patient submissions since yesterday.</Muted>
                : followUps.map((s) => <BriefRow key={s.id} title={s.source} meta={s.preview} />)}
            </Section>

            {risks.length > 0 && (
              <Section title="Yesterday's flags" count={risks.length} accent>
                {risks.map((s) => <BriefRow key={s.id} title={s.title} meta={s.preview} accent />)}
              </Section>
            )}

            {openTasks.length > 0 && (
              <Section title="Tasks on deck" count={openTasks.length}>
                {openTasks.map((t) => <BriefRow key={t.id} title={t.title} meta={t.dueAt ? new Date(t.dueAt).toLocaleString() : ""} />)}
              </Section>
            )}

            <div className="mt-14 pt-8 border-t" style={{ borderColor: palette.border }}>
              <p style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: 17, lineHeight: 1.5, color: palette.ink }}>
                "The cure for anything is salt water — sweat, tears, or the sea."
              </p>
              <p className="mt-2 uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
                — Isak Dinesen
              </p>
            </div>

            <div className="mt-10 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              You receive the daily brief because it's on in <Link to="/settings/notifications" style={{ color: palette.primary }}>preferences</Link>.
              Change the rhythm any time — hourly, weekly, or off entirely.
            </div>
          </article>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, count, children, accent }: { title: string; count?: number; children: React.ReactNode; accent?: boolean }) {
  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between border-b pb-2 mb-4" style={{ borderColor: palette.border }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: accent ? palette.primary : palette.ink }}>{title}</h2>
        {typeof count === "number" && (
          <span className="tabular-nums text-[11px] uppercase tracking-[0.16em]"
            style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {count}
          </span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function BriefRow({ title, meta, accent }: { title: string; meta?: string; accent?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="mt-2 w-1 h-1 rounded-full shrink-0" style={{ background: accent ? palette.primary : palette.muted }} />
      <div>
        <div className="text-[14px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{title}</div>
        {meta && <div className="text-[12.5px] mt-0.5" style={{ color: palette.muted }}>{meta}</div>}
      </div>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px]" style={{ color: palette.muted, fontStyle: "italic", fontFamily: "'Fraunces', serif" }}>{children}</div>;
}
