import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import branchLeft from "@/assets/sakura/branch-left.svg";
import branchRight from "@/assets/sakura/branch-right.svg";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";

const LOGIN_URL = "/auth";

export type CompanySection = {
  eyebrow?: string;
  heading: string;
  body: React.ReactNode;
};

const styles = `
  .cp-mkt { font-family: 'Inter', sans-serif; color: var(--sakura-ink); background: var(--sakura-cream); }
  .pc-serif { font-family: 'Fraunces', serif; font-weight: 300; letter-spacing: -0.02em; }
  .pc-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
  .pc-label { font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 0.28em; text-transform: uppercase; font-weight: 600; }
  .cp-page { position: relative; min-height: 100vh; }
  .cp-page::before {
    content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 0; mix-blend-mode: multiply; opacity: 0.75;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55  0 0 0 0 0.2  0 0 0 0 0.33  0 0 0 0.30 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  }
  .cp-page > *:not(header):not(.fixed):not(.sticky):not(.absolute) { position: relative; z-index: 1; }
  .cp-branch { position: absolute; top: 3.5rem; width: 220px; height: auto; pointer-events: none; opacity: 0.9; user-select: none; }
  @media (min-width: 768px) { .cp-branch { width: 300px; } }
  .cp-pill { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.9rem; border-radius: 999px;
    background: rgba(255,255,255,0.7); border: 1px solid var(--sakura-border); color: var(--sakura-ink);
    font-size: 11px; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; }
  .cp-card { background: rgba(255,255,255,0.72); backdrop-filter: blur(20px); border: 1px solid var(--sakura-border);
    border-radius: 1.25rem; padding: 1.75rem; box-shadow: 0 20px 60px -30px rgba(138,51,85,0.18); }
  .cp-btn-dark { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--sakura-ink); color: var(--sakura-cream);
    padding: 0.85rem 1.75rem; border-radius: 999px; font-weight: 500; font-size: 0.9rem;
    transition: transform 150ms ease, box-shadow 150ms ease; }
  .cp-btn-dark:hover { transform: translateY(-1px); box-shadow: 0 12px 30px -10px rgba(20,10,14,0.35); }
  .cp-btn-ghost { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.75rem; border-radius: 999px;
    font-weight: 500; font-size: 0.9rem; border: 1px solid var(--sakura-rose); color: var(--sakura-rose);
    transition: background 150ms ease, color 150ms ease; }
  .cp-btn-ghost:hover { background: var(--sakura-rose); color: var(--sakura-cream); }
`;

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export function CompanyPage({
  tag, title, italic, subtitle, sections, ctaLabel = "Get started",
}: {
  tag: string;
  title: string;
  italic?: string;
  subtitle: string;
  sections: CompanySection[];
  ctaLabel?: string;
}) {
  return (
    <article className="cp-mkt cp-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <MarketingNavbar />


      <header className="relative pt-24 pb-16 px-6 overflow-hidden">
        <img src={branchLeft} alt="" aria-hidden className="cp-branch left-0 -translate-x-[15%]" />
        <img src={branchRight} alt="" aria-hidden className="cp-branch right-0 translate-x-[15%]" />
        <div className="max-w-3xl mx-auto text-center relative">
          <nav aria-label="Breadcrumb" className="mb-6 flex justify-center">
            <Link to="/for-psychologists" className="text-sm opacity-70 hover:opacity-100 inline-flex items-center gap-1" style={{ color: "var(--sakura-muted)" }}>
              ← Back to home
            </Link>
          </nav>
          <div className="mb-6 flex justify-center">
            <span className="cp-pill"><Sparkles className="w-3 h-3" /> {tag}</span>
          </div>
          <h1 className="pc-serif text-4xl md:text-6xl leading-[1.08] mb-6" style={{ color: "var(--sakura-ink)" }}>
            {title} {italic ? <span className="pc-italic">{italic}</span> : null}
          </h1>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: "var(--sakura-muted)" }}>{subtitle}</p>
        </div>
      </header>

      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map((s, i) => (
            <motion.div key={i} {...reveal} className="cp-card">
              {s.eyebrow ? (
                <div className="pc-label mb-3" style={{ color: "var(--sakura-rose)" }}>{s.eyebrow}</div>
              ) : null}
              <h2 className="pc-serif text-2xl md:text-3xl mb-3" style={{ color: "var(--sakura-ink)" }}>{s.heading}</h2>
              <div className="text-[15.5px] leading-relaxed" style={{ color: "var(--sakura-muted)" }}>{s.body}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="px-6 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="pc-serif text-3xl md:text-4xl mb-6" style={{ color: "var(--sakura-ink)" }}>
            Ready to see the workspace <span className="pc-italic">yourself?</span>
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={LOGIN_URL} className="cp-btn-dark">{ctaLabel} <ArrowRight className="w-4 h-4" /></a>
            <Link to="/features" className="cp-btn-ghost">Browse features</Link>
          </div>
        </div>
      </footer>
    </article>
  );
}
