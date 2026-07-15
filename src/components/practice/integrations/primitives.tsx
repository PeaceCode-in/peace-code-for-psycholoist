import { type ReactNode, useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { ix } from "./tokens";

export function MaskedField({ value, label }: { value: string; label?: string }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const masked = value.length > 8 ? value.slice(0, 4) + "•".repeat(Math.min(24, value.length - 8)) + value.slice(-4) : "•".repeat(value.length);

  return (
    <div className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5" style={{ borderColor: ix.border, background: ix.paper }}>
      {label ? <span className="mr-2 text-[11px] uppercase" style={{ color: ix.muted, letterSpacing: 0.8 }}>{label}</span> : null}
      <code className="min-w-0 truncate text-[13px]" style={{ fontFamily: ix.mono, color: ix.ink }}>
        {shown ? value : masked}
      </code>
      <button onClick={() => setShown(v => !v)} className="ml-1 rounded p-1 text-[11px]" style={{ color: ix.muted }} aria-label={shown ? "Hide" : "Reveal"}>
        {shown ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.6} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.6} />}
      </button>
      <button
        onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
        className="rounded p-1" style={{ color: copied ? ix.sage : ix.muted }}
        aria-label="Copy"
      >
        {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />}
      </button>
    </div>
  );
}

export function CopyRow({ value, mono = true }: { value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
      className="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left"
      style={{ borderColor: ix.border, background: ix.paper }}
    >
      <code className="min-w-0 truncate text-[12.5px]" style={{ fontFamily: mono ? ix.mono : "inherit", color: ix.ink }}>{value}</code>
      <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: copied ? ix.sage : ix.muted }}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[13px] uppercase" style={{ color: ix.muted, letterSpacing: 1.2 }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
