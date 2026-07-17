import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Menu, X, ArrowRight, CalendarCheck, ClipboardList, Users, Wallet,
  FileText, ShieldCheck, Video, Bell, CloudRain, BatteryLow, Cloud, Sun,
  ChevronDown, Plus, Minus, Apple, Play, Instagram, Twitter, Linkedin, Youtube,
} from "lucide-react";

const LOGIN_URL = "/auth/login";

export const Route = createFileRoute("/for-psychologists")({
  head: () => ({
    meta: [
      { title: "PeaceCode for Psychologists — The calm practice OS" },
      { name: "description", content: "A clinical workspace built for psychologists — scheduling, notes, assessments, billing, and outcomes in one calm place." },
      { property: "og:title", content: "PeaceCode for Psychologists" },
      { property: "og:description", content: "The calm practice OS for verified psychologists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: MarketingPage,
});

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const styles = `
  .pc-mkt { font-family: 'Inter', sans-serif; color: #1a1a2e; }
  .pc-serif { font-family: 'Fraunces', serif; font-weight: 300; letter-spacing: -0.02em; }
  .pc-display { font-family: 'DM Serif Display', serif; font-weight: 400; letter-spacing: -0.015em; }
  .pc-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
  .pc-label { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600; }

  .glass-color { background: rgba(255,255,255,0.4); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 8px 30px rgba(0,0,0,0.04); border-radius: 1.75rem; }
  .glass-white { background: rgba(255,255,255,0.7); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 20px 60px -15px rgba(0,0,0,0.1); border-radius: 1.75rem; }
  .liquid-glass {
    background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.28) 48%, rgba(210,200,240,0.18)),
                radial-gradient(circle at 18% 12%, rgba(255,255,255,0.7), transparent 34%);
    border: 1px solid rgba(255,255,255,0.55);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.58), 0 14px 38px rgba(90,80,140,0.14);
    backdrop-filter: blur(22px) saturate(1.25); -webkit-backdrop-filter: blur(22px) saturate(1.25);
  }
  .grain::after {
    content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.06; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>");
  }
`;

function MarketingPage() {
  return (
    <div className="pc-mkt relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Navbar />
      <Hero />
      <Trust />
      <HowItWorks />
      <MoodGate />
      <FAQ />
      <Bento />
      <FeatureHighlight />
      <Ecosystem />
      <Testimonials />
      <Weather />
      <Blog />
      <ClosingCTA />
      <Footer />
    </div>
  );
}

/* ---------------- Navbar ---------------- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { label: "Features", href: "/features", items: ["Scheduling", "Notes", "Assessments", "Billing", "Telehealth", "Copilot"] },
    { label: "Practice", items: ["Solo clinicians", "Group practices", "Supervisors"] },
    { label: "Resources", items: ["Blog", "Guides", "Compliance"] },
    { label: "Company", items: ["About", "Careers", "Contact"] },
  ];

  return (
    <motion.header
      initial={false}
      animate={{
        top: scrolled ? 16 : 0,
        marginInline: scrolled ? 16 : 0,
        borderRadius: scrolled ? 32 : 0,
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 z-50"
      style={{
        background: scrolled ? "rgba(255,255,255,0.55)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "none",
        border: scrolled ? "1px solid rgba(255,255,255,0.7)" : "1px solid transparent",
        color: scrolled ? "#1a1a2e" : "#ffffff",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
        <a href="#" className="pc-serif text-2xl">peace<span className="pc-italic">code</span></a>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => {
            const featureSlugMap: Record<string, string> = {
              Scheduling: "scheduling", Notes: "notes", Assessments: "assessments",
              Billing: "billing", Telehealth: "telehealth", Copilot: "copilot",
            };
            return (
              <div key={n.label} className="relative group px-4 py-2">
                {"href" in n && n.href ? (
                  <Link to={n.href} className="flex items-center gap-1 text-sm font-medium">
                    {n.label} <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </Link>
                ) : (
                  <button className="flex items-center gap-1 text-sm font-medium">
                    {n.label} <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </button>
                )}
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
                  <div className="glass-white p-4 min-w-[220px] text-slate-800">
                    {n.items.map((i) => {
                      const slug = featureSlugMap[i];
                      return slug ? (
                        <Link key={i} to="/features/$slug" params={{ slug }} className="block px-3 py-2 rounded-xl hover:bg-white/60 text-sm">{i}</Link>
                      ) : (
                        <a key={i} href="#" className="block px-3 py-2 rounded-xl hover:bg-white/60 text-sm">{i}</a>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to={LOGIN_URL}
            className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: scrolled ? "#0f172a" : "#ffffff",
              color: scrolled ? "#ffffff" : "#0f172a",
              boxShadow: scrolled ? "0 4px 14px rgba(15,23,42,0.25)" : "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            Login
          </Link>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden px-4 pb-4">
          <div className="glass-white p-4 text-slate-800">
            {nav.map((n) => (
              <details key={n.label} className="py-2 border-b border-slate-200/50 last:border-0">
                <summary className="flex justify-between items-center cursor-pointer font-medium">
                  {n.label} <Plus className="w-4 h-4" />
                </summary>
                <div className="pt-2 pl-2">
                  {n.items.map((i) => <a key={i} href="#" className="block py-1.5 text-sm text-slate-600">{i}</a>)}
                </div>
              </details>
            ))}
            <Link to={LOGIN_URL} className="mt-4 block text-center px-5 py-3 rounded-full bg-slate-900 text-white font-medium">Login</Link>
          </div>
        </div>
      )}
    </motion.header>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -60]);

  const words = ["A", "calmer", "way", "to", "run", "your", "practice."];

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 grain overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #A3B8C7 0%, #B8C4D3 40%, #D4DCE4 100%)",
      }}
    >
      {/* Floating decorations */}
      <motion.div style={{ y: y1 }} className="absolute top-32 left-[8%] hidden md:block opacity-70">
        <div className="w-24 h-24 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)" }} />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute top-48 right-[12%] hidden md:block opacity-60">
        <div className="w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(234,235,252,0.7), transparent 70%)" }} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-[15%] hidden md:block"
      >
        <Cloud className="w-16 h-16 text-white/60" />
      </motion.div>

      <div className="relative text-center max-w-4xl mx-auto text-white">
        <motion.p {...reveal} className="pc-label mb-8 text-white/80">For verified psychologists</motion.p>

        <h1 className="pc-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-8">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block mr-3"
            >
              {w === "calmer" ? <span className="pc-italic">calmer</span> : w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.9 }}
          className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 font-light"
        >
          Scheduling, notes, assessments, billing, and outcomes — one clinical workspace built for the way psychologists actually work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.9 }}
        >
          <motion.a
            href={LOGIN_URL}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-[18px] font-medium text-base shadow-lg"
          >
            Start your practice <ArrowRight className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </div>

      {/* Slide-in cloud layer */}
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.4))" }}
      />
    </section>
  );
}

/* ---------------- Trust ---------------- */
function Trust() {
  const logos = ["NIMHANS", "IIT Delhi", "Fortis", "Manipal", "AIIMS", "Apollo"];
  return (
    <section className="relative py-24 px-6 bg-white">
      <motion.div {...reveal} className="max-w-6xl mx-auto text-center">
        <p className="pc-label text-slate-500 mb-8">In collaboration with</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
          {logos.map((l) => (
            <span key={l} className="pc-serif text-2xl text-slate-700">{l}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- How It Works ---------------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Set up your practice",
      desc: "Import your calendar, add clients, and configure fees in under ten minutes.",
      bg: "linear-gradient(135deg, #A3B8C7, #98A6D4)",
    },
    {
      n: "02",
      title: "Run sessions with focus",
      desc: "Guided intake, in-session notes, and a copilot that drafts your SOAP write-up.",
      bg: "linear-gradient(135deg, #EAEBFC, #D4E2D7)",
    },
    {
      n: "03",
      title: "See the arc of care",
      desc: "PHQ-9, GAD-7 and custom instruments plot progress across every client.",
      bg: "linear-gradient(135deg, #D4E2D7, #A3B8C7)",
    },
  ];
  return (
    <section className="relative py-32 px-6 bg-white">
      <motion.div {...reveal} className="max-w-6xl mx-auto text-center mb-16">
        <p className="pc-label text-slate-500 mb-4">How it works</p>
        <h2 className="pc-serif text-4xl md:text-6xl">Three steps to a <span className="pc-italic">calmer</span> practice.</h2>
      </motion.div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            className="relative h-[440px] rounded-[28px] overflow-hidden group cursor-pointer"
            style={{ background: s.bg }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(15,23,42,0.55) 0%, transparent 55%)" }} />
            <div className="absolute inset-0 grain" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <span className="pc-serif text-6xl opacity-70 mb-3">{s.n}</span>
              <h3 className="pc-serif text-2xl mb-2">{s.title}</h3>
              <p className="text-sm text-white/85 font-light">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Mood Gate ---------------- */
function MoodGate() {
  const opts = ["Anxiety & panic", "Mood & depression", "Trauma", "Relationships", "Adolescents", "Burnout"];
  const [sel, setSel] = useState<string | null>(null);
  return (
    <section className="relative py-32 px-6 bg-white">
      <motion.div {...reveal} className="max-w-3xl mx-auto text-center">
        <p className="pc-label text-slate-500 mb-4">Built around your work</p>
        <h2 className="pc-serif text-4xl md:text-5xl mb-4">What do your <span className="pc-italic">clients</span> bring you most?</h2>
        <p className="text-slate-600 mb-10 font-light">Pick what fits — we'll show tools designed for that presentation.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {opts.map((o) => (
            <button
              key={o}
              onClick={() => setSel(o)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all border"
              style={{
                background: sel === o ? "#0f172a" : "rgba(255,255,255,0.7)",
                color: sel === o ? "#fff" : "#1a1a2e",
                borderColor: sel === o ? "#0f172a" : "rgba(15,23,42,0.12)",
              }}
            >
              {o}
            </button>
          ))}
        </div>
        {sel && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 pc-italic text-slate-700 text-lg">
            Great — templates and instruments tuned for {sel.toLowerCase()} are ready in your workspace.
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const items = [
    { q: "Is my client data private and compliant?", a: "Yes. PeaceCode is DPDP-aligned with encryption in transit and at rest, audit logs, and configurable retention windows." },
    { q: "Can I import from my current tool?", a: "You can import clients, appointments, and notes from CSV or common EHR exports. Our team assists with migrations." },
    { q: "Do I need to be a verified psychologist?", a: "Yes. Practice accounts require RCI licensure verification or an equivalent regulatory credential." },
    { q: "How does billing work?", a: "Flat monthly per clinician. No per-session fees. Cancel anytime." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-32 px-6 bg-white">
      <motion.div {...reveal} className="max-w-3xl mx-auto">
        <p className="pc-label text-slate-500 mb-4 text-center">Common questions</p>
        <h2 className="pc-serif text-4xl md:text-5xl text-center mb-12">Answers, <span className="pc-italic">not caveats.</span></h2>
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={i} className="glass-white overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="pc-serif text-xl">{it.q}</span>
                {open === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 text-slate-600 font-light">{it.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- Bento ---------------- */
function Bento() {
  const cards = [
    { icon: CalendarCheck, tag: "Schedule", title: "A calendar that respects your energy", desc: "Buffers between sessions, no-show automations, and booking links you actually want to share.", span: "md:col-span-7" },
    { icon: FileText, tag: "Notes", title: "Notes drafted while you listen", desc: "Guided SOAP, DAP and progress notes with an AI copilot you can trust and correct.", span: "md:col-span-5" },
    { icon: ClipboardList, tag: "Assessments", title: "PHQ-9, GAD-7, and your own", desc: "Send, score, and chart change over time — automatic.", span: "md:col-span-4" },
    { icon: Wallet, tag: "Billing", title: "Invoices without the friction", desc: "GST-ready invoices, UPI and card payouts, and clean monthly reports.", span: "md:col-span-4" },
    { icon: Video, tag: "Telehealth", title: "Video that just works", desc: "In-app secure video with a waiting room and consent capture.", span: "md:col-span-4" },
    { icon: Users, tag: "Teams", title: "Built for solo and group practices", desc: "Add supervisors, share caseloads, and run case conferences with peer review.", span: "md:col-span-7" },
    { icon: ShieldCheck, tag: "Compliance", title: "DPDP, audit-ready, always", desc: "Consent, retention, and audit logs — configured for Indian clinical practice.", span: "md:col-span-5" },
    { icon: Bell, tag: "Copilot", title: "A quiet co-pilot", desc: "Continuity briefs, risk flags, and homework suggestions — never noise.", span: "md:col-span-12" },
  ];

  return (
    <section className="relative pt-0 pb-32 px-6" style={{ background: "#EAEBFC" }}>
      {/* Wavy transition from white above */}
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-20 -translate-y-px">
        <path d="M0,0 L0,40 C120,70 200,25 320,40 C440,55 520,75 640,62 C760,50 840,25 960,38 C1080,50 1180,72 1300,58 C1380,48 1420,30 1440,40 L1440,0 Z" fill="#ffffff" />
      </svg>

      <motion.div {...reveal} className="max-w-6xl mx-auto text-center mb-16 pt-24">
        <p className="pc-label text-slate-500 mb-4">Everything you need</p>
        <h2 className="pc-serif text-4xl md:text-6xl">One workspace. <span className="pc-italic">All of it.</span></h2>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8 }}
              className={`glass-color p-8 group cursor-pointer ${c.span}`}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center mb-5 shadow-sm"
              >
                <Icon className="w-5 h-5 text-slate-700" />
              </motion.div>
              <p className="pc-label text-slate-500 mb-3">{c.tag}</p>
              <h3 className="pc-serif text-2xl md:text-3xl mb-2">{c.title}</h3>
              <p className="text-slate-600 font-light mb-4">{c.desc}</p>
              <span className="text-sm font-medium inline-flex items-center gap-1 text-slate-800 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Feature Highlight ---------------- */
function FeatureHighlight() {
  return (
    <section className="relative py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div {...reveal}>
          <p className="pc-label text-slate-500 mb-4">Copilot</p>
          <h2 className="pc-serif text-4xl md:text-5xl mb-6">A brief before every <span className="pc-italic">session.</span></h2>
          <p className="text-slate-600 font-light text-lg mb-6">
            Continuity briefs stitch together your last note, the client's homework, assessment deltas, and any safety flags — one glance, before they walk in.
          </p>
          <ul className="space-y-3 text-slate-700">
            {["Last-session anchors", "Homework outcomes", "Risk deltas", "Suggested opening"].map((x) => (
              <li key={x} className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-slate-900" />{x}</li>
            ))}
          </ul>
        </motion.div>
        <motion.div {...reveal} className="glass-white p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="pc-label text-slate-500">Continuity brief</span>
              <span className="text-xs text-slate-500">Session 8 · Priya S.</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/60">
              <p className="text-sm text-slate-700 leading-relaxed">
                Sleep improved (2 nights &gt; 7hrs). PHQ-9 dropped from 14 → 11. Homework: 4/7 thought records completed. Consider testing behavioural activation this week.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["PHQ-9", "11", "-3"], ["GAD-7", "9", "-1"], ["Sleep", "6.4h", "+0.8"]].map((m) => (
                <div key={m[0]} className="p-3 rounded-2xl bg-white/60 text-center">
                  <p className="pc-label text-slate-500 text-[9px]">{m[0]}</p>
                  <p className="pc-serif text-2xl">{m[1]}</p>
                  <p className="text-xs text-emerald-600">{m[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Ecosystem ---------------- */
function Ecosystem() {
  const pieces = ["Practice", "Client portal", "Supervision", "Research", "Directory"];
  return (
    <section className="relative py-32 px-6" style={{ background: "linear-gradient(180deg, #ffffff, #EAEBFC)" }}>
      <motion.div {...reveal} className="max-w-6xl mx-auto text-center">
        <p className="pc-label text-slate-500 mb-4">The ecosystem</p>
        <h2 className="pc-serif text-4xl md:text-6xl mb-12">Bigger than a <span className="pc-italic">dashboard.</span></h2>
        <div className="flex flex-wrap justify-center gap-4">
          {pieces.map((p) => (
            <motion.div key={p} whileHover={{ y: -4 }} className="glass-color px-8 py-5">
              <span className="pc-serif text-xl">{p}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials() {
  const t = [
    { q: "The continuity brief alone saved me an hour a day. I read it and I'm ready.", a: "Dr. Ananya R.", r: "Clinical Psychologist, Bengaluru" },
    { q: "Finally an EHR that doesn't feel like accounting software. My notes are actually usable now.", a: "Dr. Vikram M.", r: "Psychotherapist, Mumbai" },
    { q: "Onboarded my whole group practice in a weekend. Supervision workflows are excellent.", a: "Dr. Nisha K.", r: "Director, Mind & Body Collective" },
  ];
  return (
    <section className="relative py-32 px-6 bg-white">
      <motion.div {...reveal} className="max-w-6xl mx-auto text-center mb-16">
        <p className="pc-label text-slate-500 mb-4">From clinicians</p>
        <h2 className="pc-serif text-4xl md:text-6xl">Trusted where it <span className="pc-italic">matters.</span></h2>
      </motion.div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {t.map((x, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className="glass-white p-8"
          >
            <p className="pc-serif text-xl leading-relaxed mb-6">"{x.q}"</p>
            <p className="text-sm font-medium">{x.a}</p>
            <p className="text-xs text-slate-500">{x.r}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Weather ---------------- */
function Weather() {
  const items = [
    { i: CloudRain, t: "The 6pm cancellation", d: "A no-show turns your night. We turn it into a smart re-book link." },
    { i: BatteryLow, t: "Note fatigue at 9pm", d: "The copilot drafts the SOAP so you finish it in a click." },
    { i: Cloud, t: "The Sunday-night dread", d: "Continuity briefs surface Monday's cases before you open your laptop." },
    { i: Sun, t: "The clarity of progress", d: "Weekly outcomes make every client's arc visible in one chart." },
  ];
  return (
    <section className="relative py-32 px-6" style={{ background: "linear-gradient(180deg, #EAEBFC, #ffffff)" }}>
      <motion.div {...reveal} className="max-w-6xl mx-auto text-center mb-16">
        <p className="pc-label text-slate-500 mb-4">What psychologists face</p>
        <h2 className="pc-serif text-4xl md:text-6xl">The weather of a <span className="pc-italic">clinical week.</span></h2>
      </motion.div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5">
        {items.map((x, i) => {
          const Icon = x.i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="glass-color p-6"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center mb-4"
              >
                <Icon className="w-5 h-5 text-slate-700" />
              </motion.div>
              <h3 className="pc-serif text-xl mb-1">{x.t}</h3>
              <p className="text-sm text-slate-600 font-light">{x.d}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Blog ---------------- */
function Blog() {
  const posts = [
    { tag: "Practice", title: "Designing intake for the first ten minutes", read: "6 min", bg: "linear-gradient(135deg, #A3B8C7, #98A6D4)" },
    { tag: "Clinical", title: "When PHQ-9 stalls: reading plateaus honestly", read: "8 min", bg: "linear-gradient(135deg, #EAEBFC, #D4E2D7)" },
    { tag: "Business", title: "Pricing for solo practice in Indian metros", read: "5 min", bg: "linear-gradient(135deg, #D4E2D7, #A3B8C7)" },
  ];
  return (
    <section className="relative py-32 px-6 bg-white">
      <motion.div {...reveal} className="max-w-6xl mx-auto flex items-end justify-between mb-12 flex-wrap gap-6">
        <div>
          <p className="pc-label text-slate-500 mb-4">From the journal</p>
          <h2 className="pc-serif text-4xl md:text-5xl">Field notes for <span className="pc-italic">clinicians.</span></h2>
        </div>
        <a href="#" className="text-sm font-medium inline-flex items-center gap-2">All posts <ArrowRight className="w-4 h-4" /></a>
      </motion.div>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {posts.map((p, i) => (
          <motion.a
            key={i}
            href="#"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="block rounded-[28px] overflow-hidden border border-slate-200/60"
          >
            <div className="h-52 relative grain" style={{ background: p.bg }} />
            <div className="p-6 bg-white">
              <p className="pc-label text-slate-500 mb-3">{p.tag} · {p.read}</p>
              <h3 className="pc-serif text-2xl">{p.title}</h3>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Closing CTA ---------------- */
function ClosingCTA() {
  return (
    <section className="relative py-40 px-6 text-center overflow-hidden" style={{ background: "linear-gradient(180deg, #ffffff, #EAEBFC 60%, #A3B8C7)" }}>
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-[10%] hidden md:block opacity-70"
      >
        <Cloud className="w-20 h-20 text-white" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-24 right-[8%] hidden md:block opacity-70"
      >
        <Sun className="w-16 h-16 text-white" />
      </motion.div>

      <motion.div {...reveal} className="max-w-3xl mx-auto relative">
        <h2 className="pc-serif text-4xl md:text-7xl mb-8 leading-[1.05]">
          Your practice, held with <span className="pc-italic">the same care</span> you give.
        </h2>
        <p className="text-slate-700 font-light text-lg mb-10">
          Free to try. Verified in a day. No card required.
        </p>
        <motion.a
          href={LOGIN_URL}
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="liquid-glass inline-flex items-center gap-2 px-9 py-4 rounded-full font-medium text-slate-900"
        >
          Start your practice <ArrowRight className="w-4 h-4" />
        </motion.a>
      </motion.div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  const cols = [
    { h: "About", items: ["Story", "Team", "Careers", "Press"] },
    { h: "Product", items: ["Schedule", "Notes", "Assessments", "Billing", "Copilot"] },
    { h: "Library", items: ["Blog", "Guides", "Compliance", "Changelog"] },
  ];
  return (
    <footer className="relative pt-24 pb-10 px-6 text-white" style={{ background: "linear-gradient(180deg, #A3B8C7, #6b7d92)" }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <h3 className="pc-serif text-4xl md:text-5xl mb-6 leading-tight">
            Start your <span className="pc-italic">practice</span> today.
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            <a href="#" className="liquid-glass inline-flex items-center gap-2 px-5 py-3 rounded-full text-white">
              <Apple className="w-4 h-4" /> App Store
            </a>
            <a href="#" className="liquid-glass inline-flex items-center gap-2 px-5 py-3 rounded-full text-white">
              <Play className="w-4 h-4" /> Google Play
            </a>
          </div>
          <Link to={LOGIN_URL} className="inline-flex items-center px-6 py-3 rounded-full bg-white text-slate-900 font-medium">
            Login to your workspace
          </Link>
        </div>

        <div className="md:col-span-5 grid grid-cols-3 gap-6">
          {cols.map((c) => (
            <div key={c.h}>
              <p className="pc-label mb-4 text-white/70">{c.h}</p>
              <ul className="space-y-2 text-sm text-white/90">
                {c.items.map((i) => <li key={i}><a href="#" className="hover:text-white">{i}</a></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <p className="pc-label mb-4 text-white/70">Social</p>
            <div className="flex gap-2">
              {[Instagram, Twitter, Linkedin, Youtube].map((I, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center hover:bg-white/25 transition">
                  <I className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="pc-label mb-3 text-white/70">Compliance</p>
            <div className="flex gap-2 flex-wrap">
              {["ISO 27001", "HIPAA", "DPDP"].map((b) => (
                <span key={b} className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-white/15 border border-white/25">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-6 border-t border-white/20 flex flex-wrap justify-between gap-4 text-xs text-white/70">
        <span>© {new Date().getFullYear()} PeaceCode. All rights reserved.</span>
        <div className="flex gap-5">
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">DPA</a><a href="#">Disclosures</a>
        </div>
        <span className="max-w-md">Not a substitute for emergency care. If you or a client are in crisis, call iCall 9152987821.</span>
      </div>
    </footer>
  );
}
