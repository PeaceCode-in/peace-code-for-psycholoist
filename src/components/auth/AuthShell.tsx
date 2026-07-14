import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import wordmark from "@/assets/peacecode-wordmark.png.asset.json";
import skyBg from "@/assets/auth-sky-cranes.jpg.asset.json";

/**
 * AuthShell — single-viewport frosted glass card centered on a full-bleed
 * grainy sky-and-cranes backdrop. Amber/dusk palette pulled from the peach
 * clouds in the illustration. No page scroll; the card scrolls internally.
 */

// Warm amber palette pulled from the peach clouds in the background image.
const INK = "#2b1d14";
const INK_SOFT = "#5a4030";
const MUTED = "#7d5a44";
const ACCENT = "#b06a3c";
const ACCENT_DEEP = "#8a4a26";

export const authPalette = { ink: INK, inkSoft: INK_SOFT, muted: MUTED, accent: ACCENT, accentDeep: ACCENT_DEEP };

export function AuthShell({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  children,
  step,
  totalSteps,
  stepLabel,
}: {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  children: ReactNode;
  step?: number;
  totalSteps?: number;
  stepLabel?: string;
}) {
  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes pc-drift-a  { 0%,100% { transform: translate(0,0) } 50% { transform: translate(18px,-14px) } }
        @keyframes pc-drift-b  { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-22px,12px) } }
        @keyframes pc-grain    { 0%,100% { transform: translate(0,0) } 10% { transform: translate(-2%,1%) } 30% { transform: translate(1%,-2%) } 50% { transform: translate(-1%,2%) } 70% { transform: translate(2%,-1%) } 90% { transform: translate(-2%,-2%) } }
        .pc-card-scroll::-webkit-scrollbar { display: none }
        .pc-card-scroll { scrollbar-width: none; -ms-overflow-style: none }
      `}</style>

      {/* Sky illustration base — full bleed */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: `url(${skyBg.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Soft warm wash + gentle blur over image */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          backdropFilter: "blur(5px) saturate(110%)",
          background:
            "linear-gradient(180deg, rgba(190,205,225,0.14) 0%, rgba(240,200,170,0.20) 55%, rgba(220,170,140,0.28) 100%)",
        }}
      />
      {/* Painterly amber washes drifting slowly */}
      <div
        className="absolute -inset-40 pointer-events-none mix-blend-soft-light"
        aria-hidden
        style={{
          animation: "pc-drift-a 22s ease-in-out infinite",
          backgroundImage: [
            "radial-gradient(38% 32% at 22% 24%, rgba(255,240,220,0.55), transparent 65%)",
            "radial-gradient(30% 28% at 78% 18%, rgba(230,175,130,0.45), transparent 70%)",
          ].join(","),
        }}
      />
      <div
        className="absolute -inset-40 pointer-events-none mix-blend-soft-light"
        aria-hidden
        style={{
          animation: "pc-drift-b 28s ease-in-out infinite",
          backgroundImage: [
            "radial-gradient(34% 30% at 84% 82%, rgba(240,190,150,0.55), transparent 70%)",
            "radial-gradient(32% 28% at 14% 84%, rgba(200,160,180,0.42), transparent 72%)",
          ].join(","),
        }}
      />

      {/* Heavy warm film grain — layer 1 (coarse, multiplied) */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        aria-hidden
        style={{
          opacity: 0.48,
          animation: "pc-grain 6s steps(6) infinite",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.25' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.28 0 0 0 0 0.18 0 0 0 0.98 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* Grain layer 2 — fine highlight speckle */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        aria-hidden
        style={{
          opacity: 0.28,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2.4' numOctaves='1' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 0.95 0 0 0 0 0.85 0 0 0 0.75 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* Grain layer 3 — very fine dark speckle */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        aria-hidden
        style={{
          opacity: 0.22,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='3.6' numOctaves='1' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.13 0 0 0 0 0.1 0 0 0 0.8 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Top-right trust — floating outside card */}
      <div className="hidden sm:flex absolute top-6 right-8 z-10 items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px]"
        style={{
          background: "rgba(255,248,240,0.55)",
          border: "1px solid rgba(255,255,255,0.85)",
          color: INK_SOFT,
          backdropFilter: "blur(14px)",
        }}
      >
        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.7} />
        <span className="tracking-[0.22em] uppercase">private · for students</span>
      </div>

      {/* Centered frosted glass card */}
      <div className="relative z-[1] w-full h-full flex items-center justify-center px-4 sm:px-6">
        <div className="relative w-full max-w-[460px]">
          {/* soft aura behind card */}
          <div
            className="absolute -inset-6 rounded-[36px] pointer-events-none"
            aria-hidden
            style={{
              background:
                "radial-gradient(60% 50% at 50% 30%, rgba(255,245,230,0.55), transparent 70%), radial-gradient(60% 50% at 50% 90%, rgba(176,106,60,0.22), transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div
            className="pc-card-scroll relative rounded-[30px] overflow-hidden"
            style={{
              maxHeight: "min(92vh, 780px)",
              overflowY: "auto",
              background:
                "linear-gradient(180deg, rgba(255,250,244,0.58) 0%, rgba(250,232,216,0.38) 100%)",
              backdropFilter: "blur(34px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.85)",
              boxShadow:
                "0 30px 90px -30px rgba(90,55,30,0.35), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.35)",
            }}
          >
            {/* top gloss */}
            <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.6), transparent)" }} />
            {/* etched hairline arcs inside card */}
            <svg className="absolute -top-24 -right-24 opacity-[0.14] pointer-events-none"
              width="360" height="360" viewBox="0 0 360 360" aria-hidden>
              {[80, 130, 190, 260].map((r, i) => (
                <circle key={i} cx="260" cy="100" r={r} fill="none" stroke={ACCENT_DEEP} strokeWidth="1"
                  strokeDasharray={i % 2 ? "2 6" : "0"} />
              ))}
            </svg>

            <div className="relative px-7 sm:px-9 py-8 sm:py-10 flex flex-col gap-6">
              {/* Wordmark header */}
              <Link to="/" className="flex flex-col items-center gap-3">
                <img
                  src={wordmark.url}
                  alt="Peace Code"
                  className="h-9 sm:h-10 w-auto object-contain select-none"
                  draggable={false}
                  style={{ filter: "drop-shadow(0 2px 8px rgba(90,55,30,0.15))" }}
                />
                <div className="h-px w-16" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}66, transparent)` }} />
              </Link>

              <div className="flex flex-col items-center gap-2.5">
                {eyebrow && (
                  <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: MUTED }}>
                    {eyebrow}
                  </div>
                )}

                <h2
                  className="text-center leading-[1.05] tracking-[-0.01em]"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: "clamp(1.9rem, 3.6vw, 2.4rem)",
                    color: INK,
                    fontWeight: 500,
                  }}
                >
                  {title}{" "}
                  {titleAccent && (
                    <em className="italic" style={{ fontWeight: 500, color: ACCENT_DEEP }}>
                      {titleAccent}
                    </em>
                  )}
                </h2>

                <p
                  className="text-center text-[13.5px] leading-relaxed max-w-[340px]"
                  style={{ color: INK_SOFT }}
                >
                  {subtitle}
                </p>
              </div>

              {step && totalSteps && (
                <div>
                  <div className="flex items-center justify-between text-[10.5px] tracking-[0.18em] uppercase mb-2"
                    style={{ color: INK }}>
                    <span className="font-semibold">Step {step} of {totalSteps}</span>
                    <span style={{ color: MUTED }}>{stepLabel}</span>
                  </div>
                  <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(138,74,38,0.15)" }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${(step / totalSteps) * 100}%`,
                        background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DEEP})`,
                      }}
                    />
                  </div>
                </div>
              )}

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared UI primitives — kept API-compatible with existing routes.
export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <div className="text-[13px] font-semibold" style={{ color: INK }}>
        {children}
      </div>
      {hint && (
        <div className="text-[11.5px] mt-0.5" style={{ color: MUTED }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function GlassInput({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <label
      className="flex items-center gap-3 rounded-2xl px-4 h-[52px] transition focus-within:ring-2"
      style={{
        background: "rgba(255,250,244,0.65)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {icon && (
        <span className="shrink-0" style={{ color: ACCENT_DEEP }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#b89680]"
        style={{ color: INK }}
      />
    </label>
  );
}

export function GlassSelect({
  icon,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { icon?: ReactNode }) {
  return (
    <label
      className="flex items-center gap-3 rounded-2xl px-4 h-[52px]"
      style={{
        background: "rgba(255,250,244,0.65)",
        border: "1px solid rgba(255,255,255,0.9)",
      }}
    >
      {icon && (
        <span className="shrink-0" style={{ color: ACCENT_DEEP }}>
          {icon}
        </span>
      )}
      <select
        {...props}
        className="flex-1 bg-transparent outline-none text-[14px] appearance-none"
        style={{ color: INK }}
      >
        {children}
      </select>
    </label>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full h-[52px] rounded-2xl text-[14.5px] font-medium transition disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-[0.99]"
      style={{
        background: `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT_DEEP} 100%)`,
        color: "white",
        boxShadow:
          "0 10px 24px -12px rgba(138,74,38,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
      }}
    >
      {children}
    </button>
  );
}

export function GhostRow({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: "rgba(255,250,244,0.55)",
        border: "1px solid rgba(255,255,255,0.85)",
      }}
    >
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.85)", color: ACCENT_DEEP }}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-[13.5px] font-semibold" style={{ color: INK }}>
          {title}
        </div>
        <div className="text-[11.5px]" style={{ color: MUTED }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
