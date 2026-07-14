import { useEffect } from "react";

/**
 * Premium matte backdrop — no images, no SVG art.
 * Ultra-soft radial gradients (white with the faintest hints of sky, cream,
 * lavender) + a fine procedural film grain. Mount inside a layout route to
 * activate the shared `html[data-pc-glass]` CSS scope in src/styles.css.
 */
export function GlassFX() {
  useEffect(() => {
    document.documentElement.setAttribute("data-pc-glass", "");
  }, []);

  const fixed = {
    position: "fixed" as const,
    inset: 0,
    zIndex: 0,
    pointerEvents: "none" as const,
  };

  // Extremely fine grain — 3–5% opacity, matte-paper feel.
  const grainUrl =
    "url(\"data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>
        <filter id='n'>
          <feTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='2' stitchTiles='stitch'/>
          <feColorMatrix values='0 0 0 0 0.10  0 0 0 0 0.12  0 0 0 0 0.16  0 0 0 0.55 0'/>
        </filter>
        <rect width='100%' height='100%' filter='url(#n)'/>
      </svg>`
    ) +
    "\")";

  return (
    <>
      {/* Base matte + soft radial glows (blended, nearly invisible) */}
      <div
        aria-hidden
        style={{
          ...fixed,
          background:
            "radial-gradient(60% 45% at 18% 12%, #DDEEFF 0%, rgba(221,238,255,0) 60%)," +
            "radial-gradient(55% 50% at 88% 8%, #FFF5EE 0%, rgba(255,245,238,0) 62%)," +
            "radial-gradient(70% 55% at 82% 92%, #EAF2FF 0%, rgba(234,242,255,0) 65%)," +
            "radial-gradient(80% 60% at 20% 90%, #F7F8FC 0%, rgba(247,248,252,0) 70%)," +
            "radial-gradient(90% 60% at 50% 50%, #FFFFFF 0%, #F8FAFD 55%, #F5F7FB 100%)",
        }}
      />
      {/* Hero sunlight — one huge, gentle radial highlight up top */}
      <div
        aria-hidden
        style={{
          ...fixed,
          background:
            "radial-gradient(45% 32% at 50% -6%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      {/* Film grain — matte paper */}
      <div
        aria-hidden
        style={{
          ...fixed,
          backgroundImage: grainUrl,
          backgroundSize: "320px 320px",
          mixBlendMode: "multiply",
          opacity: 0.045,
        }}
      />
    </>
  );
}
