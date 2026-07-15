// Preferences: sound design (opt-in) + reduced-motion echo.
// Local-first, event-bus pattern matching other stores.
import { useEffect, useState } from "react";

type Prefs = {
  soundsEnabled: boolean;
  soundSessionStart: boolean;
  soundNoteRatified: boolean;
  soundUrgentNotification: boolean;
};

const KEY = "pc.prefs.v1";
const DEFAULT: Prefs = {
  soundsEnabled: false,
  soundSessionStart: true,
  soundNoteRatified: true,
  soundUrgentNotification: true,
};

function read(): Prefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}
function write(next: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  window.dispatchEvent(new CustomEvent("pc:prefs"));
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  useEffect(() => {
    setPrefs(read());
    const on = () => setPrefs(read());
    window.addEventListener("pc:prefs", on);
    return () => window.removeEventListener("pc:prefs", on);
  }, []);
  const update = (patch: Partial<Prefs>) => write({ ...read(), ...patch });
  return [prefs, update] as const;
}

// Soft, warm, opt-in sound cues — synthesized via WebAudio, no assets.
type Cue = "sessionStart" | "noteRatified" | "urgent";

export function playCue(cue: Cue) {
  if (typeof window === "undefined") return;
  const p = read();
  if (!p.soundsEnabled) return;
  if (cue === "sessionStart" && !p.soundSessionStart) return;
  if (cue === "noteRatified" && !p.soundNoteRatified) return;
  if (cue === "urgent" && !p.soundUrgentNotification) return;
  try {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (cue === "sessionStart") {
      osc.type = "sine"; osc.frequency.value = 528;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(now); osc.stop(now + 0.32);
    } else if (cue === "noteRatified") {
      osc.type = "triangle"; osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.start(now); osc.stop(now + 0.22);
    } else {
      osc.type = "sine"; osc.frequency.value = 320;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now); osc.stop(now + 0.42);
    }
  } catch {
    // Silent failure — sound is a nicety, never a requirement.
  }
}
