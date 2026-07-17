import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bookmark, Archive, Tag as TagIcon, MoreHorizontal, Paperclip, Bold, Italic, X, Trash2, CornerUpLeft, Printer, Download } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import {
  useLiveThread, useLiveMessages, useLiveCanned, useLiveSettings,
  markThreadRead, sendMessage, toggleStar, toggleArchive,
  addLabel, removeLabel, deleteThread, deleteMessage, editMessage,
  applyCannedTemplate, interpolate, logAttachmentDownload,
  validateBody, validateAttachment, ensureSeededWithPatients,
  type Message, type Attachment, ALLOWED_MIME,
} from "@/lib/messages-store";
import { getPatient } from "@/lib/patients-store";
import { Avatar, fmtTime, fmtDayDivider, fmtSize, LabelChip, renderMarkdown, senderName } from "@/components/practice/messages/primitives";
import { ThreadList, EmptyPane } from "./messages.index";
import { THERAPIST_ID } from "@/lib/messages-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/messages/$threadId")({
  head: () => ({ meta: [{ title: "Conversation — Messages · PeaceCode" }] }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const hydrated = useHydrated();
  useEffect(() => { if (hydrated) ensureSeededWithPatients(); }, [hydrated]);

  const thread = useLiveThread(threadId);
  const messages = useLiveMessages(threadId);
  const navigate = useNavigate();

  useEffect(() => {
    if (thread && thread.unreadCount > 0) markThreadRead(threadId);
  }, [threadId, thread?.unreadCount, thread]);

  // Global shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!thread) return;
      if (e.key === "s") toggleStar(threadId);
      if (e.key === "e") { toggleArchive(threadId); navigate({ to: "/messages" }); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [thread, threadId, navigate]);

  if (hydrated && !thread) {
    return (
      <AppShell>
        <div className="flex h-[calc(100dvh-32px)]">
          <ThreadList activeId={undefined} />
          <div className="flex-1 flex items-center justify-center" style={{ color: palette.muted }}>Conversation not found.</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex h-[calc(100dvh-32px)]">
        <ThreadList activeId={threadId} />
        <section className="flex-1 flex flex-col min-w-0" style={{ background: palette.surface }}>
          {thread ? (
            <>
              <ThreadHeader threadId={threadId} />
              <MessageList messages={messages} />
              <Composer threadId={threadId} />
            </>
          ) : (
            <EmptyPane />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function ThreadHeader({ threadId }: { threadId: string }) {
  const thread = useLiveThread(threadId);
  const navigate = useNavigate();
  const [labelOpen, setLabelOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  if (!thread) return null;
  const patient = getPatient(thread.patientId);

  return (
    <header className="h-[72px] px-5 flex items-center justify-between border-b sticky top-0 z-10" style={{ borderColor: palette.border, background: palette.surface }}>
      <div className="flex items-center gap-3 min-w-0">
        <button className="md:hidden" onClick={() => navigate({ to: "/messages" })}><ArrowLeft className="w-4 h-4" style={{ color: palette.muted }} /></button>
        <Avatar id={thread.patientId} role="patient" size={32} />
        <div className="min-w-0">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: "15px", color: palette.ink }} className="truncate">
            {patient?.fullName ?? "Patient"}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span style={{ fontSize: "11px", color: palette.muted, fontFamily: "'DM Sans', sans-serif" }}>
              Individual · {patient?.totalSessions ?? 0} sessions
            </span>
            {thread.labels.map((l) => (
              <LabelChip key={l} label={l} onRemove={() => removeLabel(threadId, l)} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <IconBtn onClick={() => toggleStar(threadId)} label={thread.isStarred ? "Unstar" : "Bookmark"}>
          <Bookmark className="w-3.5 h-3.5" fill={thread.isStarred ? palette.primary : "none"} style={{ color: thread.isStarred ? palette.primary : palette.muted }} />
        </IconBtn>
        <IconBtn onClick={() => { toggleArchive(threadId); navigate({ to: "/messages" }); }} label="Archive">
          <Archive className="w-3.5 h-3.5" style={{ color: palette.muted }} />
        </IconBtn>
        <div className="relative">
          <IconBtn onClick={() => setLabelOpen((v) => !v)} label="Add label">
            <TagIcon className="w-3.5 h-3.5" style={{ color: palette.muted }} />
          </IconBtn>
          {labelOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[200px] rounded-xl p-2 z-20" style={{ background: palette.solid, border: `1px solid ${palette.border}`, boxShadow: "0 8px 28px rgba(30,20,24,0.08)" }}>
              <div className="flex flex-wrap gap-1 mb-2">
                {["clinical", "scheduling", "billing", "warmth", "urgent"].filter((l) => !thread.labels.includes(l)).map((l) => (
                  <button key={l} onClick={() => { addLabel(threadId, l); setLabelOpen(false); }} className="px-2 py-0.5 rounded" style={{ background: palette.surface2, fontSize: "10.5px", fontFamily: "'DM Mono', monospace", color: palette.muted }}>{l}</button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if (newLabel.trim()) { addLabel(threadId, newLabel); setNewLabel(""); setLabelOpen(false); } }}>
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New label…" className="w-full h-7 px-2 text-[11px] rounded outline-none" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }} />
              </form>
            </div>
          )}
        </div>
        <div className="relative">
          <IconBtn onClick={() => setMoreOpen((v) => !v)} label="More">
            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: palette.muted }} />
          </IconBtn>
          {moreOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[180px] rounded-xl p-1 z-20" style={{ background: palette.solid, border: `1px solid ${palette.border}`, boxShadow: "0 8px 28px rgba(30,20,24,0.08)" }}>
              {[
                { label: "Print", icon: Printer, onClick: () => window.print() },
                { label: "Export PDF", icon: Download, onClick: () => window.print() },
                { label: "Delete thread", icon: Trash2, danger: true, onClick: () => { if (confirm("Delete this entire thread? This cannot be undone.")) { deleteThread(threadId); navigate({ to: "/messages" }); } } },
              ].map((it) => (
                <button key={it.label} onClick={() => { setMoreOpen(false); it.onClick(); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] hover:bg-black/[0.03]"
                  style={{ color: it.danger ? "#B0567A" : palette.ink }}>
                  <it.icon className="w-3.5 h-3.5" />{it.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.03]">
      {children}
    </button>
  );
}

function MessageList({ messages }: { messages: Message[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // scroll to bottom on new message
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages.length]);

  const grouped = useMemo(() => {
    const groups: Array<{ day: string; items: Message[] }> = [];
    for (const m of messages) {
      const day = fmtDayDivider(m.sentAt);
      const last = groups[groups.length - 1];
      if (last && last.day === day) last.items.push(m);
      else groups.push({ day, items: [m] });
    }
    return groups;
  }, [messages]);

  return (
    <div ref={ref} className="flex-1 overflow-y-auto px-6 md:px-10 py-6" style={{ background: palette.surface, animation: "fadeIn 120ms ease-out" }}>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
      {grouped.map((g, gi) => (
        <div key={gi}>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: palette.border }} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10.5px", color: palette.muted }}>— {g.day} —</span>
            <div className="flex-1 h-px" style={{ background: palette.border }} />
          </div>
          {g.items.map((m, i) => (
            <MessageRow key={m.id} message={m} previous={g.items[i - 1] ?? messages[messages.indexOf(m) - 1]} />
          ))}
        </div>
      ))}
    </div>
  );
}

function MessageRow({ message, previous }: { message: Message; previous?: Message }) {
  const isTherapist = message.senderRole === "therapist";
  const isSystem = message.senderRole === "system";
  const name = senderName(message.senderId, message.senderRole);
  const readByOther = message.readBy.find((r) => r.userId !== message.senderId);

  if (message.deletedAt) {
    return (
      <div className="my-6" style={{ fontSize: "12px", color: palette.muted, fontFamily: "'DM Mono', monospace" }}>
        — Message deleted {fmtTime(message.deletedAt)} —
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="my-6 text-center">
        <span className="inline-block px-3 py-1 rounded-full" style={{ background: palette.surface2, color: palette.muted, fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>
          {message.body}
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-3" style={{ marginTop: "12px" }}>
      <Avatar id={message.senderId} role={message.senderRole} size={32} />
      <div className="min-w-0 flex-1" style={{
        borderLeft: isTherapist ? `2px solid ${palette.primary}66` : "2px solid transparent",
        paddingLeft: "12px",
      }}>
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "13px", color: palette.ink }}>{name}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10.5px", color: palette.muted }}>
            {fmtTime(message.sentAt)}{message.editedAt ? " · edited" : ""}
          </span>
        </div>
        <div className="mt-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: palette.ink, maxWidth: "640px", lineHeight: 1.55 }}>
          {renderMarkdown(message.body)}
        </div>
        {message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((a) => <AttachmentCard key={a.id} attachment={a} threadId={message.threadId} messageId={message.id} />)}
          </div>
        )}
        {isTherapist && readByOther && (
          <div className="mt-1" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: palette.muted }}>
            Read · {fmtTime(readByOther.readAt)}
          </div>
        )}
      </div>
    </div>
  );
}

function AttachmentCard({ attachment, threadId, messageId }: { attachment: Attachment; threadId: string; messageId: string }) {
  return (
    <button
      onClick={() => logAttachmentDownload(threadId, messageId, attachment.id)}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded max-w-md"
      style={{ border: `1px solid ${palette.border}`, background: palette.surface2 }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={palette.muted} strokeWidth="1.2" />
        <path d="M14 2v6h6" stroke={palette.muted} strokeWidth="1.2" />
      </svg>
      <div className="text-left min-w-0">
        <div className="truncate" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12.5px", color: palette.ink }}>{attachment.filename}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "10.5px", color: palette.muted }}>
          {fmtSize(attachment.sizeBytes)} · {attachment.mimeType}
        </div>
      </div>
    </button>
  );
}

function Composer({ threadId }: { threadId: string }) {
  const thread = useLiveThread(threadId);
  const canned = useLiveCanned();
  const settings = useLiveSettings();
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cannedOpen, setCannedOpen] = useState(false);
  const [cannedQuery, setCannedQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const patient = thread ? getPatient(thread.patientId) : undefined;

  const filteredCanned = useMemo(() => {
    const q = cannedQuery.toLowerCase();
    if (!q) return canned.slice(0, 8);
    return canned.filter((c) => c.shortcut.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [canned, cannedQuery]);

  const doSend = useCallback(async () => {
    const v = validateBody(body);
    if (!v.ok) { setError(v.error); return; }
    setSending(true);
    setError(null);
    const finalBody = settings.signatureEnabled && !body.includes(settings.signature)
      ? `${body}\n\n${settings.signature}` : body;
    await new Promise((r) => setTimeout(r, 400));
    sendMessage({ threadId, body: finalBody, attachments });
    setBody(""); setAttachments([]); setSending(false);
  }, [body, attachments, threadId, settings]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setCannedOpen(false); setShowShortcuts(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") { e.preventDefault(); setShowShortcuts((v) => !v); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); doSend(); }
    if (e.key === "/" && body === "") { setCannedOpen(true); setCannedQuery(""); }
    if (e.key === "Escape") setCannedOpen(false);
  };

  const onBodyChange = (val: string) => {
    setBody(val);
    if (val.startsWith("/")) { setCannedOpen(true); setCannedQuery(val.slice(1)); }
    else setCannedOpen(false);
  };

  const insertCanned = (id: string) => {
    if (!patient) return;
    const text = applyCannedTemplate(id, patient.id);
    setBody(text);
    setCannedOpen(false);
    taRef.current?.focus();
  };

  const onFilePick = (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      const check = validateAttachment({ filename: f.name, sizeBytes: f.size, mimeType: f.type || "application/octet-stream" });
      if (!check.ok) { setError(`${f.name}: ${check.error}`); continue; }
      setAttachments((prev) => [...prev, {
        id: `att_${Math.random().toString(36).slice(2, 8)}`,
        filename: f.name.slice(0, 200),
        sizeBytes: f.size,
        mimeType: f.type || "application/octet-stream",
        uploadedAt: new Date().toISOString(),
      }]);
    }
  };

  return (
    <div className="border-t px-6 md:px-10 py-3 relative" style={{ borderColor: palette.border, background: palette.surface }}>
      {error && (
        <div className="mb-2 px-2.5 py-1.5 rounded text-[11px] flex items-center justify-between" style={{ background: `${palette.primary}12`, color: palette.primary, border: `1px solid ${palette.primary}30` }}>
          <span>{error}</span>
          <button onClick={() => setError(null)}><X className="w-3 h-3" /></button>
        </div>
      )}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((a) => (
            <div key={a.id} className="flex items-center gap-2 px-2 py-1 rounded" style={{ border: `1px solid ${palette.border}`, background: palette.surface2 }}>
              <span style={{ fontSize: "11px", color: palette.ink, fontFamily: "'DM Sans', sans-serif" }}>{a.filename}</span>
              <span style={{ fontSize: "10px", color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{fmtSize(a.sizeBytes)}</span>
              <button onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}><X className="w-3 h-3" style={{ color: palette.muted }} /></button>
            </div>
          ))}
        </div>
      )}
      <textarea
        ref={taRef}
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write a message… (type / for templates, ⌘↵ to send)"
        rows={2}
        className="w-full resize-none outline-none px-1 py-2"
        style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: palette.ink,
          background: "transparent", minHeight: "44px", maxHeight: "240px",
          lineHeight: 1.55,
        }}
      />
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <input ref={fileRef} type="file" hidden accept={ALLOWED_MIME.join(",")} multiple onChange={(e) => onFilePick(e.target.files)} />
          <button onClick={() => fileRef.current?.click()} className="w-7 h-7 rounded flex items-center justify-center hover:bg-black/[0.03]" aria-label="Attach"><Paperclip className="w-3.5 h-3.5" style={{ color: palette.muted }} /></button>
          <button onClick={() => { setCannedOpen(true); setCannedQuery(""); }} className="h-7 px-2 rounded flex items-center gap-1 hover:bg-black/[0.03]" aria-label="Templates">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: palette.muted }}>/</span>
            <span style={{ fontSize: "11px", color: palette.muted }}>Canned</span>
          </button>
          <button onClick={() => setBody((b) => b + "**bold**")} className="w-7 h-7 rounded flex items-center justify-center hover:bg-black/[0.03]" aria-label="Bold"><Bold className="w-3.5 h-3.5" style={{ color: palette.muted }} /></button>
          <button onClick={() => setBody((b) => b + "*italic*")} className="w-7 h-7 rounded flex items-center justify-center hover:bg-black/[0.03]" aria-label="Italic"><Italic className="w-3.5 h-3.5" style={{ color: palette.muted }} /></button>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10.5px", color: palette.muted }}>⌘↵ to send</span>
          <button
            onClick={doSend}
            disabled={sending || !body.trim()}
            className="h-8 px-4 rounded-full text-[12px] text-white disabled:opacity-50"
            style={{ background: palette.primary }}
          >{sending ? "Sending…" : "Send"}</button>
        </div>
      </div>

      {cannedOpen && filteredCanned.length > 0 && patient && (
        <div className="absolute left-6 md:left-10 bottom-full mb-2 min-w-[280px] max-w-[420px] rounded-xl p-1 z-20" style={{ background: palette.solid, border: `1px solid ${palette.border}`, boxShadow: "0 8px 28px rgba(30,20,24,0.08)" }}>
          {filteredCanned.map((c) => (
            <button key={c.id} onClick={() => insertCanned(c.id)} className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-black/[0.03]">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: palette.primary }}>{c.shortcut}</span>
                <span style={{ fontSize: "12.5px", color: palette.ink }}>{c.title}</span>
              </div>
              <div className="truncate mt-0.5" style={{ fontSize: "11px", color: palette.muted }}>{interpolate(c.body, patient).slice(0, 100)}</div>
            </button>
          ))}
        </div>
      )}

      {showShortcuts && <ShortcutsSheet onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}

function ShortcutsSheet({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ["⌘↵", "Send message"],
    ["⌘/", "Show shortcuts"],
    ["j / k", "Next / previous thread"],
    ["s", "Bookmark thread"],
    ["e", "Archive thread"],
    ["Esc", "Close popover"],
    ["/", "Open canned responses"],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative rounded-2xl p-5 w-full max-w-md" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "15px", color: palette.ink }}>Keyboard shortcuts</span>
          <button onClick={onClose}><X className="w-4 h-4" style={{ color: palette.muted }} /></button>
        </div>
        <div className="space-y-1.5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span style={{ fontSize: "12px", color: palette.ink }}>{v}</span>
              <span className="px-2 py-0.5 rounded" style={{ background: palette.surface2, fontFamily: "'DM Mono', monospace", fontSize: "11px", color: palette.muted }}>{k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
