import { useEffect } from "react";
import skyAsset from "@/assets/sky-clouds.jpg.asset.json";

/**
 * Fixed sky-clouds background for the Resources directory.
 * Pairs with the `.pc-glass-card` liquid-glass surfaces defined in styles.css.
 */
export function ResourcesFX() {
  useEffect(() => {
    document.documentElement.setAttribute("data-pc-resources", "");
    return () => document.documentElement.removeAttribute("data-pc-resources");
  }, []);

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `url(${skyAsset.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Soft wash to keep glass legible without darkening the sky */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.18), transparent 55%), linear-gradient(180deg, rgba(180,210,240,0.08) 0%, rgba(120,160,210,0.18) 100%)",
        }}
      />
    </>
  );
}
