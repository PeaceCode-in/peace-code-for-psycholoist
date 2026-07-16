import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Copy, Linkedin, Twitter, Instagram, Mail, Presentation, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { palette } from "@/components/practice/palette";
import { getPiece, excerpt } from "@/lib/library-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/library/repurpose/$pid")({ component: Repurpose });

function Repurpose() {
  const hydrated = useHydrated();
  const { pid } = Route.useParams();
  if (!hydrated) return <div className="max-w-[1000px] mx-auto px-8 py-16 text-[11px] uppercase" style={{ color: palette.muted }}>Loading…</div>;
  const p = getPiece(pid);
  if (!p) return <div className="max-w-[1000px] mx-auto px-8 py-16 text-center"><p style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Piece not found.</p></div>;
  const ex = excerpt(p.blocks, 240);
  const drafts = useMemo(() => makeDrafts(p.title, ex), [p.title, ex]);
  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 pb-24">
      <Link to="/library/$pid" params={{ pid: p.id }} className="inline-flex items-center gap-1 text-[12px] mb-6" style={{ color: palette.muted }}><ArrowLeft className="h-3.5 w-3.5" /> Back to piece</Link>
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] mb-2 px-2 py-1 rounded-full" style={{ background: palette.soft, color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Sparkles className="h-3 w-3" /> Co-Pilot drafts
        </div>
        <h1 className="text-[26px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Repurpose "{p.title}"</h1>
        <p className="text-[12.5px] mt-2" style={{ color: palette.muted }}>Every draft is a starting point. Edit before you post — Co-Pilot never publishes for you.</p>
      </div>
      <div className="space-y-4">
        <DraftCard icon={<Linkedin className="h-4 w-4" />} title="LinkedIn post" text={drafts.linkedin} />
        <DraftCard icon={<Twitter className="h-4 w-4" />} title="Twitter / X thread" text={drafts.twitter} />
        <DraftCard icon={<Instagram className="h-4 w-4" />} title="Instagram caption" text={drafts.instagram} />
        <DraftCard icon={<Mail className="h-4 w-4" />} title="Newsletter" text={drafts.newsletter} />
        <DraftCard icon={<Presentation className="h-4 w-4" />} title="Presentation outline" text={drafts.slides} />
        <DraftCard icon={<FileText className="h-4 w-4" />} title="Patient-facing worksheet variant" text={drafts.worksheet} />
      </div>
    </div>
  );
}

function DraftCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const [val, setVal] = useState(text);
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: palette.primary }}>{icon}</span>
        <span className="text-[12.5px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{title}</span>
        <button onClick={() => { navigator.clipboard.writeText(val); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          className="ml-auto inline-flex items-center gap-1 text-[11px] h-7 px-3 rounded-full border" style={{ borderColor: palette.border, color: palette.muted }}>
          <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={Math.max(4, Math.min(12, Math.ceil(val.length / 90)))}
        className="w-full bg-transparent outline-none resize-none text-[13px] leading-relaxed" style={{ color: palette.ink, fontFamily: "'DM Sans', sans-serif" }} />
    </div>
  );
}

function makeDrafts(title: string, ex: string) {
  return {
    linkedin: `${title}\n\n${ex}\n\nRead the full piece — link in comments. Written for anyone who's been sitting with this longer than they've been talking about it.`,
    twitter: `1/ ${title}\n\n2/ ${ex.slice(0, 240)}\n\n3/ The part most people miss: the framing matters more than the technique.\n\n4/ Full piece linked below.`,
    instagram: `${title}.\n\n${ex}\n\nSaved for later? Bookmark it — the middle third is where the useful part lives.`,
    newsletter: `Hi —\n\nA new piece went up this week: ${title}.\n\n${ex}\n\nIf it helps, forward it to one person who might need it. That's how most of this work reaches the right reader.\n\n— The practice`,
    slides: `Slide 1 — Title: ${title}\nSlide 2 — Why this, why now\nSlide 3 — The common framing (and why it falls short)\nSlide 4 — The better working definition\nSlide 5 — What the research actually says\nSlide 6 — A worked example\nSlide 7 — What to try this week\nSlide 8 — When to seek support\nSlide 9 — References\nSlide 10 — Q & A`,
    worksheet: `Handout — ${title}\n\nPage 1 — A short read (paraphrased from the article, 150 words max).\n\nPage 2 — Three prompts:\n\n1. What did you notice in your body while reading this?\n2. When was the last time this pattern showed up for you?\n3. What is one small thing you'd try this week?\n\nPage 3 — Space to write.`,
  };
}
