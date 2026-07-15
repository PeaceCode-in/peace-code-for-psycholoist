import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Power } from "lucide-react";
import { IntegrationsFrame } from "@/components/practice/integrations/IntegrationsFrame";
import { MaskedField, Section } from "@/components/practice/integrations/primitives";
import { ix } from "@/components/practice/integrations/tokens";
import { createWebhook, EVENTS, fmtRelative, removeWebhook, toggleWebhook, useWebhooks } from "@/lib/integrations-store";

export const Route = createFileRoute("/integrations/webhooks")({
  head: () => ({ meta: [{ title: "Webhooks · Integrations" }, { name: "robots", content: "noindex" }] }),
  component: WebhooksPage,
});

function WebhooksPage() {
  const list = useWebhooks();
  const [creating, setCreating] = useState(false);
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  return (
    <IntegrationsFrame>
      <Section title="Outbound webhooks" action={
        <button onClick={() => setCreating(v => !v)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px]" style={{ background: ix.ink, color: "#fff" }}>
          <Plus className="h-3 w-3" strokeWidth={2} /> New endpoint
        </button>
      }>
        <p className="mb-4 text-[13.5px]" style={{ color: ix.muted }}>
          Subscribe an external endpoint to events happening in your practice. Each event is signed with a shared secret; verify it on the receiving end before trusting the payload.
        </p>

        {creating && (
          <div className="mb-4 rounded-2xl p-5" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] uppercase" style={{ color: ix.muted, letterSpacing: 1 }}>Endpoint URL</span>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.your-service.com/hooks/peacecode"
                className="rounded-lg border px-3 py-2 text-[13.5px] outline-none"
                style={{ borderColor: ix.border, background: ix.paper, color: ix.ink, fontFamily: ix.mono }} />
            </label>
            <div className="mt-4">
              <p className="text-[12px] uppercase" style={{ color: ix.muted, letterSpacing: 1 }}>Events</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {EVENTS.map(e => {
                  const on = selected.includes(e);
                  return (
                    <button key={e} onClick={() => setSelected(s => on ? s.filter(x => x !== e) : [...s, e])}
                      className="rounded-md px-2 py-0.5 text-[12px]"
                      style={{ background: on ? ix.rose : ix.soft, color: on ? "#fff" : ix.roseDeep, fontFamily: ix.mono }}>
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setCreating(false); setUrl(""); setSelected([]); }} className="rounded-full px-3 py-1.5 text-[12.5px]" style={{ color: ix.muted }}>Cancel</button>
              <button
                disabled={!url || !selected.length}
                onClick={() => { createWebhook(url, selected); setCreating(false); setUrl(""); setSelected([]); }}
                className="rounded-full px-4 py-1.5 text-[12.5px] disabled:opacity-40"
                style={{ background: ix.rose, color: "#fff" }}
              >Create endpoint</button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: ix.border, background: ix.paper }}>
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_100px_100px_60px] gap-3 border-b px-4 py-2 text-[10.5px] uppercase"
            style={{ borderColor: ix.border, color: ix.muted, letterSpacing: 1, fontFamily: ix.mono }}>
            <span>URL</span><span>Events</span><span>Last delivery</span><span>Status</span><span>State</span><span></span>
          </div>
          {list.length === 0 ? (
            <p className="p-6 text-[13.5px]" style={{ color: ix.muted }}>No webhooks yet. Create one to start streaming events out.</p>
          ) : list.map(w => (
            <div key={w.id} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_100px_100px_60px] items-center gap-3 border-b px-4 py-3 text-[12.5px]"
              style={{ borderColor: ix.border, opacity: w.enabled ? 1 : 0.55 }}>
              <div className="min-w-0">
                <p className="truncate" style={{ color: ix.ink, fontFamily: ix.mono }}>{w.url}</p>
                <div className="mt-1"><MaskedField value={w.secret} label="secret" /></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {w.events.slice(0, 3).map(e => <code key={e} className="rounded px-1.5 py-0.5 text-[11px]" style={{ background: ix.soft, color: ix.roseDeep, fontFamily: ix.mono }}>{e}</code>)}
                {w.events.length > 3 ? <span className="text-[11px]" style={{ color: ix.muted }}>+{w.events.length - 3}</span> : null}
              </div>
              <span style={{ color: ix.muted, fontFamily: ix.mono }}>{fmtRelative(w.lastDeliveryAt)}</span>
              <span style={{ color: w.lastStatus && w.lastStatus >= 400 ? ix.amber : ix.ink, fontFamily: ix.mono }}>{w.lastStatus ?? "—"}</span>
              <button onClick={() => toggleWebhook(w.id)} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px]"
                style={{ background: w.enabled ? ix.sageBg : ix.grayBg, color: w.enabled ? "#4E7358" : ix.muted }}>
                <Power className="h-3 w-3" strokeWidth={1.6} /> {w.enabled ? "On" : "Off"}
              </button>
              {confirmRemove === w.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => setConfirmRemove(null)} className="text-[11px]" style={{ color: ix.muted }}>×</button>
                  <button onClick={() => { removeWebhook(w.id); setConfirmRemove(null); }} className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: ix.roseDeep, color: "#fff" }}>del</button>
                </div>
              ) : (
                <button onClick={() => setConfirmRemove(w.id)} aria-label="Remove"><Trash2 className="h-3.5 w-3.5" style={{ color: ix.muted }} strokeWidth={1.6} /></button>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Signature verification">
        <div className="rounded-2xl p-5" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
          <p className="text-[13.5px]" style={{ color: ix.ink }}>Every delivery includes an <code style={{ fontFamily: ix.mono }}>X-PeaceCode-Signature</code> header. Verify it before processing:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg p-4 text-[12px]" style={{ background: "#1E1418", color: "#F4E3E7", fontFamily: ix.mono }}>
{`import crypto from "crypto";

const sig = req.headers["x-peacecode-signature"];
const expected = crypto.createHmac("sha256", WEBHOOK_SECRET)
  .update(req.rawBody)
  .digest("hex");

if (sig !== expected) return res.status(401).end();`}
          </pre>
        </div>
      </Section>
    </IntegrationsFrame>
  );
}
