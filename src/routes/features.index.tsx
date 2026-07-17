import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CalendarCheck, FileText, ClipboardList, Wallet, Video, Users, ShieldCheck, Bell, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/features/")({
  head: () => ({
    meta: [
      { title: "Features — PeaceCode for Psychologists" },
      { name: "description", content: "Every tool inside PeaceCode — scheduling, notes, assessments, billing, telehealth, and copilot. Explore each one." },
      { property: "og:title", content: "Features — PeaceCode" },
      { property: "og:description", content: "The full clinical toolkit for psychologists." },
    ],
  }),
  component: FeaturesIndex,
});

const features = [
  { slug: "scheduling", icon: CalendarCheck, tag: "Schedule", title: "Smart scheduling", desc: "Buffers, no-show automations, and booking links your clients actually use.", ready: true },
  { slug: "notes", icon: FileText, tag: "Notes", title: "Clinical notes with a copilot", desc: "SOAP, DAP and progress notes drafted while you listen.", ready: false },
  { slug: "assessments", icon: ClipboardList, tag: "Assessments", title: "Assessments & outcomes", desc: "PHQ-9, GAD-7 and custom instruments, scored and charted over time.", ready: false },
  { slug: "billing", icon: Wallet, tag: "Billing", title: "Billing without friction", desc: "GST-ready invoices, UPI and card payouts, clean monthly reports.", ready: false },
  { slug: "telehealth", icon: Video, tag: "Telehealth", title: "Telehealth video", desc: "Secure in-app video with waiting room and consent capture.", ready: false },
  { slug: "teams", icon: Users, tag: "Teams", title: "Group practice tools", desc: "Supervisors, shared caseloads, and case conferences with peer review.", ready: false },
  { slug: "compliance", icon: ShieldCheck, tag: "Compliance", title: "DPDP compliance", desc: "Consent, retention, and audit logs configured for Indian practice.", ready: false },
  { slug: "copilot", icon: Bell, tag: "Copilot", title: "A quiet co-pilot", desc: "Continuity briefs, risk flags, and homework suggestions — never noise.", ready: false },
];

const styles = `
  .pc-mkt { font-family: 'Inter', sans-serif; color: #1a1a2e; }
  .pc-serif { font-family: 'Fraunces', serif; font-weight: 300; letter-spacing: -0.02em; }
  .pc-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
  .pc-label { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600; }
  .glass-color { background: rgba(255,255,255,0.45); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.65); box-shadow: 0 8px 30px rgba(0,0,0,0.04); border-radius: 1.75rem; }
`;

function FeaturesIndex() {
  return (
    <div className="pc-mkt min-h-screen" style={{ background: "linear-gradient(180deg, #EAEBFC 0%, #ffffff 40%, #EAEBFC 100%)" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-6">
          <Link to="/for-psychologists" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
            ← Back to overview
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl mb-16">
          <p className="pc-label text-slate-500 mb-4">Features</p>
          <h1 className="pc-serif text-5xl md:text-7xl leading-[1.05] mb-6">
            Every tool, <span className="pc-italic">explained.</span>
          </h1>
          <p className="text-lg text-slate-600 font-light">
            One page per feature. What it is, how it works, and where it saves you time in a clinical week.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            const card = (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={f.ready ? { y: -6 } : {}}
                className={`glass-color p-8 h-full flex flex-col ${f.ready ? "cursor-pointer" : "opacity-70"}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  {!f.ready && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/60 text-slate-500 border border-white/70">
                      Soon
                    </span>
                  )}
                </div>
                <p className="pc-label text-slate-500 mb-3">{f.tag}</p>
                <h3 className="pc-serif text-2xl md:text-3xl mb-2">{f.title}</h3>
                <p className="text-slate-600 font-light mb-5 flex-1">{f.desc}</p>
                <span className={`text-sm font-medium inline-flex items-center gap-1 ${f.ready ? "text-slate-900" : "text-slate-400"}`}>
                  {f.ready ? "Explore" : "Coming soon"} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </motion.div>
            );
            return f.ready ? (
              <Link key={f.slug} to="/features/$slug" params={{ slug: f.slug }} className="block">{card}</Link>
            ) : (
              <div key={f.slug}>{card}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
