import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLiveSettings, updateSettings } from "@/lib/messages-store";

export const Route = createFileRoute("/messages/settings")({
  head: () => ({ meta: [{ title: "Message Settings — PeaceCode" }] }),
  component: SettingsPage,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-5 mb-4" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "16px", color: palette.ink, marginBottom: "16px" }}>{title}</h2>
      {children}
    </section>
  );
}

function SettingsPage() {
  const settings = useLiveSettings();
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (saved) { const t = setTimeout(() => setSaved(false), 1500); return () => clearTimeout(t); } }, [saved]);

  const flash = () => setSaved(true);

  return (
    <AppShell>
      <div className="min-h-[calc(100dvh-32px)] p-6" style={{ background: palette.surface2 }}>
        <div className="max-w-[720px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link to="/messages" className="flex items-center gap-1.5 text-[12px]" style={{ color: palette.muted }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Inbox
              </Link>
              <h1 className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontSize: "26px", color: palette.ink }}>Message settings</h1>
            </div>
            {saved && (
              <span className="flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full" style={{ background: "#E7F6EC", color: "#1F7A3E" }}>
                <Save className="w-3 h-3" /> Saved
              </span>
            )}
          </div>

          <Block title="Signature">
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={settings.signatureEnabled} onChange={(e) => { updateSettings({ signatureEnabled: e.target.checked }); flash(); }} />
              <span style={{ fontSize: "12.5px", color: palette.ink }}>Append signature to every therapist message</span>
            </label>
            <textarea value={settings.signature} onChange={(e) => { updateSettings({ signature: e.target.value }); flash(); }} rows={4} className="w-full px-3 py-2 rounded-lg outline-none resize-none" style={{ border: `1px solid ${palette.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: "13px" }} />
          </Block>

          <Block title="Auto-reply / Out of office">
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={settings.autoReply.enabled} onChange={(e) => { updateSettings({ autoReply: { ...settings.autoReply, enabled: e.target.checked } }); flash(); }} />
              <span style={{ fontSize: "12.5px", color: palette.ink }}>Enable auto-reply</span>
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10.5px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>START</label>
                <input type="datetime-local" value={settings.autoReply.startAt ?? ""} onChange={(e) => { updateSettings({ autoReply: { ...settings.autoReply, startAt: e.target.value } }); flash(); }} className="w-full h-9 px-2 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontSize: "12px" }} />
              </div>
              <div>
                <label className="block text-[10.5px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>END</label>
                <input type="datetime-local" value={settings.autoReply.endAt ?? ""} onChange={(e) => { updateSettings({ autoReply: { ...settings.autoReply, endAt: e.target.value } }); flash(); }} className="w-full h-9 px-2 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontSize: "12px" }} />
              </div>
            </div>
            <textarea value={settings.autoReply.message} onChange={(e) => { updateSettings({ autoReply: { ...settings.autoReply, message: e.target.value } }); flash(); }} rows={4} className="w-full px-3 py-2 rounded-lg outline-none resize-none mb-3" style={{ border: `1px solid ${palette.border}`, fontFamily: "'DM Sans', sans-serif", fontSize: "13px" }} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={settings.autoReply.emergencyRedirect} onChange={(e) => { updateSettings({ autoReply: { ...settings.autoReply, emergencyRedirect: e.target.checked } }); flash(); }} />
              <span style={{ fontSize: "12.5px", color: palette.ink }}>Include emergency helpline in auto-reply</span>
            </label>
          </Block>

          <Block title="Notifications">
            {[
              { key: "notifyEmail", label: "Email me on new patient message" },
              { key: "notifyDesktop", label: "Desktop notification" },
            ].map((it) => (
              <label key={it.key} className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={(settings as any)[it.key]} onChange={(e) => { updateSettings({ [it.key]: e.target.checked } as any); flash(); }} />
                <span style={{ fontSize: "12.5px", color: palette.ink }}>{it.label}</span>
              </label>
            ))}
            <div className="mt-3 flex items-center gap-2">
              <span style={{ fontSize: "12px", color: palette.muted }}>Quiet hours</span>
              <input type="time" value={settings.quietHoursStart} onChange={(e) => { updateSettings({ quietHoursStart: e.target.value }); flash(); }} className="h-8 px-2 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontFamily: "'DM Mono', monospace", fontSize: "12px" }} />
              <span style={{ color: palette.muted }}>→</span>
              <input type="time" value={settings.quietHoursEnd} onChange={(e) => { updateSettings({ quietHoursEnd: e.target.value }); flash(); }} className="h-8 px-2 rounded-lg outline-none" style={{ border: `1px solid ${palette.border}`, fontFamily: "'DM Mono', monospace", fontSize: "12px" }} />
            </div>
          </Block>

          <Block title="Retention">
            <select value={settings.retention} onChange={(e) => { updateSettings({ retention: e.target.value as any }); flash(); }} className="w-full h-9 px-2 rounded-lg outline-none mb-2" style={{ border: `1px solid ${palette.border}`, fontSize: "13px" }}>
              <option value="forever">Keep messages forever</option>
              <option value="7y">Keep for 7 years</option>
              <option value="3y">Keep for 3 years</option>
            </select>
            <p style={{ fontSize: "11.5px", color: palette.muted, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
              Regulatory retention for Indian clinical records typically requires 3 years minimum. Verify with your professional body.
            </p>
          </Block>

          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: palette.primary }} />
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: palette.muted, lineHeight: 1.55 }}>
              Messages are encrypted at rest and in transit. Only you and the patient can read the contents. PeaceCode staff cannot access message bodies.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
