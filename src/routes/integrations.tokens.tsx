import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, KeyRound, Check, Copy, ShieldAlert } from "lucide-react";
import { IntegrationsFrame } from "@/components/practice/integrations/IntegrationsFrame";
import { Section } from "@/components/practice/integrations/primitives";
import { ix } from "@/components/practice/integrations/tokens";
import { createToken, fmtRelative, revokeToken, TOKEN_SCOPES, useTokens } from "@/lib/integrations-store";

export const Route = createFileRoute("/integrations/tokens")({
  head: () => ({ meta: [{ title: "API tokens · Integrations" }, { name: "robots", content: "noindex" }] }),
  component: TokensPage,
});

function TokensPage() {
  const list = useTokens();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [justCreated, setJustCreated] = useState<{ id: string; value: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  return (
    <IntegrationsFrame>
      <Section title="Personal API tokens" action={
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px]" style={{ background: ix.ink, color: "#fff" }}>
          <Plus className="h-3 w-3" strokeWidth={2} /> New token
        </button>
      }>
        <p className="mb-4 text-[13.5px]" style={{ color: ix.muted }}>
          Use tokens to authenticate machine-to-machine calls into the PeaceCode API. Grant the smallest scope that gets the job done. Tokens are shown once at creation, then permanently masked.
        </p>

        {justCreated && (
          <div className="mb-4 rounded-2xl p-5" style={{ background: "#FFF7EE", border: `1px solid #EAD5A8` }}>
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 shrink-0" style={{ color: "#8A6023" }} strokeWidth={1.6} />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px]" style={{ color: "#6E5320" }}>
                  Copy this token now. You won't see it again — only its prefix.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg border bg-white px-3 py-2" style={{ borderColor: "#EAD5A8" }}>
                  <KeyRound className="h-3.5 w-3.5" style={{ color: "#8A6023" }} strokeWidth={1.6} />
                  <code className="min-w-0 flex-1 truncate text-[13px]" style={{ fontFamily: ix.mono, color: ix.ink }}>{justCreated.value}</code>
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(justCreated.value); setCopied(true); setTimeout(() => setCopied(false), 1400); }}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px]"
                    style={{ background: copied ? ix.sageBg : ix.ink, color: copied ? "#4E7358" : "#fff" }}
                  >
                    {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </button>
                </div>
                <button onClick={() => setJustCreated(null)} className="mt-3 text-[12px]" style={{ color: "#6E5320" }}>I've saved it, dismiss.</button>
              </div>
            </div>
          </div>
        )}

        {creating && (
          <div className="mb-4 rounded-2xl p-5" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] uppercase" style={{ color: ix.muted, letterSpacing: 1 }}>Token name</span>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="What is this for?"
                className="rounded-lg border px-3 py-2 text-[13.5px] outline-none"
                style={{ borderColor: ix.border, background: ix.paper, color: ix.ink }} />
            </label>
            <div className="mt-4">
              <p className="text-[12px] uppercase" style={{ color: ix.muted, letterSpacing: 1 }}>Scopes</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TOKEN_SCOPES.map(s => {
                  const on = scopes.includes(s);
                  return (
                    <button key={s} onClick={() => setScopes(x => on ? x.filter(y => y !== s) : [...x, s])}
                      className="rounded-md px-2 py-0.5 text-[12px]"
                      style={{ background: on ? ix.rose : ix.soft, color: on ? "#fff" : ix.roseDeep, fontFamily: ix.mono }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setCreating(false); setName(""); setScopes([]); }} className="rounded-full px-3 py-1.5 text-[12.5px]" style={{ color: ix.muted }}>Cancel</button>
              <button
                disabled={!name || !scopes.length}
                onClick={() => {
                  const { token, fullValue } = createToken(name, scopes);
                  setJustCreated({ id: token.id, value: fullValue });
                  setCreating(false); setName(""); setScopes([]);
                }}
                className="rounded-full px-4 py-1.5 text-[12.5px] disabled:opacity-40"
                style={{ background: ix.rose, color: "#fff" }}
              >Generate token</button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: ix.border, background: ix.paper }}>
          <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_140px_120px_100px_70px] gap-3 border-b px-4 py-2 text-[10.5px] uppercase"
            style={{ borderColor: ix.border, color: ix.muted, letterSpacing: 1, fontFamily: ix.mono }}>
            <span>Name</span><span>Scopes</span><span>Prefix</span><span>Created</span><span>Last used</span><span></span>
          </div>
          {list.length === 0 ? (
            <p className="p-6 text-[13.5px]" style={{ color: ix.muted }}>No tokens yet.</p>
          ) : list.map(t => (
            <div key={t.id} className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_140px_120px_100px_70px] items-center gap-3 border-b px-4 py-3 text-[12.5px]"
              style={{ borderColor: ix.border, opacity: t.revoked ? 0.4 : 1 }}>
              <div className="min-w-0">
                <p className="truncate" style={{ color: ix.ink }}>{t.name}</p>
                {t.revoked ? <p className="text-[11px]" style={{ color: ix.muted, fontFamily: ix.mono }}>revoked</p> : null}
              </div>
              <div className="flex flex-wrap gap-1">
                {t.scopes.slice(0, 2).map(s => <code key={s} className="rounded px-1.5 py-0.5 text-[11px]" style={{ background: ix.soft, color: ix.roseDeep, fontFamily: ix.mono }}>{s}</code>)}
                {t.scopes.length > 2 ? <span className="text-[11px]" style={{ color: ix.muted }}>+{t.scopes.length - 2}</span> : null}
              </div>
              <code style={{ color: ix.ink, fontFamily: ix.mono }}>{t.prefix}…{"•".repeat(6)}</code>
              <span style={{ color: ix.muted, fontFamily: ix.mono }}>{fmtRelative(t.createdAt)}</span>
              <span style={{ color: ix.muted, fontFamily: ix.mono }}>{fmtRelative(t.lastUsedAt)}</span>
              {t.revoked ? <span /> : confirmRevoke === t.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => setConfirmRevoke(null)} className="text-[11px]" style={{ color: ix.muted }}>×</button>
                  <button onClick={() => { revokeToken(t.id); setConfirmRevoke(null); }} className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: ix.roseDeep, color: "#fff" }}>revoke</button>
                </div>
              ) : (
                <button onClick={() => setConfirmRevoke(t.id)} className="text-[11.5px]" style={{ color: ix.muted }}>Revoke</button>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Using a token">
        <div className="rounded-2xl p-5" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
          <pre className="overflow-x-auto rounded-lg p-4 text-[12px]" style={{ background: "#1E1418", color: "#F4E3E7", fontFamily: ix.mono }}>
{`curl https://api.peacecode.in/v1/sessions \\
  -H "Authorization: Bearer pc_live_xxxx..."`}
          </pre>
        </div>
      </Section>
    </IntegrationsFrame>
  );
}
