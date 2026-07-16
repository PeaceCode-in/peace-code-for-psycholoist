import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Segmented, Toggle } from "@/components/settings/primitives";
import { useSettings } from "@/lib/settings-store";

export const Route = createFileRoute("/settings/accessibility")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Accessibility — Settings" }] }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const [s, setS] = useSettings();
  const ax = s.accessibility;
  const size = s.appearance.fontSize;
  const patch = (fn: (p: typeof s) => typeof s, label: string) => { setS(fn, label); toast.success("Saved", { description: label }); };

  return (
    <>
      <PageHeader title="Accessibility" description="Font size, contrast, reduced motion, screen reader tags." />
      <Section title="Reading">
        <Row label="Font size" hint={`${size}px base — everything scales from this.`}
          action={
            <Segmented value={String(size) as "14" | "15" | "16" | "17" | "18" | "20"}
              onChange={(v) => patch((p) => ({ ...p, appearance: { ...p.appearance, fontSize: Number(v) } }), `Font size · ${v}px`)}
              options={[{ value: "14", label: "14" }, { value: "16", label: "16" }, { value: "18", label: "18" }, { value: "20", label: "20" }]} />
          } />
        <Row label="Reading width" hint="How wide long-form text can grow."
          action={
            <Segmented value={ax.readingWidth}
              onChange={(v) => patch((p) => ({ ...p, accessibility: { ...p.accessibility, readingWidth: v } }), `Reading width · ${v}`)}
              options={[{ value: "narrow", label: "Narrow" }, { value: "regular", label: "Regular" }, { value: "wide", label: "Wide" }]} />
          } />
        <Row label="Dyslexia-friendly font" hint="Swap the body face for OpenDyslexic."
          action={<Toggle checked={ax.dyslexiaFont} onChange={(v) => patch((p) => ({ ...p, accessibility: { ...p.accessibility, dyslexiaFont: v } }), `Dyslexia font · ${v ? "on" : "off"}`)} />} />
      </Section>

      <Section title="Contrast & motion">
        <Row label="High contrast" hint="Stronger borders, higher-contrast ink."
          action={<Toggle checked={ax.highContrast} onChange={(v) => patch((p) => ({ ...p, accessibility: { ...p.accessibility, highContrast: v } }), `High contrast · ${v ? "on" : "off"}`)} />} />
        <Row label="Reduce motion" hint="Fewer transitions, no parallax."
          action={<Toggle checked={ax.reduceAnim} onChange={(v) => patch((p) => ({ ...p, accessibility: { ...p.accessibility, reduceAnim: v }, appearance: { ...p.appearance, reduceMotion: v } }), `Reduce motion · ${v ? "on" : "off"}`)} />} />
        <Row label="Colour-blind mode" hint="Palette adjustments for common vision types."
          action={
            <Segmented value={ax.colorBlind}
              onChange={(v) => patch((p) => ({ ...p, accessibility: { ...p.accessibility, colorBlind: v } }), `Colour-blind · ${v}`)}
              options={[{ value: "none", label: "None" }, { value: "protanopia", label: "Prot." }, { value: "deuteranopia", label: "Deut." }, { value: "tritanopia", label: "Trit." }]} />
          } />
      </Section>

      <Section title="Assistive tech">
        <Row label="Screen reader tags" hint="Verbose labels on data cards and charts."
          action={<Toggle checked={ax.screenReader} onChange={(v) => patch((p) => ({ ...p, accessibility: { ...p.accessibility, screenReader: v } }), `Screen reader · ${v ? "on" : "off"}`)} />} />
        <Row label="Keyboard navigation" hint="Show focus rings and shortcut hints."
          action={<Toggle checked={ax.keyboardNav} onChange={(v) => patch((p) => ({ ...p, accessibility: { ...p.accessibility, keyboardNav: v } }), `Keyboard nav · ${v ? "on" : "off"}`)} />} />
        <Row label="Captions" hint="Auto-caption telehealth sessions when possible."
          action={<Toggle checked={ax.captions} onChange={(v) => patch((p) => ({ ...p, accessibility: { ...p.accessibility, captions: v } }), `Captions · ${v ? "on" : "off"}`)} />} />
      </Section>
    </>
  );
}
