"""E2E: frosted marketing navbar stays fixed & prevents horizontal overflow.

Runs against the running dev server at http://localhost:8080.
Checks, across mobile / tablet / desktop breakpoints and across the main
marketing routes:
  1. <header> uses position: fixed and stays visually pinned after scroll.
  2. document/body scrollWidth <= clientWidth (no horizontal overflow).
  3. Navbar width never exceeds the viewport.
"""
import asyncio, json, sys, time
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
OUT = Path("src/lib/navbar-report.json")
SHOTS = Path("/tmp/browser/navbar")
SHOTS.mkdir(parents=True, exist_ok=True)

BREAKPOINTS = [
    ("mobile", 375, 780),
    ("tablet", 768, 1024),
    ("desktop", 1280, 900),
    ("wide", 1600, 1000),
]

ROUTES = [
    "/for-psychologists",
    "/features",
    "/features/scheduling",
    "/features/notes",
    "/company/story",
    "/company/faq",
    "/company/contact",
]


NAV_SELECTOR = "header:has(img[src='/nav-bar-logo.svg'])"


async def check(page, label, route, width) -> dict:
    issues: list[str] = []
    await page.goto(f"{BASE}{route}", wait_until="domcontentloaded")
    await page.wait_for_selector(NAV_SELECTOR, timeout=5000)

    # 1. fixed position
    pos = await page.evaluate(
        f"() => getComputedStyle(document.querySelector({NAV_SELECTOR!r})).position"
    )
    if pos != "fixed":
        issues.append(f"navbar position={pos!r}, expected 'fixed'")

    # 2. no horizontal overflow at rest
    overflow = await page.evaluate(
        "() => ({ dw: document.documentElement.scrollWidth,"
        "         cw: document.documentElement.clientWidth,"
        "         bw: document.body.scrollWidth })"
    )
    if overflow["dw"] > overflow["cw"] + 1:
        issues.append(f"horizontal overflow: scrollWidth={overflow['dw']} > clientWidth={overflow['cw']}")
    if overflow["bw"] > overflow["cw"] + 1:
        issues.append(f"body overflow: bodyScrollWidth={overflow['bw']} > clientWidth={overflow['cw']}")

    # 3. header width fits viewport
    box = await page.evaluate(
        f"() => {{ const r = document.querySelector({NAV_SELECTOR!r}).getBoundingClientRect();"
        "        return { x: r.x, w: r.width, top: r.top }; }"
    )
    if box["w"] > width + 1:
        issues.append(f"navbar width {box['w']} > viewport {width}")

    # 4. remains fixed after scrolling
    await page.evaluate("() => window.scrollTo(0, 1200)")
    await page.wait_for_timeout(400)
    box2 = await page.evaluate(
        f"() => {{ const r = document.querySelector({NAV_SELECTOR!r}).getBoundingClientRect();"
        "        return { top: r.top, w: r.width }; }"
    )
    # fixed → top stays close to viewport top (within a few px of the resting offset)
    if box2["top"] > 60 or box2["top"] < -5:
        issues.append(f"header not pinned after scroll: top={box2['top']}")
    if box2["w"] > width + 1:
        issues.append(f"header width after scroll {box2['w']} > viewport {width}")

    shot = SHOTS / f"{label}_{route.replace('/', '_') or 'root'}.png"
    await page.screenshot(path=str(shot))
    return {
        "route": route,
        "breakpoint": label,
        "viewport": width,
        "pass": not issues,
        "issues": issues,
        "screenshot": str(shot),
    }


async def main() -> int:
    started = int(time.time() * 1000)
    results = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        try:
            for label, w, h in BREAKPOINTS:
                ctx = await browser.new_context(viewport={"width": w, "height": h})
                page = await ctx.new_page()
                for route in ROUTES:
                    try:
                        results.append(await check(page, label, route, w))
                    except Exception as e:
                        results.append({
                            "route": route, "breakpoint": label, "viewport": w,
                            "pass": False, "issues": [f"exception: {e!r}"],
                        })
                await ctx.close()
        finally:
            await browser.close()

    failed = [r for r in results if not r["pass"]]
    report = {
        "startedAt": started,
        "finishedAt": int(time.time() * 1000),
        "total": len(results),
        "failed": len(failed),
        "results": results,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2))
    print(f"navbar e2e: {len(results) - len(failed)}/{len(results)} passed")
    for r in failed:
        print(f"  FAIL [{r['breakpoint']}] {r['route']}: {'; '.join(r['issues'])}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
