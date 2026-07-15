import type { ReactNode } from "react";
import { palette } from "@/components/practice/palette";
import { STATUS_META, CATEGORY_META, type InstanceStatus, type DocCategory } from "@/lib/documents-store";

export function StatusPill({ status }: { status: InstanceStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] text-[10.5px]"
      style={{ background: m.soft, color: m.token, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.06em" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.token }} />
      {m.label.toLowerCase()}
    </span>
  );
}

export function CategoryChip({ category }: { category: DocCategory }) {
  const m = CATEGORY_META[category];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-[2px]"
      style={{ background: palette.surface2, color: palette.muted, border: `1px solid ${palette.border}`, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase" }}
    >
      {m.label}
    </span>
  );
}

// The "glass paper" thumbnail — a document card with faint ruled lines
export function PaperThumbnail({ category, title, subtitle, children, size = "md" }: {
  category: DocCategory;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const h = size === "sm" ? 160 : size === "lg" ? 320 : 220;
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{
        height: h,
        background: "linear-gradient(180deg, #FEFCFB 0%, #FAF6F5 100%)",
        border: `1px solid ${palette.border}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.7) inset, 0 12px 32px -18px rgba(30,20,24,0.18)",
      }}
    >
      {/* faint ruled lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <pattern id="ruled" x="0" y="0" width="100%" height="24" patternUnits="userSpaceOnUse">
            <line x1="0" y1="23.5" x2="100%" y2="23.5" stroke={palette.border} strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="40" width="100%" height="100%" fill="url(#ruled)" />
      </svg>
      {/* left margin line */}
      <span className="absolute left-8 top-0 bottom-0" style={{ width: 1, background: "rgba(198,127,132,0.28)" }} />
      <div className="relative h-full flex flex-col p-4">
        <div className="flex items-center justify-between">
          <CategoryChip category={category} />
          <span className="text-[9.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            document
          </span>
        </div>
        <div className="mt-6 pl-6 pr-2">
          <div
            className="leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: size === "sm" ? 14 : 17 }}
          >
            {title}
          </div>
          {subtitle && (
            <div className="mt-1 text-[11.5px]" style={{ color: palette.muted }}>{subtitle}</div>
          )}
        </div>
        <div className="mt-auto">{children}</div>
      </div>
    </div>
  );
}

export function AuditIcon({ action }: { action: string }) {
  const map: Record<string, string> = {
    created: "○", sent: "→", delivered: "↓", viewed: "◐", signed: "✓",
    countersigned: "✓✓", downloaded: "↧", voided: "✕", amended: "⤴", expired: "◌", archived: "◇",
  };
  return (
    <span
      className="inline-flex w-5 h-5 rounded-full items-center justify-center shrink-0"
      style={{ background: palette.surface2, color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10 }}
    >
      {map[action] ?? "·"}
    </span>
  );
}

export function EmptyPaper({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-16 text-center">
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink }}>{title}</div>
      {hint && <div className="mt-2 text-[13px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>{hint}</div>}
    </div>
  );
}

// Signature-drawing canvas with variable stroke width (velocity-driven)
import { useEffect, useRef, useState } from "react";

export function SignatureCanvas({ onChange, height = 160 }: { onChange: (dataUrl: string | null) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const last = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = palette.ink;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const point = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setDrawing(true);
    last.current = point(e);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const p = point(e);
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const l = last.current!;
    const dx = p.x - l.x, dy = p.y - l.y;
    const dist = Math.hypot(dx, dy);
    const dt = Math.max(1, p.t - l.t);
    const speed = dist / dt;                    // px/ms
    const width = Math.max(0.7, 2.4 - speed * 1.4);
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const onUp = () => {
    setDrawing(false);
    last.current = null;
    const c = canvasRef.current!;
    onChange(c.toDataURL("image/png"));
  };
  const clear = () => {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    onChange(null);
  };
  return (
    <div className="rounded-xl p-3" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ width: "100%", height, touchAction: "none", cursor: "crosshair", display: "block" }}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10.5px] uppercase tracking-[0.18em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          sign above
        </span>
        <button onClick={clear} className="text-[11px]" style={{ color: palette.muted }}>Clear</button>
      </div>
    </div>
  );
}
