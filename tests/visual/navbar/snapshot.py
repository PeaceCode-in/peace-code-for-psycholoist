"""Visual regression snapshots for the marketing MarketingNavbar.

Captures the fixed frosted-glass navbar across representative pages,
viewports, and theme modes, then compares against committed baselines.

Usage:
    python tests/visual/navbar/snapshot.py            # compare vs baseline
    python tests/visual/navbar/snapshot.py --update   # (re)write baselines

Exits 1 when any snapshot exceeds MAX_DIFF_RATIO.
Baselines live in tests/visual/navbar/baseline/.
Actuals + diffs write to tests/visual/navbar/actual|diff/ (gitignored).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:8080"
ROOT = Path(__file__).parent
BASELINE = ROOT / "baseline"
ACTUAL = ROOT / "actual"
DIFF = ROOT / "diff"
for d in (BASELINE, ACTUAL, DIFF):
    d.mkdir(parents=True, exist_ok=True)

# Pixel-difference tolerance. Anti-aliasing + backdrop-filter noise means we
# need a small allowance; 0.5% of pixels differing by >12/255 fails the check.
PIXEL_THRESHOLD = 12
MAX_DIFF_RATIO = 0.005

VIEWPORTS = {
    "desktop": {"width": 1280, "height": 900},
    "mobile": {"width": 390, "height": 844},
}

PAGES = [
    ("landing", "/for-psychologists"),
    ("features-index", "/features"),
    ("features-slug", "/features/scheduling"),
    ("company", "/company/story"),
]

MODES = ("light", "dark")


async def prime_mode(page, mode: str) -> None:
    await page.goto(BASE_URL, wait_until="domcontentloaded")
    await page.evaluate(
        "m => localStorage.setItem('pc-mkt-mode', m)", mode
    )


async def capture_navbar(page, out: Path) -> None:
    # Header is the only fixed element rendered by MarketingNavbar.
    header = page.locator("header.fixed").first
    await header.wait_for(state="visible", timeout=8000)
    # Let backdrop-filter + font swap settle before shooting.
    await page.wait_for_timeout(400)
    await header.screenshot(path=str(out), omit_background=False)


def compare(actual_path: Path, baseline_path: Path, diff_path: Path) -> dict:
    a = Image.open(actual_path).convert("RGB")
    b = Image.open(baseline_path).convert("RGB")
    if a.size != b.size:
        return {"status": "size-mismatch", "actual": a.size, "baseline": b.size}

    delta = ImageChops.difference(a, b)
    arr = np.asarray(delta).max(axis=2)
    changed = int((arr > PIXEL_THRESHOLD).sum())
    total = int(arr.size)
    ratio = changed / total

    if ratio > MAX_DIFF_RATIO:
        # Highlight changed pixels in red on top of the actual for review.
        mask = (arr > PIXEL_THRESHOLD)
        overlay = np.asarray(a).copy()
        overlay[mask] = [255, 0, 0]
        Image.fromarray(overlay).save(diff_path)
        return {"status": "fail", "ratio": ratio, "changed": changed}
    return {"status": "pass", "ratio": ratio, "changed": changed}


async def run(update: bool) -> int:
    results: list[dict] = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            for vp_name, vp in VIEWPORTS.items():
                context = await browser.new_context(viewport=vp, device_scale_factor=1)
                page = await context.new_page()
                for mode in MODES:
                    await prime_mode(page, mode)
                    for label, path in PAGES:
                        name = f"{label}__{vp_name}__{mode}.png"
                        actual_path = ACTUAL / name
                        baseline_path = BASELINE / name
                        diff_path = DIFF / name

                        await page.goto(BASE_URL + path, wait_until="networkidle")
                        await capture_navbar(page, actual_path)

                        if update or not baseline_path.exists():
                            actual_path.replace(baseline_path)
                            results.append({"name": name, "status": "baseline-written"})
                            continue

                        res = compare(actual_path, baseline_path, diff_path)
                        res["name"] = name
                        results.append(res)
                await context.close()
        finally:
            await browser.close()

    (ROOT / "report.json").write_text(json.dumps(results, indent=2))
    failed = [r for r in results if r["status"] not in ("pass", "baseline-written")]
    print(f"\n{len(results)} snapshots · {len(failed)} failing")
    for r in results:
        marker = {"pass": "OK", "fail": "FAIL", "size-mismatch": "SIZE",
                  "baseline-written": "NEW"}.get(r["status"], "?")
        extra = f" ratio={r['ratio']:.4f}" if "ratio" in r else ""
        print(f"  [{marker}] {r['name']}{extra}")
    return 1 if failed else 0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--update", action="store_true", help="Overwrite baselines")
    args = parser.parse_args()
    sys.exit(asyncio.run(run(args.update)))


if __name__ == "__main__":
    main()
