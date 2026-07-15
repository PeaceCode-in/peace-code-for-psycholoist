import { createFileRoute, Link } from "@tanstack/react-router";
import { Mono, Serif, SAKURA } from "@/components/practice/onboarding/primitives";

export const Route = createFileRoute("/welcome/letter")({
  component: FoundersLetter,
});

function FoundersLetter() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <article
        className="max-w-2xl w-full rounded-3xl p-10 md:p-14"
        style={{
          background: "linear-gradient(180deg, #FBF3EF 0%, #F6E9E2 100%)",
          border: `1px solid ${SAKURA.border}`,
          boxShadow: "0 40px 100px -50px rgba(120,60,40,0.35)",
          color: "#3a2a25",
        }}
      >
        <Mono style={{ color: SAKURA.accent }}>A note from PeaceCode</Mono>
        <h1 className="mt-3 text-[34px] leading-[1.1]"><Serif>On the room, the door, and what we owe you.</Serif></h1>

        <div className="mt-8 space-y-5 text-[15.5px] leading-[1.75]" style={{ fontFamily: "'Fraunces', serif", fontOpticalSizing: "auto" }}>
          <p>Every therapist I have loved has told me the same thing: the software is not the point, but the software is in the way.</p>
          <p>PeaceCode is our attempt to get out of the way. Not to gamify your caseload. Not to score your empathy. Not to sell your patients anything, ever.</p>
          <p>We promise three small things. Your notes are yours. Your patients' data is theirs. The interface will stay quiet enough that you can hear yourself think between sessions.</p>
          <p>If we ever fail at these, write to me directly. The address is on every invoice.</p>
        </div>

        <div className="mt-10">
          <div style={{ fontFamily: "'Caveat', 'Fraunces', cursive", fontSize: 34, color: SAKURA.accent, lineHeight: 1 }}>— Rohan</div>
          <div className="mt-1 text-[12px]" style={{ color: "#7a5a50", fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Founder, PeaceCode</div>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link to="/welcome/complete" className="text-[12.5px] underline underline-offset-4" style={{ color: SAKURA.muted }}>← back to your practice</Link>
          <Link to="/" className="text-[12.5px]" style={{ color: SAKURA.accent, fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em", textTransform: "uppercase" }}>Open dashboard →</Link>
        </div>
      </article>
    </main>
  );
}
