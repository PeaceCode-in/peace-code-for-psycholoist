import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PortalShell, Card, Chip, portal } from "@/components/portal/PortalShell";
import { bandFor, fmtDateWarm, useMyAssessments } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/assessments")({
  head: () => ({ meta: [{ title: "Check-ins" }, { name: "robots", content: "noindex" }] }),
  component: AssessmentsIndex,
});

function AssessmentsIndex() {
  const list = useMyAssessments();
  const matchRoute = useMatchRoute();
  const isDetail = matchRoute({ to: "/portal/assessments/$id" as any });
  if (isDetail) return <Outlet />;

  const pending = list.filter(a => a.status !== "completed");
  const done = list.filter(a => a.status === "completed");

  return (
    <PortalShell title="Check-ins" subtitle="Short questionnaires your therapist uses to understand how you're feeling. Take them at your pace.">
      <section className="mb-10">
        <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>For you to complete</h2>
        {pending.length === 0 ? (
          <Card><p style={{ color: portal.muted }}>You're all caught up.</p></Card>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map(a => (
              <Link key={a.id} to="/portal/assessments/$id" params={{ id: a.id }} className="flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-[#FDF9F7]" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
                <div className="min-w-0 flex-1">
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 19 }}>{a.instrument} check-in</p>
                  <p className="text-[13px]" style={{ color: portal.muted }}>
                    {a.status === "in-progress" ? "Continue where you left off · " : ""}
                    About {a.instrument === "PHQ-9" ? "3" : a.instrument === "GAD-7" ? "2" : "3"} minutes
                    {a.dueAt ? ` · due ${fmtDateWarm(a.dueAt).toLowerCase()}` : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4" style={{ color: portal.muted }} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Your recent check-ins</h2>
          <div className="flex flex-col gap-2">
            {done.map(a => {
              const band = a.score != null ? bandFor(a.instrument, a.score) : null;
              return (
                <Card key={a.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>{a.instrument}</p>
                      <p className="text-[13px]" style={{ color: portal.muted }}>Completed {a.completedAt ? fmtDateWarm(a.completedAt).toLowerCase() : ""}</p>
                    </div>
                    {band ? <Chip tone={band.tone}>{band.label}</Chip> : null}
                  </div>
                  {band ? <p className="mt-3 text-[14px]">{band.friendly}</p> : null}
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </PortalShell>
  );
}
