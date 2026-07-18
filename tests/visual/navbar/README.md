# Navbar Visual Regression Snapshots

Captures the marketing `MarketingNavbar` across pages, viewports, and theme
modes, then diffs each capture against a committed baseline PNG. Fails when
more than 0.5% of pixels differ by more than 12/255 — enough tolerance for
backdrop-filter and font anti-aliasing noise, tight enough to catch spacing,
color, and layout regressions.

## Matrix

- **Pages**: `/for-psychologists`, `/features`, `/features/scheduling`, `/company/story`
- **Viewports**: desktop (1280×900), mobile (390×844)
- **Modes**: light, dark (persisted via `pc-mkt-mode` in localStorage)

16 snapshots total.

## Run

Dev server on `http://localhost:8080` must already be up.

```bash
# Compare against baselines (CI / local check)
python tests/visual/navbar/snapshot.py

# Regenerate baselines after an intentional navbar change
python tests/visual/navbar/snapshot.py --update
```

Exit code `1` on any failing snapshot. Failing diffs are written to
`tests/visual/navbar/diff/` with changed pixels highlighted in red on top
of the actual capture. `actual/` and `diff/` are gitignored — only `baseline/`
is committed.

## When a snapshot fails

1. Open the diff PNG in `diff/<name>.png` and the actual in `actual/<name>.png`.
2. If the change is a bug — fix the navbar and re-run.
3. If the change is intentional — re-run with `--update` and commit the new baselines.
