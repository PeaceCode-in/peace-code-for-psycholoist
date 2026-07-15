import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Segmented, Toggle, Chip } from "@/components/settings/primitives";
import { useSettings, ACCENTS, BG_THEMES, type AccentKey, type BgThemeKey } from "@/lib/settings-store";

export const Route = createFileRoute("/settings/appearance")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => {
    const [s, setS] = useSettings();
    return (
      <>
        <PageHeader title="Appearance" description="Same Sakura + Rose defaults as the student app." />
        <Section title="Theme mode">
          <Row label="Mode" action={<Segmented value={s.appearance.theme} onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, theme: v } }), "Appearance · theme")} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "auto", label: "Auto" }]} />} />
          <Row label="Density" action={<Segmented value={s.appearance.density} onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, density: v } }))} options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }, { value: "spacious", label: "Spacious" }]} />} />
          <Row label="Reduce motion" action={<Toggle checked={s.appearance.reduceMotion} onChange={(v) => setS((p) => ({ ...p, appearance: { ...p.appearance, reduceMotion: v } }))} />} />
        </Section>
        <Section title="Accent">
          <div className="p-4 flex flex-wrap gap-2">
            {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
              <Chip key={k} label={ACCENTS[k].name} active={s.appearance.accent === k} onClick={() => setS((p) => ({ ...p, appearance: { ...p.appearance, accent: k } }))} />
            ))}
          </div>
        </Section>
        <Section title="Background">
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(BG_THEMES) as BgThemeKey[]).map((k) => {
              const t = BG_THEMES[k]; const active = s.appearance.bgTheme === k;
              return (
                <button key={k} onClick={() => setS((p) => ({ ...p, appearance: { ...p.appearance, bgTheme: k } }), `Background · ${t.name}`)}
                  className="rounded-xl p-3 text-left transition"
                  style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[2] || t.swatch[1]})`, border: active ? "2px solid #1E1418" : "1px solid rgba(0,0,0,0.08)" }}>
                  <div className="text-[12px] font-medium text-[#1E1418]">{t.name}</div>
                  <div className="text-[10px] opacity-70 mt-0.5 text-[#1E1418]">{t.blurb}</div>
                </button>
              );
            })}
          </div>
        </Section>
      </>
    );
  },
});
