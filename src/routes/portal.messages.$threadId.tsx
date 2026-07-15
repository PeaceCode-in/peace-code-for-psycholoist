import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { PortalShell, portal } from "@/components/portal/PortalShell";
import { fmtRelative, markThreadRead, sendMessage, useCurrentClient, useMyThreads } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/messages/$threadId")({
  head: () => ({ meta: [{ title: "Message" }, { name: "robots", content: "noindex" }] }),
  component: Thread,
});

const CANNED = ["I'm okay.", "Can we talk before next session?", "Thank you.", "I'll bring this up in session."];

function Thread() {
  const { threadId } = Route.useParams();
  const threads = useMyThreads();
  const client = useCurrentClient();
  const thread = useMemo(() => threads.find(t => t.id === threadId), [threads, threadId]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (thread) markThreadRead(thread.id); }, [thread?.id]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [thread?.messages.length]);

  if (!thread || !client) return null;

  const submit = () => {
    if (!draft.trim()) return;
    sendMessage(thread.id, draft.trim());
    setDraft("");
  };

  return (
    <PortalShell>
      <Link to="/portal/messages" className="inline-flex items-center gap-1 text-[13px]" style={{ color: portal.muted }}>
        <ArrowLeft className="h-3.5 w-3.5" /> All messages
      </Link>
      <div className="mt-2 mb-6">
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, letterSpacing: -0.4 }}>{thread.subject}</h1>
        <p className="text-[13px]" style={{ color: portal.muted }}>with {client.therapistName}</p>
      </div>

      <div ref={scrollRef} className="mb-4 flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
        {thread.messages.map(m => {
          const mine = m.from === "client";
          return (
            <div key={m.id} className={mine ? "self-end" : "self-start"} style={{ maxWidth: "82%" }}>
              <div className="rounded-2xl px-4 py-3 text-[14.5px]" style={{
                background: mine ? portal.rose : portal.paper,
                color: mine ? "#fff" : portal.ink,
                border: mine ? "none" : `1px solid ${portal.border}`,
                borderTopRightRadius: mine ? 4 : 20,
                borderTopLeftRadius: mine ? 20 : 4,
              }}>
                {m.body}
              </div>
              <p className="mt-1 px-1 text-[11px]" style={{ color: portal.muted, textAlign: mine ? "right" : "left" }}>
                {fmtRelative(m.sentAt)}{mine && m.readAt ? " · read" : ""}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {CANNED.map(c => (
          <button key={c} onClick={() => setDraft(d => d ? d : c)} className="rounded-full px-3 py-1.5 text-[12px]" style={{ background: portal.soft, color: portal.roseDeep }}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 rounded-2xl p-2" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
          rows={2}
          placeholder="Write a message…"
          className="flex-1 resize-none bg-transparent px-3 py-2 text-[14.5px] outline-none"
          style={{ color: portal.ink }}
        />
        <button onClick={submit} disabled={!draft.trim()} className="grid h-10 w-10 place-items-center rounded-full disabled:opacity-30" style={{ background: portal.rose, color: "#fff" }}>
          <Send className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </div>

      <p className="mt-4 text-center text-[12px]" style={{ color: portal.muted }}>
        Not for emergencies. If you're in crisis, <Link to="/portal/crisis" style={{ color: portal.roseDeep }}>tap here</Link> or call iCall at 9152987821.
      </p>
    </PortalShell>
  );
}
