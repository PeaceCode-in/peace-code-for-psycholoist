import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CalendarCheck, FileText, ClipboardList, Wallet, Video, Users, ShieldCheck, Bell,
  MessageSquare, BookOpen, UsersRound, Share2, GraduationCap, Award, FolderOpen,
  Library, BarChart3, LifeBuoy, Plug, Hourglass, Globe, HeartPulse, ArrowRight,
} from "lucide-react";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { useMarketingTheme } from "@/lib/use-marketing-theme";

const ORIGIN = "https://psychologist.peacecode.in";
const INDEX_URL = `${ORIGIN}/features`;
const INDEX_TITLE = "All 22 Features for Psychologists — PeaceCode";
const INDEX_DESC = "22 clinical tools in one login — scheduling, SOAP notes copilot, PHQ-9/GAD-7 assessments, telehealth, GST billing, supervision, DPDP/HIPAA compliance. Built for verified psychologists in India and worldwide.";

export const Route = createFileRoute("/features/")({
  head: () => ({
    meta: [
      { title: INDEX_TITLE },
      { name: "description", content: INDEX_DESC },
      { name: "keywords", content: "psychology practice software, EHR for psychologists, therapy notes app, PHQ-9 GAD-7 online, telehealth for therapists, DPDP compliant EHR India, HIPAA therapy software, SimplePractice alternative, TherapyNotes alternative, private practice management" },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { property: "og:title", content: INDEX_TITLE },
      { property: "og:description", content: INDEX_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: INDEX_URL },
      { property: "og:site_name", content: "PeaceCode for Psychologists" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: INDEX_TITLE },
      { name: "twitter:description", content: INDEX_DESC },
      { name: "geo.region", content: "IN-DL" },
      { name: "geo.placename", content: "Old Delhi, Delhi, India" },
    ],
    links: [
      { rel: "canonical", href: INDEX_URL },
      { rel: "alternate", hrefLang: "en", href: INDEX_URL },
      { rel: "alternate", hrefLang: "en-IN", href: INDEX_URL },
      { rel: "alternate", hrefLang: "x-default", href: INDEX_URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/for-psychologists` },
            { "@type": "ListItem", position: 2, name: "Features", item: INDEX_URL },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "PeaceCode features for psychologists",
          numberOfItems: features.length,
          itemListElement: features.map((f, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${ORIGIN}/features/${f.slug}`,
            name: f.title,
            description: f.desc,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: INDEX_TITLE,
          description: INDEX_DESC,
          url: INDEX_URL,
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", name: "PeaceCode for Psychologists", url: `${ORIGIN}/` },
          about: { "@type": "Thing", name: "Psychology practice management software" },
        }),
      },
    ],
  }),
  component: FeaturesIndex,
});

const features = [
  { slug: "scheduling", icon: CalendarCheck, tag: "Schedule", title: "Smart scheduling", desc: "Buffers, no-show automations, and a booking link clients actually use." },
  { slug: "notes", icon: FileText, tag: "Notes", title: "Clinical notes with a copilot", desc: "SOAP, DAP, intake and progress notes drafted while you listen." },
  { slug: "assessments", icon: ClipboardList, tag: "Assessments", title: "Assessments & outcomes", desc: "40+ instruments — PHQ-9, GAD-7, PCL-5 — scored and charted over time." },
  { slug: "telehealth", icon: Video, tag: "Telehealth", title: "In-app secure video", desc: "Waiting room, consent, and encrypted sessions with no download for clients." },
  { slug: "billing", icon: Wallet, tag: "Billing", title: "Billing without friction", desc: "GST-ready invoices, UPI + card payouts, insurance claims, monthly reports." },
  { slug: "messages", icon: MessageSquare, tag: "Messaging", title: "Secure client messaging", desc: "HIPAA/DPDP-aligned chat with canned replies and a full audit trail." },
  { slug: "homework", icon: BookOpen, tag: "Homework", title: "Between-session care", desc: "CBT worksheets, thought records, behavioural logs, compliance at a glance." },
  { slug: "groups", icon: UsersRound, tag: "Groups", title: "Group & couples therapy", desc: "Roster, attendance, per-member notes, and shared homework in one place." },
  { slug: "patients", icon: HeartPulse, tag: "Patients", title: "Patient charts", desc: "Every note, session, assessment and message on one calm timeline." },
  { slug: "safety", icon: LifeBuoy, tag: "Safety", title: "Risk & safety planning", desc: "Stanley-Brown safety plans, risk flags, and an emergency protocol." },
  { slug: "referrals", icon: Share2, tag: "Referrals", title: "Warm referrals in & out", desc: "Track sources, close the loop, and grow your professional network." },
  { slug: "teams", icon: Users, tag: "Teams", title: "Group practice", desc: "Shared caseloads, supervision, case conferences, and peer review." },
  { slug: "supervision", icon: Award, tag: "Supervision", title: "Supervision tracker", desc: "Contracts, hours, competencies, and supervisor sign-off." },
  { slug: "cpd", icon: GraduationCap, tag: "CPD", title: "CPD & continuing education", desc: "Plan, catalog, log and renewal reminders — never miss a licence cycle." },
  { slug: "documents", icon: FolderOpen, tag: "Documents", title: "Documents & templates", desc: "Intake packets, informed consent, certificates, custom template editor." },
  { slug: "library", icon: Library, tag: "Library", title: "Resource library", desc: "Psychoeducation media, worksheets and series — reuse across your caseload." },
  { slug: "analytics", icon: BarChart3, tag: "Analytics", title: "Practice analytics", desc: "Caseload, revenue, no-show rate and outcomes on interactive charts." },
  { slug: "copilot", icon: Bell, tag: "Copilot", title: "A quiet co-pilot", desc: "Continuity briefs, risk flags, and gentle nudges — never noise." },
  { slug: "compliance", icon: ShieldCheck, tag: "Compliance", title: "DPDP / HIPAA compliance", desc: "Consent, retention, audit logs and breach ledger — configured for you." },
  { slug: "integrations", icon: Plug, tag: "Integrations", title: "Integrations & API", desc: "Google, Outlook, Zoom, Meet, Stripe, Razorpay, webhooks, API tokens." },
  { slug: "waitlist", icon: Hourglass, tag: "Waitlist", title: "Waitlist auto-fill", desc: "Priority queue notified instantly when a slot opens." },
  { slug: "profile", icon: Globe, tag: "Profile", title: "Public clinician profile", desc: "SEO-optimized page with direct booking — your website, done." },
];

const styles = `
  .pc-mkt { font-family: 'Inter', sans-serif; color: var(--sakura-ink, #1a1a2e); }
  .pc-serif { font-family: 'Fraunces', serif; font-weight: 300; letter-spacing: -0.02em; }
  .pc-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
  .pc-label { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600; }
  .glass-color { background: rgba(255,255,255,0.45); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.65); box-shadow: 0 8px 30px rgba(0,0,0,0.04); border-radius: 1.75rem; }
  .pc-mkt[data-mode="dark"] { background: #140A0E !important; color: #F7ECEF !important; }
  .pc-mkt[data-mode="dark"] .glass-color { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); box-shadow: 0 8px 30px rgba(0,0,0,0.4); }
  .pc-mkt[data-mode="dark"] .text-slate-900, .pc-mkt[data-mode="dark"] .text-slate-800 { color: #F7ECEF !important; }
  .pc-mkt[data-mode="dark"] .text-slate-700, .pc-mkt[data-mode="dark"] .text-slate-600, .pc-mkt[data-mode="dark"] .text-slate-500 { color: #C9B4BC !important; }
  .pc-mkt[data-mode="dark"] .bg-white, .pc-mkt[data-mode="dark"] .bg-slate-50, .pc-mkt[data-mode="dark"] .bg-slate-100 { background-color: rgba(255,255,255,0.05) !important; }
  .pc-mkt[data-mode="dark"] .border-slate-200, .pc-mkt[data-mode="dark"] .border-slate-100 { border-color: rgba(255,255,255,0.1) !important; }
`;

function FeaturesIndex() {
  const { darkMode } = useMarketingTheme();
  return (
    <main
      className="pc-mkt min-h-screen"
      data-mode={darkMode ? "dark" : "light"}
      style={{
        background: darkMode
          ? "linear-gradient(180deg, #140A0E 0%, #1E1014 50%, #140A0E 100%)"
          : "linear-gradient(180deg, #FFF8FA 0%, #ffffff 40%, #F9E6EC 100%)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <MarketingNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link to="/for-psychologists" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">← Back to overview</Link>
        </nav>

        <header>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl mb-16">
            <p className="pc-label text-slate-500 mb-4">Features · 22 tools · 1 login</p>
            <h1 className="pc-serif text-5xl md:text-7xl leading-[1.05] mb-6">
              The complete <span className="pc-italic">psychology</span> workspace.
            </h1>
            <p className="text-lg text-slate-600 font-light max-w-2xl">
              Everything a private practice, clinic, or counselling centre needs — from the first booking to the final discharge letter — on one calm surface. Every feature has its own page: what it does, how it flows, and how much time it saves in a real clinical week.
            </p>
          </motion.div>
        </header>

        <section aria-label="All features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Link key={f.slug} to="/features/$slug" params={{ slug: f.slug }} className="block">
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: (i % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6 }}
                  className="glass-color p-7 h-full flex flex-col cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm mb-4">
                    <Icon className="w-5 h-5 text-slate-700" aria-hidden />
                  </div>
                  <p className="pc-label text-slate-500 mb-2">{f.tag}</p>
                  <h2 className="pc-serif text-2xl mb-2">{f.title}</h2>
                  <p className="text-slate-600 font-light text-sm mb-5 flex-1">{f.desc}</p>
                  <span className="text-sm font-medium inline-flex items-center gap-1 text-slate-900">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.article>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
