import { useEffect } from "react";
import skyAsset from "@/assets/sky-clouds.jpg.asset.json";

/**
 * Sky-clouds backdrop for the Resources directory.
 * Layers (back → front):
 *   1. sharp sky photo (cover)
 *   2. soft blurred copy of the same sky (atmosphere)
 *   3. subtle color wash for glass legibility
 *   4. high-frequency SVG grain for editorial texture
 * All layers are fixed, pointer-events: none, and rendered once — no re-layout.
 */
export function ResourcesFX() {
  useEffect(() => {
    document.documentElement.setAttribute("data-pc-resources", "");
    return () => document.documentElement.removeAttribute("data-pc-resources");
  }, []);

  const fixed = {
    position: "fixed" as const,
    inset: 0,
    zIndex: 0,
    pointerEvents: "none" as const,
  };

  // Inline SVG turbulence — no network request, GPU-composited as a bg image.
  const grainUrl =
    "url(\"data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
        <filter id='n'>
          <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
          <feColorMatrix values='0 0 0 0 0.06  0 0 0 0 0.09  0 0 0 0 0.16  0 0 0 1 0'/>
        </filter>
        <rect width='100%' height='100%' filter='url(#n)' opacity='1'/>
      </svg>`
    ) +
    "\")";

  return (
    <>
      {/* 1. sharp sky */}
      <div
        aria-hidden
        style={{
          ...fixed,
          backgroundImage: `url(${skyAsset.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* 2. soft blurred atmosphere — same photo, blurred and slightly zoomed */}
      <div
        aria-hidden
        style={{
          ...fixed,
          backgroundImage: `url(${skyAsset.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(36px) saturate(115%)",
          transform: "scale(1.08)",
          opacity: 0.55,
        }}
      />

      {/* 3. tone wash */}
      <div
        aria-hidden
        style={{
          ...fixed,
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.22), transparent 55%), linear-gradient(180deg, rgba(180,210,240,0.08) 0%, rgba(120,160,210,0.20) 100%)",
        }}
      />

      {/* 4. high grain */}
      <div
        aria-hidden
        style={{
          ...fixed,
          backgroundImage: grainUrl,
          backgroundSize: "240px 240px",
          mixBlendMode: "overlay",
          opacity: 0.55,
        }}
      />
    </>
  );
}
