import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowRight, Sparkles, Clock, Link2, BellOff, RefreshCw, ShieldCheck, CalendarCheck,
  Check, TrendingDown, TrendingUp, Users, Zap, Coffee, Moon, Sun,
} from "lucide-react";
import branchLeft from "@/assets/sakura/branch-left.svg";
import branchRight from "@/assets/sakura/branch-right.svg";

const LOGIN_URL = "https://psychologist.peacecode.in/auth";

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

// ─── Realistic mock data ──────────────────────────────────────────
const weeklyUtilization = [
  { day: "Mon", booked: 6, buffer: 1.5, free: 0.5 },
  { day: "Tue", booked: 7, buffer: 1.5, free: 0 },
  { day: "Wed", booked: 5, buffer: 1, free: 2 },
  { day: "Thu", booked: 8, buffer: 2, free: 0 },
  { day: "Fri", booked: 6, buffer: 1.5, free: 1 },
  { day: "Sat", booked: 4, buffer: 1, free: 0 },
];

const noShowTrend = [
  { month: "Feb", before: 14, after: 14 },
  { month: "Mar", before: 15, after: 12 },
  { month: "Apr", before: 13, after: 9 },
  { month: "May", before: 16, after: 7 },
  { month: "Jun", before: 14, after: 6 },
  { month: "Jul", before: 15, after: 5 },
];

const reminderFunnel = [
  { stage: "Booked", count: 100, color: "var(--sakura-rose)" },
  { stage: "24h reminder", count: 96, color: "#C48DA5" },
  { stage: "2h reminder", count: 91, color: "#D8A7BB" },
  { stage: "Attended", count: 87, color: "#7BA88A" },
];

const timeSaved = [
  { name: "Reminders", value: 82 },
  { name: "Rescheduling", value: 61 },
  { name: "No-show chase", value: 44 },
  { name: "Manual admin", value: 13 },
];
const timeColors = ["var(--sakura-rose)", "#C48DA5", "#D8A7BB", "#EAC7D1"];

const bookingSteps = [
  { icon: Link2, title: "Client opens the link", detail: "Three-tap flow. No account required." },
  { icon: CalendarCheck, title: "Picks a real slot", detail: "Only shows availability that respects your buffers." },
  { icon: BellOff, title: "Automations run", detail: "24h + 2h reminders. Auto-charge on no-show." },
  { icon: RefreshCw, title: "Calendars sync", detail: "Google or Outlook, both ways, privately." },
];

const capabilityCards = [
  { icon: Clock, tag: "Buffers", title: "Buffers that hold", body: "Pre/post buffers per service — booking links respect them automatically. No more 5-minute overruns eating your lunch." },
  { icon: Link2, tag: "One link", title: "One booking link", body: "Clients pick from real availability, filtered by service, location, and mode. Send once, use everywhere." },
  { icon: BellOff, tag: "Automations", title: "No-show automations", body: "24h + 2h reminders. Auto-charge, auto-reschedule, or release to waitlist. Configured per service." },
];

const extraCards = [
  { icon: RefreshCw, title: "Two-way calendar sync", body: "Google and Outlook stay in lockstep. Personal events block your calendar without exposing details." },
  { icon: ShieldCheck, title: "Privacy-first sync", body: "Client names never appear on shared calendars. Synced blocks read as 'Session — hold'." },
  { icon: CalendarCheck, title: "Waitlist that actually works", body: "Priority queue notified the instant a slot opens. First confirmation books automatically." },
];

const faqs = [
  { q: "Can I have different rules per service?", a: "Yes. Every service — assessment, first session, follow-up, couples, group — carries its own duration, buffers, fee, cancellation window, and reminder cadence." },
  { q: "What exactly happens on a no-show?", a: "Your call, per service: charge the on-file card, offer one automatic reschedule, or release the slot to the waitlist. Policies can be softened by client tag (e.g. 'first session — grace')." },
  { q: "Do clients need an account to book?", a: "No. Three-tap booking with just a name, email, and phone. An account is only created if you enable the client portal for that person." },
  { q: "Will it work in-clinic when Wi-Fi drops?", a: "Reads work fully offline. New bookings and edits queue locally and sync as soon as connectivity returns." },
  { q: "Can I offer package deals or block bookings?", a: "Yes. Configure packages (e.g. 6-session CBT bundle), let clients book the whole arc in one flow, and auto-schedule recurring slots with drift protection." },
];

// ─── Component ────────────────────────────────────────────────────
export function SchedulingDeepDive() {
  return (
    <article className="pc-mkt sakura-page">
      <style dangerouslySetInnerHTML={{ __html: schedulingStyles }} />

      {/* ─── HERO ─── */}
      <header className="relative pt-20 pb-24 px-6 overflow-hidden">
        <img src={branchLeft} alt="" aria-hidden="true" className="sakura-branch left-0 -translate-x-[15%]" />
        <img src={branchRight} alt="" aria-hidden="true" className="sakura-branch right-0 translate-x-[15%]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <nav className="mb-6 flex justify-center">
            <Link to="/features" className="text-sm inline-flex items-center gap-1" style={{ color: "var(--sakura-muted)" }}>
              ← All features
            </Link>
          </nav>
          <div className="mb-8 flex justify-center">
            <span className="sakura-pill"><Sparkles className="w-3 h-3" /> Schedule · booking · waitlist</span>
          </div>
          <h1 className="pc-serif text-4xl md:text-6xl lg:text-7xl leading-[1.08] mb-8" style={{ color: "var(--sakura-ink)" }}>
            A calendar that respects the way you <span className="pc-italic">work.</span>
          </h1>
          <p className="text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed" style={{ color: "var(--sakura-muted)" }}>
            Buffers between sessions, no-show automations, and one booking link that fits your practice — not the other way around.
          </p>

          {/* Live stat chips */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <StatChip icon={<TrendingDown className="w-3.5 h-3.5" />} label="No-shows" value="−62%" />
            <StatChip icon={<Coffee className="w-3.5 h-3.5" />} label="Admin time saved" value="4 hrs/wk" />
            <StatChip icon={<Zap className="w-3.5 h-3.5" />} label="Reminders sent" value="Auto · 24h + 2h" />
            <StatChip icon={<Users className="w-3.5 h-3.5" />} label="Waitlist fills" value="Under 3 min" />
          </div>
        </div>
      </header>

      {/* ─── SPLIT COPY ─── */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <motion.h2 {...reveal} className="pc-serif text-3xl md:text-5xl leading-[1.1]" style={{ color: "var(--sakura-ink)" }}>
            The scheduling tax on a clinical week<span className="pc-italic">.</span>
          </motion.h2>
          <motion.div {...reveal}>
            <p className="text-base leading-relaxed font-light mb-4" style={{ color: "var(--sakura-muted)" }}>
              For most psychologists the calendar is where the day quietly falls apart. Overlapping bookings, missed buffers,
              SMS threads, and no-shows that eat an hour of your evening.
            </p>
            <ul className="space-y-2">
              {["Clients rebook over your lunch buffer",
                "Confirmations go out late — or not at all",
                "A cancellation cascades into an idle slot",
                "You chase reminders on WhatsApp"].map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm" style={{ color: "var(--sakura-muted)" }}>
                  <span className="mt-2 w-1 h-1 rounded-full shrink-0" style={{ background: "var(--sakura-rose)" }} />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ─── DATA VIZ — Weekly utilization ─── */}
      <section className="relative py-16 px-6">
        <motion.div {...reveal} className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 sakura-card-outlined p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="pc-label mb-2" style={{ color: "var(--sakura-muted)" }}>Sample week</p>
                <h3 className="pc-serif text-2xl md:text-3xl" style={{ color: "var(--sakura-ink)" }}>
                  Your calendar at a <span className="pc-italic">glance</span>
                </h3>
              </div>
              <LegendDot color="var(--sakura-rose)" label="Sessions" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyUtilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--sakura-border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--sakura-muted)" fontSize={12} />
                  <YAxis stroke="var(--sakura-muted)" fontSize={12} unit="h" />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--sakura-petal)", opacity: 0.4 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "var(--sakura-muted)" }} />
                  <Bar dataKey="booked" stackId="a" fill="var(--sakura-rose)" radius={[0, 0, 4, 4]} name="Sessions" />
                  <Bar dataKey="buffer" stackId="a" fill="#D8A7BB" name="Buffers" />
                  <Bar dataKey="free" stackId="a" fill="#F0D5DE" radius={[4, 4, 0, 0]} name="Open" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs mt-4 font-light" style={{ color: "var(--sakura-muted)" }}>
              Stacked hours — booked sessions, protected buffers, and remaining open capacity. Hover any day for the breakdown.
            </p>
          </div>

          <div className="lg:col-span-2 sakura-card-outlined p-8">
            <p className="pc-label mb-2" style={{ color: "var(--sakura-muted)" }}>Time reclaimed</p>
            <h3 className="pc-serif text-2xl mb-6" style={{ color: "var(--sakura-ink)" }}>
              Where automation <span className="pc-italic">gives back</span>
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={timeSaved} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {timeSaved.map((_, i) => <Cell key={i} fill={timeColors[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v} min/wk`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-1.5">
              {timeSaved.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2" style={{ color: "var(--sakura-ink)" }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: timeColors[i] }} />
                    {s.name}
                  </span>
                  <span style={{ color: "var(--sakura-muted)" }}>{s.value} min</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── 3 CAPABILITY CARDS ─── */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {capabilityCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08 }} whileHover={{ y: -4 }} className="sakura-card-outlined p-7">
                <div className="sakura-icon-chip mb-5"><Icon className="w-5 h-5" /></div>
                <span className="sakura-card-tag mb-3">{c.tag}</span>
                <h3 className="pc-serif text-2xl mt-3 mb-2" style={{ color: "var(--sakura-ink)" }}>{c.title}</h3>
                <p className="text-sm font-light leading-relaxed mb-5" style={{ color: "var(--sakura-muted)" }}>{c.body}</p>
                <a href="#booking-flow" className="sakura-btn-ghost">View details <ArrowRight className="w-3.5 h-3.5" /></a>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── NO-SHOW TREND ─── */}
      <section className="relative py-16 px-6">
        <motion.div {...reveal} className="max-w-5xl mx-auto sakura-card-outlined p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="pc-label mb-2" style={{ color: "var(--sakura-muted)" }}>Before vs after PeaceCode</p>
              <h3 className="pc-serif text-2xl md:text-3xl" style={{ color: "var(--sakura-ink)" }}>
                No-show rate, <span className="pc-italic">quietly falling</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-full" style={{ background: "#E6F4EC", color: "#1F7A3E" }}>
              <TrendingDown className="w-4 h-4" /> −62% since enabling automations
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={noShowTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="beforeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D8A7BB" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#D8A7BB" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="afterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--sakura-rose)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--sakura-rose)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sakura-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--sakura-muted)" fontSize={12} />
                <YAxis stroke="var(--sakura-muted)" fontSize={12} unit="%" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="before" stroke="#D8A7BB" strokeWidth={2} fill="url(#beforeGrad)" name="Before" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="after" stroke="var(--sakura-rose)" strokeWidth={2.5} fill="url(#afterGrad)" name="After" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* ─── BOOKING FLOW as visual timeline ─── */}
      <section id="booking-flow" className="relative py-20 px-6">
        <motion.div {...reveal} className="max-w-3xl mx-auto text-center mb-12">
          <p className="pc-label mb-3" style={{ color: "var(--sakura-muted)" }}>How a booking flows</p>
          <h2 className="pc-serif text-3xl md:text-5xl" style={{ color: "var(--sakura-ink)" }}>
            One link, four <span className="pc-italic">quiet steps.</span>
          </h2>
        </motion.div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px" style={{ background: "linear-gradient(90deg, transparent, var(--sakura-rose), transparent)" }} />
          {bookingSteps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.1 }} className="sakura-card-outlined p-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="sakura-icon-chip"><Icon className="w-5 h-5" /></div>
                  <span className="pc-serif text-3xl" style={{ color: "var(--sakura-rose)" }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="pc-serif text-lg mb-1" style={{ color: "var(--sakura-ink)" }}>{s.title}</h3>
                <p className="text-xs font-light" style={{ color: "var(--sakura-muted)" }}>{s.detail}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── REMINDER FUNNEL as horizontal bars ─── */}
      <section className="relative py-16 px-6">
        <motion.div {...reveal} className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
          <div className="sakura-card-outlined p-8">
            <p className="pc-label mb-2" style={{ color: "var(--sakura-muted)" }}>Attendance funnel</p>
            <h3 className="pc-serif text-2xl mb-6" style={{ color: "var(--sakura-ink)" }}>
              From booking to <span className="pc-italic">attended</span>
            </h3>
            <div className="space-y-4">
              {reminderFunnel.map((r) => {
                const pct = (r.count / reminderFunnel[0].count) * 100;
                return (
                  <div key={r.stage}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span style={{ color: "var(--sakura-ink)" }}>{r.stage}</span>
                      <span className="font-medium tabular-nums" style={{ color: "var(--sakura-muted)" }}>{r.count}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--sakura-petal)" }}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: "easeOut" }} className="h-full rounded-full" style={{ background: r.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs mt-6 font-light" style={{ color: "var(--sakura-muted)" }}>
              Across ~2,400 sessions on early-access practices. 87% attendance vs. 74% industry baseline.
            </p>
          </div>

          <div className="sakura-card-outlined p-8">
            <p className="pc-label mb-2" style={{ color: "var(--sakura-muted)" }}>Live waitlist behaviour</p>
            <h3 className="pc-serif text-2xl mb-6" style={{ color: "var(--sakura-ink)" }}>
              A slot opens at <span className="pc-italic">4:17 pm</span>
            </h3>
            <ol className="relative border-l pl-6 space-y-5" style={{ borderColor: "var(--sakura-border)" }}>
              {[
                { t: "4:17", label: "Cancellation received", detail: "Client A cancels Thu 5pm session." },
                { t: "4:17", label: "Waitlist notified", detail: "3 priority clients get SMS + email." },
                { t: "4:19", label: "First confirmation", detail: "Client B taps 'take it' — slot locked." },
                { t: "4:19", label: "Rest auto-released", detail: "Others told slot is filled, kept in queue." },
                { t: "4:20", label: "Calendar reconciled", detail: "Google + Outlook updated silently." },
              ].map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full ring-4" style={{ background: "var(--sakura-rose)", boxShadow: "0 0 0 4px var(--sakura-petal)" }} />
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs tabular-nums font-medium" style={{ color: "var(--sakura-rose)" }}>{e.t}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--sakura-ink)" }}>{e.label}</span>
                  </div>
                  <p className="text-xs mt-0.5 font-light" style={{ color: "var(--sakura-muted)" }}>{e.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </section>

      {/* ─── EXTRA CAPABILITIES ─── */}
      <section className="relative py-16 px-6">
        <motion.div {...reveal} className="max-w-3xl mx-auto text-center mb-10">
          <p className="pc-label mb-3" style={{ color: "var(--sakura-muted)" }}>Also inside</p>
          <h2 className="pc-serif text-3xl md:text-4xl" style={{ color: "var(--sakura-ink)" }}>
            Everything the calendar <span className="pc-italic">already knows.</span>
          </h2>
        </motion.div>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {extraCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="sakura-card-outlined p-6">
                <div className="sakura-icon-chip mb-3" style={{ width: 36, height: 36 }}><Icon className="w-4 h-4" /></div>
                <h3 className="pc-serif text-lg mb-1" style={{ color: "var(--sakura-ink)" }}>{c.title}</h3>
                <p className="text-xs font-light" style={{ color: "var(--sakura-muted)" }}>{c.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── PRICING / IMPACT ROW ─── */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          <ImpactCard metric="~4 hrs" label="Saved per week" note="on scheduling admin, from early-access clinicians" icon={<Coffee className="w-4 h-4" />} />
          <ImpactCard metric="38%" label="Fewer no-shows" note="with 24h + 2h reminders enabled" icon={<TrendingDown className="w-4 h-4" />} />
          <ImpactCard metric="1 link" label="Instead of 40 SMS" note="for a typical booking week" icon={<Link2 className="w-4 h-4" />} />
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="relative py-20 px-6">
        <motion.div {...reveal} className="max-w-3xl mx-auto">
          <p className="pc-label mb-3 text-center" style={{ color: "var(--sakura-muted)" }}>Frequently asked</p>
          <h2 className="pc-serif text-3xl md:text-5xl text-center mb-10" style={{ color: "var(--sakura-ink)" }}>
            Straight <span className="pc-italic">answers.</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((it) => (
              <details key={it.q} className="sakura-card-outlined p-6 group">
                <summary className="cursor-pointer flex items-start gap-3 list-none">
                  <Check className="w-4 h-4 mt-1.5 shrink-0" style={{ color: "var(--sakura-rose)" }} />
                  <h3 className="pc-serif text-lg" style={{ color: "var(--sakura-ink)" }}>{it.q}</h3>
                </summary>
                <p className="font-light pl-7 mt-3 text-sm" style={{ color: "var(--sakura-muted)" }}>{it.a}</p>
              </details>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <footer className="relative py-24 px-6 text-center overflow-hidden">
        <motion.div {...reveal} className="max-w-3xl mx-auto">
          <div className="flex justify-center gap-6 mb-8" aria-hidden="true">
            <Sun className="w-4 h-4" style={{ color: "var(--sakura-rose)", opacity: 0.6 }} />
            <Moon className="w-4 h-4" style={{ color: "var(--sakura-rose)", opacity: 0.6 }} />
            <Sun className="w-4 h-4" style={{ color: "var(--sakura-rose)", opacity: 0.6 }} />
          </div>
          <h2 className="pc-serif text-3xl md:text-5xl mb-8 leading-[1.05]" style={{ color: "var(--sakura-ink)" }}>
            Give your calendar the <span className="pc-italic">same care.</span>
          </h2>
          <a href={LOGIN_URL} className="sakura-btn-dark">
            Get started free <ArrowRight className="w-4 h-4" />
          </a>
          <div className="mt-6">
            <Link to="/features" className="text-sm underline underline-offset-4" style={{ color: "var(--sakura-muted)" }}>
              Or browse other features
            </Link>
          </div>
        </motion.div>
      </footer>
    </article>
  );
}

// ─── Sub-components ─────────────────────────────────────────────
function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="sakura-card-outlined inline-flex items-center gap-2 px-4 py-2 text-xs" style={{ color: "var(--sakura-ink)", borderRadius: 999 }}>
      <span style={{ color: "var(--sakura-rose)" }}>{icon}</span>
      <span style={{ color: "var(--sakura-muted)" }}>{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs" style={{ color: "var(--sakura-muted)" }}>
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
function ImpactCard({ metric, label, note, icon }: { metric: string; label: string; note: string; icon: React.ReactNode }) {
  return (
    <div className="sakura-card-outlined p-8 text-center">
      <div className="flex justify-center mb-3" style={{ color: "var(--sakura-rose)" }}>{icon}</div>
      <p className="pc-serif text-5xl md:text-6xl mb-2" style={{ color: "var(--sakura-rose)" }}>{metric}</p>
      <p className="pc-label mb-2" style={{ color: "var(--sakura-ink)" }}>{label}</p>
      <p className="text-xs font-light" style={{ color: "var(--sakura-muted)" }}>{note}</p>
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(255,255,255,0.95)",
  border: "1px solid var(--sakura-border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--sakura-ink)",
  boxShadow: "0 10px 30px -10px rgba(138,51,85,0.18)",
};

// Outlined frosted-glass card CSS specific to deep-dive pages.
// Standard property only — Lightning CSS adds the -webkit- prefix.
const schedulingStyles = `
  .sakura-card-outlined {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(24px);
    border: 1px solid var(--sakura-border);
    border-radius: 1.5rem;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6), 0 20px 60px -30px rgba(138, 51, 85, 0.15);
    transition: box-shadow 200ms ease, transform 200ms ease;
  }
  .sakura-card-outlined:hover {
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.8), 0 24px 70px -25px rgba(138, 51, 85, 0.25);
  }
`;
