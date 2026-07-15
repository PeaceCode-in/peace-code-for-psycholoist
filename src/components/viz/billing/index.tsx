// PeaceCode · Billing viz primitives. All numbers DM Mono, all muted.
import { useEffect, useState, useMemo } from "react";
import { formatINR, INVOICE_STATUS_META, CLAIM_STATUS_META, CHART_PALETTE, type InvoiceStatus, type ClaimStatus } from "@/lib/billing-store";
import { palette } from "@/components/practice/palette";

// ─── Currency number, count-up ───────────────────────────────
export function CurrencyNumber({
  value,
  size = "md",
  animate = true,
  muted,
  className,
  withSymbol = true,
  decimals = false,
}: {
  value: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  muted?: boolean;
  className?: string;
  withSymbol?: boolean;
  decimals?: boolean;
}) {
  const [v, setV] = useState(animate ? 0 : value);
  useEffect(() => {
    if (!animate) { setV(value); return; }
    let raf = 0;
    const start = performance.now();
    const dur = 700;
    const from = 0;
    function step(t: number) {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);
  const sizeMap = { xs: "text-[10.5px]", sm: "text-[12px]", md: "text-[14px]", lg: "text-[22px]", xl: "text-[38px]" } as const;
  return (
    <span
      className={`font-mono tabular-nums tracking-tight ${sizeMap[size]} ${className ?? ""}`}
      style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: muted ? palette.muted : palette.ink }}
    >
      {formatINR(v, { withSymbol, decimals })}
    </span>
  );
}

// ─── Status pills ────────────────────────────────────────────
export function StatusPill({ status, kind = "invoice" }: { status: InvoiceStatus | ClaimStatus; kind?: "invoice" | "claim" }) {
  const meta = kind === "invoice"
    ? INVOICE_STATUS_META[status as InvoiceStatus]
    : CLAIM_STATUS_META[status as ClaimStatus];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] uppercase tracking-[0.06em]"
      style={{ background: meta.soft, color: meta.color, fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <span className="w-1 h-1 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

// ─── Stacked area chart ──────────────────────────────────────
export function StackedAreaChart({
  data,
  keys,
  height = 220,
  palette: pal = CHART_PALETTE,
}: {
  data: { month: string; byService: Record<string, number>; total: number }[];
  keys: string[];
  height?: number;
  palette?: string[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 800, H = height, padL = 56, padR = 12, padT = 12, padB = 26;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxY = Math.max(1, ...data.map((d) => d.total)) * 1.15;
  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

  // Build stacked series
  const series = useMemo(() => {
    return keys.map((k, ki) => {
      const pts = data.map((d, i) => {
        const below = keys.slice(0, ki).reduce((s, k2) => s + (d.byService[k2] ?? 0), 0);
        const val = d.byService[k] ?? 0;
        const yTop = padT + chartH - ((below + val) / maxY) * chartH;
        const yBot = padT + chartH - (below / maxY) * chartH;
        return { x: padL + i * xStep, yTop, yBot };
      });
      const top = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.yTop.toFixed(1)}`).join(" ");
      const bot = pts.slice().reverse().map((p) => `L ${p.x.toFixed(1)} ${p.yBot.toFixed(1)}`).join(" ");
      return { d: `${top} ${bot} Z`, color: pal[ki % pal.length], key: k };
    });
  }, [data, keys, chartH, chartW, xStep, pal, maxY, padT, padL]);

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => (maxY * (yTicks - i)) / yTicks);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height }}>
        {/* Y grid */}
        {yLabels.map((y, i) => {
          const yy = padT + (i / yTicks) * chartH;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={yy} y2={yy} stroke={palette.border} strokeDasharray="2 3" />
              <text x={padL - 8} y={yy + 3} fontSize="9.5" textAnchor="end" fill={palette.muted} fontFamily="'DM Mono', monospace">
                {formatINR(y, { withSymbol: false })}
              </text>
            </g>
          );
        })}
        {/* Areas */}
        {series.map((s) => (
          <path key={s.key} d={s.d} fill={s.color} opacity={0.85}>
            <animate attributeName="opacity" from="0" to="0.85" dur="0.22s" fill="freeze" />
          </path>
        ))}
        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={padL + i * xStep} y={H - 8} fontSize="9.5" textAnchor="middle" fill={palette.muted} fontFamily="'Fraunces', serif" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {d.month}
          </text>
        ))}
        {/* Hover line */}
        {hoverIdx !== null && (
          <line x1={padL + hoverIdx * xStep} x2={padL + hoverIdx * xStep} y1={padT} y2={padT + chartH} stroke={palette.ink} strokeWidth={0.5} opacity={0.4} />
        )}
        {/* Hover targets */}
        {data.map((_d, i) => (
          <rect key={i} x={padL + i * xStep - xStep / 2} y={padT} width={xStep} height={chartH} fill="transparent"
            onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} />
        ))}
      </svg>
      {hoverIdx !== null && (
        <div
          className="absolute pointer-events-none px-3 py-2 rounded-xl text-[11px]"
          style={{
            left: `calc(${((padL + hoverIdx * xStep) / W) * 100}% + 8px)`,
            top: 12,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${palette.border}`,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            minWidth: 180,
          }}
        >
          <div style={{ color: palette.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Fraunces', serif" }}>{data[hoverIdx].month}</div>
          {keys.map((k, ki) => (
            <div key={k} className="flex items-center gap-2 justify-between mt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: pal[ki % pal.length] }} />
                <span style={{ color: palette.ink }}>{k}</span>
              </span>
              <span className="font-mono tabular-nums" style={{ color: palette.ink }}>{formatINR(data[hoverIdx].byService[k] ?? 0)}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 justify-between mt-1 pt-1" style={{ borderTop: `1px solid ${palette.border}` }}>
            <span style={{ color: palette.muted }}>Total</span>
            <span className="font-mono tabular-nums" style={{ color: palette.ink }}>{formatINR(data[hoverIdx].total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Aging bars ──────────────────────────────────────────────
export function AgingBars({ buckets }: { buckets: { label: string; days: string; amount: number; count: number }[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.amount));
  const colors = ["#8AA2C8", "#C2A97E", "#B6763A", "#B0567A"];
  return (
    <div className="space-y-3">
      {buckets.map((b, i) => (
        <div key={b.label}>
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[12px]" style={{ color: palette.ink }}>{b.label}</span>
              <span className="text-[10.5px]" style={{ color: palette.muted }}>{b.count} invoice{b.count === 1 ? "" : "s"}</span>
            </div>
            <span className="font-mono tabular-nums text-[13px]" style={{ color: palette.ink, fontFamily: "'DM Mono', monospace" }}>
              {formatINR(b.amount)}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: palette.surface2 }}>
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{ width: `${(b.amount / max) * 100}%`, background: colors[i] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Payment mix donut ───────────────────────────────────────
export function PaymentMixDonut({
  segments,
  centerLabel,
  centerValue,
  size = 200,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: number;
  size?: number;
}) {
  const stroke = 22;
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let cum = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={palette.surface2} strokeWidth={stroke} />
        {segments.map((seg) => {
          const frac = seg.value / total;
          const dash = frac * c;
          const gap = c - dash;
          const offset = -cum * c;
          cum += frac;
          return (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "all 0.5s ease-out" }}
            />
          );
        })}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize="10" fill={palette.muted} fontFamily="'Fraunces', serif" style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>
          {centerLabel}
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fontSize="16" fill={palette.ink} fontFamily="'Fraunces', serif">
          {formatINR(centerValue)}
        </text>
      </svg>
      <div className="space-y-1.5 min-w-0">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-[11.5px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color }} />
            <span style={{ color: palette.ink }} className="min-w-[80px]">{seg.label}</span>
            <span className="font-mono tabular-nums ml-auto" style={{ color: palette.muted }}>{formatINR(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Payment ring ────────────────────────────────────────────
export function PaymentRing({ paid, total, size = 160 }: { paid: number; total: number; size?: number }) {
  const stroke = 14;
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.min(1, paid / total) : 0;
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    function step(t: number) { const p = Math.min(1, (t - start) / 600); setDisplay(frac * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); }
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [frac]);
  const dash = display * c;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={palette.surface2} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#7BA88A"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fontSize="26" fill={palette.ink} fontFamily="'Fraunces', serif">
        {Math.round(frac * 100)}%
      </text>
      <text x={size / 2} y={size / 2 + 22} textAnchor="middle" fontSize="10" fill={palette.muted} fontFamily="'Fraunces', serif" style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}>
        collected
      </text>
    </svg>
  );
}

// ─── KPI cell ────────────────────────────────────────────────
export function KPICell({
  label,
  value,
  delta,
  sparkline,
  format = "currency",
  suffix,
}: {
  label: string;
  value: number;
  delta?: number;
  sparkline?: number[];
  format?: "currency" | "percent" | "number";
  suffix?: string;
}) {
  const display =
    format === "currency" ? <CurrencyNumber value={value} size="lg" animate />
    : format === "percent" ? <span className="font-mono tabular-nums text-[22px]" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{Math.round(value * 100)}%</span>
    : <span className="font-mono tabular-nums text-[22px]" style={{ fontFamily: "'DM Mono', monospace", color: palette.ink }}>{Math.round(value)}{suffix}</span>;
  const deltaColor = (delta ?? 0) >= 0 ? "#5C8F6B" : "#B0567A";
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(24px)", border: `1px solid ${palette.border}` }}>
      <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">{display}</div>
      <div className="flex items-center justify-between mt-2 h-6">
        {typeof delta === "number" ? (
          <span className="text-[10.5px] font-mono tabular-nums" style={{ color: deltaColor, fontFamily: "'DM Mono', monospace" }}>
            {delta >= 0 ? "+" : "−"}{Math.abs(delta * 100).toFixed(1)}%
          </span>
        ) : <span />}
        {sparkline && sparkline.length > 1 && <Sparkline data={sparkline} width={72} height={20} />}
      </div>
    </div>
  );
}

// ─── Sparkline ───────────────────────────────────────────────
export function Sparkline({ data, width = 80, height = 22, color = palette.primary }: { data: number[]; width?: number; height?: number; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const d = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="opacity-70">
      <path d={d} fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

// ─── Claim stage waterfall ───────────────────────────────────
export function ClaimStageWaterfall({ steps }: { steps: { label: string; at?: number; done: boolean; note?: string }[] }) {
  return (
    <ol className="relative pl-6">
      <span className="absolute left-2 top-2 bottom-2 w-px" style={{ background: palette.border }} />
      {steps.map((s, i) => (
        <li key={i} className="relative pb-4 last:pb-0">
          <span
            className="absolute -left-4 top-0.5 w-3 h-3 rounded-full"
            style={{
              background: s.done ? "#7BA88A" : palette.surface,
              border: `1.5px solid ${s.done ? "#7BA88A" : palette.border}`,
            }}
          />
          <div className="text-[12.5px]" style={{ color: s.done ? palette.ink : palette.muted }}>{s.label}</div>
          {s.at && (
            <div className="text-[10px] mt-0.5" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {new Date(s.at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
          {s.note && <div className="text-[11px] mt-1" style={{ color: palette.muted }}>{s.note}</div>}
        </li>
      ))}
    </ol>
  );
}

// ─── Cohort heatmap ──────────────────────────────────────────
export function CohortHeatmap({ rows, cols, cell }: { rows: string[]; cols: string[]; cell: (r: number, c: number) => number }) {
  const values = rows.map((_, r) => cols.map((_, c) => cell(r, c)));
  const max = Math.max(1, ...values.flat());
  return (
    <div className="overflow-x-auto">
      <table className="text-[10.5px]" style={{ borderCollapse: "separate", borderSpacing: 2, fontFamily: "'DM Mono', monospace" }}>
        <thead>
          <tr>
            <th />
            {cols.map((c) => <th key={c} className="px-1 pb-1 font-normal" style={{ color: palette.muted }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r}>
              <td className="pr-2" style={{ color: palette.muted }}>{r}</td>
              {cols.map((_, ci) => {
                const v = values[ri][ci];
                const alpha = 0.08 + (v / max) * 0.75;
                return (
                  <td key={ci} title={formatINR(v)}
                    className="w-8 h-8 rounded-md text-center align-middle tabular-nums"
                    style={{ background: `rgba(176,86,122,${alpha})`, color: alpha > 0.5 ? "#fff" : palette.ink }}>
                    {v > 0 ? Math.round(v / 1000) + "k" : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Horizontal bar list (revenue by service / patient) ──────
export function HBarList({ items, format = "currency" }: { items: { label: string; value: number; sublabel?: string }[]; format?: "currency" | "number" }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2.5">
      {items.map((i) => (
        <div key={i.label}>
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-[12px] truncate" style={{ color: palette.ink }}>{i.label}</span>
              {i.sublabel && <span className="text-[10px]" style={{ color: palette.muted }}>{i.sublabel}</span>}
            </div>
            <span className="font-mono tabular-nums text-[12px]" style={{ color: palette.ink, fontFamily: "'DM Mono', monospace" }}>
              {format === "currency" ? formatINR(i.value) : Math.round(i.value)}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: palette.surface2 }}>
            <div className="h-full transition-all duration-500" style={{ width: `${(i.value / max) * 100}%`, background: palette.primary, opacity: 0.7 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
