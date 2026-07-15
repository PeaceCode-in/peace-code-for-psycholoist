import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Star, Archive, AlertOctagon, Inbox } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLiveThreads, ensureSeededWithPatients, type Thread } from "@/lib/messages-store";
import { getPatient } from "@/lib/patients-store";
import { Avatar, fmtRelative, LabelChip } from "@/components/practice/messages/primitives";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/messages/")({
  head: () => ({ meta: [{ title: "Inbox — Messages · PeaceCode" }] }),
  component: MessagesIndex,
});

type Filter = "all" | "unread" | "starred" | "archived" | "urgent";

function MessagesIndex() {
  const hydrated = useHydrated();
  useEffect(() => { if (hydrated) ensureSeededWithPatients(); }, [hydrated]);
  return (
    <AppShell>
      <div className="flex h-[calc(100dvh-32px)]">
        <ThreadList activeId={undefined} />
        <EmptyPane />
      </div>
    </AppShell>
  );
}

export function ThreadList({ activeId }: { activeId?: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const threads = useLiveThreads({ filter, search });
  const navigate = useNavigate();

  // ⌘K focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        (document.getElementById("msg-search") as HTMLInputElement | null)?.focus();
      }
      // j/k thread navigation
      if (!activeId) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const idx = threads.findIndex((t) => t.id === activeId);
      if (e.key === "j" && idx < threads.length - 1) navigate({ to: "/messages/$threadId", params: { threadId: threads[idx + 1].id } });
      if (e.key === "k" && idx > 0) navigate({ to: "/messages/$threadId", params: { threadId: threads[idx - 1].id } });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [threads, activeId, navigate]);

  return (
    <aside
      className="w-[320px] shrink-0 flex flex-col border-r hidden md:flex"
      style={{ borderColor: palette.border, background: palette.surface }}
    >
      <div className="p-3 border-b" style={{ borderColor: palette.border }}>
        <div className="flex items-center justify-between mb-2.5">
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: "16px", color: palette.ink }}>Messages</span>
          <Link
            to="/messages/compose"
            className="flex items-center gap-1 h-7 px-2.5 rounded-full text-white text-[11px]"
            style={{ background: palette.primary }}
          >
            <Plus className="w-3 h-3" /> Compose
          </Link>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
          <input
            id="msg-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full h-8 pl-8 pr-12 text-[12px] rounded-lg outline-none"
            style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}
          />
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[9.5px]"
            style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}
          >⌘K</span>
        </div>
        <div className="flex gap-1 mt-2.5 overflow-x-auto no-scrollbar">
          {(["all", "unread", "starred", "urgent", "archived"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2 h-6 rounded-full text-[10.5px] shrink-0"
              style={{
                background: filter === f ? palette.ink : "transparent",
                color: filter === f ? "#fff" : palette.muted,
                border: `1px solid ${filter === f ? palette.ink : palette.border}`,
              }}
            >{f[0].toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-8 text-center" style={{ color: palette.muted, fontSize: "12px" }}>No conversations.</div>
        ) : threads.map((t) => (
          <ThreadRow key={t.id} thread={t} active={t.id === activeId} />
        ))}
      </div>
    </aside>
  );
}

function ThreadRow({ thread, active }: { thread: Thread; active: boolean }) {
  const p = getPatient(thread.patientId);
  const unread = thread.unreadCount > 0;
  return (
    <Link
      to="/messages/$threadId"
      params={{ threadId: thread.id }}
      className="block px-3 py-2.5 border-b transition-colors"
      style={{
        borderColor: palette.border,
        background: active ? palette.surface2 : "transparent",
        borderLeft: active ? `2px solid ${palette.primary}` : "2px solid transparent",
      }}
    >
      <div className="flex gap-2.5">
        <Avatar id={thread.patientId} role="patient" size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className="truncate"
              style={{
                fontFamily: "'Fraunces', serif", fontSize: "13.5px",
                color: palette.ink, fontWeight: unread ? 600 : 400,
              }}
            >{p?.fullName ?? "Patient"}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10.5px", color: palette.muted }}>
              {fmtRelative(thread.lastMessageAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span
              className="truncate"
              style={{
                fontSize: "12.5px", color: palette.ink,
                fontWeight: unread ? 500 : 400,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >{thread.subject}</span>
            {unread && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: palette.primary }} />}
            {thread.isStarred && !unread && <Star className="w-3 h-3 shrink-0" style={{ color: palette.primary }} fill={palette.primary} />}
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span
              className="truncate"
              style={{ fontSize: "12px", color: palette.muted, fontFamily: "'DM Sans', sans-serif" }}
            >{thread.lastMessagePreview}</span>
            {thread.labels.length > 0 && (
              <span className="flex gap-1 shrink-0">
                {thread.labels.slice(0, 2).map((l) => <LabelChip key={l} label={l} />)}
                {thread.labels.length > 2 && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: palette.muted }}>+{thread.labels.length - 2}</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function EmptyPane() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", opacity: 0.04 }}>
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", color: palette.muted, fontStyle: "italic" }}>
        Select a conversation
      </p>
    </div>
  );
}

/* mobile-only surface for /messages */
export function MobileInboxOnly() {
  return null;
}

/* export for reuse */
export { Inbox as InboxIcon, Archive as ArchiveIcon, AlertOctagon as UrgentIcon };
