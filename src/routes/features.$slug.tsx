import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CalendarCheck, ArrowRight, Clock, Link2, BellOff, RefreshCw, ShieldCheck, Check,
} from "lucide-react";

const LOGIN_URL = "/auth/login";

type Feature = {
  slug: string;
  tag: string;
  title: string;
  italicWord: string;
  hero: string;
  subtitle: string;
  problem: { title: string; body: string; points: string[] };
  capabilities: { icon: typeof CalendarCheck; title: string; body: string }[];
  workflow: { step: string; title: string; body: string }[];
  savings: { metric: string; label: string; note: string }[];
  faq: { q: string; a: string }[];
};

const FEATURES: Record<string, Feature> = {
  scheduling: {
    slug: "scheduling",
    tag: "Schedule",
    title: "A calendar that respects the way you",
    italicWord: "work.",
    hero: "Smart scheduling",
    subtitle: "Buffers between sessions, no-show automations, and one booking link that fits your practice — not the other way around.",
    problem: {
      title: "The scheduling tax on a clinical week",
      body: "For most psychologists, the calendar is where the day quietly falls apart. Overlapping bookings, missed buffers, back-and-forth SMS threads, and no-shows that eat an hour of your evening.",
      points: [
        "Clients rebook over your lunch buffer",
        "Confirmations go out late — or not at all",
        "A single cancellation cascades into an idle slot",
        "You end up manually chasing reminders on WhatsApp",
      ],
    },
    capabilities: [
      { icon: Clock, title: "Buffers that hold", body: "Set pre and post buffers per service type. Booking links respect them automatically — no one can book into your 10-minute reset." },
      { icon: Link2, title: "One booking link", body: "Share a single link. Clients pick from your real availability, filtered by service, location, and mode (in-person or video)." },
      { icon: BellOff, title: "No-show automations", body: "Reminders 24h and 2h before. Auto-charge, auto-reschedule, or auto-open the slot for waitlist — you choose per service." },
      { icon: RefreshCw, title: "Two-way calendar sync", body: "Google and Outlook stay in lockstep. Personal events block your booking link without exposing details." },
      { icon: ShieldCheck, title: "Privacy first", body: "Client names never appear on shared calendars. Sync sends anonymized 'Session' blocks by default." },
      { icon: CalendarCheck, title: "Waitlist that works", body: "When a slot opens, the waitlist is notified in priority order. First to confirm books automatically." },
    ],
    workflow: [
      { step: "01", title: "Define your week", body: "Set working hours, session lengths, and buffers once. Copy them across weeks." },
      { step: "02", title: "Share your link", body: "Send one link. Clients see only the slots you want to fill." },
      { step: "03", title: "Let automations run", body: "Reminders, reschedules, and cancellations happen without your inbox." },
      { step: "04", title: "See the arc", body: "Weekly view shows utilization, no-show rate, and revenue at a glance." },
    ],
    savings: [
      { metric: "~4 hrs", label: "Saved per week", note: "on scheduling admin, based on early-access clinicians" },
      { metric: "38%", label: "Fewer no-shows", note: "with 24h + 2h reminders enabled" },
      { metric: "1 link", label: "Instead of 40 SMS", note: "for a typical week of bookings" },
    ],
    faq: [
      { q: "Can I have different rules for different services?", a: "Yes. Each service (assessment, first session, follow-up, couples) can have its own duration, buffers, fee, and cancellation window." },
      { q: "What happens on a no-show?", a: "You pick the policy: charge the fee, offer one reschedule, or release the slot to the waitlist. Set it per service." },
      { q: "Do clients need an account to book?", a: "No. They book in three taps. An account is created only if you enable client portal for that person." },
      { q: "Does it work offline in-clinic?", a: "The web app is offline-tolerant for reads. New bookings and reschedules sync when you're back online." },
    ],
  },
};

export const Route = createFileRoute("/features/$slug")({
  loader: ({ params }) => {
    const f = FEATURES[params.slug];
    if (!f) throw notFound();
    return { feature: f };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Feature not found — PeaceCode" }, { name: "robots", content: "noindex" }] };
    const f = loaderData.feature;
    return {
      meta: [
        { title: `${f.hero} — PeaceCode for Psychologists` },
        { name: "description", content: f.subtitle },
        { property: "og:title", content: `${f.hero} — PeaceCode` },
        { property: "og:description", content: f.subtitle },
      ],
    };
  },
  notFoundComponent: FeatureNotFound,
  component: FeatureDetail,
});

function FeatureNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#EAEBFC" }}>
      <div className="text-center">
        <h1 className="pc-serif text-5xl mb-3" style={{ fontFamily: "Fraunces, serif", fontWeight: 300 }}>Feature not found</h1>
        <p className="text-slate-600 mb-6">That page hasn't been written yet.</p>
        <Link to="/features" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-medium">
          See all features <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const styles = `
  .pc-mkt { font-family: 'Inter', sans-serif; color: #1a1a2e; }
  .pc-serif { font-family: 'Fraunces', serif; font-weight: 300; letter-spacing: -0.02em; }
  .pc-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
  .pc-label { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600; }
  .glass-color { background: rgba(255,255,255,0.45); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.65); box-shadow: 0 8px 30px rgba(0,0,0,0.04); border-radius: 1.75rem; }
  .glass-white { background: rgba(255,255,255,0.72); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 20px 60px -15px rgba(0,0,0,0.08); border-radius: 1.75rem; }
  .grain::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.05; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>"); }
`;

function FeatureDetail() {
  const { feature: f } = Route.useLoaderData();

  return (
    <div className="pc-mkt">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Hero */}
      <section className="relative pt-28 pb-24 px-6 grain overflow-hidden" style={{ background: "linear-gradient(180deg, #A3B8C7 0%, #B8C4D3 50%, #EAEBFC 100%)" }}>
        <div className="max-w-5xl mx-auto text-center relative text-white">
          <div className="mb-6">
            <Link to="/features" className="text-sm text-white/80 hover:text-white inline-flex items-center gap-1">
              ← All features
            </Link>
          </div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pc-label mb-6 text-white/85">
            {f.tag}
          </motion.p>
          <h1 className="pc-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-6">
            {f.title.split(" ").map((w, i) => (
              <motion.span key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="inline-block mr-3">
                {w}
              </motion.span>
            ))}
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }} className="pc-italic inline-block">
              {f.italicWord}
            </motion.span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 font-light">
            {f.subtitle}
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.7 }}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}
            href={LOGIN_URL}
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-[18px] font-medium text-base shadow-lg"
          >
            Try it in your practice <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>
      </section>

      {/* Problem */}
      <section className="relative py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <motion.div {...reveal}>
            <p className="pc-label text-slate-500 mb-4">The problem</p>
            <h2 className="pc-serif text-3xl md:text-5xl mb-6">{f.problem.title}</h2>
            <p className="text-slate-600 font-light text-lg">{f.problem.body}</p>
          </motion.div>
          <motion.ul {...reveal} className="space-y-3">
            {f.problem.points.map((p) => (
              <li key={p} className="glass-white p-5 flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                <span className="text-slate-700">{p}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Capabilities */}
      <section className="relative py-28 px-6" style={{ background: "#EAEBFC" }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-20 -translate-y-px">
          <path d="M0,0 L0,40 C120,70 200,25 320,40 C440,55 520,75 640,62 C760,50 840,25 960,38 C1080,50 1180,72 1300,58 C1380,48 1420,30 1440,40 L1440,0 Z" fill="#ffffff" />
        </svg>
        <motion.div {...reveal} className="max-w-6xl mx-auto text-center mb-14 pt-8">
          <p className="pc-label text-slate-500 mb-4">What's inside</p>
          <h2 className="pc-serif text-4xl md:text-6xl">Everything the calendar <span className="pc-italic">already knows.</span></h2>
        </motion.div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {f.capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="glass-color p-7"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-11 h-11 rounded-2xl bg-white/70 flex items-center justify-center mb-4 shadow-sm"
                >
                  <Icon className="w-5 h-5 text-slate-700" />
                </motion.div>
                <h3 className="pc-serif text-2xl mb-2">{c.title}</h3>
                <p className="text-slate-600 font-light text-sm">{c.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Workflow */}
      <section className="relative py-28 px-6 bg-white">
        <motion.div {...reveal} className="max-w-6xl mx-auto text-center mb-14">
          <p className="pc-label text-slate-500 mb-4">How it flows</p>
          <h2 className="pc-serif text-4xl md:text-6xl">Four steps, <span className="pc-italic">once.</span></h2>
        </motion.div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-5">
          {f.workflow.map((w, i) => (
            <motion.div
              key={w.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="p-6 border border-slate-200/60 rounded-[28px] bg-white/70"
            >
              <span className="pc-serif text-5xl text-slate-300">{w.step}</span>
              <h3 className="pc-serif text-xl mt-2 mb-2">{w.title}</h3>
              <p className="text-slate-600 font-light text-sm">{w.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Savings */}
      <section className="relative py-28 px-6" style={{ background: "linear-gradient(180deg, #ffffff, #EAEBFC)" }}>
        <motion.div {...reveal} className="max-w-4xl mx-auto text-center mb-14">
          <p className="pc-label text-slate-500 mb-4">Where it saves you</p>
          <h2 className="pc-serif text-4xl md:text-5xl">The measurable <span className="pc-italic">difference.</span></h2>
        </motion.div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {f.savings.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass-white p-8 text-center"
            >
              <p className="pc-serif text-6xl mb-2">{s.metric}</p>
              <p className="pc-label text-slate-700 mb-3">{s.label}</p>
              <p className="text-xs text-slate-500 font-light">{s.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-28 px-6 bg-white">
        <motion.div {...reveal} className="max-w-3xl mx-auto">
          <p className="pc-label text-slate-500 mb-4 text-center">Frequently asked</p>
          <h2 className="pc-serif text-4xl md:text-5xl text-center mb-12">Straight <span className="pc-italic">answers.</span></h2>
          <div className="space-y-4">
            {f.faq.map((it) => (
              <div key={it.q} className="glass-white p-6">
                <div className="flex items-start gap-3 mb-2">
                  <Check className="w-4 h-4 mt-1.5 text-slate-500 shrink-0" />
                  <h3 className="pc-serif text-xl">{it.q}</h3>
                </div>
                <p className="text-slate-600 font-light pl-7">{it.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 text-center overflow-hidden" style={{ background: "linear-gradient(180deg, #EAEBFC, #A3B8C7)" }}>
        <motion.div {...reveal} className="max-w-3xl mx-auto">
          <h2 className="pc-serif text-4xl md:text-6xl mb-8 leading-[1.05] text-slate-900">
            Give your calendar the <span className="pc-italic">same care</span> you give your notes.
          </h2>
          <motion.a
            href={LOGIN_URL}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-medium"
          >
            Start free <ArrowRight className="w-4 h-4" />
          </motion.a>
          <div className="mt-6">
            <Link to="/features" className="text-sm text-slate-700 hover:text-slate-900 underline underline-offset-4">
              Or browse other features
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
