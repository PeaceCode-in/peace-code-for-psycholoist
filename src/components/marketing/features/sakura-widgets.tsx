/**
 * Reusable Sakura widgets for feature deep-dive pages.
 *
 * All widgets share:
 *  • Frosted outlined glass surface (`sakura-card-outlined`)
 *  • Sakura design tokens (`--sakura-*`) — no hardcoded colors
 *  • Animated entrance + hover states
 *  • Touch-friendly Recharts tooltips
 *  • Fully responsive containers
 *
 * Import once at the top of a deep-dive component, then compose:
 *
 *   import { SakuraWidgetStyles, StatChip, ChartCard, DataTable, MiniTrend }
 *     from "@/components/marketing/features/sakura-widgets";
 *
 *   <SakuraWidgetStyles />
 *   <ChartCard title="Weekly load" caption="Sessions vs. capacity">
 *     <BarChart …>…</BarChart>
 *   </ChartCard>
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipProps } from "recharts";

/* ────────────────────────────────────────────────────────────────
 * Shared Sakura token palette (JS-accessible for Recharts fills)
 * ──────────────────────────────────────────────────────────────── */
export const SAKURA_CHART_TOKENS = {
  rose:   "var(--sakura-rose)",
  petal:  "var(--sakura-petal)",
  blush:  "var(--sakura-blush)",
  cream:  "var(--sakura-cream)",
  ink:    "var(--sakura-ink)",
  muted:  "var(--sakura-muted)",
  border: "var(--sakura-border)",
} as const;

/** Ordered series palette — use in `<Bar fill={SAKURA_SERIES[i]} />`. */
export const SAKURA_SERIES = [
  "var(--sakura-rose)",
  "var(--sakura-petal)",
  "var(--sakura-blush)",
  "var(--sakura-muted)",
] as const;

/* ────────────────────────────────────────────────────────────────
 * Global widget styles — mount once per page via <SakuraWidgetStyles />
 * ──────────────────────────────────────────────────────────────── */
const WIDGET_CSS = `
  .sakura-card-outlined {
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(24px) saturate(140%);
    border: 1px solid var(--sakura-border);
    border-radius: 1.5rem;
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.6),
      0 20px 60px -30px rgba(138, 51, 85, 0.15);
    transition: box-shadow 200ms ease, transform 200ms ease;
  }
  .sakura-card-outlined:hover {
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,0.8),
      0 24px 70px -25px rgba(138, 51, 85, 0.25);
    transform: translateY(-2px);
  }

  .sakura-stat-chip {
    display: inline-flex; align-items: baseline; gap: 0.5rem;
    padding: 0.4rem 0.85rem;
    background: rgba(255,255,255,0.55);
    backdrop-filter: blur(18px);
    border: 1px solid var(--sakura-border);
    border-radius: 999px;
    font-size: 0.8rem;
    color: var(--sakura-ink);
    transition: transform 180ms ease, background 180ms ease;
  }
  .sakura-stat-chip:hover { transform: translateY(-1px); background: rgba(255,255,255,0.75); }
  .sakura-stat-chip__value {
    font-family: 'Fraunces', serif; font-weight: 500;
    font-size: 1rem; color: var(--sakura-rose);
  }

  .sakura-tooltip {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px);
    border: 1px solid var(--sakura-border);
    border-radius: 0.85rem;
    padding: 0.65rem 0.85rem;
    box-shadow: 0 12px 32px -12px rgba(138, 51, 85, 0.25);
    font-size: 0.8rem; color: var(--sakura-ink);
  }
  .sakura-tooltip__label {
    font-family: 'Fraunces', serif; font-weight: 500;
    margin-bottom: 0.3rem; color: var(--sakura-rose);
  }
  .sakura-tooltip__row { display: flex; align-items: center; gap: 0.4rem; }
  .sakura-tooltip__dot { width: 8px; height: 8px; border-radius: 999px; }

  .sakura-table {
    width: 100%; border-collapse: separate; border-spacing: 0;
    font-size: 0.9rem; color: var(--sakura-ink);
  }
  .sakura-table thead th {
    text-align: left; font-weight: 500;
    font-family: 'Fraunces', serif; color: var(--sakura-rose);
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--sakura-border);
    background: rgba(255,255,255,0.35);
  }
  .sakura-table tbody td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid color-mix(in oklab, var(--sakura-border) 60%, transparent);
  }
  .sakura-table tbody tr {
    transition: background 160ms ease;
  }
  .sakura-table tbody tr:hover {
    background: color-mix(in oklab, var(--sakura-petal) 25%, transparent);
  }
  .sakura-table tbody tr:last-child td { border-bottom: 0; }
  .sakura-table .sakura-pill {
    display: inline-flex; align-items: center; gap: 0.35rem;
    padding: 0.2rem 0.6rem; border-radius: 999px;
    background: color-mix(in oklab, var(--sakura-petal) 45%, transparent);
    color: var(--sakura-rose);
    font-size: 0.75rem; font-weight: 500;
  }

  .sakura-mini-trend {
    display: flex; align-items: flex-end; gap: 3px; height: 32px;
  }
  .sakura-mini-trend__bar {
    flex: 1; min-width: 4px;
    background: linear-gradient(180deg, var(--sakura-rose), var(--sakura-petal));
    border-radius: 2px 2px 0 0;
    transform-origin: bottom;
    animation: sakura-grow 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes sakura-grow {
    from { transform: scaleY(0); opacity: 0; }
    to   { transform: scaleY(1); opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .sakura-card-outlined, .sakura-stat-chip, .sakura-mini-trend__bar { transition: none; animation: none; }
  }
`;

export function SakuraWidgetStyles() {
  return <style dangerouslySetInnerHTML={{ __html: WIDGET_CSS }} />;
}

/* ────────────────────────────────────────────────────────────────
 * StatChip — pill showing a metric + label
 * ──────────────────────────────────────────────────────────────── */
export function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="sakura-stat-chip">
      <span className="sakura-stat-chip__value">{value}</span>
      <span style={{ color: "var(--sakura-muted)" }}>{label}</span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────
 * ChartCard — frosted outlined shell for any Recharts chart.
 *   • Handles ResponsiveContainer sizing
 *   • Adds a shared branded tooltip
 *   • Fades in on mount
 * ──────────────────────────────────────────────────────────────── */
export function ChartCard({
  title,
  caption,
  height = 260,
  actions,
  children,
}: {
  title: string;
  caption?: string;
  height?: number;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sakura-card-outlined p-6"
    >
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3
            className="text-lg"
            style={{ fontFamily: "'Fraunces', serif", color: "var(--sakura-ink)" }}
          >
            {title}
          </h3>
          {caption && (
            <p className="text-sm mt-1" style={{ color: "var(--sakura-muted)" }}>
              {caption}
            </p>
          )}
        </div>
        {actions}
      </header>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

/* ────────────────────────────────────────────────────────────────
 * SakuraTooltip — drop into any Recharts chart as `<Tooltip content={<SakuraTooltip />} />`
 * ──────────────────────────────────────────────────────────────── */
export function SakuraTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="sakura-tooltip">
      {label !== undefined && <div className="sakura-tooltip__label">{String(label)}</div>}
      {payload.map((p, i) => (
        <div key={i} className="sakura-tooltip__row">
          <span
            className="sakura-tooltip__dot"
            style={{ background: (p.color as string) ?? "var(--sakura-rose)" }}
          />
          <span style={{ color: "var(--sakura-muted)" }}>{p.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/** Convenience: pre-wired Recharts <Tooltip> with the Sakura style. */
export function SakuraChartTooltip(props: Partial<React.ComponentProps<typeof Tooltip>>) {
  return (
    <Tooltip
      cursor={{ fill: "color-mix(in oklab, var(--sakura-petal) 30%, transparent)" }}
      content={<SakuraTooltip />}
      {...props}
    />
  );
}

/* ────────────────────────────────────────────────────────────────
 * DataTable — outlined frosted table with hover rows + optional pill status.
 * ──────────────────────────────────────────────────────────────── */
export type Column<Row> = {
  key: keyof Row & string;
  header: string;
  render?: (row: Row) => ReactNode;
  align?: "left" | "right" | "center";
};

export function DataTable<Row extends Record<string, unknown>>({
  title,
  caption,
  columns,
  rows,
}: {
  title?: string;
  caption?: string;
  columns: Column<Row>[];
  rows: Row[];
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sakura-card-outlined overflow-hidden"
    >
      {(title || caption) && (
        <header className="px-6 pt-6 pb-2">
          {title && (
            <h3
              className="text-lg"
              style={{ fontFamily: "'Fraunces', serif", color: "var(--sakura-ink)" }}
            >
              {title}
            </h3>
          )}
          {caption && (
            <p className="text-sm mt-1" style={{ color: "var(--sakura-muted)" }}>
              {caption}
            </p>
          )}
        </header>
      )}
      <div className="overflow-x-auto">
        <table className="sakura-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: c.align ?? "left" }}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key} style={{ textAlign: c.align ?? "left" }}>
                    {c.render ? c.render(row) : String(row[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

/** Small badge for status cells inside DataTable. */
export function StatusPill({ children }: { children: ReactNode }) {
  return <span className="sakura-pill">{children}</span>;
}

/* ────────────────────────────────────────────────────────────────
 * MiniTrend — tiny inline sparkbar for row-level trend cells.
 * ──────────────────────────────────────────────────────────────── */
export function MiniTrend({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="sakura-mini-trend" aria-hidden="true">
      {values.map((v, i) => (
        <span
          key={i}
          className="sakura-mini-trend__bar"
          style={{
            height: `${(v / max) * 100}%`,
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}
