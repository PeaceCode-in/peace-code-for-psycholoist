import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, PrimaryButton } from "@/components/settings/primitives";
import { palette } from "@/components/practice/palette";
import { Users } from "lucide-react";

export const Route = createFileRoute("/settings/team")({
  head: () => ({ meta: [{ title: "Team — Settings" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <>
      <PageHeader title="Team" description="Add associates and receptionists to your practice." />
      <Section title="Members">
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: palette.soft, color: palette.primary }}><Users className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="text-[13px]" style={{ color: palette.ink }}>Solo practice</div>
            <div className="text-[11.5px] mt-0.5" style={{ color: palette.muted }}>Multi-therapist practices land in a later release. Join the waitlist to be first.</div>
          </div>
          <PrimaryButton>Join waitlist</PrimaryButton>
        </div>
      </Section>
      <Row label="" />
    </>
  ),
});
