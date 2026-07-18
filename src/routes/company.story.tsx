import { createFileRoute } from "@tanstack/react-router";
import { CompanyPage } from "@/components/marketing/CompanyPage";

export const Route = createFileRoute("/company/story")({
  head: () => ({
    meta: [
      { title: "Our story — PeaceCode for Psychologists" },
      { name: "description", content: "Why we built PeaceCode: a calm, focused workspace made with and for practising psychologists in India and beyond." },
      { property: "og:title", content: "Our story — PeaceCode for Psychologists" },
      { property: "og:description", content: "Why we built PeaceCode for practising psychologists." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: StoryPage,
});

function StoryPage() {
  return (
    <CompanyPage
      tag="Our story"
      title="Built with practising"
      italic="psychologists."
      subtitle="PeaceCode began in a small Old Delhi clinic where three things kept getting in the way of good therapy: paperwork, scheduling, and software that wasn't built for clinicians."
      sections={[
        {
          eyebrow: "Origin",
          heading: "A clinic problem, not a startup idea.",
          body: "We spent the first six months shadowing psychologists — watching them wrestle with generic EHRs, spreadsheets, and WhatsApp scheduling. Every workflow we saw was slower than it needed to be, and every clinician told us the same thing: 'I chose this work to help people, not to type notes at 10pm.' PeaceCode is our answer.",
        },
        {
          eyebrow: "Principles",
          heading: "Calm surfaces. Clinical rigour underneath.",
          body: "We reject dashboards that look like control panels. Therapy is a slow, human craft — the software supporting it should feel that way too. Every screen goes through a 'would a burnt-out clinician find this soothing?' review before it ships.",
        },
        {
          eyebrow: "Today",
          heading: "A team of clinicians, engineers, and designers.",
          body: "PeaceCode is used by solo practitioners, group practices, and university counselling centres. Our team includes registered clinical psychologists who set the roadmap, and engineers who care as much about DPDP compliance as they do about animation curves.",
        },
        {
          eyebrow: "Tomorrow",
          heading: "The quiet backbone of Indian mental healthcare.",
          body: "Our goal is simple: make the operational side of a private practice so quiet you forget it's there. So you can spend your day where it matters — in the room, with the person in front of you.",
        },
      ]}
      ctaLabel="Try PeaceCode"
    />
  );
}
