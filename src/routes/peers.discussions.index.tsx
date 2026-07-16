import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Filter } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useDiscussions, usePeers, KIND_LABEL, createDiscussion, type DiscussionKind, ME_ID } from "@/lib/peers-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/peers/discussions/")({
  component: DiscussionsIndex,
});

function DiscussionsIndex() {
  const hydrated = useHydrated();
  const discussions = useDiscussions();
  const peers = usePeers();
  const nav = useNavigate();
  const [kind, setKind] = useState<DiscussionKind | "all">("all");
  const [showNew, setShowNew] = useState(false);

  const pmap = useMemo(() => Object.fromEntries(peers.map((p) => [p.id, p])), [peers]);
  const filtered = kind === "all" ? discussions : discussions.filter((d) => d.kind === kind);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-2 rounded-full border p-1" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
          <Filter className="h-3.5 w-3.5 ml-2" style={{ color: palette.muted }} />
          {(["all", "case", "methodology", "ethics", "question"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className="rounded-full px-3 py-1 text-[11px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: kind === k ? palette.ink : "transparent", color: kind === k ? "#fff" : palette.muted }}>
              {k === "all" ? "All" : KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Plus className="h-3.5 w-3.5" /> New discussion
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((d) => {
          const a = pmap[d.authorId];
          const label = d.anonymised ? a?.handle ?? "@anon" : a?.name ?? "—";
          return (
            <Link key={d.id} to="/peers/discussions/$tid" params={{ tid: d.id }} className="block rounded-2xl border p-5 hover:border-[var(--ink)] transition-all duration-[180ms]" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)", ["--ink" as string]: palette.ink }}>
              <div className="flex items-center justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <span>{KIND_LABEL[d.kind]} · {label}{d.anonymised ? " (anon)" : ""}</span>
                <span>{d.replies.length} replies</span>
              </div>
              <div className="mt-1 text-[17px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{d.title}</div>
              <p className="mt-1 text-[13px] line-clamp-2" style={{ color: palette.muted }}>{d.body}</p>
              <div className="mt-2 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{d.tags.map((t) => `#${t}`).join("  ")}</div>
            </Link>
          );
        })}
        {filtered.length === 0 && <p className="text-[12px] text-center py-8" style={{ color: palette.muted }}>Nothing here yet.</p>}
      </div>

      {showNew && <NewDiscussionModal onClose={() => setShowNew(false)} onCreate={(id) => nav({ to: "/peers/discussions/$tid", params: { tid: id } })} />}
    </div>
  );
}

function NewDiscussionModal({ onClose, onCreate }: { onClose: () => void; onCreate: (id: string) => void }) {
  const [kind, setKind] = useState<DiscussionKind>("case");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anon, setAnon] = useState(true);
  const [tags, setTags] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,20,20,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-[600px] rounded-3xl border p-6" style={{ borderColor: palette.border, background: "#fff" }} onClick={(e) => e.stopPropagation()}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>New discussion</div>

        <div className="inline-flex items-center rounded-full border p-1 mb-3" style={{ borderColor: palette.border }}>
          {(["case", "methodology", "ethics", "question"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className="rounded-full px-3 py-1 text-[11px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: kind === k ? palette.ink : "transparent", color: kind === k ? "#fff" : palette.muted }}>{KIND_LABEL[k]}</button>
          ))}
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border rounded-xl px-3 py-2 text-[14px] mb-3" style={{ borderColor: palette.border, fontFamily: "'Fraunces', serif" }} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={kind === "case" ? "Anonymise all identifying details. Age range, presenting issue, what you've tried, the specific question." : "What's the question?"} rows={7} className="w-full border rounded-xl px-3 py-2 text-[13px] mb-3" style={{ borderColor: palette.border }} />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma separated" className="w-full border rounded-xl px-3 py-2 text-[12px] mb-3" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }} />

        <label className="flex items-center gap-2 text-[12px] mb-4" style={{ color: palette.ink }}>
          <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
          Post under handle (recommended for case discussions)
        </label>

        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="text-[12px] px-3 py-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Cancel</button>
          <button
            disabled={!title.trim() || !body.trim()}
            onClick={() => {
              const d = createDiscussion({ kind, title: title.trim(), body: body.trim(), authorId: ME_ID, anonymised: anon, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) });
              onCreate(d.id);
            }}
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[12px] disabled:opacity-40"
            style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}
          >Post</button>
        </div>
      </div>
    </div>
  );
}
