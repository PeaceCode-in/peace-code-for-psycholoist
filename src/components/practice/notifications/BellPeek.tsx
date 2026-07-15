import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { useHydrated } from "@/lib/use-hydrated";
import {
  useRecent, useUnreadCount, useHasUrgent, relTime, markRead, markAllRead,
  type Notification, type NotifSeverity,
} from "@/lib/notifications-store";
import { Bell } from "lucide-react";

export function severityDot(s: NotifSeverity): string {
  if (s === "urgent") return palette.primary;
  if (s === "attention") return "#C9A46A";
  return "#B7ADB0";
}

export function SeverityGlyph({ s }: { s: NotifSeverity }) {
  const color = severityDot(s);
  if (s === "urgent") {
    return (
      <span className="relative inline-flex w-2 h-2 mt-1.5 shrink-0">
        <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: color }} />
        <span className="relative w-2 h-2 rounded-full" style={{ background: color }} />
      </span>
    );
  }
  return <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color }} />;
}

export function BellPeek() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const rawUnread = useUnreadCount();
  const rawUrgent = useHasUrgent();
  const recent = useRecent(5);
  const unread = hydrated ? rawUnread : 0;
  const urgent = hydrated ? rawUrgent : false;

  // outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // keyboard shortcut: g then i
  useEffect(() => {
    let waiting = false; let timer: number | null = null;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === "g") {
        waiting = true;
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => { waiting = false; }, 900);
      } else if (waiting && e.key.toLowerCase() === "i") {
        waiting = false;
        window.location.assign("/inbox");
      } else {
        waiting = false;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center relative"
        style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="w-3.5 h-3.5" />
        {unread > 0 && (
          <span
            className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full"
            style={{ background: urgent ? palette.primary : "#C9A46A" }}
          />
        )}
        {urgent && (
          <span
            className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full animate-ping opacity-70"
            style={{ background: palette.primary }}
          />
        )}
      </button>
      {open && (
        <div
          ref={wrapRef}
          role="dialog"
          aria-label="Recent notifications"
          className="absolute right-0 top-full mt-2 z-50 w-[380px] rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,251,252,0.96)",
            backdropFilter: "blur(24px) saturate(140%)",
            border: `1px solid ${palette.border}`,
            boxShadow: "0 12px 40px rgba(30,20,24,0.10)",
          }}
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 15 }}>
                Recent
              </div>
              <div
                className="uppercase mt-0.5"
                style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 9.5, letterSpacing: "0.16em", color: palette.muted }}
              >
                {unread > 0 ? `${unread} unread` : "all clear"}
              </div>
            </div>
            <button
              onClick={() => markAllRead(recent.map((r) => r.id))}
              className="text-[10.5px] uppercase tracking-[0.14em] px-2 py-1 rounded-md"
              style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}
            >
              Mark seen
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {recent.length === 0 && (
              <div className="px-4 py-10 text-center" style={{ color: palette.muted }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: palette.ink }}>
                  Inbox zero.
                </div>
                <div className="mt-1 text-[12px]">Rare and precious.</div>
              </div>
            )}
            {recent.map((n) => (
              <PeekRow key={n.id} n={n} onClose={() => setOpen(false)} />
            ))}
          </div>
          <div
            className="px-4 py-2.5 flex items-center justify-between border-t"
            style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}
          >
            <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>G</kbd>
              {" "}then{" "}
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>I</kbd>
            </span>
            <Link
              to="/inbox"
              onClick={() => setOpen(false)}
              className="text-[11.5px]"
              style={{ color: palette.primary, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}
            >
              View all →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function PeekRow({ n, onClose }: { n: Notification; onClose: () => void }) {
  return (
    <Link
      to={n.deepLink}
      onClick={() => { markRead(n.id, true); onClose(); }}
      className="flex gap-3 px-4 py-3 border-b transition-colors"
      style={{ borderColor: palette.border, background: n.readAt ? "transparent" : "rgba(198,127,132,0.04)" }}
    >
      <SeverityGlyph s={n.severity} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className="truncate flex-1"
            style={{
              color: palette.ink,
              fontFamily: "'Fraunces', serif",
              fontSize: 13.5,
              fontWeight: n.readAt ? 400 : 500,
            }}
          >
            {n.title}
          </span>
          <span
            className="tabular-nums shrink-0"
            style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, color: palette.muted }}
            title={new Date(n.timestamp).toLocaleString()}
          >
            {relTime(n.timestamp)}
          </span>
        </div>
        <div className="text-[12px] mt-0.5 truncate" style={{ color: palette.muted }}>
          {n.preview}
        </div>
      </div>
    </Link>
  );
}

export function UndoBar() {
  // rendered by inbox route separately
  return null;
}
