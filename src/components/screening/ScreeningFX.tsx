import { useEffect } from "react";
import skyAsset from "@/assets/sky-clouds.jpg.asset.json";

/**
 * Screening backdrop — identical to ResourcesFX (sky-clouds photo,
 * blurred atmosphere, tone wash, high-frequency grain). Uses the
 * `data-pc-screening` root attribute so the shared liquid-glass CSS
 * scope applies automatically.
 */
export function ScreeningFX() {
  useEffect(() => {
    document.documentElement.setAttribute("data-pc-screening", "");
    return () => document.documentElement.removeAttribute("data-pc-screening");
  }, []);

  const fixed = {
    position: "fixed" as const,
    inset: 0,
    zIndex: 0,
    pointerEvents: "none" as const,
  };

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
      {/* 2. soft blurred atmosphere */}
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
