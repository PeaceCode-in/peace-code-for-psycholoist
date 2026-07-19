import { useEffect, useState } from "react";

const KEY_MODE = "pc-mkt-mode";
const KEY_CONTRAST = "pc-mkt-contrast";

type Mode = "light" | "dark";
type Contrast = "normal" | "high";

function readMode(): Mode {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem(KEY_MODE) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function readContrast(): Contrast {
  if (typeof window === "undefined") return "normal";
  try {
    return localStorage.getItem(KEY_CONTRAST) === "high" ? "high" : "normal";
  } catch {
    return "normal";
  }
}

/**
 * Shared marketing-site theme state. Every page under the marketing shell
 * (for-psychologists, features index, feature deep-dives, company pages)
 * uses this hook so toggling dark mode on one page is reflected everywhere.
 */
export function useMarketingTheme() {
  const [mode, setMode] = useState<Mode>("light");
  const [contrast, setContrast] = useState<Contrast>("normal");

  useEffect(() => {
    setMode(readMode());
    setContrast(readContrast());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY_MODE) setMode(readMode());
      if (e.key === KEY_CONTRAST) setContrast(readContrast());
    };
    const onCustom = () => {
      setMode(readMode());
      setContrast(readContrast());
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pc-mkt-theme-change", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pc-mkt-theme-change", onCustom);
    };
  }, []);

  const setModeSynced = (next: Mode) => {
    setMode(next);
    try {
      localStorage.setItem(KEY_MODE, next);
      window.dispatchEvent(new Event("pc-mkt-theme-change"));
    } catch {}
  };

  const setContrastSynced = (next: Contrast) => {
    setContrast(next);
    try {
      localStorage.setItem(KEY_CONTRAST, next);
      window.dispatchEvent(new Event("pc-mkt-theme-change"));
    } catch {}
  };

  const toggleDark = () => setModeSynced(mode === "dark" ? "light" : "dark");
  const toggleContrast = () =>
    setContrastSynced(contrast === "high" ? "normal" : "high");

  return {
    mode,
    contrast,
    darkMode: mode === "dark",
    highContrast: contrast === "high",
    setMode: setModeSynced,
    setContrast: setContrastSynced,
    toggleDark,
    toggleContrast,
  };
}
