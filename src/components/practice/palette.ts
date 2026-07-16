// Shared palette tokens for the Practice (therapist) app.
//
// EVERY value here is a live CSS variable (defined in src/styles.css under
// `:root` and overridden under `.dark, [data-theme="dark"]`). That means any
// inline style like `style={{ background: palette.surface }}` automatically
// picks up the current theme — light or dark — with no per-component change.
//
// Do NOT put raw hex here; that's what broke dark mode. If you need a new
// token, add the corresponding `--pc-*` variable in styles.css (both the
// light and dark scopes) and reference it below.
export const palette = {
  surface:  "var(--pc-surface,  #FFFFFF)",
  surface2: "var(--pc-surface2, #F6F1F2)",
  border:   "var(--pc-border,   #EADFE2)",
  ink:      "var(--pc-ink,      #1E1418)",
  muted:    "var(--pc-muted,    #7B6A70)",
  primary:  "var(--pc-primary,  #B0567A)",
  soft:     "var(--pc-soft,     #F1C7D6)",
  ring:     "var(--pc-ring,     #D68CA6)",
  lavender: "var(--pc-lavender, #EFE4F0)",
  glass:       "var(--pc-glass,         rgba(255,255,255,0.60))",
  glassStrong: "var(--pc-glass-strong,  rgba(255,255,255,0.70))",
  solid:       "var(--pc-solid,         #FFFFFF)",
  inkContrast: "var(--pc-ink-contrast,  #FFFFFF)",
} as const;


