# Therapist ↔ Student Parity Pass

Two workstreams. Part B (theme engine) is self-contained and low-risk, so it ships first and unblocks the "feels like the same PeaceCode" check. Part A (real audit + module sweep) is high-risk touch-everything work and needs the audit tool built *before* any edits so we measure progress against ground truth, not vibes.

## Order of operations

```text
Wave 0 — Foundations (no visible change, unblocks everything)
Wave 1 — Theme engine port (Part B) — visible, isolated
Wave 2 — Real audit tool + first report snapshot (Part A infra)
Wave 3 — Module sweep, in the 18-step order you listed
Wave 4 — Re-run audit until both reports read zero
```

Each wave is a separate turn. Trying to land all four in one shot means the build breaks somewhere in the middle of Wave 3 and neither of us can tell which module did it.

## Wave 0 — Foundations

- Confirm `src/lib/formatters.ts`, `src/lib/enums.ts`, `src/lib/constants.ts` cover every case the sweep will need. Add missing helpers up front (e.g. `formatPhone`, `formatLicense`, `SAMPLE_EMAIL_DOMAINS` allowlist) so the sweep never blocks on "no helper exists yet."
- Rename `formatters.ts` re-exports so both `src/lib/format.ts` (your spec) and the existing `formatters.ts` resolve — one canonical file, one shim.
- Add `usePractice()` selectors for clinician name, credentials, clinic address, GST, license — every field the sweep will replace.

## Wave 1 — Theme engine port (Part B, standalone)

Port the student system verbatim, renamed for the practice namespace:

- `src/lib/practice-settings-store.ts` (already exists) → replace shape with the student's `settings-store.ts` shape. 15 `bgTheme` presets, 7 `accent` presets, all appearance + a11y controls listed in the brief. Storage key `peacecode.practice.settings.v1`. Same `applyAppearance()` / `applyAccessibility()` / `useSettings()` API.
- `src/components/GlassFX.tsx` — copy the student version, mount once in `AppShell` root, includes the pre-hydration inline script that reads `bgTheme` and sets `html[data-pc-bg]` before React boots (no flash).
- `src/styles.css` — port the full `[data-pc-bg="..."]` block (15 gradient stacks + grain layer), the 7 accent blocks setting `--pc-primary` / `--pc-soft` / `--pc-aurora-b`, the `data-density` / `data-motion` / `data-glass` / `data-card-style` / `data-chart-style` rules.
- `src/routes/settings.appearance.tsx` — rebuild to match student layout: live canvas preview, swatch tiles for the 15 bg themes and 7 accents, typography sliders, density picker, a11y section.
- Defaults for new therapist accounts: `bgTheme: "sakura"`, `accent: "rose"`, `theme: "light"`.

Ship criterion for Wave 1: opening the therapist app in a fresh browser lands on Sakura + Rose, matches the student home visually side-by-side, and every swatch in `/settings/appearance` changes the canvas live.

## Wave 2 — Real audit infrastructure (Part A infra only)

- `scripts/audit.ts` — real static-analysis sweep. Uses `ts-morph` (already an option) or the TypeScript compiler API + `fast-glob` over `src/**/*.{ts,tsx}`.
  - **Hardcode scan** — matches: `toLocaleString(`, `Intl.NumberFormat`, `Intl.DateTimeFormat`, `.toLocaleDateString`, `.toLocaleTimeString`, raw `₹`/`$` in JSX text, raw status literals (`"scheduled"|"completed"|"cancelled"|"paid"|"overdue"|"draft"|"signed"`) outside `enums.ts`, hardcoded email patterns (`test@|example@|demo@|@example\.`), hardcoded phone/GST/license patterns, date strings matching `/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/`.
  - **Dead-button scan** — AST walk: for each JSX `<button>`, `<Button>`, `role="button"`, or element with a click handler, verify presence of one of `onClick`, `onSubmit`, `href`, `to`, `type="submit"`. Elements failing all four get flagged.
  - **Broken-link scan** — for each `<Link to="...">` and `router.navigate({ to: "..." })`, verify the target route file exists under `src/routes/` and required params are supplied by the call site.
  - **Loader-boundary scan** — for each `createFileRoute(...)({ loader: ... })`, verify both `errorComponent` and `notFoundComponent` are present. Verify `__root.tsx` sets `notFoundComponent`.
- Writes `src/lib/audit-report.json` with `{ generatedAt, hardcode: [...], deadButtons: [...], brokenLinks: [...], missingBoundaries: [...] }`.
- Wire into `package.json` as `bun run audit`, and add a `prebuild` hook so it runs before every `bun run build`.
- Rewrite `/admin/wire-up-report` and `/admin/hardcode-report` to import the JSON directly. No more hand-written rows.

Ship criterion for Wave 2: `bun run audit` completes, JSON exists on disk, both admin pages render the *real* counts. Expect the numbers to be ugly — that's the point.

## Wave 3 — Module sweep

Modules in your listed order (Sessions → Patients → … → Admin). Per module:

1. Read the module's routes + store + components.
2. Replace every hit the audit flagged in that module's files.
3. Re-run `bun run audit`. Confirm that module's row drops to zero.
4. Move on.

Dead buttons: wire them, remove them, or convert to a documented `<PlannedControl reason="..."/>` primitive that the audit whitelists. No `alert()`, no `console.log`-only handlers, no "Coming soon" toasts.

Broken links get either fixed params or the target route file created.

Every route with a loader gets `errorComponent` + `notFoundComponent` (small shared `<RouteError/>` and `<RouteNotFound/>` primitives to keep bundle size honest).

## Wave 4 — Zero out

- Re-run audit. Fix stragglers (there will be some — every real sweep uncovers 20–30 things the pattern list missed).
- `bun run typecheck` clean, `bun run build` clean.
- Both admin pages show zero.

## Technical notes

- `ts-morph` is heavier than raw TS compiler API but 5× faster to author scan rules in; using it for `scripts/audit.ts` only, not in the app bundle.
- The audit script is Node-only and never imported by app code, so it doesn't affect the Cloudflare Worker runtime.
- Storage key namespace stays separate: student = `peacecode.settings.v1`, therapist = `peacecode.practice.settings.v1`. Same *shape*, different key, so a user logged into both doesn't cross-contaminate.
- Grain layer uses the same SVG-noise `data:` URL as student to keep the visual identical.
- Fraunces + DM Sans are already loaded in `__root.tsx` — no font work needed.

## What I need from you before I start

1. **Confirm the wave order.** If you want everything in one turn I'll do it, but I'll warn upfront that the build will likely break mid-sweep and the recovery cycle costs more turns than doing it in four.
2. **Confirm `ts-morph` is OK as a devDependency** for the audit script. Alternative is hand-rolled regex, which is faster to write but misses more.
3. **Confirm `<PlannedControl>` primitive is acceptable** for buttons that legitimately belong in the UI but aren't wired yet (e.g. "Export to insurance clearinghouse" on Billing when no clearinghouse is connected). The alternative is deleting them, which erodes the product surface.

Once you green-light, I start with Wave 1 (theme engine) since it's the visible, low-risk half and gives you something to look at while Waves 2–4 run.
