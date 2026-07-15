import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PortalShell, Card, portal } from "@/components/portal/PortalShell";
import { fmtRelative, useMyThreads } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/messages")({
  head: () => ({ meta: [{ title: "Messages" }, { name: "robots", content: "noindex" }] }),
  component: MessagesIndex,
});

function MessagesIndex() {
  const matchRoute = useMatchRoute();
  const isDetail = matchRoute({ to: "/portal/messages/$threadId" as any });
  if (isDetail) return <Outlet />;

  const threads = useMyThreads();

  return (
    <PortalShell title="Messages" subtitle="A private, secure space between you and your therapist.">
      <div className="mb-6 rounded-2xl p-4 text-[13px]" style={{ background: portal.soft, color: portal.roseDeep }}>
        Messages here are not for emergencies. If you're in crisis right now, tap <Link to="/portal/crisis" className="underline underline-offset-2">I need help now</Link>.
      </div>
      <div className="flex flex-col gap-2">
        {threads.map(t => {
          const last = t.messages[t.messages.length - 1];
          const unread = t.messages.some(m => m.from === "therapist" && !m.readAt);
          return (
            <Link key={t.id} to="/portal/messages/$threadId" params={{ threadId: t.id }} className="flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-[#FDF9F7]" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  {unread ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: portal.rose }} /> : null}
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: unread ? 500 : 400 }}>{t.subject}</p>
                </div>
                <p className="mt-1 line-clamp-1 text-[13px]" style={{ color: portal.muted }}>
                  {last.from === "therapist" ? "" : "You: "}{last.body}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[12px]" style={{ color: portal.muted }}>{fmtRelative(last.sentAt)}</span>
                <ChevronRight className="h-4 w-4" style={{ color: portal.muted }} />
              </div>
            </Link>
          );
        })}
      </div>
    </PortalShell>
  );
}
