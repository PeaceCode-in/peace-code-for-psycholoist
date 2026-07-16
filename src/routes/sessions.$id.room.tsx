import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, MonitorUp, Captions, NotebookPen, PhoneOff, X } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveSession, useLiveRoom, updateRoom, startRoom, endRoom, recordEvent, completeSession } from "@/lib/sessions-store";
import { getPatient, avatarUrl } from "@/lib/patients-store";
import { ConnectionMeter } from "@/components/viz/ConnectionMeter";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/sessions/$id/room")({
  head: () => ({ meta: [{ title: "Session room — PeaceCode · Practice" }] }),
  component: RoomView,
});

const CAPTIONS = [
  "So this week I actually managed the presentation without the panic spiral…",
  "That is a real shift. Walk me through what felt different in the moment.",
  "I remembered the grounding — five things I could see. It slowed everything.",
];

function fmtDur(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function RoomView() {
  const hydrated = useHydrated();
  const { id } = Route.useParams();
  const session = useLiveSession(id);
  const room = useLiveRoom(id);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef(false);

  // start room once
  useEffect(() => {
    if (!session || startedRef.current) return;
    startedRef.current = true;
    if (!room.startedAt) startRoom(session.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  useEffect(() => {
    const start = room.startedAt ? new Date(room.startedAt).getTime() : Date.now();
    const t = setInterval(() => setElapsed(Date.now() - start), 500);
    return () => clearInterval(t);
  }, [room.startedAt]);

  useEffect(() => {
    if (!room.captionsOn) return;
    const t = setInterval(() => setCaptionIdx((i) => (i + 1) % CAPTIONS.length), 4200);
    return () => clearInterval(t);
  }, [room.captionsOn]);

  if (!hydrated) return null;
  if (!session) throw notFound();
  const patient = getPatient(session.patientId);

  function toggleMic() { const next = !room.micOn; updateRoom(id, { micOn: next }); recordEvent(id, next ? "unmute" : "mute"); }
  function toggleCam() { const next = !room.camOn; updateRoom(id, { camOn: next }); recordEvent(id, next ? "cam_on" : "cam_off"); }
  function toggleShare() { const next = !room.screenShare; updateRoom(id, { screenShare: next }); recordEvent(id, next ? "screen_start" : "screen_end"); }
  function toggleCaptions() { const next = !room.captionsOn; updateRoom(id, { captionsOn: next }); recordEvent(id, next ? "captions_on" : "captions_off"); }

  function confirmEnd() {
    endRoom(id);
    navigate({ to: "/sessions/$id/wrap", params: { id } });
  }

  return (
    <div className="fixed inset-0 z-40 overflow-hidden" style={{ background: "radial-gradient(120% 80% at 50% 20%, #F5DDE4 0%, #FBF7F8 55%, #F1E4E8 100%)" }}>
      {/* film grain */}
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-6 z-20">
        <div className="rounded-full border px-3 py-2" style={{ background: palette.glass, backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.6)" }}>
          <ConnectionMeter quality={room.connectionQuality} />
        </div>

        <div className="rounded-full border px-4 py-2 tabular-nums" style={{ background: palette.glass, backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.6)", color: palette.primary, fontFamily: "'Fraunces', serif", fontVariantNumeric: "tabular-nums", fontSize: 15 }}>
          {fmtDur(elapsed)}
        </div>

        <button
          onClick={() => navigate({ to: "/sessions/$id", params: { id } })}
          className="w-9 h-9 rounded-full flex items-center justify-center border transition-transform hover:scale-105"
          style={{ background: palette.glass, backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.6)", color: palette.ink }}
          aria-label="Minimize"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Center stage */}
      <div className="absolute inset-0 flex items-center justify-center px-6 pt-24 pb-40">
        <div className="relative w-full max-w-4xl aspect-video rounded-[32px] overflow-hidden border" style={{ background: "linear-gradient(135deg, #F1C7D6 0%, #EFE4F0 100%)", borderColor: "rgba(255,255,255,0.7)", boxShadow: "0 30px 80px -30px rgba(30,20,24,0.35), inset 0 0 0 1px rgba(255,255,255,0.35)" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              {room.camOn ? (
                <img
                  src={avatarUrl(patient?.id ?? "peer")}
                  alt=""
                  className="w-40 h-40 rounded-full opacity-90"
                  style={{ filter: "blur(0.4px) saturate(1.05)", boxShadow: "0 0 60px rgba(176,86,122,0.35)" }}
                />
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-[28px]" style={{ background: palette.glass, color: palette.ink, fontFamily: "'Fraunces', serif" }}>
                    {(patient?.preferredName ?? patient?.fullName ?? "—").slice(0, 1)}
                  </div>
                  <p className="mt-3 text-[11px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Video paused</p>
                </div>
              )}
            </div>

            {/* Name plate */}
            <div className="absolute bottom-5 left-5 rounded-full px-3.5 py-1.5" style={{ background: "rgba(30,20,24,0.35)", backdropFilter: "blur(14px)", color: "#fff" }}>
              <span className="text-[12.5px]" style={{ fontFamily: "'Fraunces', serif" }}>{patient?.preferredName ?? patient?.fullName}</span>
            </div>
        </div>

        {/* Self preview */}
        <div className="absolute bottom-32 right-8 w-[180px] h-[120px] rounded-2xl border overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EADFE2, #FBF7F8)", borderColor: "rgba(255,255,255,0.7)", boxShadow: "0 10px 30px -12px rgba(30,20,24,0.4)" }}>
          <span className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted }}>You</span>
        </div>
      </div>

      {/* Captions */}
      {room.captionsOn && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-40 max-w-2xl w-[calc(100%-3rem)] rounded-2xl px-4 py-3 text-center animate-in fade-in duration-200"
          style={{ background: palette.glassStrong, backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)" }}>
          <p className="text-[13.5px] leading-snug" style={{ color: palette.ink }}>{CAPTIONS[captionIdx]}</p>
        </div>
      )}

      {/* Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 rounded-full border px-3 h-[72px]" style={{ background: palette.glassStrong, backdropFilter: "blur(24px) saturate(140%)", borderColor: "rgba(255,255,255,0.6)", boxShadow: "0 20px 50px -20px rgba(30,20,24,0.3)" }}>
          <DockBtn active={room.micOn} onClick={toggleMic} label={room.micOn ? "Mute" : "Unmute"}>{room.micOn ? <Mic className="w-4 h-4" strokeWidth={1.5} /> : <MicOff className="w-4 h-4" strokeWidth={1.5} />}</DockBtn>
          <DockBtn active={room.camOn} onClick={toggleCam} label={room.camOn ? "Stop video" : "Start video"}>{room.camOn ? <Video className="w-4 h-4" strokeWidth={1.5} /> : <VideoOff className="w-4 h-4" strokeWidth={1.5} />}</DockBtn>
          <DockBtn active={room.screenShare} onClick={toggleShare} label="Share screen"><MonitorUp className="w-4 h-4" strokeWidth={1.5} /></DockBtn>
          <DockBtn active={room.captionsOn} onClick={toggleCaptions} label="Captions"><Captions className="w-4 h-4" strokeWidth={1.5} /></DockBtn>
          <DockBtn active={notesOpen} onClick={() => setNotesOpen((v) => !v)} label="Notes"><NotebookPen className="w-4 h-4" strokeWidth={1.5} /></DockBtn>
          <button
            onClick={() => setConfirm(true)}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{ background: "#B0384A", color: "#fff", boxShadow: "0 8px 20px -10px rgba(176,56,74,0.6)" }}
            aria-label="End session"
          >
            <PhoneOff className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Notes drawer */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-[380px] z-30 transition-transform duration-200 ease-out ${notesOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-full p-4">
          <div className="h-full rounded-3xl border p-5 overflow-y-auto" style={{ background: palette.glassStrong, backdropFilter: "blur(24px) saturate(140%)", borderColor: "rgba(255,255,255,0.6)" }}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>Quick capture</p>
              <button onClick={() => setNotesOpen(false)}><X className="w-4 h-4" style={{ color: palette.muted }} /></button>
            </div>
            {(["Subjective", "Objective", "Assessment", "Plan"] as const).map((label) => (
              <div key={label} className="mt-4">
                <p className="text-[10.5px] tracking-[0.14em] uppercase mb-1.5" style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{label}</p>
                <textarea className="w-full bg-transparent outline-none text-[13px] resize-none min-h-[64px] border-b" placeholder="…" style={{ color: palette.ink, borderColor: palette.border }} />
              </div>
            ))}
            <p className="text-[10.5px] mt-4" style={{ color: palette.muted }}>Autosaves — finalise in the wrap-up screen.</p>
          </div>
        </div>
      </div>

      {/* Confirm end */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(30,20,24,0.4)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl border p-6 max-w-sm w-full animate-in fade-in duration-150" style={{ background: palette.glassStrong, borderColor: "rgba(255,255,255,0.6)" }}>
            <h2 className="text-[18px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>End this session?</h2>
            <p className="text-[12.5px] mt-2" style={{ color: palette.muted }}>You'll be taken to a quick wrap-up. Timer stops now.</p>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={() => setConfirm(false)} className="h-9 px-4 rounded-full text-[12px]" style={{ color: palette.ink }}>Keep going</button>
              <button onClick={confirmEnd} className="h-9 px-4 rounded-full text-[12px]" style={{ background: "#B0384A", color: "#fff" }}>End session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DockBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-150"
      style={{
        background: active ? "#B0567A" : "transparent",
        color: active ? "#fff" : palette.ink,
        boxShadow: active ? "0 0 0 4px rgba(176,86,122,0.16)" : "none",
      }}
    >
      {children}
    </button>
  );
}
