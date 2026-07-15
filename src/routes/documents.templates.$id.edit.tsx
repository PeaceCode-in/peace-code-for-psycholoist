import { useEffect, useRef, useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useTemplate, upsertTemplate, CATEGORY_META,
  type Template, type Block, type BlockType, type DocCategory, type SignerRole,
} from "@/lib/documents-store";
import {
  Type, Heading, AlignLeft, MessageCircle, ListChecks, ListOrdered, Sliders,
  Calendar, Clock, PenTool, Fingerprint, Upload, Info, GripVertical, Trash2, Plus, ArrowLeft, Save, Send,
} from "lucide-react";

export const Route = createFileRoute("/documents/templates/$id/edit")({
  head: () => ({ meta: [{ title: "Edit template — PeaceCode" }, { name: "robots", content: "noindex" }] }),
  component: TemplateEditor,
});

type BlockDef = { type: BlockType; label: string; icon: React.ComponentType<{ className?: string }> };
const BLOCK_LIBRARY: BlockDef[] = [
  { type: "heading",    label: "Section header",     icon: Heading },
  { type: "text",       label: "Paragraph",           icon: AlignLeft },
  { type: "info",       label: "Info notice",         icon: Info },
  { type: "short",      label: "Short answer",        icon: Type },
  { type: "long",       label: "Long answer",         icon: MessageCircle },
  { type: "choice",     label: "Multiple choice",     icon: ListOrdered },
  { type: "checkboxes", label: "Checkboxes",          icon: ListChecks },
  { type: "dropdown",   label: "Dropdown",            icon: ListOrdered },
  { type: "scale",      label: "Scale (0–10)",        icon: Sliders },
  { type: "date",       label: "Date",                icon: Calendar },
  { type: "time",       label: "Time",                icon: Clock },
  { type: "signature",  label: "Signature",           icon: PenTool },
  { type: "initials",   label: "Initial here",        icon: Fingerprint },
  { type: "upload",     label: "File upload",         icon: Upload },
];

function newBlock(type: BlockType): Block {
  const id = `b_${Math.random().toString(36).slice(2, 10)}`;
  switch (type) {
    case "heading":  return { id, type, value: "New section" };
    case "text":     return { id, type, value: "Add your paragraph here." };
    case "info":     return { id, type, value: "An important note for the patient." };
    case "choice":
    case "checkboxes":
    case "dropdown": return { id, type, label: "Question", options: ["Option one", "Option two"] };
    case "scale":    return { id, type, label: "How much? (0–10)", min: 0, max: 10 };
    case "signature":return { id, type, label: "Signature", signerRole: "patient", required: true };
    case "initials": return { id, type, label: "Initial to acknowledge", signerRole: "patient", required: true };
    default:         return { id, type, label: "Untitled question" };
  }
}

function TemplateEditor() {
  const { id } = Route.useParams();
  const existing = useTemplate(id);
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Template | null>(existing);
  useEffect(() => { if (existing && !draft) setDraft(existing); }, [existing, draft]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSlash, setShowSlash] = useState<{ afterId: string | null } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  if (!draft) {
    return (
      <AppShell crumb="Templates">
        <div className="max-w-xl mx-auto py-16 text-center">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink }}>Template not found</div>
          <Link to="/documents" className="mt-4 inline-block text-[13px]" style={{ color: palette.primary }}>Back to library</Link>
        </div>
      </AppShell>
    );
  }

  const updateBlock = (bid: string, patch: Partial<Block>) => {
    setDraft((d) => d && ({ ...d, blocks: d.blocks.map((b) => b.id === bid ? { ...b, ...patch } : b) }));
  };
  const removeBlock = (bid: string) => {
    setDraft((d) => d && ({ ...d, blocks: d.blocks.filter((b) => b.id !== bid) }));
  };
  const insertAfter = (bid: string | null, type: BlockType) => {
    const nb = newBlock(type);
    setDraft((d) => {
      if (!d) return d;
      if (!bid) return { ...d, blocks: [...d.blocks, nb] };
      const idx = d.blocks.findIndex((b) => b.id === bid);
      const arr = [...d.blocks];
      arr.splice(idx + 1, 0, nb);
      return { ...d, blocks: arr };
    });
    setSelectedId(nb.id);
    setShowSlash(null);
  };
  const move = (from: string, to: string) => {
    setDraft((d) => {
      if (!d) return d;
      const fi = d.blocks.findIndex((b) => b.id === from);
      const ti = d.blocks.findIndex((b) => b.id === to);
      if (fi < 0 || ti < 0) return d;
      const arr = [...d.blocks];
      const [item] = arr.splice(fi, 1);
      arr.splice(ti, 0, item);
      return { ...d, blocks: arr };
    });
  };

  const save = () => { upsertTemplate(draft); };
  const saveAndSend = () => { upsertTemplate(draft); navigate({ to: "/documents/new", search: { template: draft.id } as never }); };

  const selected = draft.blocks.find((b) => b.id === selectedId) ?? null;

  return (
    <AppShell crumb="Template editor">
      <div className="flex h-[calc(100vh-56px)] min-h-0">
        {/* Left palette */}
        <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r overflow-y-auto"
          style={{ borderColor: palette.border, background: "#FCF9FA" }}>
          <div className="px-4 pt-5 pb-3">
            <Link to="/documents" className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em]"
              style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <ArrowLeft className="w-3 h-3" /> Library
            </Link>
          </div>
          <div className="px-4 pb-2 uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
            Blocks
          </div>
          <div className="px-2 pb-6 space-y-0.5">
            {BLOCK_LIBRARY.map((def) => (
              <button
                key={def.type}
                onClick={() => insertAfter(selectedId, def.type)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-[12.5px] hover:bg-white/80"
                style={{ color: palette.ink }}
              >
                <def.icon className="w-3.5 h-3.5" />
                {def.label}
              </button>
            ))}
          </div>
          <div className="mt-auto px-4 py-3 border-t text-[10.5px]" style={{ borderColor: palette.border, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            Press <kbd>/</kbd> in a block for quick insert
          </div>
        </aside>

        {/* Canvas */}
        <section className="flex-1 min-w-0 overflow-y-auto" style={{ background: "#F7F3F4" }}>
          <div className="max-w-3xl mx-auto py-10 px-6">
            {/* Doc header */}
            <div className="rounded-2xl p-6 mb-4" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full bg-transparent outline-none"
                style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: palette.ink, letterSpacing: "-0.01em" }}
              />
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={2}
                className="w-full bg-transparent outline-none mt-2 text-[13px] resize-none"
                style={{ color: palette.muted }}
              />
            </div>

            {/* Blocks */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
              {draft.blocks.length === 0 && (
                <div className="p-10 text-center text-[13px]" style={{ color: palette.muted }}>
                  A blank page. Add a block from the left, or use the + below.
                </div>
              )}
              {draft.blocks.map((blk, i) => (
                <div
                  key={blk.id}
                  draggable
                  onDragStart={() => setDragId(blk.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragId && dragId !== blk.id) move(dragId, blk.id); setDragId(null); }}
                  onClick={() => setSelectedId(blk.id)}
                  className="group relative flex gap-2 px-4 py-3 border-b transition-colors"
                  style={{
                    borderColor: palette.border,
                    background: selectedId === blk.id ? "rgba(198,127,132,0.05)" : "transparent",
                    borderLeft: selectedId === blk.id ? `2px solid ${palette.primary}` : "2px solid transparent",
                  }}
                >
                  <button className="opacity-0 group-hover:opacity-100 shrink-0 mt-1.5 cursor-grab" style={{ color: palette.muted }}>
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <BlockEditor block={blk} onChange={(p) => updateBlock(blk.id, p)} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeBlock(blk.id); }}
                    className="opacity-0 group-hover:opacity-100 shrink-0 mt-1.5" style={{ color: palette.muted }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowSlash({ afterId: draft.blocks[draft.blocks.length - 1]?.id ?? null })}
                className="w-full flex items-center gap-2 px-4 py-3 text-[12.5px]"
                style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add a block
              </button>
            </div>

            {showSlash && (
              <div className="mt-3 rounded-xl p-2 grid grid-cols-2 gap-1" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
                {BLOCK_LIBRARY.map((def) => (
                  <button key={def.type} onClick={() => insertAfter(showSlash.afterId, def.type)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-black/[0.03] text-left text-[12.5px]"
                    style={{ color: palette.ink }}>
                    <def.icon className="w-3.5 h-3.5" /> {def.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right sidebar: properties */}
        <aside className="hidden xl:flex flex-col w-[300px] shrink-0 border-l overflow-y-auto"
          style={{ borderColor: palette.border, background: "#FCF9FA" }}>
          <div className="px-5 pt-6 pb-2 uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
            Document properties
          </div>
          <div className="px-5 pb-6 space-y-4">
            <Field label="Category">
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as DocCategory })}
                className="w-full h-8 px-2 rounded-md text-[12.5px]" style={inputStyle}>
                {(Object.keys(CATEGORY_META) as DocCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
              </select>
            </Field>
            <Field label="Audience">
              <select value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value as Template["audience"] })}
                className="w-full h-8 px-2 rounded-md text-[12.5px]" style={inputStyle}>
                <option value="patient">Patient</option>
                <option value="guardian">Guardian</option>
                <option value="both">Both</option>
              </select>
            </Field>
            <Field label="Required signatures">
              <div className="flex flex-wrap gap-1.5">
                {(["patient", "therapist", "guardian", "witness"] as SignerRole[]).map((r) => {
                  const on = draft.requiredSigners.includes(r);
                  return (
                    <button key={r} onClick={() => setDraft({
                      ...draft,
                      requiredSigners: on ? draft.requiredSigners.filter((x) => x !== r) : [...draft.requiredSigners, r],
                    })}
                      className="px-2.5 h-7 rounded-full text-[11px]"
                      style={{
                        background: on ? palette.primary : palette.surface,
                        color: on ? "#fff" : palette.ink,
                        border: `1px solid ${on ? palette.primary : palette.border}`,
                      }}>{r}</button>
                  );
                })}
              </div>
            </Field>
            <Field label="Expires after">
              <div className="flex items-center gap-2">
                <input type="number" value={draft.expirationDays} min={1}
                  onChange={(e) => setDraft({ ...draft, expirationDays: Number(e.target.value || 1) })}
                  className="w-20 h-8 px-2 rounded-md text-[12.5px] tabular-nums" style={inputStyle} />
                <span className="text-[11px]" style={{ color: palette.muted }}>days</span>
              </div>
            </Field>
            <Field label="Retention (auto-delete after)">
              <div className="flex items-center gap-2">
                <input type="number" value={draft.retentionDays} min={30}
                  onChange={(e) => setDraft({ ...draft, retentionDays: Number(e.target.value || 30) })}
                  className="w-20 h-8 px-2 rounded-md text-[12.5px] tabular-nums" style={inputStyle} />
                <span className="text-[11px]" style={{ color: palette.muted }}>days</span>
              </div>
            </Field>
            <Field label="Auto-attach to session">
              <button onClick={() => setDraft({ ...draft, autoAttachToSession: !draft.autoAttachToSession })}
                className="inline-flex w-10 h-5 rounded-full items-center transition-colors"
                style={{ background: draft.autoAttachToSession ? palette.primary : palette.surface, border: `1px solid ${draft.autoAttachToSession ? palette.primary : palette.border}` }}>
                <span className="w-3.5 h-3.5 rounded-full transition-transform"
                  style={{ background: draft.autoAttachToSession ? "#fff" : palette.muted, transform: draft.autoAttachToSession ? "translateX(21px)" : "translateX(3px)" }} />
              </button>
            </Field>
          </div>

          {selected && (
            <>
              <div className="px-5 pt-3 pb-2 uppercase border-t" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
                Selected block
              </div>
              <div className="px-5 pb-6 space-y-3">
                {"label" in selected && selected.type !== "heading" && selected.type !== "text" && selected.type !== "info" && (
                  <Field label="Label">
                    <input value={selected.label ?? ""} onChange={(e) => updateBlock(selected.id, { label: e.target.value })}
                      className="w-full h-8 px-2 rounded-md text-[12.5px]" style={inputStyle} />
                  </Field>
                )}
                <Field label="Required">
                  <button onClick={() => updateBlock(selected.id, { required: !selected.required })}
                    className="inline-flex w-10 h-5 rounded-full items-center transition-colors"
                    style={{ background: selected.required ? palette.primary : palette.surface, border: `1px solid ${selected.required ? palette.primary : palette.border}` }}>
                    <span className="w-3.5 h-3.5 rounded-full"
                      style={{ background: selected.required ? "#fff" : palette.muted, transform: selected.required ? "translateX(21px)" : "translateX(3px)" }} />
                  </button>
                </Field>
                {(selected.type === "signature" || selected.type === "initials") && (
                  <Field label="Signer">
                    <select value={selected.signerRole} onChange={(e) => updateBlock(selected.id, { signerRole: e.target.value as SignerRole })}
                      className="w-full h-8 px-2 rounded-md text-[12.5px]" style={inputStyle}>
                      <option value="patient">Patient</option>
                      <option value="therapist">Therapist</option>
                      <option value="guardian">Guardian</option>
                      <option value="witness">Witness</option>
                    </select>
                  </Field>
                )}
              </div>
            </>
          )}

          <div className="mt-auto p-4 border-t space-y-2" style={{ borderColor: palette.border }}>
            <button onClick={save} className="w-full h-9 rounded-full text-[12.5px] flex items-center justify-center gap-1.5"
              style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}>
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={saveAndSend} className="w-full h-9 rounded-full text-[12.5px] text-white flex items-center justify-center gap-1.5"
              style={{ background: palette.primary }}>
              <Send className="w-3.5 h-3.5" /> Save &amp; send
            </button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

const inputStyle: React.CSSProperties = { background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink, outline: "none" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.16em] mb-1"
        style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      {children}
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: Block; onChange: (p: Partial<Block>) => void }) {
  switch (block.type) {
    case "heading":
      return <input value={block.value ?? ""} onChange={(e) => onChange({ value: e.target.value })}
        className="w-full bg-transparent outline-none py-1"
        style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: palette.ink }} placeholder="Section header" />;
    case "text":
      return <textarea value={block.value ?? ""} onChange={(e) => onChange({ value: e.target.value })}
        rows={3} className="w-full bg-transparent outline-none text-[13.5px] leading-relaxed resize-none"
        style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }} />;
    case "info":
      return (
        <div className="flex gap-2 items-start p-3 rounded-lg" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: palette.primary }} />
          <textarea value={block.value ?? ""} onChange={(e) => onChange({ value: e.target.value })}
            rows={2} className="w-full bg-transparent outline-none text-[12.5px] resize-none" style={{ color: palette.ink }} />
        </div>
      );
    case "choice":
    case "checkboxes":
    case "dropdown":
      return (
        <div>
          <input value={block.label ?? ""} onChange={(e) => onChange({ label: e.target.value })}
            className="w-full bg-transparent outline-none text-[13.5px]"
            style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }} placeholder="Question" />
          <div className="mt-2 space-y-1">
            {(block.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2 text-[12.5px]" style={{ color: palette.muted }}>
                <span>{block.type === "checkboxes" ? "☐" : block.type === "dropdown" ? "▾" : "○"}</span>
                <input value={opt}
                  onChange={(e) => {
                    const opts = [...(block.options ?? [])]; opts[i] = e.target.value;
                    onChange({ options: opts });
                  }}
                  className="flex-1 bg-transparent outline-none" style={{ color: palette.ink }} />
                <button onClick={() => onChange({ options: (block.options ?? []).filter((_, x) => x !== i) })} style={{ color: palette.muted }}>×</button>
              </div>
            ))}
            <button onClick={() => onChange({ options: [...(block.options ?? []), `Option ${(block.options?.length ?? 0) + 1}`] })}
              className="text-[11.5px] mt-1" style={{ color: palette.primary }}>+ Add option</button>
          </div>
        </div>
      );
    case "scale":
      return (
        <div>
          <input value={block.label ?? ""} onChange={(e) => onChange({ label: e.target.value })}
            className="w-full bg-transparent outline-none text-[13.5px]"
            style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }} />
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: (block.max ?? 10) - (block.min ?? 0) + 1 }).map((_, i) => (
              <span key={i} className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] tabular-nums"
                style={{ background: palette.surface2, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {(block.min ?? 0) + i}
              </span>
            ))}
          </div>
        </div>
      );
    case "signature":
      return (
        <div>
          <div className="text-[12.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{block.label ?? "Signature"}</div>
          <div className="mt-2 h-16 rounded-lg flex items-end px-3 pb-2"
            style={{ background: "linear-gradient(180deg,#FEFCFB,#F7F3F4)", border: `1px dashed ${palette.border}` }}>
            <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              signature · {block.signerRole ?? "patient"}
            </span>
          </div>
        </div>
      );
    case "initials":
      return (
        <div className="flex items-center gap-3">
          <span className="w-14 h-10 rounded-md flex items-center justify-center text-[11px] uppercase tracking-[0.14em]"
            style={{ background: palette.surface2, color: palette.muted, border: `1px dashed ${palette.border}`, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            initial
          </span>
          <input value={block.label ?? ""} onChange={(e) => onChange({ label: e.target.value })}
            className="flex-1 bg-transparent outline-none text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }} />
        </div>
      );
    default:
      return (
        <div>
          <input value={block.label ?? ""} onChange={(e) => onChange({ label: e.target.value })}
            className="w-full bg-transparent outline-none text-[13.5px]"
            style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }} placeholder="Question" />
          <div className="mt-1.5 h-8 rounded-md flex items-center px-2 text-[11px]"
            style={{ background: palette.surface2, color: palette.muted, border: `1px solid ${palette.border}`, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {previewFor(block.type)}
          </div>
        </div>
      );
  }
}

function previewFor(t: BlockType): string {
  return ({ short: "short answer", long: "long answer", date: "date picker", time: "time picker", upload: "file upload…" } as Record<string, string>)[t] ?? "answer";
}
