import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMarketingTheme } from "@/lib/use-marketing-theme";

export const Route = createFileRoute("/qa/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing QA — Theme checklist" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MarketingQA,
});

const SURFACES: { label: string; path: string }[] = [
  { label: "Landing (for-psychologists)", path: "/for-psychologists" },
  { label: "Features index", path: "/features" },
  { label: "Feature deep-dive: scheduling", path: "/features/scheduling" },
  { label: "Feature deep-dive: notes", path: "/features/notes" },
  { label: "Company: about", path: "/about" },
  { label: "Company: contact", path: "/contact" },
];

const CHECKLIST = [
  "Page background stays continuous — no seams between sections",
  "All body text is readable (WCAG AA) against the background",
  "Cards / glass surfaces invert to graphite in dark mode",
  "Navbar frosted glass adapts to the current mode",
  "Footer text is readable (no cream-on-cream)",
  "No stray blue / slate / purple gradients leaking through",
  "Hover / focus states remain visible after toggling",
];

function MarketingQA() {
  const { darkMode, toggleDark, highContrast, toggleContrast } = useMarketingTheme();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const [nonce, setNonce] = useState(0);

  // Storage events don't fire in the same tab; nudge iframes to re-read theme.
  useEffect(() => {
    for (const iframe of Object.values(iframeRefs.current)) {
      if (!iframe?.contentWindow) continue;
      try {
        iframe.contentWindow.dispatchEvent(new StorageEvent("storage", { key: "pc-marketing-theme" }));
      } catch {
        // Cross-origin frames would throw; same-origin here is fine.
      }
    }
  }, [darkMode, highContrast, nonce]);

  return (
    <main
      className="min-h-screen p-6"
      data-mode={darkMode ? "dark" : "light"}
      data-contrast={highContrast ? "high" : "normal"}
      style={{
        background: darkMode ? "#14100F" : "#FFF8FA",
        color: darkMode ? "#F5ECEF" : "#140A0E",
      }}
    >
      <header className="max-w-[1400px] mx-auto mb-6">
        <h1 className="text-2xl font-semibold mb-1">Marketing QA</h1>
        <p className="text-sm opacity-70">
          Flip Dark / High-contrast and every marketing surface below reloads its theme instantly.
        </p>
      </header>

      <div className="max-w-[1400px] mx-auto mb-6 flex flex-wrap gap-3 items-center">
        <button
          onClick={toggleDark}
          className="px-4 py-2 rounded-full text-sm font-medium border"
          style={{
            background: darkMode ? "#F4A3BE" : "#140A0E",
            color: darkMode ? "#140A0E" : "#FFF8FA",
            borderColor: "transparent",
          }}
        >
          {darkMode ? "☀ Switch to Light" : "☾ Switch to Dark"}
        </button>
        <button
          onClick={toggleContrast}
          className="px-4 py-2 rounded-full text-sm font-medium border"
          style={{
            background: highContrast ? "#F4A3BE" : "transparent",
            color: highContrast ? "#140A0E" : "inherit",
            borderColor: "currentColor",
          }}
        >
          High contrast: {highContrast ? "ON" : "OFF"}
        </button>
        <button
          onClick={() => setNonce((n) => n + 1)}
          className="px-4 py-2 rounded-full text-sm font-medium border"
          style={{ borderColor: "currentColor", background: "transparent", color: "inherit" }}
        >
          ↻ Reload previews
        </button>
        <span className="text-xs opacity-60 ml-auto">
          Mode: <strong>{darkMode ? "dark" : "light"}</strong> · Contrast:{" "}
          <strong>{highContrast ? "high" : "normal"}</strong>
        </span>
      </div>

      <section
        className="max-w-[1400px] mx-auto mb-8 rounded-2xl p-5"
        style={{
          background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(20,10,14,0.04)",
          border: `1px solid ${darkMode ? "rgba(255,255,255,0.10)" : "rgba(20,10,14,0.10)"}`,
        }}
      >
        <h2 className="text-sm font-semibold uppercase tracking-widest opacity-70 mb-3">
          Visual checklist
        </h2>
        <ul className="grid md:grid-cols-2 gap-2">
          {CHECKLIST.map((item) => (
            <li key={item}>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked[item]}
                  onChange={(e) => setChecked((c) => ({ ...c, [item]: e.target.checked }))}
                  className="mt-1"
                />
                <span style={{ opacity: checked[item] ? 0.55 : 1, textDecoration: checked[item] ? "line-through" : "none" }}>
                  {item}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-6">
        {SURFACES.map((s) => (
          <figure
            key={s.path}
            className="rounded-2xl overflow-hidden"
            style={{
              border: `1px solid ${darkMode ? "rgba(255,255,255,0.10)" : "rgba(20,10,14,0.12)"}`,
              background: darkMode ? "#221B1E" : "#fff",
            }}
          >
            <figcaption className="flex items-center justify-between px-4 py-2 text-xs">
              <span className="font-medium">{s.label}</span>
              <a
                href={s.path}
                target="_blank"
                rel="noreferrer"
                className="opacity-70 hover:opacity-100 underline"
              >
                open ↗
              </a>
            </figcaption>
            <iframe
              key={`${s.path}-${nonce}`}
              ref={(el) => {
                iframeRefs.current[s.path] = el;
              }}
              src={s.path}
              title={s.label}
              className="w-full block"
              style={{ height: 520, border: 0, background: "transparent" }}
              loading="lazy"
            />
          </figure>
        ))}
      </div>
    </main>
  );
}
