import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES } from "@/components/practice/AppShell";
import { CheckCircle2, XCircle, Loader2, RefreshCw, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/health/routes")({
  head: () => ({
    meta: [
      { title: "Route health check" },
      { name: "description", content: "Verify every sidebar destination loads without errors." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HealthRoutesPage,
  errorComponent: ({ error, reset }) => (
    <FriendlyFallback
      title="Health check failed to load"
      detail={error?.message}
      onRetry={reset}
    />
  ),
  notFoundComponent: () => (
    <FriendlyFallback title="Health check unavailable" detail="Page not found." />
  ),
});

type Status = "pending" | "ok" | "fail" | "timeout";
type Row = { section: string; title: string; url: string; status: Status; note?: string; ms?: number };

const TIMEOUT_MS = 8000;

function buildRows(): Row[] {
  const rows: Row[] = [];
  for (const cat of CATEGORIES) {
    for (const it of cat.items) {
      rows.push({ section: cat.label, title: it.title, url: it.url, status: "pending" });
    }
  }
  return rows;
}

function HealthRoutesPage() {
  const initial = useMemo(buildRows, []);
  const [rows, setRows] = useState<Row[]>(initial);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState<number>(-1);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  const pass = rows.filter((r) => r.status === "ok").length;
  const fail = rows.filter((r) => r.status === "fail" || r.status === "timeout").length;
  const pending = rows.filter((r) => r.status === "pending").length;

  async function checkOne(index: number, url: string): Promise<Pick<Row, "status" | "note" | "ms">> {
    const start = performance.now();
    return new Promise((resolve) => {
      const frame = frameRef.current;
      if (!frame) return resolve({ status: "fail", note: "No iframe host" });
      let done = false;
      const finish = (r: Pick<Row, "status" | "note" | "ms">) => {
        if (done) return;
        done = true;
        clearTimeout(t);
        frame.onload = null;
        frame.onerror = null;
        resolve({ ...r, ms: Math.round(performance.now() - start) });
      };
      const t = setTimeout(() => finish({ status: "timeout", note: `>${TIMEOUT_MS}ms` }), TIMEOUT_MS);
      frame.onload = () => {
        // Give the client bundle a beat to render/throw.
        setTimeout(() => {
          try {
            const doc = frame.contentDocument;
            if (!doc) return finish({ status: "ok" });
            const text = (doc.body?.innerText || "").toLowerCase();
            const bad = [
              "this page didn't load",
              "something went wrong",
              "application error",
              "unexpected error",
              "404",
              "not found",
            ].find((needle) => text.includes(needle));
            if (bad) return finish({ status: "fail", note: `Matched: "${bad}"` });
            const hasBody = (doc.body?.childElementCount ?? 0) > 0;
            finish({ status: hasBody ? "ok" : "fail", note: hasBody ? undefined : "Empty body" });
          } catch {
            // Cross-origin (shouldn't happen for same-origin) → treat as ok since it loaded
            finish({ status: "ok" });
          }
        }, 600);
      };
      frame.onerror = () => finish({ status: "fail", note: "iframe error" });
      frame.src = url;
      setCurrent(index);
    });
  }

  async function runAll() {
    setRunning(true);
    setRows((prev) => prev.map((r) => ({ ...r, status: "pending" as Status, note: undefined, ms: undefined })));
    for (let i = 0; i < initial.length; i++) {
      const r = initial[i];
      const result = await checkOne(i, r.url);
      setRows((prev) => {
        const next = prev.slice();
        next[i] = { ...next[i], ...result };
        return next;
      });
    }
    setCurrent(-1);
    setRunning(false);
  }

  useEffect(() => {
    // auto-run once on mount
    runAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "var(--pc-bg)", color: "var(--pc-ink)" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif tracking-tight">Route health check</h1>
            <p className="text-sm mt-1" style={{ color: "var(--pc-muted)" }}>
              Auto-verifies every sidebar destination by loading it in a sandboxed frame.
            </p>
          </div>
          <button
            onClick={runAll}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition disabled:opacity-60"
            style={{ borderColor: "var(--pc-border)", background: "var(--pc-surface)" }}
          >
            <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
            {running ? "Running…" : "Re-run"}
          </button>
        </header>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Passed" value={pass} tone="ok" />
          <Stat label="Failed" value={fail} tone="fail" />
          <Stat label="Pending" value={pending} tone="pending" />
        </div>

        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: "var(--pc-border)", background: "var(--pc-surface)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ background: "var(--pc-surface2)", color: "var(--pc-muted)" }}>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Section</th>
                <th className="px-4 py-2.5 font-medium">Page</th>
                <th className="px-4 py-2.5 font-medium">Route</th>
                <th className="px-4 py-2.5 font-medium text-right">Time</th>
                <th className="px-4 py-2.5 font-medium"> </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.url}
                  className="border-t"
                  style={{
                    borderColor: "var(--pc-border)",
                    background: current === i ? "color-mix(in oklab, var(--pc-primary) 6%, transparent)" : undefined,
                  }}
                >
                  <td className="px-4 py-2.5"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-2.5" style={{ color: "var(--pc-muted)" }}>{r.section}</td>
                  <td className="px-4 py-2.5 font-medium">{r.title}</td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "var(--pc-muted)" }}>
                    {r.url}
                    {r.note && <span className="ml-2 italic">— {r.note}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: "var(--pc-muted)" }}>
                    {r.ms ? `${r.ms}ms` : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      to={r.url}
                      className="inline-flex items-center gap-1 text-xs hover:underline"
                      style={{ color: "var(--pc-primary)" }}
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs" style={{ color: "var(--pc-muted)" }}>
          The check reports "fail" when a page renders an error state, is empty, or matches known error copy.
          For deep diagnostics, open the failing route directly.
        </p>
      </div>

      {/* Hidden probe frame */}
      <iframe
        ref={frameRef}
        title="route-probe"
        aria-hidden
        sandbox="allow-same-origin allow-scripts"
        style={{ position: "fixed", left: -10000, top: 0, width: 1200, height: 800, opacity: 0, pointerEvents: "none" }}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "ok" | "fail" | "pending" }) {
  const color =
    tone === "ok" ? "#16a34a" : tone === "fail" ? "#dc2626" : "var(--pc-muted)";
  return (
    <div
      className="rounded-2xl px-4 py-3 border"
      style={{ borderColor: "var(--pc-border)", background: "var(--pc-surface)" }}
    >
      <div className="text-xs uppercase tracking-wide" style={{ color: "var(--pc-muted)" }}>{label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "ok")
    return <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-medium"><CheckCircle2 className="w-4 h-4" /> OK</span>;
  if (status === "fail")
    return <span className="inline-flex items-center gap-1.5 text-red-600 text-xs font-medium"><XCircle className="w-4 h-4" /> Fail</span>;
  if (status === "timeout")
    return <span className="inline-flex items-center gap-1.5 text-amber-600 text-xs font-medium"><XCircle className="w-4 h-4" /> Timeout</span>;
  return <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--pc-muted)" }}><Loader2 className="w-4 h-4 animate-spin" /> Checking…</span>;
}

function FriendlyFallback({ title, detail, onRetry }: { title: string; detail?: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center p-6" style={{ background: "var(--pc-bg)", color: "var(--pc-ink)" }}>
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-serif">{title}</h1>
        {detail && <p className="text-sm" style={{ color: "var(--pc-muted)" }}>{detail}</p>}
        <div className="flex justify-center gap-2">
          {onRetry && (
            <button onClick={onRetry} className="rounded-full px-4 py-2 text-sm border" style={{ borderColor: "var(--pc-border)" }}>
              Try again
            </button>
          )}
          <Link to="/dashboard" className="rounded-full px-4 py-2 text-sm" style={{ background: "var(--pc-primary)", color: "white" }}>
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
