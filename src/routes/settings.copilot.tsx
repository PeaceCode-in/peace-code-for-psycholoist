import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { palette } from "@/components/practice/palette";
import { EthicsRibbon, CopilotPanel, SemicolonMark } from "@/components/practice/copilot/primitives";
import { useCopilotSettings, updateSettings, useAudit, type Tone, type Length, type Retention } from "@/lib/copilot-store";

export const Route = createFileRoute("/settings/copilot")({
  head: () => ({ meta: [
      { name: "robots", content: "noindex" },{ title: "Copilot Settings — PeaceCode · Practice" }] }),
  component: CopilotSettingsPage,
});

function CopilotSettingsPage() {
  const settings = useCopilotSettings();
  const audit = useAudit();

  const last24h = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600_000;
    return audit.filter((a) => a.at >= cutoff);
  }, [audit]);

  return (
    <AppShell crumb="Copilot settings">
      <EthicsRibbon />
      <div className="max-w-[820px] mx-auto p-6 md:p-10">
        <div className="flex items-center gap-2 mb-1">
          <SemicolonMark size={14} />
          <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Copilot · settings</span>
        </div>
        <h1 className="text-[28px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>How Copilot behaves for you.</h1>
        <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>Every choice here is reversible. Nothing about Copilot is on by default that shouldn't be.</p>

        {/* Tone */}
        <Section title="Draft tone" hint="How Copilot sounds when it writes for you.">
          <Segmented<Tone>
            value={settings.tone}
            options={[["formal","Formal"],["conversational","Conversational"],["warm","Warm"]]}
            onChange={(v) => updateSettings({ tone: v })}
          />
        </Section>

        <Section title="Note length" hint="Preferred verbosity for drafted notes.">
          <Segmented<Length>
            value={settings.length}
            options={[["brief","Brief"],["standard","Standard"],["detailed","Detailed"]]}
            onChange={(v) => updateSettings({ length: v })}
          />
        </Section>

        <Section title="Auto-draft after session" hint="When a session ends, start a SOAP draft automatically.">
          <Toggle checked={settings.autoDraft} onChange={(v) => updateSettings({ autoDraft: v })} />
        </Section>

        <Section title="Voice / transcript ingestion" hint="Off by default. Requires per-patient opt-in when enabled.">
          <Toggle checked={settings.voiceIngest} onChange={(v) => updateSettings({ voiceIngest: v })} />
        </Section>

        <Section title="Data retention" hint="How long Copilot retains its own working context. Clinical records are governed by your practice retention policy, not this setting.">
          <Segmented<Retention>
            value={settings.retention}
            options={[["session","Session only"],["d30","30 days"],["d90","90 days"]]}
            onChange={(v) => updateSettings({ retention: v })}
          />
        </Section>

        {/* Trust panel */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Transparency · last 24 hours</span>
          </div>
          <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>What Copilot has seen.</h2>
          <p className="mt-1 mb-4 text-[13px]" style={{ color: palette.muted }}>Each row is a model call. Patient names are pseudonymized before leaving your device.</p>
          <CopilotPanel className="p-0 overflow-hidden">
            {last24h.length === 0 ? (
              <div className="p-6 text-center text-[13px]" style={{ color: palette.muted }}>Nothing sent in the last 24 hours.</div>
            ) : (
              <table className="w-full text-[12.5px]" style={{ color: palette.ink }}>
                <thead>
                  <tr style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    <th className="text-left px-3 py-2 text-[10.5px] uppercase tracking-[0.14em]">Time</th>
                    <th className="text-left px-3 py-2 text-[10.5px] uppercase tracking-[0.14em]">Kind</th>
                    <th className="text-left px-3 py-2 text-[10.5px] uppercase tracking-[0.14em]">Patient</th>
                    <th className="text-left px-3 py-2 text-[10.5px] uppercase tracking-[0.14em]">Context sent</th>
                    <th className="text-left px-3 py-2 text-[10.5px] uppercase tracking-[0.14em]">In · Out</th>
                  </tr>
                </thead>
                <tbody>
                  {last24h.map((a) => (
                    <tr key={a.id} className="border-t" style={{ borderColor: palette.border }}>
                      <td className="px-3 py-2 tabular-nums" style={{ color: palette.muted }}>{new Date(a.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="px-3 py-2">{a.kind}</td>
                      <td className="px-3 py-2" style={{ color: palette.muted }}>{a.patientAlias ?? "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {a.contextItems.map((c, i) => (
                            <span key={i} className="text-[10.5px] px-1.5 py-0.5 rounded" style={{ background: palette.surface2, color: palette.muted }}>{c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5 }}>
                        {a.inputHash} → {a.outputHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CopilotPanel>
        </div>

        <div className="mt-10 text-[11.5px]" style={{ color: palette.muted }}>
          Copilot never speaks to patients. It never diagnoses. It drafts, summarizes, and surfaces. You ratify.
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 grid md:grid-cols-[240px_1fr] gap-4 items-start pb-6 border-b" style={{ borderColor: palette.border }}>
      <div>
        <div className="text-[13.5px]" style={{ color: palette.ink }}>{title}</div>
        <div className="text-[11.5px] mt-0.5" style={{ color: palette.muted }}>{hint}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-full p-0.5" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="text-[12px] h-8 px-3 rounded-full transition-colors"
          style={{ background: value === v ? "#fff" : "transparent", color: value === v ? palette.ink : palette.muted, boxShadow: value === v ? "0 1px 2px rgba(30,20,24,0.05)" : "none" }}
        >{l}</button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="w-10 h-6 rounded-full relative transition-colors"
      style={{ background: checked ? palette.primary : palette.border }}
    >
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: checked ? 18 : 2, boxShadow: "0 1px 2px rgba(30,20,24,0.15)" }} />
    </button>
  );
}
