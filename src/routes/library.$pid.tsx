import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Save, Send, Star, Trash2, Calendar, Eye, Sparkles, AlertTriangle, Copy, ExternalLink,
  Plus, Heading2, Heading3, Quote, ImageIcon, Video as VideoIcon, Music, MessageSquare, BookMarked,
} from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  getPiece, updatePiece, snapshotVersion, publishPiece, unpublishPiece, schedulePiece,
  archivePiece, toggleFeatured, deletePiece, readingTimeMin, wordCount, outline,
  listSeries, type Block, type PieceAudience, type PieceFormat, type PieceCategory, type PieceStatus,
} from "@/lib/library-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/library/$pid")({ component: PieceEditor });

const CATEGORIES: PieceCategory[] = ["Anxiety", "Depression", "Relationships", "Life transitions", "Sleep", "Trauma", "Growth", "Practice announcements"];
const FORMATS: PieceFormat[] = ["Article", "Worksheet", "Guide", "Video", "Podcast", "Talk", "Presentation", "Announcement"];
const AUDIENCES: PieceAudience[] = ["public", "patients", "students", "team"];
const CLINICAL_KEYWORDS = ["depression", "anxiety", "suicid", "trauma", "medication", "diagnos"];

function PieceEditor() {
  const hydrated = useHydrated();
  const { pid } = Route.useParams();
  const nav = useNavigate();
  const initial = hydrated ? getPiece(pid) : undefined;
  const [draft, setDraft] = useState(initial);
  const [savedAt, setSavedAt] = useState<number>(Date.now());
  const [dirty, setDirty] = useState(false);
  const [ribbonDismissed, setRibbonDismissed] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (hydrated && !draft) setDraft(getPiece(pid)); }, [hydrated, pid, draft]);

  useEffect(() => {
    if (!dirty || !draft) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updatePiece(draft.id, {
        title: draft.title, subtitle: draft.subtitle, blocks: draft.blocks,
        audience: draft.audience, category: draft.category, format: draft.format,
        seriesId: draft.seriesId, tags: draft.tags, coverImage: draft.coverImage,
        metaTitle: draft.metaTitle, metaDescription: draft.metaDescription, slug: draft.slug,
      });
      setSavedAt(Date.now()); setDirty(false);
    }, 900);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [dirty, draft]);

  if (!hydrated) return <Loading />;
  if (!draft) return <div className="max-w-3xl mx-auto px-8 py-16 text-center">
    <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Piece not found.</p>
    <Link to="/library" className="text-[12px] mt-3 inline-block hover:underline" style={{ color: palette.primary }}>Back to library</Link>
  </div>;

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => { setDraft({ ...draft, [k]: v }); setDirty(true); };

  const onPublish = () => {
    if (!draft.title.trim()) { alert("Add a title before publishing."); return; }
    if (draft.blocks.length === 0) { alert("Add some content before publishing."); return; }
    snapshotVersion(draft.id, "Published");
    publishPiece(draft.id);
    setDraft(getPiece(draft.id));
  };
  const onUnpublish = () => { unpublishPiece(draft.id); setDraft(getPiece(draft.id)); };
  const onSchedule = () => {
    const when = prompt("Schedule for (YYYY-MM-DD HH:MM)");
    if (!when) return;
    const t = Date.parse(when);
    if (isNaN(t)) { alert("Invalid date."); return; }
    schedulePiece(draft.id, t); setDraft(getPiece(draft.id));
  };
  const onFeature = () => { toggleFeatured(draft.id); setDraft(getPiece(draft.id)); };
  const onArchive = () => { if (confirm("Archive this piece?")) { archivePiece(draft.id); nav({ to: "/library" }); } };
  const onDelete = () => { if (confirm("Delete permanently? This can't be undone.")) { deletePiece(draft.id); nav({ to: "/library" }); } };

  const isClinical = useMemo(() => {
    const text = (draft.title + " " + draft.blocks.map((b) => "text" in b ? b.text : "").join(" ")).toLowerCase();
    return CLINICAL_KEYWORDS.some((k) => text.includes(k));
  }, [draft]);

  const wc = wordCount(draft.blocks);
  const rt = readingTimeMin(draft.blocks);
  const ol = outline(draft.blocks);
  const checklist = [
    { ok: draft.title.trim().length > 0, label: "Title" },
    { ok: !!draft.coverImage, label: "Cover image" },
    { ok: (draft.metaDescription ?? "").length >= 50, label: "Meta description (≥ 50 chars)" },
    { ok: draft.blocks.filter((b) => b.type === "image").every((b) => "alt" in b && b.alt.trim().length > 0), label: "Alt text on all images" },
    { ok: draft.blocks.some((b) => b.type === "h2" || b.type === "h3"), label: "At least one heading" },
    { ok: !isClinical || draft.blocks.some((b) => b.type === "reference"), label: "References for clinical claims" },
  ];

  const addBlock = (type: Block["type"]) => {
    const id = "b-" + Math.random().toString(36).slice(2, 8);
    let nb: Block;
    if (type === "h2" || type === "h3") nb = { id, type, text: "Section heading" };
    else if (type === "p") nb = { id, type, text: "" };
    else if (type === "quote") nb = { id, type, text: "", by: "" };
    else if (type === "pull") nb = { id, type, text: "" };
    else if (type === "callout") nb = { id, type, kind: "info", text: "" };
    else if (type === "image") nb = { id, type, src: "", alt: "" };
    else if (type === "video") nb = { id, type, src: "" };
    else if (type === "audio") nb = { id, type, src: "" };
    else if (type === "reference") nb = { id, type, author: "", title: "", year: new Date().getFullYear() };
    else return;
    set("blocks", [...draft.blocks, nb]);
  };
  const updateBlock = (id: string, patch: Partial<Block>) => set("blocks", draft.blocks.map((b) => b.id === id ? { ...b, ...patch } as Block : b));
  const removeBlock = (id: string) => set("blocks", draft.blocks.filter((b) => b.id !== id));

  return (
    <div className="max-w-[1600px] mx-auto px-5 sm:px-8 pb-24">
      {/* Top bar */}
      <div className="flex items-center gap-3 py-4">
        <Link to="/library" className="inline-flex items-center gap-1 text-[12px]" style={{ color: palette.muted }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Library
        </Link>
        <div className="text-[11px] ml-auto" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          {dirty ? "Saving…" : `Saved ${Math.max(1, Math.floor((Date.now() - savedAt) / 1000))}s ago`}
        </div>
        <button onClick={onFeature} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11.5px]"
          style={{ borderColor: palette.border, background: draft.featured ? palette.soft : "rgba(255,255,255,0.7)", color: draft.featured ? palette.primary : palette.muted }}>
          <Star className="h-3.5 w-3.5" fill={draft.featured ? "currentColor" : "none"} /> {draft.featured ? "Featured" : "Feature"}
        </button>
        {draft.status === "published" ? (
          <>
            <Link to="/writing/$slug" params={{ slug: draft.slug }} target="_blank" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11.5px]"
              style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.ink }}>
              <ExternalLink className="h-3.5 w-3.5" /> View public
            </Link>
            <button onClick={onUnpublish} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11.5px]"
              style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.muted }}>
              Unpublish
            </button>
          </>
        ) : (
          <>
            <button onClick={onSchedule} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11.5px]"
              style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.muted }}>
              <Calendar className="h-3.5 w-3.5" /> Schedule
            </button>
            <button onClick={onPublish} className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}>
              <Send className="h-3.5 w-3.5" /> Publish
            </button>
          </>
        )}
      </div>

      {isClinical && !ribbonDismissed && (
        <div className="mb-4 rounded-2xl border px-4 py-3 flex items-start gap-3" style={{ borderColor: "#E9D7A3", background: "#FBF5E6" }}>
          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#7A5A18" }} />
          <div className="flex-1 text-[12.5px] leading-relaxed" style={{ color: "#5A4416" }}>
            You're writing about a clinical topic. Confirm all statistics have sources, and never mention any patient by any identifier — including composite descriptions.
          </div>
          <button onClick={() => setRibbonDismissed(true)} className="text-[11px] opacity-70 hover:opacity-100" style={{ color: "#7A5A18" }}>Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-6">
        {/* Left sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Outline</div>
            {ol.length === 0 ? <div className="text-[11.5px]" style={{ color: palette.muted }}>Headings will appear here.</div> : (
              <ul className="space-y-1.5">
                {ol.map((o, i) => (
                  <li key={i} className="text-[12px] leading-snug" style={{ color: palette.ink, paddingLeft: o.level === 3 ? 12 : 0, fontFamily: "'Fraunces', serif" }}>{o.text}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border p-4 space-y-1.5 text-[11.5px]" style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <div>Words · {wc}</div>
            <div>Read · {rt} min</div>
            <div>Blocks · {draft.blocks.length}</div>
            <div>Status · {draft.status}</div>
            <div>Versions · {draft.versions.length}</div>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Publishability</div>
            <ul className="space-y-1.5">
              {checklist.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[11.5px]" style={{ color: c.ok ? "#3E6A2E" : palette.muted }}>
                  <span className="mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: c.ok ? "#3E6A2E" : palette.border }} />
                  {c.label}
                </li>
              ))}
            </ul>
          </div>
          <Link to="/library/repurpose/$pid" params={{ pid: draft.id }} className="block rounded-2xl border p-4 text-[12px]"
            style={{ borderColor: palette.border, background: palette.soft, color: palette.primary }}>
            <Sparkles className="h-3.5 w-3.5 inline mr-1" /> Repurpose with Co-Pilot
          </Link>
        </aside>

        {/* Editor */}
        <main>
          <input value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Title"
            className="w-full bg-transparent outline-none text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] tracking-tight mb-2"
            style={{ fontFamily: "'Fraunces', serif", color: palette.ink }} />
          <input value={draft.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="Subtitle (optional)"
            className="w-full bg-transparent outline-none text-[16px] italic mb-6"
            style={{ fontFamily: "'Fraunces', serif", color: palette.muted }} />

          <div className="space-y-4">
            {draft.blocks.map((b) => <BlockEditor key={b.id} block={b} onChange={(patch) => updateBlock(b.id, patch)} onRemove={() => removeBlock(b.id)} />)}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <ToolBtn onClick={() => addBlock("p")} icon={<Plus className="h-3.5 w-3.5" />} label="Paragraph" />
            <ToolBtn onClick={() => addBlock("h2")} icon={<Heading2 className="h-3.5 w-3.5" />} label="H2" />
            <ToolBtn onClick={() => addBlock("h3")} icon={<Heading3 className="h-3.5 w-3.5" />} label="H3" />
            <ToolBtn onClick={() => addBlock("quote")} icon={<Quote className="h-3.5 w-3.5" />} label="Blockquote" />
            <ToolBtn onClick={() => addBlock("pull")} icon={<MessageSquare className="h-3.5 w-3.5" />} label="Pull quote" />
            <ToolBtn onClick={() => addBlock("callout")} icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Callout" />
            <ToolBtn onClick={() => addBlock("image")} icon={<ImageIcon className="h-3.5 w-3.5" />} label="Image" />
            <ToolBtn onClick={() => addBlock("video")} icon={<VideoIcon className="h-3.5 w-3.5" />} label="Video" />
            <ToolBtn onClick={() => addBlock("audio")} icon={<Music className="h-3.5 w-3.5" />} label="Audio" />
            <ToolBtn onClick={() => addBlock("reference")} icon={<BookMarked className="h-3.5 w-3.5" />} label="Reference" />
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Metadata</div>
            <LabeledSelect label="Format" value={draft.format} onChange={(v) => set("format", v as PieceFormat)} options={FORMATS} />
            <LabeledSelect label="Category" value={draft.category} onChange={(v) => set("category", v as PieceCategory)} options={CATEGORIES} />
            <LabeledSelect label="Audience" value={draft.audience} onChange={(v) => set("audience", v as PieceAudience)} options={AUDIENCES} />
            <LabeledSelect label="Series" value={draft.seriesId ?? ""} onChange={(v) => set("seriesId", v || undefined)}
              options={["", ...listSeries().map((s) => s.id)]} render={(v) => v ? (listSeries().find((s) => s.id === v)?.title ?? v) : "None"} />
            <LabeledInput label="Tags (comma-sep.)" value={draft.tags.join(", ")} onChange={(v) => set("tags", v.split(",").map((x) => x.trim()).filter(Boolean))} />
            <LabeledInput label="Cover URL" value={draft.coverImage ?? ""} onChange={(v) => set("coverImage", v || undefined)} />
          </div>
          <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>SEO</div>
            <LabeledInput label="Slug" value={draft.slug} onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
            <LabeledInput label={`Meta title (${(draft.metaTitle ?? "").length}/60)`} value={draft.metaTitle ?? ""} onChange={(v) => set("metaTitle", v.slice(0, 60))} />
            <LabeledInput label={`Meta description (${(draft.metaDescription ?? "").length}/160)`} value={draft.metaDescription ?? ""} onChange={(v) => set("metaDescription", v.slice(0, 160))} multiline />
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Version history</div>
            {draft.versions.length === 0 ? <div className="text-[11.5px]" style={{ color: palette.muted }}>No snapshots yet.</div> : (
              <ul className="space-y-1.5 max-h-40 overflow-auto">
                {draft.versions.slice(0, 8).map((v) => (
                  <li key={v.id} className="text-[11px] flex items-center gap-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    <span>{new Date(v.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="ml-auto uppercase tracking-wider text-[10px]" style={{ color: palette.ink }}>{v.label}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => { snapshotVersion(draft.id, "Manual"); setDraft(getPiece(draft.id)); }}
              className="mt-3 w-full h-8 rounded-full text-[11.5px] border" style={{ borderColor: palette.border, color: palette.ink }}>
              <Save className="h-3 w-3 inline mr-1" /> Snapshot now
            </button>
          </div>
          <div className="rounded-2xl border p-4 space-y-2" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Danger</div>
            <button onClick={onArchive} className="w-full h-8 rounded-full text-[11.5px] border" style={{ borderColor: palette.border, color: palette.muted }}>Archive</button>
            <button onClick={onDelete} className="w-full h-8 rounded-full text-[11.5px] border" style={{ borderColor: "#E9C9CE", color: "#B0567A" }}>
              <Trash2 className="h-3 w-3 inline mr-1" /> Delete permanently
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BlockEditor({ block, onChange, onRemove }: { block: Block; onChange: (patch: Partial<Block>) => void; onRemove: () => void }) {
  const base = "w-full bg-transparent outline-none resize-none";
  const cardStyle = { borderColor: palette.border, background: palette.glass };
  const wrap = (children: React.ReactNode) => (
    <div className="rounded-2xl border p-4 relative group" style={cardStyle}>
      <button onClick={onRemove} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 rounded-full flex items-center justify-center text-[10px]" style={{ color: palette.muted }}>×</button>
      {children}
    </div>
  );
  if (block.type === "p") return wrap(
    <textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Write…" rows={Math.max(3, Math.ceil(block.text.length / 90))}
      className={base + " text-[15.5px] leading-[1.7]"} style={{ fontFamily: "'DM Sans', sans-serif", color: palette.ink }} />
  );
  if (block.type === "h2" || block.type === "h3") return wrap(
    <input value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Heading"
      className={base + (block.type === "h2" ? " text-[24px] tracking-tight" : " text-[19px]")}
      style={{ fontFamily: "'Fraunces', serif", color: palette.ink }} />
  );
  if (block.type === "quote") return wrap(
    <div>
      <textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Quotation" rows={2}
        className={base + " text-[17px] italic leading-relaxed"} style={{ fontFamily: "'Fraunces', serif", color: palette.ink }} />
      <input value={block.by ?? ""} onChange={(e) => onChange({ by: e.target.value })} placeholder="— attribution (optional)"
        className={base + " text-[12px] mt-2"} style={{ color: palette.muted }} />
    </div>
  );
  if (block.type === "pull") return wrap(
    <textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Pull quote" rows={2}
      className={base + " text-[20px] italic leading-tight"} style={{ fontFamily: "'Fraunces', serif", color: palette.primary }} />
  );
  if (block.type === "callout") return wrap(
    <div className="flex items-start gap-3">
      <select value={block.kind} onChange={(e) => onChange({ kind: e.target.value as "info" | "caution" })} className="text-[11px] rounded-full border px-2 py-1"
        style={{ borderColor: palette.border, background: palette.solid }}>
        <option value="info">Info</option><option value="caution">Caution</option>
      </select>
      <input value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Callout text"
        className={base + " text-[13.5px]"} style={{ color: palette.ink }} />
    </div>
  );
  if (block.type === "image") return wrap(
    <div className="space-y-2">
      <input value={block.src} onChange={(e) => onChange({ src: e.target.value })} placeholder="Image URL" className={base + " text-[12px]"} style={{ color: palette.ink }} />
      <input value={block.alt} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Alt text (required)" className={base + " text-[12px]"} style={{ color: palette.ink }} />
      <input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} placeholder="Caption (optional)" className={base + " text-[12px] italic"} style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }} />
      {block.src && <img src={block.src} alt={block.alt} className="mt-2 rounded-lg max-h-48 object-cover" />}
    </div>
  );
  if (block.type === "video") return wrap(
    <div className="space-y-2">
      <input value={block.src} onChange={(e) => onChange({ src: e.target.value })} placeholder="Video embed URL (YouTube/Vimeo)" className={base + " text-[12px]"} style={{ color: palette.ink }} />
      <input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} placeholder="Caption" className={base + " text-[12px] italic"} style={{ color: palette.muted }} />
    </div>
  );
  if (block.type === "audio") return wrap(
    <div className="space-y-2">
      <input value={block.src} onChange={(e) => onChange({ src: e.target.value })} placeholder="Audio URL" className={base + " text-[12px]"} style={{ color: palette.ink }} />
      <input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} placeholder="Caption" className={base + " text-[12px] italic"} style={{ color: palette.muted }} />
    </div>
  );
  if (block.type === "reference") return wrap(
    <div className="grid grid-cols-2 gap-2">
      <input value={block.author} onChange={(e) => onChange({ author: e.target.value })} placeholder="Author" className={base + " text-[12px]"} style={{ color: palette.ink }} />
      <input value={String(block.year)} onChange={(e) => onChange({ year: Number(e.target.value) || 0 })} placeholder="Year" className={base + " text-[12px]"} style={{ color: palette.ink }} />
      <input value={block.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Title" className={base + " text-[12px] col-span-2 italic"} style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }} />
      <input value={block.url ?? ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="URL (optional)" className={base + " text-[12px] col-span-2"} style={{ color: palette.muted }} />
    </div>
  );
  return null;
}

function ToolBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11.5px]"
      style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {icon} {label}
    </button>
  );
}

function LabeledSelect({ label, value, onChange, options, render }: { label: string; value: string; onChange: (v: string) => void; options: string[]; render?: (v: string) => string }) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-8 rounded-lg border px-2 text-[12.5px] bg-white outline-none" style={{ borderColor: palette.border, color: palette.ink }}>
        {options.map((o) => <option key={o} value={o}>{render ? render(o) : (o || "—")}</option>)}
      </select>
    </label>
  );
}

function LabeledInput({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border px-2 py-1.5 text-[12.5px] bg-white outline-none resize-none" style={{ borderColor: palette.border, color: palette.ink }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-8 rounded-lg border px-2 text-[12.5px] bg-white outline-none" style={{ borderColor: palette.border, color: palette.ink }} />
      )}
    </label>
  );
}

function Loading() {
  return <div className="max-w-3xl mx-auto px-8 py-16 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading piece…</div>;
}
