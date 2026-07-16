// Contextual one-line "whisper" that appears at the bottom of a page once
// per module, then never again. Non-blocking, esc-dismissable.
import { useEffect, useState } from "react";
import { hasSeenTour, markTourSeen } from "@/lib/onboarding-store";
import { palette } from "@/components/practice/palette";
import { X } from "lucide-react";

export function TourWhisper({ tourKey, children }: { tourKey: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasSeenTour(tourKey)) return;
    const t = setTimeout(() => setVisible(true), 900);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourKey]);

  function dismiss() { markTourSeen(tourKey); setVisible(false); }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
      style={{ animation: "pc-whisper 260ms cubic-bezier(.4,0,.2,1)" }}
    >
      <div
        className="flex items-center gap-3 rounded-full px-5 py-2.5 max-w-lg"
        style={{
          background: palette.glassStrong,
          border: `1px solid ${palette.border}`,
          boxShadow: "0 20px 40px -20px rgba(30,20,24,0.35)",
          backdropFilter: "blur(18px) saturate(140%)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: palette.primary, boxShadow: `0 0 8px ${palette.primary}` }} />
        <span className="text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif", fontOpticalSizing: "auto" }}>
          {children}
        </span>
        <button onClick={dismiss} className="ml-2 rounded-full p-1 hover:bg-black/5" title="Esc to dismiss">
          <X className="h-3 w-3" style={{ color: palette.muted }} />
        </button>
      </div>
      <style>{`@keyframes pc-whisper { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}

// Small ribbon shown when sample data mode is active.
export function SampleDataRibbon({ onClear }: { onClear?: () => void }) {
  return (
    <div
      className="mb-4 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-[12.5px]"
      style={{
        background: "linear-gradient(90deg, rgba(176,86,122,0.06), rgba(241,199,214,0.15))",
        border: `1px dashed ${palette.primary}55`,
        color: palette.muted,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: palette.primary }} />
      <span style={{ fontFamily: "'Fraunces', serif" }}>Sample data — three fictional patients live here to keep the room breathing.</span>
      {onClear && <button onClick={onClear} className="ml-auto underline underline-offset-2" style={{ color: palette.primary }}>clear</button>}
    </div>
  );
}
