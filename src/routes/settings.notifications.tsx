import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { palette } from "@/components/practice/palette";
import {
  useNotifs, setPrefs, setDND,
  ALL_NOTIF_TYPES, NOTIF_TYPE_LABEL,
  type ChannelMatrix, type DigestMode, type NotifType,
} from "@/lib/notifications-store";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Preferences — PeaceCode · Practice" },
      { name: "description", content: "Per-type controls, digest rhythm, quiet hours, and do-not-disturb." },
    ],
  }),
  component: NotificationPrefs,
});

const CHANNELS: Array<{ key: keyof ChannelMatrix; label: string }> = [
  { key: "inapp", label: "In-app" },
  { key: "email", label: "Email" },
  { key: "sms",   label: "SMS" },
  { key: "push",  label: "Push" },
];

const DIGESTS: Array<{ key: DigestMode; label: string; hint: string }> = [
  { key: "realtime", label: "Real-time", hint: "As they happen" },
  { key: "hourly",   label: "Hourly summary", hint: "Batched every hour" },
  { key: "daily",    label: "Daily brief", hint: "7am morning email" },
  { key: "weekly",   label: "Weekly review", hint: "Sunday evening" },
];

function NotificationPrefs() {
  const { prefs } = useNotifs();

  const toggle = (t: NotifType, ch: keyof ChannelMatrix) => {
    setPrefs((p) => ({
      ...p,
      perType: { ...p.perType, [t]: { ...p.perType[t], [ch]: !p.perType[t][ch] } },
    }));
  };

  return (
    <>
      <PageHeader title="Notifications" description="How PeaceCode reaches you — per event, per channel." />

      {/* DND + rhythm bar */}
      <div className="max-w-4xl grid md:grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: palette.ink }}>Do not disturb</div>
              <div className="text-[12px] mt-0.5" style={{ color: palette.muted }}>
                Pause every channel except the crisis line.
              </div>
            </div>
            <button
              onClick={() => setDND(!prefs.dnd.enabled, null)}
              className="h-8 px-4 rounded-full text-[12px]"
              style={{
                background: prefs.dnd.enabled ? palette.primary : palette.surface,
                color: prefs.dnd.enabled ? "#fff" : palette.ink,
                border: `1px solid ${prefs.dnd.enabled ? palette.primary : palette.border}`,
              }}
            >
              {prefs.dnd.enabled ? "On" : "Off"}
            </button>
          </div>
          <div className="mt-4 text-[11px] uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.18em", color: palette.muted }}>
            Automatic
          </div>
          <div className="text-[12.5px] mt-1" style={{ color: palette.ink }}>
            DND turns on automatically during scheduled sessions.
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: palette.ink }}>Rhythm</div>
          <div className="text-[12px] mt-0.5" style={{ color: palette.muted }}>How often the digest email lands.</div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {DIGESTS.map((d) => {
              const active = prefs.digest === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setPrefs((p) => ({ ...p, digest: d.key }))}
                  className="text-left px-3 py-2 rounded-lg transition-colors"
                  style={{
                    background: active ? palette.soft : palette.surface,
                    border: `1px solid ${active ? palette.primary : palette.border}`,
                  }}
                >
                  <div className="text-[12.5px]" style={{ color: active ? palette.primary : palette.ink, fontFamily: "'Fraunces', serif" }}>
                    {d.label}
                  </div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: palette.muted }}>{d.hint}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quiet hours */}
      <div className="max-w-4xl rounded-2xl p-5 mb-6" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: palette.ink }}>Quiet hours</div>
            <div className="text-[12px] mt-0.5" style={{ color: palette.muted }}>
              Push and SMS pause. Urgent risk flags still reach you.
            </div>
          </div>
          <button
            onClick={() => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, enabled: !p.quietHours.enabled } }))}
            className="h-8 px-4 rounded-full text-[12px]"
            style={{
              background: prefs.quietHours.enabled ? palette.ink : palette.surface,
              color: prefs.quietHours.enabled ? "#fff" : palette.ink,
              border: `1px solid ${prefs.quietHours.enabled ? palette.ink : palette.border}`,
            }}
          >
            {prefs.quietHours.enabled ? "On" : "Off"}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <TimeInput label="From" value={prefs.quietHours.from}
            onChange={(v) => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, from: v } }))} />
          <TimeInput label="To" value={prefs.quietHours.to}
            onChange={(v) => setPrefs((p) => ({ ...p, quietHours: { ...p.quietHours, to: v } }))} />
          <div className="ml-auto text-[11px] uppercase tracking-[0.16em]"
            style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>
            {prefs.quietHours.timezone}
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="max-w-4xl rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: palette.border }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: palette.ink }}>Per-event channels</div>
          <div className="text-[12px] mt-0.5" style={{ color: palette.muted }}>
            Decide, for each event, where it should reach you.
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ background: "#FCF9FA" }}>
                <th className="text-left px-5 py-2.5 font-normal uppercase tracking-[0.14em]"
                  style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, color: palette.muted, width: "44%" }}>
                  Event
                </th>
                {CHANNELS.map((c) => (
                  <th key={c.key} className="text-center px-2 py-2.5 font-normal uppercase tracking-[0.14em]"
                    style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, color: palette.muted }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_NOTIF_TYPES.map((t) => (
                <tr key={t} className="border-t" style={{ borderColor: palette.border }}>
                  <td className="px-5 py-2.5" style={{ color: palette.ink }}>{NOTIF_TYPE_LABEL[t]}</td>
                  {CHANNELS.map((c) => {
                    const on = prefs.perType[t]?.[c.key];
                    return (
                      <td key={c.key} className="text-center px-2 py-2">
                        <button
                          onClick={() => toggle(t, c.key)}
                          className="inline-flex w-9 h-5 rounded-full items-center transition-colors"
                          style={{ background: on ? palette.primary : palette.surface, border: `1px solid ${on ? palette.primary : palette.border}` }}
                          aria-pressed={on}
                          aria-label={`${NOTIF_TYPE_LABEL[t]} via ${c.label}`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full transition-transform"
                            style={{
                              background: on ? "#fff" : palette.muted,
                              transform: on ? "translateX(19px)" : "translateX(3px)",
                            }}
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-4xl mt-6 flex items-center justify-between rounded-2xl p-5" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, color: palette.ink }}>Soft chime for urgent</div>
          <div className="text-[12px] mt-0.5" style={{ color: palette.muted }}>
            A single monastery bell. Only for urgent items. Off by default.
          </div>
        </div>
        <button
          onClick={() => setPrefs((p) => ({ ...p, sound: !p.sound }))}
          className="h-8 px-4 rounded-full text-[12px]"
          style={{
            background: prefs.sound ? palette.primary : palette.surface,
            color: prefs.sound ? "#fff" : palette.ink,
            border: `1px solid ${prefs.sound ? palette.primary : palette.border}`,
          }}
        >
          {prefs.sound ? "On" : "Off"}
        </button>
      </div>
    </>
  );
}

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em]"
      style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {label}
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 px-2 rounded-lg text-[12px] tabular-nums"
        style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}
      />
    </label>
  );
}
