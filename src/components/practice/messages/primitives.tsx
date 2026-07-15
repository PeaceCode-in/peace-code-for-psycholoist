// PeaceCode · Messages primitives — safe markdown, avatars, formatting.
import type { ReactNode } from "react";
import { getPatient } from "@/lib/patients-store";
import { avatarUrl } from "@/lib/patients-store";
import { THERAPIST_ID, THERAPIST_NAME } from "@/lib/messages-store";
import { palette } from "@/components/practice/palette";

/** Minute-precision timestamp: "Thu 3:42 PM" or "Oct 12, 3:42 PM" if >6d. */
export function fmtTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = (now.getTime() - d.getTime()) / 86400_000;
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  if (diffDays < 1 && d.getDate() === now.getDate()) return time;
  if (diffDays < 7) return `${d.toLocaleDateString("en-IN", { weekday: "short" })} ${time}`;
  return `${d.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}, ${time}`;
}
/** Short relative for inbox rows: "3m", "2h", "Thu", "Oct 12". */
export function fmtRelative(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24 && d.getDate() === now.getDate()) return `${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return d.toLocaleDateString("en-IN", { weekday: "short" });
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
export function fmtDayDivider(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, now)) return "Today";
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (same(d, y)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
}
export function fmtAuditTime(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().replace("T", " ").slice(0, 19);
}
export function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function senderName(senderId: string, senderRole: string): string {
  if (senderRole === "therapist") return THERAPIST_NAME;
  if (senderRole === "system") return "System";
  const p = getPatient(senderId);
  return p?.preferredName ?? p?.fullName ?? "Patient";
}
export function senderAvatarUrl(senderId: string, senderRole: string): string {
  if (senderRole === "therapist") return avatarUrl(THERAPIST_ID);
  return avatarUrl(senderId);
}

/**
 * Safe markdown renderer — supports bold, italic, code, unordered/ordered lists,
 * links (http/https/mailto only), line breaks. Everything else is escaped.
 * No dangerouslySetInnerHTML anywhere in the pipeline.
 */
export function renderMarkdown(input: string): ReactNode {
  const lines = input.split("\n");
  const blocks: ReactNode[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    const Tag = listBuffer.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`list-${blocks.length}`} className={listBuffer.ordered ? "list-decimal pl-5 space-y-1 my-1" : "list-disc pl-5 space-y-1 my-1"}>
        {listBuffer.items.map((it, i) => <li key={i}>{renderInline(it)}</li>)}
      </Tag>
    );
    listBuffer = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const ol = /^\s*\d+\.\s+(.*)/.exec(line);
    const ul = /^\s*[-*]\s+(.*)/.exec(line);
    if (ol) {
      if (!listBuffer || !listBuffer.ordered) { flushList(); listBuffer = { ordered: true, items: [] }; }
      listBuffer.items.push(ol[1]);
    } else if (ul) {
      if (!listBuffer || listBuffer.ordered) { flushList(); listBuffer = { ordered: false, items: [] }; }
      listBuffer.items.push(ul[1]);
    } else if (line.trim() === "") {
      flushList();
      blocks.push(<div key={`sp-${blocks.length}`} className="h-2" />);
    } else {
      flushList();
      blocks.push(<p key={`p-${blocks.length}`} className="whitespace-pre-wrap">{renderInline(line)}</p>);
    }
  }
  flushList();
  return <div className="space-y-1">{blocks}</div>;
}

function renderInline(text: string): ReactNode {
  // Tokenize: **bold**, *italic*, `code`, [text](url)
  const parts: ReactNode[] = [];
  let i = 0;
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > i) parts.push(<span key={key++}>{text.slice(i, match.index)}</span>);
    if (match[1]) parts.push(<strong key={key++}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={key++}>{match[4]}</em>);
    else if (match[5]) parts.push(<code key={key++} className="px-1 rounded" style={{ background: palette.surface2, fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{match[6]}</code>);
    else if (match[7]) {
      const href = match[9];
      if (/^(https?:|mailto:)/i.test(href)) {
        parts.push(<a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: palette.primary }}>{match[8]}</a>);
      } else {
        parts.push(<span key={key++}>{match[8]}</span>);
      }
    }
    i = regex.lastIndex;
  }
  if (i < text.length) parts.push(<span key={key++}>{text.slice(i)}</span>);
  return <>{parts}</>;
}

export function Avatar({ id, role, size = 32 }: { id: string; role: string; size?: number }) {
  const url = senderAvatarUrl(id, role);
  const name = senderName(id, role);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 text-white"
      style={{
        width: size, height: size,
        background: role === "therapist" ? palette.primary : palette.muted,
        fontSize: size * 0.36, fontFamily: "'Fraunces', serif",
      }}
    >
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : initials}
    </div>
  );
}

export function LabelChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{
        fontFamily: "'DM Mono', monospace", fontSize: "10px",
        background: palette.surface2, color: palette.muted, border: `1px solid ${palette.border}`,
      }}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="opacity-60 hover:opacity-100" aria-label={`Remove label ${label}`}>×</button>
      )}
    </span>
  );
}
