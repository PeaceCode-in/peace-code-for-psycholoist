// Shared palette tokens for the Practice (therapist) app.
//
// `primary` / `soft` / `ring` are LIVE CSS variables driven by
// Settings › Appearance › Accent. Anywhere we pass palette.primary as a
// color / background value, the browser resolves it against the current
// `--pc-primary`. Change the accent and every surface using it updates
// instantly — no hard-coded rose anywhere.
export const palette = {
  surface: "#FFFFFF",
  surface2: "#F6F1F2",
  border: "#EADFE2",
  ink: "#1E1418",
  muted: "#7B6A70",
  primary: "var(--pc-primary, #B0567A)",
  soft: "var(--pc-soft, #F1C7D6)",
  ring: "var(--pc-ring, #D68CA6)",
  lavender: "#EFE4F0",
} as const;
