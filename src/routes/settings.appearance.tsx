import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Segmented, Toggle } from "@/components/settings/primitives";
import { useSettings, ACCENTS, BG_THEMES, type AccentKey, type BgThemeKey } from "@/lib/settings-store";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/settings/appearance")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AppearancePage,
});

function AppearancePage() {
  const [s, setS] = useSettings();
  const a = s.appearance;

  return (
    <>
      <PageHeader
        title="Appearance"
        description="Tune the accent, background, and glass — every surface picks it up instantly."
      />

      {/* ── Theme mode ──────────────────────────────────── */}
      <Section title="Theme mode">
        <Row
          label="Mode"
          hint="Light, dark, or follow the OS."
          action={
            <Segmented
              value={a.theme === "system" ? "auto" : a.theme}
              onChange={(v) => setS((p) => {
                const curPreset = BG_THEMES[p.appearance.bgTheme];
                let nextBg = p.appearance.bgTheme;
                // Snap the background preset so Light = light surfaces,
                // Dark = dark surfaces. Auto follows the current preset.
                if (v === "light" && curPreset?.tone === "dark") nextBg = "sakura";
                if (v === "dark"  && curPreset?.tone === "light") nextBg = "graphite";
                return { ...p, appearance: { ...p.appearance, theme: v, bgTheme: nextBg } };
              }, "Appearance · theme")}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Auto" },
              ]}
            />
          }

        />
        <Row
          label="Density"
          hint="How much room every row gets."
          action={
            <Segmented
              value={a.density}
              onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, density: v } }), "Appearance · density")}
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
                { value: "spacious", label: "Spacious" },
              ]}
            />
          }
        />
        <Row
          label="Reduce motion"
          hint="Kill the drift and flicker."
          action={
            <Toggle
              checked={a.reduceMotion}
              onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, reduceMotion: v } }), "Appearance · reduce motion")}
            />
          }
        />
        <Row
          label="Grain intensity"
          hint={a.grainIntensity === 0 ? "Off — flat backgrounds." : a.grainIntensity < 0.6 ? "Whisper — barely-there texture." : a.grainIntensity > 1.4 ? "Heavy — film-grade noise." : "Balanced — the house default."}
        >
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={a.grainIntensity}
              onChange={(e) => setS((p) => ({ ...p, appearance: { ...p.appearance, grainIntensity: Number(e.target.value) } }), "Appearance · grain intensity")}
              className="flex-1 accent-current"
              style={{ color: palette.primary }}
            />
            <span className="text-[11px] tabular-nums w-10 text-right" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>
              {a.grainIntensity.toFixed(1)}×
            </span>
          </div>
        </Row>
        <Row
          label="Low-power mode"
          hint="Drops the fine grain layer and stops all background drift — kinder to older phones and laptops."
          action={
            <Toggle
              checked={a.lowPower}
              onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, lowPower: v } }), "Appearance · low-power")}
            />
          }
        />
      </Section>

      {/* ── Accent — swatches, not chips ────────────────── */}
      <Section title="Accent" hint="Applies to every button, badge, and highlight, everywhere.">
        <div className="p-4 flex flex-wrap gap-2.5">
          {(Object.keys(ACCENTS) as AccentKey[]).map((k) => {
            const acc = ACCENTS[k];
            const active = a.accent === k;
            return (
              <button
                key={k}
                onClick={() => setS((p) => ({ ...p, appearance: { ...p.appearance, accent: k } }), `Accent · ${acc.name}`)}
                className="group inline-flex items-center gap-2 pl-1 pr-3 h-9 rounded-full text-[12px] transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
                  border: `1px solid ${active ? acc.primary : "rgba(0,0,0,0.08)"}`,
                  color: palette.ink,
                  boxShadow: active ? `0 0 0 3px ${acc.soft}55` : "none",
                }}
              >
                <span
                  className="inline-block w-6 h-6 rounded-full shrink-0"
                  style={{ background: `linear-gradient(135deg, ${acc.primary}, ${acc.soft})`, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)" }}
                />
                {acc.name}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Glass + surface controls ────────────────────── */}
      <Section title="Surfaces" hint="How the app materials feel — glass, corners, cards, charts.">
        <Row
          label="Glass panels"
          hint="Turn the sidebar and top bar into frosted glass. The page shows through."
          action={
            <Toggle
              checked={a.glassEffects}
              onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, glassEffects: v } }), `Glass panels · ${v ? "on" : "off"}`)}
            />
          }
        />
        <Row
          label="Rounded corners"
          hint={`${a.roundedCorners}px — cards, buttons, inputs.`}
          action={
            <Segmented
              value={String(a.roundedCorners) as "8" | "12" | "16" | "20"}
              onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, roundedCorners: Number(v) } }), "Appearance · corners")}
              options={[
                { value: "8", label: "Sharp" },
                { value: "12", label: "Soft" },
                { value: "16", label: "Round" },
                { value: "20", label: "Pillow" },
              ]}
            />
          }
        />
        <Row
          label="Card style"
          action={
            <Segmented
              value={a.cardStyle}
              onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, cardStyle: v } }), "Appearance · card style")}
              options={[
                { value: "elevated", label: "Elevated" },
                { value: "flat", label: "Flat" },
                { value: "outlined", label: "Outlined" },
              ]}
            />
          }
        />
        <Row
          label="Chart style"
          action={
            <Segmented
              value={a.chartStyle}
              onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, chartStyle: v } }), "Appearance · chart style")}
              options={[
                { value: "smooth", label: "Smooth" },
                { value: "sharp", label: "Sharp" },
                { value: "dotted", label: "Dotted" },
              ]}
            />
          }
        />
        <Row
          label="Text size"
          hint={`${a.fontSize}px base — everything scales from this.`}
          action={
            <Segmented
              value={String(a.fontSize) as "14" | "15" | "16" | "17" | "18"}
              onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, fontSize: Number(v) } }), "Appearance · text size")}
              options={[
                { value: "14", label: "S" },
                { value: "15", label: "M" },
                { value: "16", label: "L" },
                { value: "17", label: "XL" },
                { value: "18", label: "2XL" },
              ]}
            />
          }
        />
      </Section>

      {/* ── Background ──────────────────────────────────── */}
      <Section title="Background" hint="Grainy, gradient canvases. Applies to the whole app.">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(Object.keys(BG_THEMES) as BgThemeKey[]).map((k) => {
            const t = BG_THEMES[k];
            const active = a.bgTheme === k;
            return (
              <button
                key={k}
                onClick={() => setS((p) => ({
                  ...p,
                  appearance: {
                    ...p.appearance,
                    bgTheme: k,
                    // Sync mode so a light preset never renders under .dark
                    // and vice versa. "Auto" stays auto.
                    theme: p.appearance.theme === "auto" || p.appearance.theme === "system"
                      ? p.appearance.theme
                      : (t.tone === "dark" ? "dark" : "light"),
                  },
                }), `Background · ${t.name}`)}

                className="rounded-xl p-3 text-left transition-all"
                style={{
                  background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[2] || t.swatch[1]})`,
                  border: active ? `2px solid ${palette.ink}` : "1px solid rgba(0,0,0,0.08)",
                  boxShadow: active ? "0 6px 20px -12px rgba(20,20,30,0.35)" : "none",
                }}
              >
                <div className="text-[12px] font-medium" style={{ color: t.tone === "dark" ? "#fff" : "#1E1418" }}>{t.name}</div>
                <div className="text-[10px] opacity-70 mt-0.5" style={{ color: t.tone === "dark" ? "#fff" : "#1E1418" }}>{t.blurb}</div>
              </button>
            );
          })}
        </div>
      </Section>
    </>
  );
}
