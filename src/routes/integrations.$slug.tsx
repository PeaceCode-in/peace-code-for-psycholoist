import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink, RefreshCw, Trash2, ChevronRight } from "lucide-react";
import { IntegrationsFrame, Brand, StatusPill } from "@/components/practice/integrations/IntegrationsFrame";
import { MaskedField, Section } from "@/components/practice/integrations/primitives";
import { ix, statusTone } from "@/components/practice/integrations/tokens";
import {
  connectIntegration, disconnectIntegration, fmtRelative, integrationBySlug,
  triggerSync, updateConfig, useConnection, useIntegrationActivity, statusOf, type Integration,
} from "@/lib/integrations-store";

export const Route = createFileRoute("/integrations/$slug")({
  head: ({ params }) => {
    const i = integrationBySlug(params.slug);
    return {
      meta: [
        { title: i ? `${i.name} · Integrations` : "Integration" },
        { name: "description", content: i?.purpose ?? "Integration detail" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  notFoundComponent: NotFound,
  component: Detail,
});

const TABS = ["Overview", "Configuration", "Activity", "Logs"] as const;
type Tab = typeof TABS[number];

function Detail() {
  const { slug } = Route.useParams();
  const i = integrationBySlug(slug);
  const conn = useConnection(slug);
  const activity = useIntegrationActivity(slug);
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("Overview");
  const [connecting, setConnecting] = useState(false);
  const [confirmDisc, setConfirmDisc] = useState(false);

  if (!i) return <NotFound />;
  const status = statusOf(i, conn);
  const tone = statusTone(status);
  const isConnected = !!conn;

  const onConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      const empty: Record<string, string> = {};
      i.config.forEach(f => { empty[f.key] = ""; });
      connectIntegration(i.slug, empty);
      setConnecting(false);
    }, 900);
  };

  return (
    <IntegrationsFrame>
      <Link to="/integrations" className="inline-flex items-center gap-1 text-[13px]" style={{ color: ix.muted }}>
        <ArrowLeft className="h-3.5 w-3.5" /> All integrations
      </Link>

      {/* Hero */}
      <div className="mt-4 flex flex-col gap-6 rounded-3xl p-6 md:flex-row md:items-start md:justify-between md:p-8"
        style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
        <div className="flex min-w-0 items-start gap-5">
          <Brand glyph={i.glyph} size={64} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 style={{ fontFamily: ix.serif, fontSize: 30, letterSpacing: -0.4, lineHeight: 1.1 }}>{i.name}</h1>
              <StatusPill tone={tone} />
              {i.region ? <span className="text-[12px]" style={{ color: ix.muted }}>· {i.region}</span> : null}
            </div>
            <p className="mt-1 text-[13px]" style={{ color: ix.muted, fontFamily: ix.mono }}>{i.vendor}</p>
            <p className="mt-4 max-w-xl text-[15px]" style={{ color: ix.ink, lineHeight: 1.5 }}>{i.description}</p>
            {conn?.connectedAt ? (
              <p className="mt-3 text-[12.5px]" style={{ color: ix.muted, fontFamily: ix.mono }}>
                Connected {fmtRelative(conn.connectedAt)} · last sync {fmtRelative(conn.lastSyncAt)} · env {conn.environment ?? "live"}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
          {status === "coming-soon" ? (
            <button disabled className="rounded-full px-5 py-2.5 text-[13.5px]" style={{ background: ix.grayBg, color: ix.muted }}>Coming soon</button>
          ) : isConnected ? (
            <>
              <button onClick={() => triggerSync(i.slug)} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13.5px]"
                style={{ background: ix.ink, color: "#fff" }}>
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.6} /> Sync now
              </button>
              {confirmDisc ? (
                <div className="flex items-center gap-2 rounded-full px-3 py-1 text-[12px]" style={{ background: ix.dustBg, color: ix.roseDeep }}>
                  Disconnect?
                  <button onClick={() => setConfirmDisc(false)} className="rounded-full px-2 py-0.5" style={{ color: ix.muted }}>Keep</button>
                  <button onClick={() => { disconnectIntegration(i.slug); setConfirmDisc(false); }} className="rounded-full px-2 py-0.5" style={{ background: ix.roseDeep, color: "#fff" }}>Yes</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDisc(true)} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13.5px]"
                  style={{ background: ix.paper, color: ix.roseDeep, border: `1px solid ${ix.border}` }}>
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.6} /> Disconnect
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onConnect} disabled={connecting}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[13.5px] disabled:opacity-60"
              style={{ background: ix.rose, color: "#fff" }}
            >
              {connecting ? <><span className="h-3 w-3 animate-spin rounded-full border-2" style={{ borderColor: "#ffffff88", borderTopColor: "#fff" }} /> Connecting…</> : "Connect"}
            </button>
          )}
          {i.docsUrl ? (
            <a href={i.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1 rounded-full px-5 py-2.5 text-[12.5px]" style={{ color: ix.muted }}>
              <ExternalLink className="h-3 w-3" /> Vendor docs
            </a>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <nav className="mt-8 flex gap-1 border-b" style={{ borderColor: ix.border }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="relative px-4 py-2.5 text-[13.5px]"
            style={{ color: tab === t ? ix.ink : ix.muted }}>
            {t}
            {tab === t ? <span className="absolute bottom-[-1px] left-2 right-2 h-[2px] rounded-full" style={{ background: ix.rose }} /> : null}
          </button>
        ))}
      </nav>

      <div className="pt-8">
        {tab === "Overview" && <Overview i={i} />}
        {tab === "Configuration" && <Configuration i={i} isConnected={isConnected} onConnect={onConnect} />}
        {tab === "Activity" && <Activity slug={i.slug} activity={activity} />}
        {tab === "Logs" && <Logs slug={i.slug} activity={activity} />}
      </div>
    </IntegrationsFrame>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────
function Overview({ i }: { i: Integration }) {
  return (
    <>
      <Section title="What it does">
        <div className="rounded-2xl p-6" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
          <p className="text-[15px]" style={{ color: ix.ink, lineHeight: 1.55 }}>{i.description}</p>
          {i.events.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] uppercase" style={{ color: ix.muted, letterSpacing: 1 }}>Emits events</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {i.events.map(e => (
                  <code key={e} className="rounded-md px-2 py-0.5 text-[12px]" style={{ background: ix.soft, color: ix.roseDeep, fontFamily: ix.mono }}>
                    {e}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Data flow">
        <DataFlowDiagram i={i} />
      </Section>

      <Section title="Permissions requested">
        <ul className="flex flex-col gap-2">
          {i.permissions.map(p => (
            <li key={p} className="flex items-start gap-3 rounded-lg px-3 py-2" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
              <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: ix.rose }} />
              <span className="text-[14px]" style={{ color: ix.ink }}>{p}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function DataFlowDiagram({ i }: { i: Integration }) {
  if (i.dataFlow.length === 0) {
    return (
      <div className="rounded-2xl p-6" style={{ background: ix.paper, border: `1px dashed ${ix.border}` }}>
        <p className="text-[14px]" style={{ color: ix.muted }}>Wiring diagram will appear here after this integration ships.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl p-6" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
      <svg width="100%" viewBox="0 0 720 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Data flow between PeaceCode and ${i.name}`}>
        {/* Nodes */}
        <g fontFamily={"'Fraunces', serif"}>
          <rect x={40} y={140} rx={14} ry={14} width={180} height={80} fill={ix.paper} stroke={ix.ink} strokeWidth={1} />
          <text x={130} y={175} textAnchor="middle" fontSize={16} fill={ix.ink}>PeaceCode</text>
          <text x={130} y={198} textAnchor="middle" fontSize={11} fill={ix.muted} fontFamily={"'DM Sans', sans-serif"}>Practice</text>

          <rect x={500} y={140} rx={14} ry={14} width={180} height={80} fill={ix.paper} stroke={ix.ink} strokeWidth={1} />
          <text x={590} y={175} textAnchor="middle" fontSize={16} fill={ix.ink}>{i.name}</text>
          <text x={590} y={198} textAnchor="middle" fontSize={11} fill={ix.muted} fontFamily={"'DM Sans', sans-serif"}>{i.vendor}</text>
        </g>

        {/* Flows */}
        {i.dataFlow.map((flow, idx) => {
          const goingRight = flow.from === "PeaceCode";
          const y = 100 + idx * 65;
          const x1 = goingRight ? 220 : 500;
          const x2 = goingRight ? 500 : 220;
          const arrowX = goingRight ? x2 : x2;
          const required = flow.required !== false;
          return (
            <g key={idx}>
              <line
                x1={x1} y1={y} x2={x2} y2={y}
                stroke={required ? ix.ink : ix.muted}
                strokeWidth={1}
                strokeDasharray={required ? undefined : "4 4"}
                markerEnd={goingRight ? "url(#arrR)" : "url(#arrL)"}
              />
              <text
                x={(x1 + x2) / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize={11.5}
                fill={ix.muted}
                fontFamily={"'DM Mono', monospace"}
              >
                {flow.fields.join(" · ")}
              </text>
              <text
                x={(x1 + x2) / 2}
                y={y + 14}
                textAnchor="middle"
                fontSize={10}
                fill={ix.muted}
                fontFamily={"'DM Sans', sans-serif"}
                fontStyle={required ? undefined : "italic"}
              >
                {required ? "required" : "optional"}
              </text>
            </g>
          );
        })}

        <defs>
          <marker id="arrR" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={ix.ink} />
          </marker>
          <marker id="arrL" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto">
            <path d="M8,0 L0,4 L8,8 Z" fill={ix.ink} />
          </marker>
        </defs>
      </svg>
      <p className="mt-4 text-[12px]" style={{ color: ix.muted }}>
        Solid lines are required data. Dashed lines are optional and only sent if the feature is enabled.
      </p>
    </div>
  );
}

// ─── Configuration ───────────────────────────────────────────────────────
function Configuration({ i, isConnected, onConnect }: { i: Integration; isConnected: boolean; onConnect: () => void }) {
  const conn = useConnection(i.slug);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const val = (k: string) => draft[k] ?? conn?.config[k] ?? "";
  const dirty = Object.keys(draft).some(k => draft[k] !== (conn?.config[k] ?? ""));

  if (!isConnected) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: ix.paper, border: `1px dashed ${ix.border}` }}>
        <p style={{ fontFamily: ix.serif, fontSize: 20 }}>Connect first to configure.</p>
        <p className="mt-1 text-[13.5px]" style={{ color: ix.muted }}>Fields, webhook URLs, and secrets appear here once the connection is live.</p>
        <button onClick={onConnect} className="mt-5 rounded-full px-5 py-2 text-[13.5px]" style={{ background: ix.rose, color: "#fff" }}>Connect {i.name}</button>
      </div>
    );
  }

  if (i.config.length === 0) {
    return (
      <div className="rounded-2xl p-6" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
        <p className="text-[14px]" style={{ color: ix.muted }}>Nothing to configure — this integration works out of the box.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {i.config.map(f => (
        <div key={f.key} className="rounded-2xl p-5" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
          <label className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px]" style={{ color: ix.ink }}>{f.label}</span>
              {f.kind === "secret" ? <span className="text-[11px]" style={{ color: ix.muted, fontFamily: ix.mono }}>SECRET</span> : null}
            </div>
            {f.hint ? <span className="text-[12.5px]" style={{ color: ix.muted }}>{f.hint}</span> : null}
            {f.kind === "secret" && conn?.config[f.key] ? (
              <MaskedField value={conn.config[f.key]} />
            ) : (
              <input
                type={f.kind === "secret" ? "password" : "text"}
                value={val(f.key)}
                placeholder={f.placeholder}
                onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                className="rounded-lg border px-3 py-2 text-[13.5px] outline-none"
                style={{ borderColor: ix.border, background: ix.paper, color: ix.ink, fontFamily: f.kind === "secret" || f.kind === "url" ? ix.mono : "inherit" }}
              />
            )}
          </label>
        </div>
      ))}
      <div className="flex justify-end gap-2">
        <button
          disabled={!dirty}
          onClick={() => { updateConfig(i.slug, draft); setDraft({}); }}
          className="rounded-full px-4 py-2 text-[13px] disabled:opacity-40"
          style={{ background: ix.ink, color: "#fff" }}
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

// ─── Activity ────────────────────────────────────────────────────────────
function Activity({ slug, activity }: { slug: string; activity: ReturnType<typeof useIntegrationActivity> }) {
  const [selected, setSelected] = useState(activity[0]?.id ?? null);
  const active = activity.find(a => a.id === selected) ?? activity[0];

  if (activity.length === 0) {
    return <div className="rounded-2xl p-8 text-center" style={{ background: ix.paper, border: `1px dashed ${ix.border}` }}>
      <p style={{ color: ix.muted }}>No activity yet.</p>
    </div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-2">
        {activity.slice(0, 20).map(a => (
          <button key={a.id} onClick={() => setSelected(a.id)}
            className="flex items-start gap-3 rounded-xl p-3 text-left transition-colors"
            style={{
              background: active?.id === a.id ? ix.soft : ix.paper,
              border: `1px solid ${active?.id === a.id ? ix.rose : ix.border}`,
            }}>
            <KindDot kind={a.kind} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px]" style={{ color: ix.ink }}>{a.summary}</p>
              <p className="mt-0.5 text-[11.5px]" style={{ color: ix.muted, fontFamily: ix.mono }}>
                {a.method ? `${a.method} · ` : ""}{a.path ?? ""}{a.status ? ` · ${a.status}` : ""} · {fmtRelative(a.at)}
              </p>
            </div>
          </button>
        ))}
      </div>
      {active && (
        <div className="rounded-2xl p-5" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
          <p className="text-[11px] uppercase" style={{ color: ix.muted, letterSpacing: 1 }}>Event detail</p>
          <p className="mt-2 text-[15px]" style={{ color: ix.ink }}>{active.summary}</p>
          <dl className="mt-4 grid grid-cols-[100px_1fr] gap-y-2 text-[12.5px]">
            <dt style={{ color: ix.muted }}>at</dt><dd style={{ color: ix.ink, fontFamily: ix.mono }}>{new Date(active.at).toLocaleString("en-IN")}</dd>
            <dt style={{ color: ix.muted }}>kind</dt><dd style={{ color: ix.ink, fontFamily: ix.mono }}>{active.kind}</dd>
            {active.method ? <><dt style={{ color: ix.muted }}>method</dt><dd style={{ color: ix.ink, fontFamily: ix.mono }}>{active.method}</dd></> : null}
            {active.path ? <><dt style={{ color: ix.muted }}>path</dt><dd style={{ color: ix.ink, fontFamily: ix.mono, wordBreak: "break-all" }}>{active.path}</dd></> : null}
            {active.status ? <><dt style={{ color: ix.muted }}>status</dt><dd style={{ color: ix.ink, fontFamily: ix.mono }}>{active.status}</dd></> : null}
            <dt style={{ color: ix.muted }}>actor</dt><dd style={{ color: ix.ink, fontFamily: ix.mono }}>{active.actor}</dd>
          </dl>
          <div className="mt-4 rounded-lg p-3" style={{ background: "#1E1418", color: "#F4E3E7" }}>
            <pre className="overflow-x-auto text-[11.5px]" style={{ fontFamily: ix.mono }}>{samplePayload(slug, active)}</pre>
          </div>
          <p className="mt-2 text-[11px]" style={{ color: ix.muted }}>Secrets are redacted from all payload previews.</p>
        </div>
      )}
    </div>
  );
}

function KindDot({ kind }: { kind: string }) {
  const map: Record<string, string> = {
    "sync": ix.sage, "webhook.in": ix.rose, "webhook.out": ix.roseDeep, "config": ix.gray, "error": ix.amber,
  };
  return <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: map[kind] ?? ix.gray }} />;
}

function samplePayload(slug: string, e: { kind: string; summary: string; status?: number; path?: string }): string {
  return JSON.stringify({
    integration: slug,
    kind: e.kind,
    request: e.path ? { path: e.path } : undefined,
    response: e.status ? { status: e.status } : undefined,
    body: {
      note: "Sample payload. Real payloads appear here once traffic runs.",
      summary: e.summary,
    },
  }, null, 2);
}

// ─── Logs ────────────────────────────────────────────────────────────────
function Logs({ slug, activity }: { slug: string; activity: ReturnType<typeof useIntegrationActivity> }) {
  const [q, setQ] = useState("");
  const filtered = activity.filter(a => !q || a.summary.toLowerCase().includes(q.toLowerCase()) || (a.path ?? "").includes(q));
  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter logs"
          className="rounded-full border px-3 py-1.5 text-[13px] outline-none"
          style={{ borderColor: ix.border, background: ix.paper, color: ix.ink, fontFamily: ix.mono }} />
        <span className="text-[11.5px]" style={{ color: ix.muted, fontFamily: ix.mono }}>{filtered.length} entries</span>
      </div>
      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: ix.border, background: ix.paper }}>
        <div className="grid grid-cols-[110px_60px_60px_80px_1fr] gap-3 border-b px-4 py-2 text-[10.5px] uppercase"
          style={{ borderColor: ix.border, color: ix.muted, letterSpacing: 1, fontFamily: ix.mono }}>
          <span>Time</span><span>Kind</span><span>Method</span><span>Status</span><span>Detail</span>
        </div>
        {filtered.slice(0, 200).map(a => (
          <div key={a.id} className="grid grid-cols-[110px_60px_60px_80px_1fr] gap-3 border-b px-4 py-2 text-[12px]"
            style={{ borderColor: ix.border, color: ix.ink, fontFamily: ix.mono }}>
            <span style={{ color: ix.muted }}>{new Date(a.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
            <span style={{ color: a.kind === "error" ? ix.amber : ix.ink }}>{a.kind}</span>
            <span>{a.method ?? "—"}</span>
            <span>{a.status ?? "—"}</span>
            <span className="truncate" title={a.summary}>{a.path ? <><span style={{ color: ix.muted }}>{a.path} </span></> : null}{a.summary}</span>
          </div>
        ))}
        {filtered.length === 0 ? <p className="px-4 py-6 text-[13px]" style={{ color: ix.muted }}>Nothing matches that filter.</p> : null}
      </div>
    </>
  );
}

function NotFound() {
  return (
    <IntegrationsFrame>
      <div className="rounded-2xl p-10 text-center" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
        <p style={{ fontFamily: ix.serif, fontSize: 22 }}>Integration not found.</p>
        <p className="mt-2 text-[13.5px]" style={{ color: ix.muted }}>It might have been retired.</p>
        <Link to="/integrations" className="mt-6 inline-block rounded-full px-5 py-2 text-[13px]" style={{ background: ix.rose, color: "#fff" }}>Back to directory</Link>
      </div>
    </IntegrationsFrame>
  );
}
