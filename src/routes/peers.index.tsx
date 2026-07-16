import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { MessagesSquare, BookOpen, Share2, UserPlus2, CheckCircle2 } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useDiscussions, useConnections, useReferrals, useJournal, usePeers, useEndorsements, KIND_LABEL, ME_ID, acceptConnection } from "@/lib/peers-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/peers/")({
  component: PeersHome,
});

function fmtAgo(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}

function PeersHome() {
  const hydrated = useHydrated();
  const discussions = useDiscussions();
  const connections = useConnections();
  const referrals = useReferrals();
  const journal = useJournal();
  const peers = usePeers();
  const endorsements = useEndorsements();

  const pmap = useMemo(() => Object.fromEntries(peers.map((p) => [p.id, p])), [peers]);
  const connected = connections.filter((c) => c.status === "connected");
  const pendingIn = connections.filter((c) => c.status === "pending_in");
  const openReferrals = referrals.filter((r) => r.status === "open");
  const nextClub = journal.find((j) => j.discussionAt && j.discussionAt > Date.now());
  const mineEndorsements = endorsements.filter((e) => e.toId === ME_ID);

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Connections" value={String(connected.length)} sub={pendingIn.length ? `${pendingIn.length} pending` : "up to date"} tone={pendingIn.length ? "warn" : "ok"} />
        <Stat label="Open threads" value={String(discussions.filter((d) => !d.resolved).length)} sub={`${discussions.length} total`} />
        <Stat label="Open referrals" value={String(openReferrals.length)} sub={openReferrals.length ? "needs response" : "clear"} tone={openReferrals.length ? "warn" : "ok"} />
        <Stat label="Endorsements" value={String(mineEndorsements.length)} sub="from peers" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <SectionHead icon={<MessagesSquare className="h-4 w-4" />} label="Recent discussions" href="/peers/discussions" />
          {discussions.slice(0, 4).map((d) => {
            const author = pmap[d.authorId];
            const authorLabel = d.anonymised ? author?.handle ?? "@anon" : author?.name ?? "—";
            return (
              <Link key={d.id} to="/peers/discussions/$tid" params={{ tid: d.id }} className="block rounded-2xl border p-5 hover:border-[var(--ink)] transition-all duration-[180ms]" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)", ["--ink" as string]: palette.ink }}>
                <div className="flex items-center gap-2 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <span className="uppercase tracking-[0.12em]">{KIND_LABEL[d.kind]}</span>
                  <span>·</span>
                  <span>{authorLabel}</span>
                  <span>·</span>
                  <span>{fmtAgo(d.createdAt)} ago</span>
                  {d.resolved ? <><span>·</span><span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> resolved</span></> : null}
                </div>
                <div className="mt-2 text-[16px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{d.title}</div>
                <p className="mt-1 text-[13px] line-clamp-2" style={{ color: palette.muted }}>{d.body}</p>
                <div className="mt-3 flex items-center justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <span>{d.replies.length} {d.replies.length === 1 ? "reply" : "replies"}</span>
                  <span>{d.tags.map((t) => `#${t}`).join("  ")}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="space-y-5">
          {pendingIn.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
              <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Pending requests</div>
              {pendingIn.map((c) => {
                const p = pmap[c.peerId];
                if (!p) return null;
                return (
                  <div key={c.peerId} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: palette.border }}>
                    <div>
                      <div className="text-[13px]" style={{ color: palette.ink }}>{p.name}</div>
                      <div className="text-[11px]" style={{ color: palette.muted }}>{p.credentials ?? p.focus.join(" · ")}</div>
                    </div>
                    <button onClick={() => acceptConnection(c.peerId)} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px]" style={{ background: palette.ink, color: "#fff" }}>
                      <UserPlus2 className="h-3 w-3" /> Accept
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {nextClub && (
            <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <BookOpen className="h-3.5 w-3.5" /> Next journal club
              </div>
              <Link to="/peers/journal-club" className="text-[15px] hover:underline" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{nextClub.paperTitle}</Link>
              <div className="mt-1 text-[12px]" style={{ color: palette.muted }}>{nextClub.authors} · {nextClub.venue} ({nextClub.year})</div>
              <div className="mt-3 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {new Date(nextClub.discussionAt!).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {nextClub.attendees.length} attending
              </div>
            </div>
          )}

          {openReferrals.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <Share2 className="h-3.5 w-3.5" /> Open referrals
              </div>
              {openReferrals.slice(0, 3).map((r) => {
                const p = pmap[r.counterpartId];
                return (
                  <Link key={r.id} to="/peers/referrals" className="block py-2 border-b last:border-0" style={{ borderColor: palette.border }}>
                    <div className="text-[13px]" style={{ color: palette.ink }}>{r.focus}</div>
                    <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{r.direction === "sent" ? "→ " : "← "}{p?.name ?? "—"} · {r.patientInitials}</div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Endorsements for you</div>
            {mineEndorsements.length === 0 ? (
              <p className="text-[12px]" style={{ color: palette.muted }}>None yet.</p>
            ) : mineEndorsements.map((e) => {
              const from = pmap[e.fromId];
              return (
                <div key={e.id} className="py-2 border-b last:border-0" style={{ borderColor: palette.border }}>
                  <div className="text-[12px]" style={{ color: palette.ink }}><span style={{ fontFamily: "'Fraunces', serif" }}>{e.skill}</span></div>
                  <p className="text-[12px] italic mt-1" style={{ color: palette.muted }}>"{e.note}"</p>
                  <div className="text-[11px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>— {from?.name ?? "peer"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone = "ok" }: { label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  const border = tone === "warn" ? "rgba(203,108,84,0.4)" : palette.border;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
      <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
      <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{sub}</div>
    </div>
  );
}

function SectionHead({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        {icon} {label}
      </div>
      <Link to={href} className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>see all →</Link>
    </div>
  );
}
