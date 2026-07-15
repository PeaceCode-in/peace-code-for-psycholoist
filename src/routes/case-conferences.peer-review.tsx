import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Lock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveConferences, REASON_META } from "@/lib/conferences-store";
import { getMember } from "@/lib/team-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/case-conferences/peer-review")({
  head: () => ({
    meta: [
      { title: "Peer review — PeaceCode · Practice" },
      { name: "description", content: "De-identified case discussions for CPD hours. No patient identifiers, structured reflection." },
    ],
  }),
  component: PeerReviewPage,
});

function PeerReviewPage() {
  const hydrated = useHydrated();
  const all = useLiveConferences();
  const peer = all.filter((c) => c.peerReview);

  if (!hydrated) return <div className="max-w-[1400px] mx-auto px-8 py-16 text-[11px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>Loading…</div>;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="rounded-2xl border p-5 mb-5" style={{ borderColor: palette.border, background: palette.lavender + "80" }}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full p-2" style={{ background: "#fff" }}>
            <GraduationCap className="h-4 w-4" style={{ color: palette.primary }} />
          </div>
          <div>
            <p className="text-[13.5px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Peer review · de-identified only.</p>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>No patient names, no session dates. Structured as: what I did · what I&apos;d change · what I&apos;d like feedback on. Counts toward CPD hours.</p>
          </div>
        </div>
      </div>

      {peer.length === 0 ? (
        <div className="rounded-3xl border p-16 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
          <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>No peer-review cases yet.</p>
          <p className="text-[12.5px] mt-2" style={{ color: palette.muted }}>Start one to log a de-identified consult.</p>
          <Link to="/case-conferences/new" search={{ peer: "1" }} className="inline-flex items-center gap-2 mt-5 h-9 px-4 rounded-full text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>
            New peer-review case
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {peer.map((c) => {
            const facilitator = getMember(c.facilitatorId);
            return (
              <Link key={c.id} to="/case-conferences/$cid" params={{ cid: c.id }} className="block rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: REASON_META[c.reason].tone, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{REASON_META[c.reason].label}</span>
                      <span style={{ color: palette.muted }}>·</span>
                      <span className="text-[11.5px]" style={{ color: palette.muted }}>{facilitator?.preferredName ?? facilitator?.fullName}</span>
                    </div>
                    <p className="text-[14.5px] leading-snug" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{c.presenting}</p>
                  </div>
                  {c.status === "closed" && <Lock className="h-3.5 w-3.5 mt-1" style={{ color: palette.muted }} />}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
