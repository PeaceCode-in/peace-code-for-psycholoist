/**
 * FeatureDeepDivePage — shared layout for every feature deep-dive page.
 *
 * Provides consistent:
 *  • Sakura background wash + fixed grain overlay
 *  • Decorative branch SVGs in the hero corners
 *  • Fraunces-serif "Victorian" hero with pill tag, italic accent, and stat chips
 *  • Frosted outlined section wrappers + reveal-on-scroll animation
 *  • FAQ accordion (native <details>) with FAQPage JSON-LD payload optional at route level
 *  • Sticky "Get started" CTA footer with per-feature deep link
 *
 * Consumers focus on *content*, not chrome:
 *
 *   <FeatureDeepDivePage
 *     backHref="/features"
 *     tag="Notes"
 *     tagIcon={<PenLine className="w-3 h-3" />}
 *     title={{ before: "Notes that finish", accent: "themselves." }}
 *     subtitle="SOAP, DAP, BIRP — auto-drafted from your session recording."
 *     stats={[{ label: "Draft time", value: "−78%" }, …]}
 *     ctaHref="/auth?next=/notes"
 *     ctaLabel="Start a note"
 *     faqs={[{ q, a }, …]}
 *   >
 *     <SectionBlock title="The paperwork tax" caption="Why notes never end">…</SectionBlock>
 *     <ChartCard title="Weekly load" …>…</ChartCard>
 *   </FeatureDeepDivePage>
 */

import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import branchLeft from "@/assets/sakura/branch-left.svg";
import branchRight from "@/assets/sakura/branch-right.svg";
import { SakuraWidgetStyles, StatChip } from "./sakura-widgets";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { useMarketingTheme } from "@/lib/use-marketing-theme";

/* ────────────────────────────────────────────────────────────────
 * Shared reveal-on-scroll preset
 * ──────────────────────────────────────────────────────────────── */
export const REVEAL = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

/* ────────────────────────────────────────────────────────────────
 * Page chrome CSS — mounted once via <FeatureDeepDivePage />
 * ──────────────────────────────────────────────────────────────── */
const CHROME_CSS = `
  .fdd-page {
    position: relative;
    background: var(--sakura-cream);
    color: var(--sakura-ink);
    isolation: isolate;
    min-height: 100vh;
  }
  .fdd-page::before {
    content: "";
    position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>");
    mix-blend-mode: soft-light;
    opacity: 0.85;
  }
  .fdd-branch {
    position: absolute; top: 0;
    width: clamp(160px, 24vw, 320px);
    opacity: 0.55; pointer-events: none;
    filter: hue-rotate(-4deg);
  }
  .fdd-pill {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(18px);
    border: 1px solid var(--sakura-border);
    border-radius: 999px;
    font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--sakura-rose);
    font-weight: 500;
  }
  .fdd-serif { font-family: 'Fraunces', serif; font-weight: 400; }
  .fdd-italic { font-family: 'Fraunces', serif; font-style: italic; font-weight: 300; color: var(--sakura-rose); }

  .fdd-faq {
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(24px);
    border: 1px solid var(--sakura-border);
    border-radius: 1rem;
    padding: 1.1rem 1.35rem;
    transition: box-shadow 200ms ease, transform 200ms ease;
  }
  .fdd-faq[open] {
    box-shadow: 0 18px 48px -24px rgba(138,51,85,0.22);
    transform: translateY(-1px);
  }
  .fdd-faq summary {
    list-style: none; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'Fraunces', serif; font-size: 1.05rem;
    color: var(--sakura-ink);
  }
  .fdd-faq summary::-webkit-details-marker { display: none; }
  .fdd-faq summary .fdd-caret { transition: transform 200ms ease; color: var(--sakura-rose); }
  .fdd-faq[open] summary .fdd-caret { transform: rotate(180deg); }
  .fdd-faq p {
    margin-top: 0.7rem; color: var(--sakura-muted);
    font-size: 0.92rem; line-height: 1.65; font-weight: 300;
  }

  .fdd-cta {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.85rem 1.5rem;
    background: var(--sakura-ink);
    color: var(--sakura-cream);
    border-radius: 999px;
    font-size: 0.95rem; font-weight: 500;
    transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  .fdd-cta:hover {
    transform: translateY(-2px);
    background: var(--sakura-rose);
    box-shadow: 0 18px 40px -18px rgba(138,51,85,0.55);
  }
  .fdd-cta-ghost {
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.85rem 1.35rem;
    border: 1px solid var(--sakura-border);
    border-radius: 999px;
    font-size: 0.9rem; color: var(--sakura-ink);
    background: rgba(255,255,255,0.4);
    transition: background 180ms ease, transform 180ms ease;
  }
  .fdd-cta-ghost:hover { background: rgba(255,255,255,0.7); transform: translateY(-1px); }

  .fdd-section-title { font-family: 'Fraunces', serif; color: var(--sakura-ink); }
  .fdd-label {
    font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--sakura-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .fdd-cta, .fdd-cta-ghost, .fdd-faq { transition: none; }
  }
`;

/* ────────────────────────────────────────────────────────────────
 * SectionBlock — semantic wrapper that consumers use inside children.
 * ──────────────────────────────────────────────────────────────── */
export function SectionBlock({
  eyebrow,
  title,
  caption,
  children,
  as: Tag = "section",
}: {
  eyebrow?: string;
  title?: ReactNode;
  caption?: ReactNode;
  children: ReactNode;
  as?: "section" | "div";
}) {
  return (
    <Tag className="relative py-16 px-6">
      <motion.div {...REVEAL} className="max-w-6xl mx-auto">
        {(eyebrow || title || caption) && (
          <header className="mb-10 max-w-3xl">
            {eyebrow && <p className="fdd-label mb-3">{eyebrow}</p>}
            {title && (
              <h2 className="fdd-section-title text-3xl md:text-4xl leading-tight">{title}</h2>
            )}
            {caption && (
              <p
                className="mt-3 text-base md:text-lg font-light leading-relaxed"
                style={{ color: "var(--sakura-muted)" }}
              >
                {caption}
              </p>
            )}
          </header>
        )}
        {children}
      </motion.div>
    </Tag>
  );
}

/* ────────────────────────────────────────────────────────────────
 * FAQ accordion — pairs with FAQPage JSON-LD in the route's head()
 * ──────────────────────────────────────────────────────────────── */
export function FaqBlock({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  return (
    <SectionBlock
      eyebrow="Frequently asked"
      title={<>Answers, without the <span className="fdd-italic">jargon.</span></>}
    >
      <div className="grid gap-3 max-w-3xl">
        {items.map((f) => (
          <details key={f.q} className="fdd-faq">
            <summary>
              <span>{f.q}</span>
              <ChevronDown className="w-4 h-4 fdd-caret" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </SectionBlock>
  );
}

/* ────────────────────────────────────────────────────────────────
 * FeatureDeepDivePage — the shell every deep-dive renders through.
 * ──────────────────────────────────────────────────────────────── */
export type DeepDivePageProps = {
  /** Path back to the feature index (usually `/features`). */
  backHref?: string;
  /** Short pill tag above the H1 (e.g. "Notes · SOAP · DAP"). */
  tag: string;
  tagIcon?: ReactNode;
  /** H1 with an italic accent (`before` + `accent`). */
  title: { before: string; accent: string };
  /** Sub-headline paragraph. */
  subtitle: string;
  /** Optional stat chips rendered under the subtitle. */
  stats?: { label: string; value: string }[];
  /** Primary CTA — deep-links into the app after auth. */
  ctaHref: string;
  ctaLabel: string;
  /** Optional secondary link. */
  secondaryHref?: string;
  secondaryLabel?: string;
  /** FAQ items — rendered as accordion + drives the SEO snippet upstream. */
  faqs?: { q: string; a: string }[];
  /** Body sections composed by the consumer. */
  children: ReactNode;
};

export function FeatureDeepDivePage({
  backHref = "/features",
  tag,
  tagIcon,
  title,
  subtitle,
  stats,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  faqs,
  children,
}: DeepDivePageProps) {
  const { darkMode } = useMarketingTheme();
  return (
    <article className="fdd-page" data-mode={darkMode ? "dark" : "light"}>
      <style dangerouslySetInnerHTML={{ __html: CHROME_CSS }} />
      <SakuraWidgetStyles />
      <MarketingNavbar />


      {/* ─── HERO ─── */}
      <header className="relative pt-20 pb-24 px-6 overflow-hidden">
        <img
          src={branchLeft}
          alt=""
          aria-hidden="true"
          className="fdd-branch left-0 -translate-x-[15%]"
        />
        <img
          src={branchRight}
          alt=""
          aria-hidden="true"
          className="fdd-branch right-0 translate-x-[15%]"
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <nav className="mb-6 flex justify-center">
            <Link
              to={backHref}
              className="text-sm inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: "var(--sakura-muted)" }}
            >
              ← All features
            </Link>
          </nav>

          <div className="mb-8 flex justify-center">
            <span className="fdd-pill">
              {tagIcon ?? <Sparkles className="w-3 h-3" />}
              {tag}
            </span>
          </div>

          <h1
            className="fdd-serif text-4xl md:text-6xl lg:text-7xl leading-[1.08] mb-8"
            style={{ color: "var(--sakura-ink)" }}
          >
            {title.before} <span className="fdd-italic">{title.accent}</span>
          </h1>

          <p
            className="text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed"
            style={{ color: "var(--sakura-muted)" }}
          >
            {subtitle}
          </p>

          {stats && stats.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {stats.map((s) => (
                <StatChip key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to={ctaHref} className="fdd-cta">
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
            {secondaryHref && secondaryLabel && (
              <Link to={secondaryHref} className="fdd-cta-ghost">
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ─── BODY (consumer-composed sections) ─── */}
      {children}

      {/* ─── FAQ ─── */}
      {faqs && faqs.length > 0 && <FaqBlock items={faqs} />}

      {/* ─── CLOSING CTA ─── */}
      <section className="relative py-24 px-6">
        <motion.div {...REVEAL} className="max-w-3xl mx-auto text-center">
          <h2
            className="fdd-serif text-3xl md:text-5xl leading-tight mb-6"
            style={{ color: "var(--sakura-ink)" }}
          >
            Ready when you <span className="fdd-italic">are.</span>
          </h2>
          <p
            className="text-base md:text-lg font-light mb-8"
            style={{ color: "var(--sakura-muted)" }}
          >
            Set it up in minutes. Keep the parts that fit, ignore the rest.
          </p>
          <Link to={ctaHref} className="fdd-cta">
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </article>
  );
}
