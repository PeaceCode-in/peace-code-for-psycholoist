import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ThumbsUp, CheckCircle2, Bookmark } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { getDiscussion, usePeers, useDiscussions, KIND_LABEL, replyToDiscussion, markHelpful, toggleResolved, toggleBookmark, ME_ID } from "@/lib/peers-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/peers/discussions/$tid")({
  loader: ({ params }) => {
    const d = getDiscussion(params.tid);
    if (!d) throw notFound();
    return { tid: params.tid };
  },
  component: ThreadDetail,
  notFoundComponent: NotFound,
});

function NotFound() {
  return <div className="max-w-[900px] mx-auto px-5 sm:px-8 pt-6"><p className="text-[13px]" style={{ color: palette.muted }}>Thread not found.</p></div>;
}

function ThreadDetail() {
  const { tid } = Route.useParams();
  const hydrated = useHydrated();
  const discussions = useDiscussions();
  const peers = usePeers();
  const d = discussions.find((x) => x.id === tid);
  const pmap = useMemo(() => Object.fromEntries(peers.map((p) => [p.id, p])), [peers]);
  const [reply, setReply] = useState("");

  if (!hydrated) return null;
  if (!d) return <NotFound />;

  const author = pmap[d.authorId];
  const authorLabel = d.anonymised ? author?.handle ?? "@anon" : author?.name ?? "—";

  return (
    <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-16">
      <Link to="/peers/discussions" className="inline-flex items-center gap-1 text-[11px] mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <ArrowLeft className="h-3 w-3" /> All discussions
      </Link>

      <div className="rounded-2xl border p-6 mb-4" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <div className="flex items-center justify-between text-[11px] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <span className="uppercase tracking-[0.14em]">{KIND_LABEL[d.kind]}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => toggleBookmark(d.id)} className="inline-flex items-center gap-1"><Bookmark className={"h-3.5 w-3.5 " + (d.bookmarked ? "fill-current" : "")} /> {d.bookmarked ? "Saved" : "Save"}</button>
            <button onClick={() => toggleResolved(d.id)} className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {d.resolved ? "Mark open" : "Mark resolved"}</button>
          </div>
        </div>
        <h1 className="text-[26px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{d.title}</h1>
        <div className="mt-2 text-[12px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          {authorLabel}{d.anonymised ? " · anonymised" : ""} · {new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
        <p className="mt-4 text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: palette.ink }}>{d.body}</p>
        <div className="mt-4 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{d.tags.map((t) => `#${t}`).join("  ")}</div>
      </div>

      <div className="mb-3 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        {d.replies.length} {d.replies.length === 1 ? "reply" : "replies"}
      </div>

      <div className="space-y-3 mb-6">
        {d.replies.map((r) => {
          const a = pmap[r.authorId];
          const mine = r.helpfulBy.includes(ME_ID);
          return (
            <div key={r.id} className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
              <div className="flex items-center justify-between text-[11px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <span>{a?.name ?? "—"}{a?.self ? " (you)" : ""}</span>
                <span>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
              <p className="text-[13px] whitespace-pre-wrap leading-relaxed" style={{ color: palette.ink }}>{r.body}</p>
              <button onClick={() => markHelpful(d.id, r.id)} className="mt-2 inline-flex items-center gap-1 text-[11px]" style={{ color: mine ? palette.ink : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <ThumbsUp className={"h-3 w-3 " + (mine ? "fill-current" : "")} /> Helpful · {r.helpful}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Your reply</div>
        <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={4} placeholder="Contribute — clinical judgement, references, or a question of your own." className="w-full border rounded-xl px-3 py-2 text-[13px]" style={{ borderColor: palette.border }} />
        <div className="mt-3 flex justify-end">
          <button
            disabled={!reply.trim()}
            onClick={() => { replyToDiscussion(d.id, reply.trim()); setReply(""); }}
            className="inline-flex items-center rounded-full px-4 py-1.5 text-[12px] disabled:opacity-40"
            style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}
          >Post reply</button>
        </div>
      </div>
    </div>
  );
}
