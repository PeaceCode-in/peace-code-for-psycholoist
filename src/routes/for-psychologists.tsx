import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Menu, X, ArrowRight, ChevronDown, Plus, Minus,
  Instagram, Twitter, Linkedin, Youtube,
  CalendarCheck, ClipboardList, FileText, Wallet, ShieldCheck, Video,
  Users, Activity, Bell, Sparkles, Brain, Layers,
} from "lucide-react";

const LOGIN_URL = "https://app.peacecode.in/psychologist/auth";

export const Route = createFileRoute("/for-psychologists")({
  head: () => ({
    meta: [
      { title: "PeaceCode · Practice — the calm workspace for psychologists" },
      { name: "description", content: "A calm, clinical workspace for verified psychologists — scheduling, notes, assessments, billing, referrals and outcomes in one place." },
      { property: "og:title", content: "PeaceCode · Practice — for psychologists" },
      { property: "og:description", content: "The calm workspace for verified psychologists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: MarketingPage,
});

const COLOR = { lavender: "#98A6D4", peach: "#EAEBFC", sage: "#D4E2D7" };

const reveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const styles = `
  .pc-mkt { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; color: #1a1a2e; }
  .pc-serif { font-family: 'Fraunces', 'Instrument Serif', Georgia, serif; font-weight: 300; letter-spacing: -0.02em; }
  .pc-display { font-family: 'DM Serif Display', 'Instrument Serif', serif; font-weight: 400; letter-spacing: -0.015em; }
  .pc-italic { font-family: 'Instrument Serif', 'Fraunces', Georgia, serif; font-style: italic; font-weight: 400; }
  .pc-label { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600; }

  .glass-color { background: rgba(255,255,255,0.30); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); border: 1px solid rgba(255,255,255,0.60); box-shadow: 0 8px 30px rgba(0,0,0,0.04); border-radius: 1.75rem; }
  .glass-white { background: rgba(255,255,255,0.70); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.80); box-shadow: 0 20px 60px -15px rgba(0,0,0,0.10); border-radius: 1.75rem; }

  .liquid-glass-button {
    position: relative; isolation: isolate; overflow: hidden; color: #2A2140;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.28) 48%, rgba(210,200,240,0.18)),
      radial-gradient(circle at 18% 12%, rgba(255,255,255,0.70), transparent 34%);
    border-top: 1px solid rgba(255,255,255,0.58);
    border-left: 1px solid rgba(255,255,255,0.58);
    border-right: 1px solid rgba(255,255,255,0.24);
    border-bottom: 1px solid rgba(255,255,255,0.24);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.58), 0 14px 38px rgba(90,80,140,0.14);
    backdrop-filter: blur(22px) saturate(1.25); -webkit-backdrop-filter: blur(22px) saturate(1.25);
    transition: background 180ms ease;
  }
  .liquid-glass-button:hover {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.34) 48%, rgba(210,200,240,0.24)),
      radial-gradient(circle at 18% 12%, rgba(255,255,255,0.78), transparent 34%);
  }
  .liquid-glass-icon {
    color: #2A2140;
    background: linear-gradient(135deg, rgba(255,255,255,0.48), rgba(255,255,255,0.24));
    border: 1px solid rgba(255,255,255,0.58);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.62), 0 10px 24px rgba(90,80,140,0.12);
    backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px) saturate(1.2);
  }

  .grain-overlay {
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    background-size: 240px 240px;
  }

  .how-card { position: relative; overflow: hidden; border-radius: 1.25rem; cursor: default; isolation: isolate; }
  .how-card img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
  .how-card:hover img { transform: scale(1.02); }
  .how-card::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.15) 55%, transparent 75%); pointer-events: none; z-index: 1; }
  .how-card-content { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; justify-content: space-between; padding: 2rem; pointer-events: none; }
  .how-card-step { font-family: 'Fraunces', serif; font-size: 0.8rem; font-weight: 300; letter-spacing: 0.18em; color: rgba(255,255,255,0.55); text-transform: uppercase; }
  .how-card-headline { font-family: 'Fraunces', serif; font-size: 1.65rem; font-weight: 400; color: rgba(255,255,255,0.95); line-height: 1.15; letter-spacing: -0.01em; margin-bottom: 0.75rem; }
  .how-card-desc { font-family: 'Inter', sans-serif; font-size: 0.82rem; color: rgba(255,255,255,0.72); line-height: 1.65; max-width: 30ch; }
  .how-card-micro { font-family: 'Inter', sans-serif; font-size: 0.7rem; font-style: italic; color: rgba(255,255,255,0.42); margin-top: 0.65rem; letter-spacing: 0.02em; }
  @media (min-width: 768px) { .how-card-headline { font-size: 1.85rem; } .how-card-content { padding: 2.25rem; } }
  @media (min-width: 1024px) { .how-card-headline { font-size: 2rem; } .how-card-content { padding: 2.5rem; } }
`;

function MarketingPage() {
  return (
    <div className="pc-mkt relative overflow-x-hidden bg-white">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <Navbar />
      <Hero />
      <Collaboration />
      <HowItWorks />
      <MoodGate />
      <MindAccordion />
      <BentoFeatures />
      <FeatureHighlight />
      <Ecosystem />
      <Testimonials />
      <WhatPsychologistsFace />
      <Blog />
      <ClosingCTA />
      <Footer />
    </div>
  );
}

/* ---------------- Navbar ---------------- */
const NAV_ITEMS = [
  {
    label: "Announcements",
    href: "#announcements",
    dropdown: { columns: [{ items: [
      { label: "Blog", href: "#blog" },
      { label: "Product updates", href: "#announcements" },
    ]}]},
  },
  {
    label: "About",
    href: "#about",
    dropdown: { columns: [{ header: "ABOUT", items: [
      { label: "Our story", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
      { label: "FAQs", href: "#faq" },
    ]}]},
  },
  {
    label: "Practice",
    href: "#practice",
    dropdown: { columns: [
      { header: "CLINICAL", items: [
        { label: "Scheduling", href: "/features/scheduling" },
        { label: "Session notes", href: "/features" },
        { label: "Assessments", href: "/features" },
        { label: "Safety planning", href: "/features" },
      ]},
      { header: "OPERATIONS", items: [
        { label: "Billing", href: "/features" },
        { label: "Referrals", href: "/features" },
        { label: "Telehealth", href: "/features" },
        { label: "Compliance", href: "/features" },
      ]},
    ]},
  },
  { label: "Resources", href: "#resources" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 left-0 right-0 transition-all duration-300 ${
        scrolled ? "top-4 px-4 md:px-8" : "top-0 px-0"
      }`}
    >
      <div
        className={`mx-auto max-w-[1360px] flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "rounded-[2rem] bg-white/30 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(255,255,255,0.15)] py-4 px-6 md:px-8"
            : "bg-transparent py-5 px-6 md:px-10"
        }`}
      >
        <Link to="/for-psychologists" className="flex items-center gap-2 shrink-0" aria-label="PeaceCode">
          <img
            src="/nav%20bar%20logo.svg"
            alt="PeaceCode"
            className={`h-7 w-auto object-contain transition-all duration-300 ${
              scrolled ? "brightness-0" : "brightness-0 invert drop-shadow-sm"
            }`}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <span
            className={`pc-serif text-[20px] transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}
            style={{ fontWeight: 400 }}
          >
            PeaceCode
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a
                href={item.href}
                className={`inline-flex items-center gap-1 px-4 py-2 text-[14px] font-medium transition-colors ${
                  scrolled ? "text-slate-900 hover:text-slate-600" : "text-white/95 hover:text-white"
                }`}
              >
                {item.label}
                {item.dropdown ? <ChevronDown className="h-3.5 w-3.5 opacity-70" /> : null}
              </a>
              {item.dropdown && openDropdown === item.label ? (
                <div className="absolute left-0 top-full pt-3 min-w-[260px]">
                  <div className="bg-white/95 backdrop-blur-2xl border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[1.5rem] p-7 flex gap-8">
                    {item.dropdown.columns.map((col, ci) => (
                      <div key={ci} className="min-w-[140px]">
                        {"header" in col && col.header ? (
                          <div className="pc-label text-slate-500 mb-3">{col.header}</div>
                        ) : null}
                        <ul className="space-y-2">
                          {col.items.map((li) => (
                            <li key={li.label}>
                              <a href={li.href} className="text-[14px] text-slate-800 hover:text-slate-500 transition-colors">
                                {li.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={LOGIN_URL}
            className={`hidden sm:inline-flex items-center rounded-full px-6 py-2.5 text-[14px] font-medium transition-all ${
              scrolled
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-white text-slate-900 hover:bg-white/90"
            }`}
          >
            Login
          </a>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className={`lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              scrolled ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"
            }`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="lg:hidden mx-4 mt-2 bg-white/85 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg p-5">
          <ul className="space-y-3">
            {NAV_ITEMS.map((i) => (
              <li key={i.label}>
                <a href={i.href} className="block py-1.5 text-[15px] text-slate-900" onClick={() => setMobileOpen(false)}>
                  {i.label}
                </a>
              </li>
            ))}
            <li className="pt-2 border-t border-slate-200">
              <a
                href={LOGIN_URL}
                className="inline-flex items-center rounded-full px-5 py-2 text-[14px] font-medium bg-slate-900 text-white"
              >
                Login
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#A3B8C7]">
      <img
        src="/hero-background.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
      />
      <div className="absolute inset-0 grain-overlay opacity-[0.08] mix-blend-overlay pointer-events-none" />

      {/* Floating birds */}
      <FloatingBird src="/bg-decoration-2.svg" className="absolute top-[18%] right-[8%] w-16 opacity-80" delay={0} y={12} />
      <FloatingBird src="/bg-decoration-2.svg" className="absolute top-[34%] right-[22%] w-10 opacity-60" delay={0.4} y={8} />
      <FloatingBird src="/bg-decoration-2.svg" className="absolute top-[46%] right-[6%] w-8 opacity-50 blur-[1px]" delay={0.8} y={10} />
      <FloatingBird src="/bg-decoration-2.svg" className="absolute bottom-[28%] left-[10%] w-12 opacity-70" delay={1.2} y={14} />
      <FloatingBird src="/bg-decoration-1.svg" className="absolute bottom-[36%] right-[38%] w-20 opacity-90" delay={0.6} y={16} />

      {/* Cloud layer */}
      <motion.img
        src="/landing-illustration-2.svg"
        alt=""
        aria-hidden
        initial={{ x: -120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-6 left-0 w-full pointer-events-none select-none"
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
      />

      {/* Text */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="pc-label text-white/85 mb-6"
        >
          For psychologists, by PeaceCode
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pc-serif text-white max-w-[18ch] text-[clamp(44px,7vw,88px)] leading-[1.02]"
        >
          The calm workspace <span className="pc-italic">behind steady care.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mt-6 max-w-[52ch] text-[16px] md:text-[17px] text-white/85 leading-relaxed"
        >
          Scheduling, notes, assessments, billing and outcomes — held together in one clinical space that respects
          your time and your patients.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75 }}
          className="mt-9"
        >
          <a
            href={LOGIN_URL}
            className="liquid-glass-button inline-flex items-center gap-2.5 rounded-full pl-5 pr-6 py-3 text-[15px] font-medium"
          >
            <img
              src="/nav%20bar%20logo.svg"
              alt=""
              aria-hidden
              className="w-[18px] h-[18px] brightness-0"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
            Get started
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingBird({ src, className, delay, y }: { src: string; className: string; delay: number; y: number }) {
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      className={className}
      animate={{ y: [0, -y, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
    />
  );
}

/* ---------------- Collaboration ---------------- */
function Collaboration() {
  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <img src="/section2-bg.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
      <motion.img
        src="/cloud-bg-5.svg" alt="" aria-hidden
        className="absolute right-0 top-10 w-[704px] max-w-[70vw] pointer-events-none select-none"
        style={{ mixBlendMode: "screen" }}
        initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }}
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
      />
      <motion.div {...reveal} className="relative z-10 mx-auto max-w-[1200px] px-6 text-center">
        <p className="pc-label text-slate-600 mb-4">Trusted by clinicians and institutions</p>
        <h2 className="pc-serif text-slate-900 text-[clamp(28px,3.6vw,44px)] leading-[1.1] max-w-[24ch] mx-auto">
          Care that stays <span className="pc-italic">continuous</span> across teams and time.
        </h2>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-14 gap-y-8 opacity-80">
          {[1, 2, 3, 4, 5].map((i) => (
            <img key={i} src="/assets/dtu.svg" alt="Partner" className="h-12 md:h-14 grayscale opacity-70"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
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
      step: "STEP 01",
      title: "Open a room built for the work.",
      desc: "Video, notes and safety tools live in the same place — no toggling tabs mid-session.",
      micro: "Set up in under a minute.",
      img: "/assets/how-step-01-safe-space.jpg",
    },
    {
      step: "STEP 02",
      title: "Write the note while it's fresh.",
      desc: "SOAP, DAP, or your own template — with assessment scores auto-pulled and dictation ready.",
      micro: "Signed and locked in one pass.",
      img: "/assets/how-step-02-peer-support.jpg",
    },
    {
      step: "STEP 03",
      title: "Watch outcomes take shape.",
      desc: "PHQ-9, GAD-7 and custom measures charted per patient — spot drift before it becomes a crisis.",
      micro: "Evidence-based, quietly.",
      img: "/assets/how-step-03-progress.jpg",
    },
  ];

  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden">
      <img src="/section3-bg.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
      <div className="relative z-10 mx-auto max-w-[1280px] px-6">
        <motion.div {...reveal} className="text-center mb-14">
          <p className="pc-label text-slate-600 mb-4">How it works</p>
          <h2 className="pc-serif text-slate-900 text-[clamp(32px,4vw,52px)] leading-[1.05] max-w-[22ch] mx-auto">
            Three moments that make a <span className="pc-italic">practice feel calm.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.step} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }} className="how-card aspect-[4/5]">
              <img src={s.img} alt="" onError={(e) => ((e.currentTarget as HTMLImageElement).style.background = "#3a3a4a")} />
              <div className="how-card-content">
                <span className="how-card-step">{s.step}</span>
                <div>
                  <h3 className="how-card-headline">{s.title}</h3>
                  <p className="how-card-desc">{s.desc}</p>
                  <p className="how-card-micro">{s.micro}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Mood Gate ---------------- */
function MoodGate() {
  const [choice, setChoice] = useState<number | null>(null);
  const moods = [
    { label: "Overloaded caseload", copy: "Batch triage, waitlist scoring and smart scheduling clear the fog." },
    { label: "Notes falling behind", copy: "In-session SOAP drafts and dictation catch you up in one pass." },
    { label: "Unclear outcomes", copy: "Assessment trajectories per patient — see what's actually working." },
    { label: "Billing chaos", copy: "Invoicing, GST/PAN, refunds and payouts in one clean ledger." },
  ];
  return (
    <section id="practice" className="relative w-full py-28 md:py-36 bg-white">
      <div className="mx-auto max-w-[1120px] px-6">
        <motion.div {...reveal} className="text-center mb-12">
          <p className="pc-label text-slate-500 mb-4">Where are you today?</p>
          <h2 className="pc-serif text-slate-900 text-[clamp(30px,4vw,48px)] leading-[1.05] max-w-[24ch] mx-auto">
            Tell us the friction — <span className="pc-italic">we'll show you the fix.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {moods.map((m, i) => {
            const active = choice === i;
            return (
              <button
                key={m.label}
                onClick={() => setChoice(i)}
                className={`glass-white text-left p-6 transition-all duration-200 ${
                  active ? "ring-2 ring-slate-900/70 -translate-y-1" : "hover:-translate-y-0.5"
                }`}
              >
                <div className="pc-label text-slate-500 mb-3">0{i + 1}</div>
                <div className="pc-serif text-[18px] text-slate-900">{m.label}</div>
              </button>
            );
          })}
        </div>
        {choice !== null ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="mt-8 glass-white p-8 md:p-10 max-w-[720px] mx-auto text-center"
          >
            <p className="pc-serif text-slate-900 text-[22px] leading-snug">{moods[choice].copy}</p>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

/* ---------------- Mind Accordion (FAQ) ---------------- */
function MindAccordion() {
  const items = [
    { q: "Is this only for solo practice?", a: "No. PeaceCode works for solo clinicians and multi-clinician groups — role-based access, supervision workflows and shared calendars are all built in." },
    { q: "How does it handle compliance?", a: "DPDP-aligned consent flows, audit logs, encrypted storage and configurable retention. Every export is logged; every access is traceable." },
    { q: "Will my patients need to install anything?", a: "No. Telehealth runs in the browser. Patients get a link, a waiting room and a note that a session is starting." },
    { q: "Can I bring my templates and forms?", a: "Yes — import your intake forms, note templates and consent copy. Or start with our clinician-authored defaults and edit from there." },
    { q: "What about assessments?", a: "PHQ-9, GAD-7, PCL-5, WHO-5, DASS-21 and more are built in. Custom instruments can be added; scores auto-flow into the chart and the note." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative w-full py-24 md:py-32 bg-white overflow-hidden">
      <motion.img
        src="/cloud-bg-2.svg" alt="" aria-hidden
        style={{ mixBlendMode: "multiply" }}
        className="absolute left-0 top-24 w-[420px] max-w-[45vw] pointer-events-none opacity-70"
        initial={{ x: -40, opacity: 0 }} whileInView={{ x: 0, opacity: 0.7 }} viewport={{ once: true }} transition={{ duration: 1.2 }}
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
      />
      <div className="relative z-10 mx-auto max-w-[880px] px-6">
        <motion.div {...reveal} className="text-center mb-12">
          <p className="pc-label text-slate-500 mb-4">Questions clinicians ask</p>
          <h2 className="pc-serif text-slate-900 text-[clamp(30px,4vw,48px)] leading-[1.05]">
            Straight answers, <span className="pc-italic">no marketing fog.</span>
          </h2>
        </motion.div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {items.map((it, i) => {
            const on = open === i;
            return (
              <div key={it.q}>
                <button
                  className="w-full flex items-center justify-between py-6 text-left"
                  onClick={() => setOpen(on ? null : i)}
                >
                  <span className="pc-serif text-slate-900 text-[20px] md:text-[22px] pr-6">{it.q}</span>
                  <span className="shrink-0 h-8 w-8 rounded-full liquid-glass-icon inline-flex items-center justify-center">
                    {on ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                {on ? (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className="text-[15px] text-slate-600 leading-relaxed pb-6 pr-12"
                  >
                    {it.a}
                  </motion.p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Bento Features ---------------- */
function BentoFeatures() {
  const bento = [
    { span: "md:col-span-7", tag: "SCHEDULING",   title: "A calendar that respects buffers.",   body: "Back-to-back protection, telehealth links auto-attached, reschedules that don't ripple through your day.", icon: CalendarCheck },
    { span: "md:col-span-5", tag: "NOTES",        title: "SOAP that writes itself.",             body: "In-session dictation and structured drafts — you edit, you sign, you move on.", icon: FileText },
    { span: "md:col-span-5", tag: "ASSESSMENTS",  title: "Outcomes you can see.",                body: "Per-patient trajectories for PHQ-9, GAD-7 and custom instruments — trend lines, not just scores.", icon: Activity },
    { span: "md:col-span-7", tag: "BILLING",      title: "One clean ledger.",                    body: "Invoices, GST/PAN, refunds and payouts — reconciled, exportable, audit-friendly.", icon: Wallet },
    { span: "md:col-span-4", tag: "TELEHEALTH",   title: "Rooms that just open.",                body: "No installs. Waiting room, consent-to-record, one link per session.", icon: Video },
    { span: "md:col-span-4", tag: "SAFETY",       title: "A plan when it matters.",              body: "Stanley-Brown safety plans, escalation contacts and helplines within reach.", icon: ShieldCheck },
    { span: "md:col-span-4", tag: "REFERRALS",    title: "Warm handoffs, tracked.",              body: "In and out — sources, urgency, and conversion in one honest view.", icon: Users },
    { span: "md:col-span-12", tag: "COPILOT",     title: "A quiet AI that stays inside your notes.", body: "Continuity briefs, SOAP drafts and follow-up prompts — grounded in the chart, never in the cloud alone.", icon: Sparkles },
  ];

  return (
    <section id="features" className="relative w-full pb-28 md:pb-36 pt-0" style={{ background: COLOR.peach }}>
      <WavyBridge from="#FFFFFF" to={COLOR.peach} />
      <div className="mx-auto max-w-[1280px] px-6 pt-4">
        <motion.div {...reveal} className="text-center mb-14">
          <p className="pc-label text-slate-500 mb-4">The workspace</p>
          <h2 className="pc-serif text-slate-900 text-[clamp(32px,4.4vw,56px)] leading-[1.05] max-w-[26ch] mx-auto">
            One clinical space. <span className="pc-italic">Every part of the practice.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
          {bento.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div key={b.title} {...reveal} transition={{ ...reveal.transition, delay: (i % 3) * 0.08 }}
                className={`glass-color p-7 md:p-8 ${b.span} min-h-[220px] flex flex-col justify-between`}>
                <div className="flex items-start justify-between">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                    className="h-11 w-11 rounded-2xl liquid-glass-icon inline-flex items-center justify-center"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </motion.div>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-slate-500 font-semibold">{b.tag}</span>
                </div>
                <div className="mt-6">
                  <h3 className="pc-serif text-slate-900 text-2xl md:text-[26px] tracking-tight">{b.title}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{b.body}</p>
                </div>
                <a href="/features" className="mt-6 text-[11px] uppercase tracking-[0.25em] text-slate-800 font-semibold inline-flex items-center gap-1.5">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WavyBridge({ from, to }: { from: string; to: string }) {
  return (
    <div className="w-full -mt-1" style={{ background: from }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="block w-full h-[80px] md:h-[110px]">
        <path d="M0,64 C240,120 480,20 720,60 C960,100 1200,40 1440,80 L1440,120 L0,120 Z" fill={to} />
      </svg>
    </div>
  );
}

/* ---------------- Feature Highlight ---------------- */
function FeatureHighlight() {
  return (
    <section className="relative w-full py-28 md:py-36 overflow-hidden" style={{ background: "linear-gradient(180deg,#93A8C1 0%,#F4F6F8 100%)" }}>
      <img src="/journal-illustration-1.svg" alt="" aria-hidden
        className="hidden xl:block absolute -left-6 top-10 w-[30vw] pointer-events-none"
        style={{ mixBlendMode: "multiply", transform: "scale(1.35)" }}
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />
      <img src="/journal-illustration-2.svg" alt="" aria-hidden
        className="hidden xl:block absolute -right-6 bottom-10 w-[30vw] pointer-events-none"
        style={{ mixBlendMode: "multiply", transform: "rotate(-90deg)" }}
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")} />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6">
        <motion.div {...reveal} className="glass-white overflow-hidden grid grid-cols-1 lg:grid-cols-[58%_42%]">
          <div className="aspect-[4/3] lg:aspect-auto">
            <img src="/assets/editorial-courtyard.jpg" alt="A quiet courtyard" className="h-full w-full object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.background = "#c9d3dc")} />
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <p className="pc-label text-slate-500 mb-4">Continuity, held</p>
            <h3 className="pc-serif text-slate-900 text-[clamp(26px,3vw,38px)] leading-[1.1]">
              A brief before every session, <span className="pc-italic">so the hour begins where you left off.</span>
            </h3>
            <p className="mt-5 text-slate-600 leading-relaxed">
              The continuity brief pulls the last note, the last score, the last homework — grounded in the chart. You
              open the room already oriented, and the patient feels it.
            </p>
            <a href="/features" className="mt-7 inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.25em] font-semibold text-slate-900">
              See how it works <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Ecosystem ---------------- */
function Ecosystem() {
  const cards = [
    { icon: "/peer-support-icon.svg",  fallback: Users,  title: "Supervision & peer groups",  body: "Case conferences, group notes and shared caseload views — training and quality kept in one loop." },
    { icon: "/comm-coaching-icon.svg", fallback: Layers, title: "Referrals & networks",       body: "GPs, psychiatrists, EAPs, universities — track incoming, refer outgoing, close the loop." },
    { icon: "/therapists-icon.svg",    fallback: Brain,  title: "The clinician bench",        body: "CPD, reflections, professional identity — a private space alongside the clinical one." },
  ];
  return (
    <section id="ecosystem" className="relative w-full py-24 md:py-32" style={{ background: COLOR.peach }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div {...reveal} className="text-center mb-14">
          <p className="pc-label text-slate-500 mb-4">The wider practice</p>
          <h2 className="pc-serif text-slate-900 text-[clamp(30px,4vw,48px)] leading-[1.05]">
            Not just a tool. <span className="pc-italic">A place to be a clinician.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => {
            const Fallback = c.fallback;
            return (
              <motion.div key={c.title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}
                className="glass-white p-10 text-center">
                <div className="flex justify-center mb-6 h-[180px] items-center">
                  <img src={c.icon} alt="" className="h-[180px] w-auto object-contain"
                    onError={(e) => { const el = e.currentTarget as HTMLImageElement; el.replaceWith(document.createElement("div")); }} />
                  <Fallback className="hidden h-16 w-16 text-slate-400" />
                </div>
                <h3 className="pc-serif text-slate-900 text-[22px] mb-3">{c.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{c.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
function Testimonials() {
  const quotes = [
    { q: "The first tool that didn't add work to my Sundays. Notes are done before I stand up.", who: "Dr. A. Menon", role: "Clinical Psychologist, Bengaluru" },
    { q: "My caseload doubled and my week got quieter. That still surprises me.", who: "Dr. R. Kapoor", role: "Psychotherapist, Mumbai" },
    { q: "Assessments finally feel useful instead of admin. Patients see their own trajectory.", who: "Dr. S. Iyer", role: "Counselling Psychologist, Chennai" },
  ];
  return (
    <section className="relative w-full py-28 md:py-36 bg-gradient-to-b from-[#EAEBFC] to-white">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div {...reveal} className="text-center mb-14">
          <p className="pc-label text-slate-500 mb-4">In their words</p>
          <h2 className="pc-serif text-slate-900 text-[clamp(30px,4vw,48px)] leading-[1.05]">
            Clinicians who traded chaos <span className="pc-italic">for clarity.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quotes.map((q, i) => (
            <motion.figure key={q.who} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}
              className="glass-white p-8">
              <blockquote className="pc-serif text-slate-900 text-[19px] leading-snug">"{q.q}"</blockquote>
              <figcaption className="mt-6">
                <div className="text-[14px] font-medium text-slate-900">{q.who}</div>
                <div className="text-[13px] text-slate-500">{q.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- What Psychologists Face ---------------- */
function WhatPsychologistsFace() {
  const cols = [
    { h: "The invisible load", items: ["No-show whiplash", "After-hours notes", "Insurance back-and-forth", "Referral limbo"] },
    { h: "The clinical drift",  items: ["Outdated risk picture", "Assessment scores that vanish", "Homework that goes unread", "Consent that expired"] },
    { h: "The lonely bench",    items: ["Supervision squeezed in", "Peer cases in DMs", "CPD as a spreadsheet", "Isolation you don't name"] },
  ];
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <section className="relative w-full py-24 md:py-32" style={{ background: "linear-gradient(180deg,#FFFFFF 0%,#F5F6FC 50%,#FFFFFF 100%)" }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div {...reveal} className="text-center mb-14">
          <p className="pc-label text-slate-500 mb-4">What psychologists carry</p>
          <h2 className="pc-serif text-slate-900 text-[clamp(30px,4vw,48px)] leading-[1.05] max-w-[28ch] mx-auto">
            The parts of the work no one <span className="pc-italic">put on the brochure.</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-slate-200">
          {cols.map((c) => (
            <div key={c.h} className="px-6 md:px-10">
              <h3 className="pc-serif text-slate-900 text-[22px] mb-6">{c.h}</h3>
              <ul className="space-y-3">
                {c.items.map((it) => {
                  const key = c.h + it;
                  const on = !!open[key];
                  return (
                    <li key={it}>
                      <button
                        onClick={() => setOpen((o) => ({ ...o, [key]: !on }))}
                        className="w-full flex items-center justify-between text-left py-3 border-b border-slate-200/70"
                      >
                        <span className="text-[15px] text-slate-800">{it}</span>
                        {on ? <Minus className="h-4 w-4 text-slate-500" /> : <Plus className="h-4 w-4 text-slate-500" />}
                      </button>
                      {on ? (
                        <p className="text-[13px] text-slate-500 pt-2 pb-3 pr-6">
                          PeaceCode holds this quietly in the background so it stops holding you.
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Blog ---------------- */
function Blog() {
  const posts = [
    { img: "/ChatGPT Image Jun 3, 2026, 03_03_06 PM.png", tag: "PRACTICE", title: "The 12-minute note: how structure buys back your evenings.", date: "Jun 12" },
    { img: "/ChatGPT Image Jun 3, 2026, 03_08_14 PM.png", tag: "OUTCOMES", title: "Why trajectory beats a single PHQ-9 score, every time.",       date: "Jun 04" },
    { img: "/ChatGPT Image Jun 3, 2026, 03_35_21 PM.png", tag: "ETHICS",   title: "DPDP for private practice — a plain-language walkthrough.",     date: "May 28" },
  ];
  return (
    <section id="blog" className="relative w-full py-24 md:py-32 bg-white">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div {...reveal} className="flex items-end justify-between mb-12">
          <div>
            <p className="pc-label text-slate-500 mb-4">From the journal</p>
            <h2 className="pc-serif text-slate-900 text-[clamp(28px,3.6vw,44px)] leading-[1.05]">
              Notes for the <span className="pc-italic">working clinician.</span>
            </h2>
          </div>
          <a href="#blog" className="hidden md:inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.25em] font-semibold text-slate-900">
            All posts <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <motion.a key={p.title} href="#blog" {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}
              className="group block">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                <img src={p.img} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.background = "#e2e8f0")} />
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                  <span>{p.tag}</span><span>·</span><span>{p.date}</span>
                </div>
                <h3 className="mt-3 pc-serif text-slate-900 text-[22px] leading-snug group-hover:text-slate-600 transition-colors">
                  {p.title}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Closing CTA ---------------- */
function ClosingCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  return (
    <section ref={ref} className="relative w-full py-32 md:py-40 bg-white overflow-hidden">
      <motion.img
        src="/cloud-bg-4.svg" alt="" aria-hidden
        style={{ y, mixBlendMode: "multiply" }}
        className="absolute left-0 top-1/4 w-[420px] max-w-[45vw] pointer-events-none opacity-70"
        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
      />
      <motion.div {...reveal} className="relative z-10 mx-auto max-w-[900px] px-6 text-center">
        <h2 className="pc-serif text-slate-900 text-[clamp(38px,5.5vw,72px)] leading-[1.02]">
          Fewer tabs. Steadier care. <span className="pc-italic">Sundays back.</span>
        </h2>
        <p className="mt-6 text-slate-600 max-w-[54ch] mx-auto text-[16px] leading-relaxed">
          Try PeaceCode with your next intake. Bring your templates, your patients, and your standards — we handle the rest.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={LOGIN_URL} className="liquid-glass-button inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium">
            Get started <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#faq" className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium border border-slate-300 text-slate-900 hover:bg-slate-50">
            Talk to us <Bell className="h-4 w-4" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function Footer() {
  const linkCols = [
    { h: "PRACTICE",  links: [["Scheduling", "/features/scheduling"], ["Notes", "/features"], ["Assessments", "/features"], ["Billing", "/features"], ["Telehealth", "/features"]] },
    { h: "COMPANY",   links: [["About", "#about"], ["Careers", "#careers"], ["Contact", "#contact"], ["Press", "#press"]] },
    { h: "RESOURCES", links: [["Blog", "#blog"], ["Help centre", "#help"], ["Clinician stories", "#stories"], ["Changelog", "#changelog"]] },
  ];
  return (
    <footer className="relative w-full bg-white overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/section3-bg.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "rotate(180deg)",
          maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.9) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.9) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-24 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT */}
          <div className="lg:col-span-5">
            <h3 className="pc-serif text-slate-900 text-[clamp(36px,4.5vw,60px)] leading-[1.02]">
              Find your <span className="pc-italic">practice rhythm.</span>
            </h3>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={LOGIN_URL} className="liquid-glass-button inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium">
                Login <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#practice" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium border border-slate-300 text-slate-900 hover:bg-slate-50">
                See the workspace
              </a>
            </div>
          </div>
          {/* CENTER */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6">
            {linkCols.map((c) => (
              <div key={c.h}>
                <h4 style={{ textTransform: "uppercase", fontSize: 13, letterSpacing: "0.1em", fontWeight: 600, color: "#0F172A" }}>{c.h}</h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map(([l, href]) => (
                    <li key={l}>
                      <a href={href} className="text-[14px] transition-colors" style={{ color: "#475569" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#0F172A")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* RIGHT */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 mb-5">
              {[Instagram, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#social" aria-label="Social"
                  className="h-11 w-11 rounded-xl inline-flex items-center justify-center text-slate-800"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.65)", backdropFilter: "blur(18px)" }}>
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </a>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["DPDP-aligned", "Clinician-authored", "India-hosted"].map((b) => (
                <span key={b} className="rounded-full px-3 py-1"
                  style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.65)", fontSize: 11, color: "#0F172A" }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-[13px] text-slate-500">
          <span>© 2026 PeaceCode. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#privacy" className="hover:text-slate-900">Privacy</a>
            <a href="#terms" className="hover:text-slate-900">Terms</a>
            <a href="#dpa" className="hover:text-slate-900">DPA</a>
            <a href="#security" className="hover:text-slate-900">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
