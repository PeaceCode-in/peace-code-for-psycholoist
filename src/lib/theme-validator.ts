// Runtime check that the resolved theme mode and the active background
// preset agree. Reads the live DOM (data-pc-bg + `.dark` class) plus the
// persisted settings, so it catches drift no matter how the change happened
// (settings page, migration, external hydration script).
import { BG_THEMES, loadSettings, type BgThemeKey } from "./settings-store";

export type ThemeCheck =
  | { ok: true; mode: "light" | "dark"; bg: BgThemeKey; theme: string }
  | { ok: false; reason: string; mode: "light" | "dark"; bg: BgThemeKey | null; theme: string };

export function validateThemeConsistency(): ThemeCheck {
  if (typeof document === "undefined") {
    return { ok: false, reason: "No DOM (server render).", mode: "light", bg: null, theme: "unknown" };
  }
  const root = document.documentElement;
  const mode: "light" | "dark" = root.classList.contains("dark") ? "dark" : "light";
  const bgAttr = (root.getAttribute("data-pc-bg") || "") as BgThemeKey;
  const s = loadSettings();
  const theme = s.appearance.theme;
  const savedBg = s.appearance.bgTheme;
  const preset = BG_THEMES[bgAttr];

  if (!preset) return { ok: false, reason: `Unknown bg preset "${bgAttr}".`, mode, bg: null, theme };

  // Persisted bgTheme should match what the DOM shows.
  if (savedBg !== bgAttr) {
    return {
      ok: false,
      reason: `Persisted bgTheme "${savedBg}" doesn't match applied "${bgAttr}".`,
      mode, bg: bgAttr, theme,
    };
  }

  // Users may freely mix any preset with any mode — we only report unknown
  // presets or a persisted/applied mismatch, not tone drift.
  return { ok: true, mode, bg: bgAttr, theme };

}
