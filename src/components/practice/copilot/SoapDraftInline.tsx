// A compact inline SOAP drafting card used on the session wrap page.
// Streams into four editable blocks; each block can be regenerated or approved,
// then the whole draft can be ratified once — which is when it "saves."

import { useState } from "react";
import { palette } from "@/components/practice/palette";
import { SemicolonMark, AiDraftTag, CopilotPanel, ShimmerText, ProvenancePopover } from "./primitives";
import { generateSoapDraft, useDrafts, regenerateBlock, approveBlock, ratifyDraft } from "@/lib/copilot-store";
import { toast } from "sonner";

export function SoapDraftInline({
  patientId, sessionId, onRatified,
}: {
  patientId: string;
  sessionId: string;
  onRatified?: (blocks: { S: string; O: string; A: string; P: string }) => void;
}) {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [shorthand, setShorthand] = useState("");
  const drafts = useDrafts();
  const draft = drafts.find((d) => d.id === draftId);

  function draftIt() {
    const d = generateSoapDraft({ patientId, sessionId, shorthand });
    setDraftId(d.id);
  }

  function ratify() {
    if (!draft) return;
    const map: Record<string, string> = {};
    draft.blocks.forEach((b) => { map[b.label] = b.body; });
    ratifyDraft(draft.id);
    onRatified?.({ S: map.Subjective ?? "", O: map.Objective ?? "", A: map.Assessment ?? "", P: map.Plan ?? "" });
    toast.success("SOAP ratified. You can still edit before saving the session.");
  }

  if (!draft) {
    return (
      <CopilotPanel className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <SemicolonMark size={13} />
          <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Draft SOAP with Copilot</span>
        </div>
        <p className="text-[12.5px] mb-2" style={{ color: palette.muted }}>
          Optional: drop shorthand bullets. Copilot will fold them into the draft.
        </p>
        <textarea
          value={shorthand}
          onChange={(e) => setShorthand(e.target.value)}
          rows={2}
          placeholder="e.g. calmer opening · sleep still 60min onset · homework 2/3 nights"
          className="w-full rounded-lg p-2 text-[12.5px] outline-none focus:ring-2"
          style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink }}
        />
        <div className="mt-2 flex justify-end">
          <button onClick={draftIt} className="h-8 px-3 rounded-full text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}>Draft with Copilot</button>
        </div>
      </CopilotPanel>
    );
  }

  return (
    <CopilotPanel className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SemicolonMark size={13} />
          <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>SOAP · draft</span>
          <ProvenancePopover prov={draft.provenance}><AiDraftTag /></ProvenancePopover>
        </div>
        {draft.status !== "approved" ? (
          <button onClick={ratify} className="h-8 px-3 rounded-full text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}>
            Ratify & copy to note
          </button>
        ) : (
          <span className="text-[10.5px] px-2 h-6 rounded-full inline-flex items-center" style={{ background: "#E7F6EC", color: "#1F7A3E" }}>Ratified</span>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {draft.blocks.map((b) => (
          <div key={b.id} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.6)", border: `1px solid ${palette.border}` }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{b.label}</span>
              <div className="flex items-center gap-2 text-[10.5px]">
                <button onClick={() => regenerateBlock(draft.id, b.id)} style={{ color: palette.muted }}>Regenerate</button>
                <span style={{ color: palette.border }}>·</span>
                <button onClick={() => approveBlock(draft.id, b.id)} style={{ color: b.approved ? "#1F7A3E" : palette.primary }}>
                  {b.approved ? "Approved" : "Approve"}
                </button>
              </div>
            </div>
            <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap" style={{ color: palette.ink }}>
              <ShimmerText text={b.body} streaming={b.streaming} />
            </p>
          </div>
        ))}
      </div>
    </CopilotPanel>
  );
}
