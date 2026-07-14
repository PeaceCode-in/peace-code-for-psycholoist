import { createFileRoute } from "@tanstack/react-router";
import { SettingsShell, Section, Row, Toggle, Segmented, Select } from "@/components/settings/primitives";
import { useSettings, ACCENTS, BG_THEMES, type AccentKey, type BgThemeKey, type ThemeMode, type Density, type CardStyle, type ChartStyle } from "@/lib/settings-store";
import { palette } from "@/components/AppShell";
import { Check } from "lucide-react";

export const Route = createFileRoute("/settings/appearance")({
  head: () => ({ meta: [{ title: "Appearance — PeaceCode Settings" }] }),
  component: AppearancePage,
});

const { ink, muted, surface2, border } = palette;

function AppearancePage() {
  const [s, update] = useSettings();
  const a = s.appearance;
  const set = <K extends keyof typeof a>(k: K, v: (typeof a)[K]) => update((x) => ({ ...x, appearance: { ...x.appearance, [k]: v } }), `Appearance · ${String(k)}`);

  return (
    <SettingsShell title="Appearance" description="Every change previews live across PeaceCode.">
      <Section title="Theme">
        <Row label="Mode" hint="System follows your OS setting." action={
          <Segmented<ThemeMode> value={a.theme} onChange={(v) => set("theme", v)}
            options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "auto", label: "Auto" }, { value: "system", label: "System" }]} />
        } />
      </Section>

      <Section title="Accent color" hint="Used for buttons, links, streak markers.">
        <div className="px-5 py-4 flex flex-wrap gap-3">
          {(Object.keys(ACCENTS) as AccentKey[]).map((k) => {
            const acc = ACCENTS[k]; const active = a.accent === k;
            return (
              <button key={k} onClick={() => set("accent", k)} className="group flex flex-col items-center gap-1.5">
                <span className="w-10 h-10 rounded-full flex items-center justify-center transition" style={{ background: acc.primary, boxShadow: active ? `0 0 0 3px #fff, 0 0 0 5px ${acc.ring}` : "none" }}>
                  {active && <Check className="w-4 h-4 text-white" />}
                </span>
                <span className="text-[10px]" style={{ color: active ? ink : muted }}>{acc.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Typography">
        <Row label="Font size" hint={`${a.fontSize}px base`} action={
          <input type="range" min={14} max={20} value={a.fontSize} onChange={(e) => set("fontSize", parseInt(e.target.value))} className="w-40 accent-[var(--pc-primary)]" />
        } />
      </Section>

      <Section title="Layout">
        <Row label="Interface density" action={
          <Segmented<Density> value={a.density} onChange={(v) => set("density", v)}
            options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }, { value: "spacious", label: "Spacious" }]} />
        } />
        <Row label="Corner radius" hint={`${a.roundedCorners}px`} action={
          <input type="range" min={6} max={24} value={a.roundedCorners} onChange={(e) => set("roundedCorners", parseInt(e.target.value))} className="w-40 accent-[var(--pc-primary)]" />
        } />
        <Row label="Card style" action={
          <Select<CardStyle> value={a.cardStyle} onChange={(v) => set("cardStyle", v)} options={[{ value: "elevated", label: "Elevated" }, { value: "flat", label: "Flat" }, { value: "outlined", label: "Outlined" }]} />
        } />
        <Row label="Chart style" action={
          <Select<ChartStyle> value={a.chartStyle} onChange={(v) => set("chartStyle", v)} options={[{ value: "smooth", label: "Smooth" }, { value: "sharp", label: "Sharp" }, { value: "dotted", label: "Dotted" }]} />
        } />
      </Section>

      <Section title="Motion & effects">
        <Row label="Reduce motion" hint="Fewer animations and transitions." action={<Toggle checked={a.reduceMotion} onChange={(v) => set("reduceMotion", v)} />} />
        <Row label="Glass effects" hint="Frosted surfaces on cards and modals." action={<Toggle checked={a.glassEffects} onChange={(v) => set("glassEffects", v)} />} />
      </Section>

      <Section title="Preview">
        <div className="p-5">
          <div className="rounded-2xl p-5" style={{ background: "var(--pc-surface)", border: `1px solid ${border}` }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "var(--pc-primary)" }}>preview</div>
            <div className="font-serif text-[22px] mb-2" style={{ color: ink }}>Small changes, kept softly.</div>
            <p className="text-[13px] mb-4" style={{ color: muted }}>The button below picks up your accent and radius instantly.</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-full text-[12px] text-white" style={{ background: "var(--pc-primary)" }}>Primary action</button>
              <button className="px-4 py-2 rounded-full text-[12px]" style={{ background: surface2, color: ink }}>Secondary</button>
            </div>
          </div>
        </div>
      </Section>
    </SettingsShell>
  );
}
