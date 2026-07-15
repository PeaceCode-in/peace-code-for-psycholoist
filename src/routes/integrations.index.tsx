import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { IntegrationsFrame, Brand, StatusPill } from "@/components/practice/integrations/IntegrationsFrame";
import { ix, statusTone } from "@/components/practice/integrations/tokens";
import { CATEGORIES, INTEGRATIONS, fmtRelative, statusOf, useConnections, type IntegrationCategory } from "@/lib/integrations-store";

export const Route = createFileRoute("/integrations/")({
  head: () => ({
    meta: [
      { title: "Integrations · PeaceCode" },
      { name: "description", content: "Connect payments, telehealth, calendar, communication, storage, clinical, and analytics tools to your practice." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Directory,
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "connected", label: "Connected" },
  { key: "available", label: "Available" },
  { key: "attention", label: "Needs attention" },
] as const;

function Directory() {
  const connections = useConnections();
  const [filter, setFilter] = useState<typeof FILTERS[number]["key"]>("all");
  const [query, setQuery] = useState("");

  const connectedList = Object.values(connections);
  const degraded = connectedList.filter(c => c.status === "degraded" || c.status === "error");
  const total24h = connectedList.reduce((n, c) => n + (c.events24h ?? 0), 0);
  const totalErrors = connectedList.reduce((n, c) => n + (c.errors24h ?? 0), 0);
  const avgUptime = connectedList.length
    ? connectedList.reduce((n, c) => n + (c.uptime ?? 1), 0) / connectedList.length
    : 1;

  const items = useMemo(() => {
    return INTEGRATIONS.filter(i => {
      const conn = connections[i.slug];
      const status = statusOf(i, conn);
      if (filter === "connected" && status !== "connected" && status !== "degraded" && status !== "error") return false;
      if (filter === "available" && (conn || status === "coming-soon")) return false;
      if (filter === "attention" && !(status === "degraded" || status === "error")) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!i.name.toLowerCase().includes(q) && !i.purpose.toLowerCase().includes(q) && !i.vendor.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [connections, filter, query]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = {};
    items.forEach(i => { (g[i.category] ??= []).push(i); });
    return g;
  }, [items]);

  const recommended = INTEGRATIONS.filter(i => i.recommended);

  return (
    <IntegrationsFrame>
      {/* Health panel */}
      <section className="mb-10 grid gap-3 md:grid-cols-4">
        <HealthCard label="Connected" value={String(connectedList.length)} sub={`of ${INTEGRATIONS.length} available`} />
        <HealthCard label="Uptime · 24h" value={`${(avgUptime * 100).toFixed(1)}%`} sub={connectedList.length ? "across live integrations" : "no live integrations"} />
        <HealthCard label="Events · 24h" value={total24h.toLocaleString("en-IN")} sub={totalErrors ? `${totalErrors} error${totalErrors === 1 ? "" : "s"}` : "no errors"} mono />
        <HealthCard label="Automations" value="6" sub="pre-built recipes" />
      </section>

      {degraded.length > 0 && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl p-4" style={{ background: ix.amberBg, border: `1px solid #E8D2A2` }}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ix.amber }} strokeWidth={1.6} />
          <div className="text-[13.5px]" style={{ color: "#6E5320" }}>
            <span className="font-medium">{degraded.length} integration{degraded.length === 1 ? " is" : "s are"} degraded.</span>{" "}
            {degraded.map(d => INTEGRATIONS.find(i => i.slug === d.slug)?.name).filter(Boolean).join(", ")} needs attention. Sessions are still going out, but downstream events may be delayed.
          </div>
        </div>
      )}

      {/* Recommended row */}
      <section className="mb-10">
        <div className="mb-3 flex items-baseline gap-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: ix.rose }} strokeWidth={1.6} />
          <h2 className="text-[13px] uppercase" style={{ color: ix.muted, letterSpacing: 1.2 }}>Set up these first</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {recommended.map(i => <IntegrationCard key={i.slug} slug={i.slug} />)}
        </div>
      </section>

      {/* Filters + search */}
      <div className="sticky top-0 z-10 mb-6 -mx-1 flex flex-wrap items-center gap-2 rounded-2xl px-1 py-2 backdrop-blur" style={{ background: `${ix.bg}ee` }}>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="rounded-full border px-3 py-1 text-[12.5px] transition-colors"
              style={{
                background: filter === f.key ? ix.ink : ix.paper,
                color: filter === f.key ? "#FFFFFF" : ix.ink,
                borderColor: filter === f.key ? ix.ink : ix.border,
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={query} onChange={e => setQuery(e.target.value)} placeholder="Search integrations"
          className="ml-auto min-w-0 flex-1 max-w-xs rounded-full border px-4 py-1.5 text-[13px] outline-none"
          style={{ borderColor: ix.border, background: ix.paper, color: ix.ink }}
        />
      </div>

      {/* Category groups */}
      {(Object.keys(CATEGORIES) as IntegrationCategory[]).map(cat => {
        const list = grouped[cat] ?? [];
        const meta = CATEGORIES[cat];
        return (
          <section key={cat} className="mb-12">
            <div className="mb-4 flex items-baseline justify-between border-b pb-2" style={{ borderColor: ix.border }}>
              <div>
                <h2 style={{ fontFamily: ix.serif, fontSize: 22, letterSpacing: -0.2 }}>{meta.label}</h2>
                <p className="mt-0.5 text-[13px]" style={{ color: ix.muted }}>{meta.blurb}</p>
              </div>
              <span className="text-[12px] uppercase" style={{ color: ix.muted, letterSpacing: 1, fontFamily: ix.mono }}>
                {list.length.toString().padStart(2, "0")}
              </span>
            </div>
            {list.length === 0 ? (
              <div className="rounded-2xl p-8" style={{ background: ix.paper, border: `1px dashed ${ix.border}` }}>
                <p style={{ fontFamily: ix.serif, fontSize: 17, color: ix.ink }}>{meta.emptyLine}</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {list.map(i => <IntegrationCard key={i.slug} slug={i.slug} />)}
              </div>
            )}
          </section>
        );
      })}
    </IntegrationsFrame>
  );
}

function HealthCard({ label, value, sub, mono }: { label: string; value: string; sub?: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
      <p className="text-[11px] uppercase" style={{ color: ix.muted, letterSpacing: 1.1 }}>{label}</p>
      <p className="mt-2" style={{ fontFamily: mono ? ix.mono : ix.serif, fontSize: 26, letterSpacing: -0.2, color: ix.ink }}>{value}</p>
      {sub ? <p className="mt-0.5 text-[12.5px]" style={{ color: ix.muted }}>{sub}</p> : null}
    </div>
  );
}

function IntegrationCard({ slug }: { slug: string }) {
  const i = INTEGRATIONS.find(x => x.slug === slug)!;
  const conn = useConnections()[slug];
  const status = statusOf(i, conn);
  const tone = statusTone(status);

  return (
    <Link
      to="/integrations/$slug" params={{ slug: i.slug }}
      className="group flex flex-col gap-4 rounded-2xl p-5 transition-colors"
      style={{ background: ix.paper, border: `1px solid ${ix.border}` }}
    >
      <div className="flex items-start gap-4">
        <Brand glyph={i.glyph} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate" style={{ fontFamily: ix.serif, fontSize: 18, letterSpacing: -0.2, color: ix.ink }}>{i.name}</p>
            {i.region === "India" ? <span className="text-[11px]" style={{ color: ix.muted }}>· India</span> : null}
          </div>
          <p className="mt-1 line-clamp-2 text-[13.5px]" style={{ color: ix.muted }}>{i.purpose}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between">
        <StatusPill tone={tone} />
        <span className="text-[11.5px]" style={{ color: ix.muted, fontFamily: conn ? ix.mono : "inherit" }}>
          {conn?.lastSyncAt ? fmtRelative(conn.lastSyncAt) : status === "coming-soon" ? "not yet" : "not connected"}
        </span>
      </div>
    </Link>
  );
}
