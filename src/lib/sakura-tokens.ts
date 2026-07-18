/**
 * Sakura Design Tokens — single source of truth.
 *
 * These values are mirrored as CSS custom properties in `src/styles.css`
 * under the `:root` block (with high-contrast overrides scoped to
 * `[data-contrast="high"]`). Import `SAKURA` from this module in TSX and
 * reference `var(--sakura-*)` in CSS/className strings to keep the palette
 * consistent across every page, section, card, and overlay.
 *
 * If you change a value here, update the matching `--sakura-*` variable
 * in `src/styles.css` in the same commit.
 */

export const SAKURA = {
  // Surfaces
  cream:  "#F9E6EC", // page base
  petal:  "#F2C9D6", // soft pink surface
  blush:  "#E9A9BE", // deeper pink surface

  // Ink / text
  ink:    "#140A0E", // near-black primary text
  muted:  "#5B4348", // muted body copy (AA on cream)
  rose:   "#8A3355", // brand rose (darker for AA)

  // Structure
  border: "#D9B8C2", // hairline border

  // Glass overlays (use directly in `background:` strings)
  glassColorBg:  "rgba(255,248,250,0.55)",
  glassColorBrd: "rgba(138,51,85,0.18)",
  glassWhiteBg:  "rgba(255,255,255,0.70)",
  glassWhiteBrd: "rgba(255,255,255,0.80)",

  // High-contrast overrides
  hc: {
    base:   "#F0C9D6",
    ink:    "#000000",
    muted:  "#2E1A1F",
    rose:   "#5A1A34",
  },
} as const;

export type SakuraToken = keyof typeof SAKURA;
