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

  // Explicit mode must agree with preset tone.
  if (theme === "light" && preset.tone === "dark") {
    return { ok: false, reason: `Light mode is using a dark preset "${bgAttr}".`, mode, bg: bgAttr, theme };
  }
  if (theme === "dark" && preset.tone === "light") {
    return { ok: false, reason: `Dark mode is using a light preset "${bgAttr}".`, mode, bg: bgAttr, theme };
  }

  // Resolved DOM mode must match preset tone.
  if (mode !== preset.tone) {
    return {
      ok: false,
      reason: `DOM is "${mode}" but preset "${bgAttr}" is ${preset.tone}.`,
      mode, bg: bgAttr, theme,
    };
  }

  return { ok: true, mode, bg: bgAttr, theme };
}
