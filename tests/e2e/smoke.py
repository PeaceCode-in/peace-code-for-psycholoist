"""End-to-end smoke walk for PeaceCode Practice."""
import asyncio, json, sys, time
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
OUT = Path("src/lib/smoke-report.json")
SHOTS = Path("/tmp/browser/smoke")
SHOTS.mkdir(parents=True, exist_ok=True)

ROUTES = [
    ("home", "/dashboard"),
    ("patients", "/patients"),
    ("sessions", "/calendar"),
    ("telehealth", "/settings/telehealth"),
    ("assessments", "/assessments"),
    ("billing", "/billing"),
    ("calendar", "/calendar"),
    ("documents", "/documents"),
    ("messaging", "/messaging"),
    ("reports", "/analytics"),
    ("team", "/settings/team"),
    ("client-portal", "/portal"),
    ("integrations", "/integrations"),
    ("inbox", "/inbox"),
    ("copilot", "/copilot"),
    ("governance", "/governance"),
    ("settings", "/settings"),
    ("admin", "/admin/launch-readiness"),
]

async def walk() -> dict:
    started = int(time.time() * 1000)
    results = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 1600})
        page = await ctx.new_page()

        state = {"page_errs": [], "console_errs": [], "bad_net": []}
        page.on("pageerror", lambda e: state["page_errs"].append(str(e)))
        page.on("console", lambda m: state["console_errs"].append(m.text) if m.type == "error" else None)
        def on_resp(r):
            if r.status >= 400 and r.request.resource_type in ("document", "xhr", "fetch") and BASE in r.url:
                state["bad_net"].append(f"{r.status} {r.url}")
        page.on("response", on_resp)

        await page.goto(BASE, wait_until="domcontentloaded")
        await page.evaluate("localStorage.setItem('pc.session.v1', JSON.stringify({email:'demo@peacecode.app',ts:Date.now()}))")

        for name, path in ROUTES:
            state["page_errs"].clear(); state["console_errs"].clear(); state["bad_net"].clear()
            entry = {"name": name, "path": path, "ok": False, "detail": ""}
            try:
                await page.goto(BASE + path, wait_until="domcontentloaded", timeout=15000)
                try: await page.wait_for_load_state("networkidle", timeout=2500)
                except: pass
                main_present = await page.locator("main").count() > 0
                main_len = await page.locator("main").first.evaluate("el => el.innerText.length") if main_present else 0
                dead = await page.evaluate("""() => {
                    const els=[...document.querySelectorAll('button,a')]; let d=0;
                    for(const el of els){
                      if(el.offsetParent===null) continue;
                      if(el.tagName==='A'&&el.getAttribute('href')) continue;
                      if(el.tagName==='BUTTON'&&(el.type==='submit'||el.disabled)) continue;
                      const txt=(el.innerText||'').trim(); if(!txt) continue;
                      if(el.closest('form')) continue;
                      if(el.getAttribute('aria-controls')) continue;
                      // React onClick shows up as listener; can't detect from DOM, so we only flag anchors with no href.
                      if(el.tagName==='A'&&!el.getAttribute('href')) d++;
                    }
                    return d;
                }""")
                await page.screenshot(path=str(SHOTS / f"{name}.png"))
                bad = [b for b in state["bad_net"] if "/lovable/" not in b and "/@vite/" not in b and "/@react-refresh" not in b and "/__" not in b]
                # Hydration warnings are noisy but non-fatal — allow them through.
                fatal_page_errs = [e for e in state["page_errs"] if "Hydration" not in e and "hydration" not in e]
                ok = main_present and main_len > 20 and not fatal_page_errs and not bad
                parts = []
                if not main_present: parts.append("no <main>")
                elif main_len <= 20: parts.append(f"empty main ({main_len} chars)")
                if fatal_page_errs: parts.append(f"pageerror: {fatal_page_errs[0][:140]}")
                if bad: parts.append(f"net: {bad[0][:140]}")
                entry.update(ok=ok, detail="; ".join(parts) or "clean", mainChars=main_len, deadControls=dead, consoleErrors=len(state["console_errs"]))
            except Exception as e:
                entry["detail"] = f"nav failed: {e}"
            results.append(entry)
            print(f"[{'PASS' if entry['ok'] else 'FAIL'}] {name:14s} {path:30s} {entry['detail']}", flush=True)
            # write incrementally so partial results survive a timeout
            OUT.parent.mkdir(parents=True, exist_ok=True)
            OUT.write_text(json.dumps({"startedAt": started, "finishedAt": int(time.time()*1000), "total": len(ROUTES), "passed": sum(1 for r in results if r["ok"]), "failed": sum(1 for r in results if not r["ok"]), "routes": results, "partial": len(results) < len(ROUTES)}, indent=2))
        await browser.close()

    passed = sum(1 for r in results if r["ok"])
    report = {"startedAt": started, "finishedAt": int(time.time()*1000), "total": len(results), "passed": passed, "failed": len(results)-passed, "routes": results}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2))
    print(f"\n{passed}/{len(results)} passed → {OUT}")
    return report

if __name__ == "__main__":
    rep = asyncio.run(walk())
    sys.exit(0 if rep["failed"] == 0 else 1)
