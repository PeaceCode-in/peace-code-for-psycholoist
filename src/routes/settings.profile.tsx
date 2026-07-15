import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, TextArea } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";

export const Route = createFileRoute("/settings/profile")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: () => {
    const [s, set] = usePractice();
    return (
      <>
        <PageHeader title="Profile" description="What patients see when they browse your practice." />
        <Section title="Public profile">
          <Row label="Full name"><div className="mt-2 max-w-md"><TextField value={s.profile.fullName} onChange={(v) => set((p) => ({ ...p, profile: { ...p.profile, fullName: v } }))} /></div></Row>
          <Row label="Headline" hint="A short line under your name"><div className="mt-2 max-w-md"><TextField value={s.profile.headline} onChange={(v) => set((p) => ({ ...p, profile: { ...p.profile, headline: v } }))} /></div></Row>
          <Row label="Bio" hint="120–200 words works best"><div className="mt-2"><TextArea rows={4} value={s.profile.bio} onChange={(v) => set((p) => ({ ...p, profile: { ...p.profile, bio: v } }))} /></div></Row>
          <Row label="Pronouns"><div className="mt-2 max-w-[200px]"><TextField value={s.profile.pronouns} onChange={(v) => set((p) => ({ ...p, profile: { ...p.profile, pronouns: v } }))} /></div></Row>
          <Row label="Languages" hint="Comma separated"><div className="mt-2 max-w-md"><TextField value={s.profile.languages} onChange={(v) => set((p) => ({ ...p, profile: { ...p.profile, languages: v } }))} /></div></Row>
        </Section>
      </>
    );
  },
});
