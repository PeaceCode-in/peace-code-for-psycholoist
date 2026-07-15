import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PortalShell, Card, portal } from "@/components/portal/PortalShell";
import { portalSignOut, updateClient, useCurrentClient } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/profile")({
  head: () => ({ meta: [{ title: "You" }, { name: "robots", content: "noindex" }] }),
  component: Profile,
});

function Profile() {
  const client = useCurrentClient();
  const nav = useNavigate();
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [ec, setEc] = useState(client?.emergencyContact ?? { name: "", phone: "", relation: "" });
  if (!client) return null;

  const theme = client.preferences.theme;
  const setTheme = (t: "light" | "dark" | "system") => updateClient({ preferences: { ...client.preferences, theme: t } });
  const setPref = (patch: Partial<typeof client.preferences>) => updateClient({ preferences: { ...client.preferences, ...patch } });

  return (
    <PortalShell title="You" subtitle="Your details and how the portal shows up for you.">
      <Card className="mb-6">
        <p className="text-[13px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>You</p>
        <p className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontSize: 26, letterSpacing: -0.3 }}>{client.firstName} {client.lastName}</p>
        <p className="text-[13px]" style={{ color: portal.muted }}>{client.email} · {client.timezone}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px]" style={{ color: portal.muted }}>
            Phone
            <input value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => updateClient({ phone })}
              className="rounded-xl border px-3 py-2 text-[14.5px] outline-none" style={{ borderColor: portal.border, color: portal.ink, background: portal.paper }} />
          </label>
        </div>
      </Card>

      <Card className="mb-6">
        <p className="text-[13px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Emergency contact</p>
        <p className="mt-1 text-[13px]" style={{ color: portal.muted }}>Someone we can reach if you're in real trouble.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(["name", "relation", "phone"] as const).map(k => (
            <input key={k} value={ec[k]} onChange={e => setEc({ ...ec, [k]: e.target.value })} onBlur={() => updateClient({ emergencyContact: ec })}
              placeholder={k[0].toUpperCase() + k.slice(1)}
              className="rounded-xl border px-3 py-2 text-[14.5px] outline-none" style={{ borderColor: portal.border, color: portal.ink, background: portal.paper }} />
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <p className="text-[13px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Preferences</p>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[14px]">Appearance</p>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} className="rounded-full px-4 py-1.5 text-[13px] capitalize"
                  style={{ background: theme === t ? portal.rose : portal.paper, color: theme === t ? "#fff" : portal.ink, border: `1px solid ${theme === t ? portal.rose : portal.border}` }}>{t}</button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between">
            <span className="text-[14px]">Reduced motion</span>
            <Toggle on={client.preferences.reducedMotion} onChange={v => setPref({ reducedMotion: v })} />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-[14px]">Session reminders</span>
            <Toggle on={client.preferences.reminders} onChange={v => setPref({ reminders: v })} />
          </label>
          <div>
            <p className="mb-2 text-[14px]">Language</p>
            <div className="flex gap-2">
              {(["en", "hi"] as const).map(l => (
                <button key={l} onClick={() => setPref({ language: l })} className="rounded-full px-4 py-1.5 text-[13px] uppercase"
                  style={{ background: client.preferences.language === l ? portal.rose : portal.paper, color: client.preferences.language === l ? "#fff" : portal.ink, border: `1px solid ${client.preferences.language === l ? portal.rose : portal.border}` }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <button onClick={() => { portalSignOut(); nav({ to: "/portal/auth" }); }} className="rounded-full px-4 py-2 text-[13px]" style={{ color: portal.muted }}>
        Sign out
      </button>
    </PortalShell>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="relative h-6 w-11 rounded-full transition-colors" style={{ background: on ? portal.rose : "#E4D7DA" }} aria-pressed={on}>
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: on ? 22 : 2 }} />
    </button>
  );
}
