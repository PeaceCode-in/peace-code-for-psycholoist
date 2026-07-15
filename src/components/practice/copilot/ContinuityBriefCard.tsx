// A letterpress-style card that renders a Continuity Brief inline.
// Compact, deferential — a colleague slipping you a note.

import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { SemicolonMark, AiDraftTag, CopilotPanel, ShimmerText, ProvenancePopover } from "./primitives";
import { generateContinuityBrief, useDrafts } from "@/lib/copilot-store";

export function ContinuityBriefCard({ patientId }: { patientId: string }) {
  const drafts = useDrafts();
  const existing = drafts.find((d) => d.kind === "continuity" && d.patientId === patientId);
  const [draftId, setDraftId] = useState<string | null>(existing?.id ?? null);
  const draft = drafts.find((d) => d.id === draftId) ?? existing;

  if (!draft) {
    return (
      <CopilotPanel className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SemicolonMark size={14} />
            <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Continuity brief</span>
          </div>
          <button
            onClick={() => {
              const d = generateContinuityBrief(patientId);
              setDraftId(d.id);
            }}
            className="text-[11.5px] h-7 px-2.5 rounded-full"
            style={{ background: palette.ink, color: "#fff" }}
          >
            Prepare with Copilot
          </button>
        </div>
        <p className="mt-3 text-[12.5px]" style={{ color: palette.muted }}>
          Copilot can pull the last SOAP, homework compliance, and assessment deltas into a card for the next hour.
        </p>
      </CopilotPanel>
    );
  }

  return (
    <section
      className="p-6 rounded-2xl relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FBF6EF 0%, #F7EFE5 100%)",
        border: `1px solid #E9DDC9`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 0 rgba(30,20,24,0.02)",
      }}
    >
      {/* letterpress vignette */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.5), transparent 60%)" }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <SemicolonMark size={14} color="#8A6A3B" />
            <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: "#8A6A3B", fontFamily: "'DM Mono', ui-monospace, monospace" }}>A note before you begin</span>
          </div>
          <ProvenancePopover prov={draft.provenance}><AiDraftTag /></ProvenancePopover>
        </div>
        <div className="space-y-3">
          {draft.blocks.map((b) => (
            <div key={b.id}>
              <div className="text-[11px] tracking-[0.14em] uppercase mb-1" style={{ color: "#8A6A3B" }}>{b.label}</div>
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: "#2A2018", fontFamily: "'Fraunces', serif" }}>
                <ShimmerText text={b.body} streaming={b.streaming} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
