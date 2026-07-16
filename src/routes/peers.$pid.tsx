import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, MapPin, Award } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { getPeer, usePeers, useDiscussions, useEndorsements, connectionOf, requestConnection, ME_ID } from "@/lib/peers-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/peers/$pid")({
  loader: ({ params }) => {
    const p = getPeer(params.pid);
    if (!p) throw notFound();
    return { pid: params.pid };
  },
  component: PeerProfile,
  notFoundComponent: () => <div className="p-8 text-[13px]" style={{ color: palette.muted }}>Peer not found.</div>,
});

function PeerProfile() {
  const { pid } = Route.useParams();
  const hydrated = useHydrated();
  const peers = usePeers();
  const p = peers.find((x) => x.id === pid);
  const discussions = useDiscussions();
  const endorsements = useEndorsements();
  const conn = connectionOf(pid);

  const authored = useMemo(() => discussions.filter((d) => d.authorId === pid).slice(0, 6), [discussions, pid]);
  const eIn = useMemo(() => endorsements.filter((e) => e.toId === pid), [endorsements, pid]);
  const pmap = useMemo(() => Object.fromEntries(peers.map((x) => [x.id, x])), [peers]);

  if (!hydrated || !p) return null;

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 pb-16">
      <Link to="/peers/directory" className="inline-flex items-center gap-1 text-[11px] mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <ArrowLeft className="h-3 w-3" /> Directory
      </Link>

      <div className="rounded-2xl border p-6 mb-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-[18px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'Fraunces', serif" }}>{p.avatarInitials}</div>
          <div className="flex-1">
            <h1 className="text-[26px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.name}</h1>
            <div className="text-[12px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.handle} · {p.years} yrs</div>
            <div className="text-[12px] mt-1 inline-flex items-center gap-1" style={{ color: palette.muted }}><MapPin className="h-3 w-3" /> {p.city}</div>
            <p className="mt-3 text-[14px]" style={{ color: palette.ink }}>{p.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {p.modalities.map((m) => <span key={m} className="text-[10px] rounded-full border px-2 py-0.5" style={{ borderColor: palette.border, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{m}</span>)}
            </div>
          </div>
          <div>
            {pid === ME_ID ? (
              <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Your profile</span>
            ) : conn?.status === "connected" ? (
              <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Connected</span>
            ) : conn ? (
              <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Pending</span>
            ) : (
              <button onClick={() => requestConnection(pid)} className="rounded-full px-3 py-1.5 text-[11px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Connect</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Recent discussions</div>
          {authored.length === 0 ? <p className="text-[12px]" style={{ color: palette.muted }}>None yet.</p> : authored.map((d) => (
            <Link key={d.id} to="/peers/discussions/$tid" params={{ tid: d.id }} className="block py-2 border-b last:border-0" style={{ borderColor: palette.border }}>
              <div className="text-[13px]" style={{ color: palette.ink }}>{d.title}</div>
              <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{d.replies.length} replies</div>
            </Link>
          ))}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Endorsements</div>
          {eIn.length === 0 ? <p className="text-[12px]" style={{ color: palette.muted }}>No endorsements yet.</p> : eIn.map((e) => {
            const from = pmap[e.fromId];
            return (
              <div key={e.id} className="py-3 border-b last:border-0" style={{ borderColor: palette.border }}>
                <div className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: palette.ink }}><Award className="h-3 w-3" /> <span style={{ fontFamily: "'Fraunces', serif" }}>{e.skill}</span></div>
                <p className="text-[12px] italic mt-1" style={{ color: palette.muted }}>"{e.note}"</p>
                <div className="text-[11px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>— {from?.name ?? "peer"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
