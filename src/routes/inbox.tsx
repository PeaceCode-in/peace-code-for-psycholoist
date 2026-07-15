import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import {
  useCategoryItems, useCategoryCounts, useNotifs, useNotificationTicker, useUndo,
  markRead, archive, snooze, unarchive, unsnooze, convertToTask,
  bulkArchive, bulkSnooze, pushUndo, snoozeOptions,
  relTime, absTime, categoryLabel,
  type InboxCategoryKey, type Notification, type NotifSeverity,
} from "@/lib/notifications-store";
import { SeverityGlyph, severityDot } from "@/components/practice/notifications/BellPeek";
import {
  Archive, Clock, Reply, CheckCheck, MailOpen, Mail, ListTodo,
  Sun, Users as UsersIcon, MessagesSquare, Receipt, Server, UsersRound, AlertOctagon, Undo2, X,
} from "lucide-react";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title: "Inbox — PeaceCode · Practice" },
      { name: "description", content: "Every alert that needs your attention, in one calm place." },
    ],
  }),
  component: InboxPage,
});

const CAT_ORDER: InboxCategoryKey[] = ["today","needs","sessions","patients","billing","team","system","archived","snoozed"];

const CAT_ICON: Record<InboxCategoryKey, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  today: Sun, needs: Reply, sessions: MessagesSquare, patients: UsersIcon,
  billing: Receipt, team: UsersRound, system: Server, archived: Archive, snoozed: Clock,
};

function InboxPage() {
  useNotificationTicker();
  const [cat, setCat] = useState<InboxCategoryKey>("today");
  const items = useCategoryItems(cat);
  const counts = useCategoryCounts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [multi, setMulti] = useState<Set<string>>(new Set());
  const [snoozeFor, setSnoozeFor] = useState<string | "bulk" | null>(null);

  useEffect(() => {
    if (!selectedId && items.length > 0) setSelectedId(items[0].id);
    if (selectedId && !items.find((i) => i.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
  }, [items, selectedId]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const toggleMulti = useCallback((id: string) => {
    setMulti((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);
  const clearMulti = useCallback(() => setMulti(new Set()), []);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const cur = selectedId;
      const currentIdx = items.findIndex((i) => i.id === cur);
      switch (e.key.toLowerCase()) {
        case "j": {
          const next = items[Math.min(items.length - 1, currentIdx + 1)];
          if (next) setSelectedId(next.id);
          e.preventDefault();
          break;
        }
        case "k": {
          const prev = items[Math.max(0, currentIdx - 1)];
          if (prev) setSelectedId(prev.id);
          e.preventDefault();
          break;
        }
        case "x": {
          if (cur) { toggleMulti(cur); e.preventDefault(); }
          break;
        }
        case "e": {
          const ids = multi.size > 0 ? Array.from(multi) : cur ? [cur] : [];
          if (ids.length) {
            const snapshot = ids.map((id) => items.find((i) => i.id === id)!).filter(Boolean);
            bulkArchive(ids);
            pushUndo(`Archived ${ids.length} item${ids.length > 1 ? "s" : ""}`,
              () => { snapshot.forEach((n) => unarchive(n.id)); });
            clearMulti();
          }
          e.preventDefault();
          break;
        }
        case "s": {
          if (cur || multi.size > 0) { setSnoozeFor(multi.size > 0 ? "bulk" : cur); e.preventDefault(); }
          break;
        }
        case "u": {
          if (cur) { markRead(cur, false); e.preventDefault(); }
          break;
        }
        case "t": {
          if (cur) {
            convertToTask(cur);
            pushUndo("Converted to task", () => { /* soft — leave */ });
            e.preventDefault();
          }
          break;
        }
        case "escape": {
          clearMulti(); setSnoozeFor(null);
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, selectedId, multi, toggleMulti, clearMulti]);

  const doSnooze = (until: number) => {
    if (snoozeFor === "bulk") {
      const ids = Array.from(multi);
      bulkSnooze(ids, until);
      pushUndo(`Snoozed ${ids.length} items`, () => { ids.forEach(unsnooze); });
      clearMulti();
    } else if (snoozeFor) {
      snooze(snoozeFor, until);
      pushUndo("Snoozed", () => unsnooze(snoozeFor));
    }
    setSnoozeFor(null);
  };

  return (
    <AppShell crumb="Inbox">
      <div className="flex h-[calc(100vh-56px)] min-h-0">
        {/* Category rail */}
        <aside
          className="hidden md:flex flex-col w-[220px] shrink-0 border-r overflow-y-auto"
          style={{ borderColor: palette.border, background: "#FCF9FA" }}
        >
          <div className="px-5 pt-6 pb-4">
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink, lineHeight: 1.1 }}>
              Inbox
            </div>
            <div
              className="mt-1 uppercase"
              style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}
            >
              a calm triage
            </div>
          </div>
          <nav className="flex-1 px-2 space-y-0.5">
            {CAT_ORDER.map((k) => {
              const active = cat === k;
              const Icon = CAT_ICON[k];
              return (
                <button
                  key={k}
                  onClick={() => { setCat(k); clearMulti(); }}
                  className="w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-left transition-colors"
                  style={{
                    background: active ? palette.soft : "transparent",
                    color: active ? palette.primary : palette.ink,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  <span className="flex-1 text-[13px]" style={{ fontWeight: active ? 500 : 400 }}>
                    {categoryLabel(k)}
                  </span>
                  {counts[k] > 0 && (
                    <span
                      className="tabular-nums text-[10.5px]"
                      style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: active ? palette.primary : palette.muted }}
                    >
                      {counts[k]}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t space-y-1" style={{ borderColor: palette.border }}>
            <Link to="/inbox/tasks" className="w-full flex items-center gap-2 px-3 h-9 rounded-lg text-[13px]"
              style={{ color: palette.ink, background: palette.surface }}>
              <ListTodo className="w-3.5 h-3.5" /> Tasks
            </Link>
            <Link to="/inbox/daily-brief" className="w-full flex items-center gap-2 px-3 h-9 rounded-lg text-[13px]"
              style={{ color: palette.ink, background: palette.surface }}>
              <Sun className="w-3.5 h-3.5" /> Daily brief
            </Link>
            <Link to="/settings/notifications" className="w-full flex items-center gap-2 px-3 h-9 rounded-lg text-[13px]"
              style={{ color: palette.muted }}>
              Preferences
            </Link>
          </div>
        </aside>

        {/* Thread list */}
        <section className="flex-1 min-w-0 flex flex-col border-r" style={{ borderColor: palette.border, background: "#fff" }}>
          <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: palette.border }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, color: palette.ink }}>{categoryLabel(cat)}</div>
              <div
                className="uppercase"
                style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 9.5, letterSpacing: "0.16em", color: palette.muted }}
              >
                {items.length} {items.length === 1 ? "item" : "items"}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {multi.size > 0 && (
                <>
                  <span className="text-[10.5px] uppercase tracking-[0.14em] mr-2"
                    style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    {multi.size} selected
                  </span>
                  <ToolbarButton icon={<Clock className="w-3.5 h-3.5" />} label="Snooze" onClick={() => setSnoozeFor("bulk")} />
                  <ToolbarButton icon={<Archive className="w-3.5 h-3.5" />} label="Archive" onClick={() => {
                    const ids = Array.from(multi);
                    const snap = ids.map((id) => items.find((i) => i.id === id)!).filter(Boolean);
                    bulkArchive(ids);
                    pushUndo(`Archived ${ids.length}`, () => snap.forEach((n) => unarchive(n.id)));
                    clearMulti();
                  }} />
                  <ToolbarButton icon={<X className="w-3.5 h-3.5" />} label="Clear" onClick={clearMulti} />
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <EmptyState cat={cat} />
            ) : (
              items.map((n) => (
                <ThreadRow
                  key={n.id}
                  n={n}
                  selected={selectedId === n.id}
                  checked={multi.has(n.id)}
                  onSelect={() => { setSelectedId(n.id); if (!n.readAt) markRead(n.id, true); }}
                  onCheck={() => toggleMulti(n.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* Detail pane */}
        <section className="hidden lg:flex flex-col w-[420px] shrink-0 overflow-y-auto" style={{ background: "#FCF9FA" }}>
          {selected ? (
            <DetailPane n={selected} onSnooze={() => setSnoozeFor(selected.id)} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center px-8" style={{ color: palette.muted }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: palette.ink }}>
                  Nothing selected.
                </div>
                <div className="text-[12.5px] mt-2">Choose an item on the left, or press <kbd>J</kbd>/<kbd>K</kbd> to move.</div>
              </div>
            </div>
          )}
        </section>
      </div>

      {snoozeFor && (
        <SnoozePicker onClose={() => setSnoozeFor(null)} onPick={doSnooze} />
      )}
      <UndoBar />
      <KeyboardHint />
    </AppShell>
  );
}

function ToolbarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11.5px]"
      style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink }}
    >
      {icon} {label}
    </button>
  );
}

function ThreadRow({ n, selected, checked, onSelect, onCheck }: {
  n: Notification; selected: boolean; checked: boolean;
  onSelect: () => void; onCheck: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="group px-5 py-3.5 border-b cursor-pointer transition-colors flex gap-3"
      style={{
        borderColor: palette.border,
        background: selected ? "rgba(198,127,132,0.06)" : checked ? "rgba(198,127,132,0.03)" : "transparent",
        borderLeft: selected ? `2px solid ${palette.primary}` : "2px solid transparent",
      }}
    >
      <div
        onClick={(e) => { e.stopPropagation(); onCheck(); }}
        className="mt-1 w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0"
        style={{
          borderColor: checked ? palette.primary : palette.border,
          background: checked ? palette.primary : "transparent",
        }}
        aria-label={checked ? "Deselect" : "Select"}
      >
        {checked && <CheckCheck className="w-2.5 h-2.5 text-white" />}
      </div>
      <SeverityGlyph s={n.severity} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="truncate"
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 14,
              color: palette.ink,
              fontWeight: n.readAt ? 400 : 600,
              maxWidth: "70%",
            }}
          >
            {n.source}
          </span>
          <span className="text-[11.5px] truncate" style={{ color: palette.muted }}>
            {n.title}
          </span>
          <span
            className="ml-auto tabular-nums shrink-0"
            style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, color: palette.muted }}
            title={absTime(n.timestamp)}
          >
            {relTime(n.timestamp)}
          </span>
        </div>
        <div className="text-[12.5px] mt-1 truncate" style={{ color: n.readAt ? palette.muted : palette.ink, opacity: n.readAt ? 0.8 : 1 }}>
          {n.preview}
        </div>
      </div>
    </div>
  );
}

function DetailPane({ n, onSnooze }: { n: Notification; onSnooze: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="p-6 flex-1">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="uppercase px-2 py-0.5 rounded-full"
          style={{
            fontFamily: "'DM Mono', ui-monospace, monospace",
            fontSize: 9.5, letterSpacing: "0.18em",
            background: "rgba(255,255,255,0.7)",
            border: `1px solid ${palette.border}`,
            color: severityDot(n.severity),
          }}
        >
          {n.severity}
        </span>
        <span className="tabular-nums" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, color: palette.muted }}>
          {absTime(n.timestamp)}
        </span>
      </div>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, color: palette.ink, lineHeight: 1.15 }}>
        {n.title}
      </h2>
      <div className="mt-1 text-[12px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        from {n.source}
      </div>
      <div className="mt-6 text-[14px] leading-relaxed" style={{ color: palette.ink }}>
        {n.body ?? n.preview}
      </div>

      {n.meta && Object.keys(n.meta).length > 0 && (
        <div className="mt-6 rounded-xl p-3.5" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
          {Object.entries(n.meta).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1 text-[12px]">
              <span className="uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {k}
              </span>
              <span className="tabular-nums" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          onClick={() => navigate({ to: n.deepLink })}
          className="h-9 px-4 rounded-full text-[12.5px] text-white"
          style={{ background: palette.primary }}
        >
          Open in context
        </button>
        {(n.type === "patient_message" || n.type === "supervisor_comment") && (
          <button onClick={() => navigate({ to: n.deepLink })} className="h-9 px-4 rounded-full text-[12.5px] flex items-center gap-1.5"
            style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>
            <Reply className="w-3.5 h-3.5" /> Reply
          </button>
        )}
        <button onClick={onSnooze} className="h-9 px-4 rounded-full text-[12.5px] flex items-center gap-1.5"
          style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>
          <Clock className="w-3.5 h-3.5" /> Snooze
        </button>
        <button onClick={() => {
          const snap = { ...n };
          archive(n.id);
          pushUndo("Archived", () => unarchive(snap.id));
        }} className="h-9 px-4 rounded-full text-[12.5px] flex items-center gap-1.5"
          style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>
          <Archive className="w-3.5 h-3.5" /> Archive
        </button>
        <button onClick={() => { markRead(n.id, false); }} className="h-9 px-4 rounded-full text-[12.5px] flex items-center gap-1.5"
          style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>
          <Mail className="w-3.5 h-3.5" /> Mark unread
        </button>
        <button onClick={() => { convertToTask(n.id); pushUndo("Converted to task", () => {}); }} className="h-9 px-4 rounded-full text-[12.5px] flex items-center gap-1.5"
          style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>
          <ListTodo className="w-3.5 h-3.5" /> Convert to task
        </button>
      </div>
    </div>
  );
}

function SnoozePicker({ onClose, onPick }: { onClose: () => void; onPick: (at: number) => void }) {
  const opts = snoozeOptions();
  const [custom, setCustom] = useState<string>("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/25" />
      <div
        className="relative rounded-2xl w-full max-w-sm overflow-hidden"
        style={{ background: "#fff", border: `1px solid ${palette.border}`, boxShadow: "0 20px 60px rgba(30,20,24,0.18)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: palette.ink }}>Snooze until…</div>
          <div className="uppercase mt-1" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 9.5, letterSpacing: "0.18em", color: palette.muted }}>
            it comes back at the right moment
          </div>
        </div>
        <div className="border-t" style={{ borderColor: palette.border }}>
          {opts.map((o) => (
            <button key={o.label} onClick={() => onPick(o.at)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-black/[0.03] transition-colors"
              style={{ color: palette.ink }}>
              <span className="text-[13.5px]" style={{ fontFamily: "'Fraunces', serif" }}>{o.label}</span>
              <span className="tabular-nums text-[11px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>
                {new Date(o.at).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
              </span>
            </button>
          ))}
          <div className="px-5 py-4 border-t" style={{ borderColor: palette.border, background: "#FCF9FA" }}>
            <label className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Custom</label>
            <div className="mt-2 flex gap-2">
              <input
                type="datetime-local"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="flex-1 h-9 px-2 rounded-lg text-[12.5px] bg-white outline-none"
                style={{ border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}
              />
              <button
                disabled={!custom}
                onClick={() => onPick(new Date(custom).getTime())}
                className="h-9 px-3 rounded-lg text-[12px] text-white disabled:opacity-40"
                style={{ background: palette.primary }}
              >
                Snooze
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UndoBar() {
  const { action, run, dismiss } = useUndo();
  if (!action) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-full"
        style={{ background: palette.ink, color: "#fff", boxShadow: "0 12px 40px rgba(0,0,0,0.24)" }}
      >
        <span className="text-[12.5px]" style={{ fontFamily: "'Fraunces', serif" }}>{action.message}</span>
        <button onClick={run} className="h-7 px-3 rounded-full flex items-center gap-1 text-[11.5px]"
          style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}>
          <Undo2 className="w-3 h-3" /> Undo
        </button>
        <button onClick={dismiss} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.7)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ cat }: { cat: InboxCategoryKey }) {
  const msg = ({
    today: { h: "Inbox zero.", s: "Rare and precious." },
    needs: { h: "Nothing waiting on you.", s: "Take a breath." },
    sessions: { h: "No session pings.", s: "The calendar is quiet." },
    patients: { h: "No new patient activity.", s: "" },
    billing: { h: "The books are current.", s: "" },
    team: { h: "No team notes.", s: "" },
    system: { h: "All systems steady.", s: "" },
    archived: { h: "Nothing archived yet.", s: "" },
    snoozed: { h: "Nothing snoozed.", s: "You keep a clean deck." },
  })[cat];
  return (
    <div className="flex-1 flex items-center justify-center py-24 text-center">
      <div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink }}>{msg.h}</div>
        {msg.s && <div className="mt-1 text-[13px]" style={{ color: palette.muted }}>{msg.s}</div>}
      </div>
    </div>
  );
}

function KeyboardHint() {
  return (
    <div
      className="hidden xl:flex fixed bottom-4 right-4 z-40 items-center gap-3 px-3 py-2 rounded-full"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${palette.border}`,
        color: palette.muted,
        fontFamily: "'DM Mono', ui-monospace, monospace",
        fontSize: 10.5,
      }}
    >
      <span><kbd>J</kbd>/<kbd>K</kbd> move</span>
      <span><kbd>X</kbd> select</span>
      <span><kbd>E</kbd> archive</span>
      <span><kbd>S</kbd> snooze</span>
      <span><kbd>T</kbd> task</span>
    </div>
  );
}
