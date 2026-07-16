import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, UserPlus2, Check, Clock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { usePeers, useConnections, requestConnection, ME_ID } from "@/lib/peers-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/peers/directory")({
  component: Directory,
});

function Directory() {
  const hydrated = useHydrated();
  const peers = usePeers();
  const conns = useConnections();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState("");

  const cmap = useMemo(() => Object.fromEntries(conns.map((c) => [c.peerId, c.status])), [conns]);
  const allFocus = useMemo(() => Array.from(new Set(peers.flatMap((p) => p.focus))).sort(), [peers]);
  const filtered = peers.filter((p) => p.id !== ME_ID)
    .filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.handle.includes(q.toLowerCase()) || p.city.toLowerCase().includes(q.toLowerCase()))
    .filter((p) => !focus || p.focus.includes(focus));

  if (!hydrated) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
          <Search className="h-3.5 w-3.5" style={{ color: palette.muted }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, handle, city" className="bg-transparent text-[12px] w-64 outline-none" style={{ color: palette.ink }} />
        </div>
        <select value={focus} onChange={(e) => setFocus(e.target.value)} className="border rounded-full px-3 py-1.5 text-[11px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <option value="">All focus areas</option>
          {allFocus.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => {
          const status = cmap[p.id];
          return (
            <div key={p.id} className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-[13px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'Fraunces', serif" }}>{p.avatarInitials}</div>
                <div className="min-w-0">
                  <Link to="/peers/$pid" params={{ pid: p.id }} className="text-[14px] hover:underline" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{p.name}</Link>
                  <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.handle} · {p.city}</div>
                </div>
              </div>
              <p className="mt-3 text-[12px] line-clamp-2" style={{ color: palette.muted }}>{p.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.focus.map((f) => <span key={f} className="text-[10px] rounded-full border px-2 py-0.5" style={{ borderColor: palette.border, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{f}</span>)}
              </div>
              <div className="mt-4">
                {status === "connected" ? (
                  <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}><Check className="h-3 w-3" /> Connected</span>
                ) : status === "pending_out" ? (
                  <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}><Clock className="h-3 w-3" /> Requested</span>
                ) : status === "pending_in" ? (
                  <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Awaits your response</span>
                ) : (
                  <button onClick={() => requestConnection(p.id)} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    <UserPlus2 className="h-3 w-3" /> Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
