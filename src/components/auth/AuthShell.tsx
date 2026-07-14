import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import logo from "@/assets/peacecode-logo.png";

/**
 * AuthShell — single-viewport frosted glass card centered on a full-bleed
 * grainy sakura backdrop. No page scroll, no marquees. The card itself
 * scrolls internally (scrollbar hidden) if content exceeds the viewport.
 */

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
        @keyframes pc-breathe { 0%,100% { transform: scale(1); opacity:.85 } 50% { transform: scale(1.06); opacity:1 } }
        @keyframes pc-drift-a  { 0%,100% { transform: translate(0,0) } 50% { transform: translate(18px,-14px) } }
        @keyframes pc-drift-b  { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-22px,12px) } }
        .pc-card-scroll::-webkit-scrollbar { display: none }
        .pc-card-scroll { scrollbar-width: none; -ms-overflow-style: none }
      `}</style>

      {/* Grainy sakura base — covers whole viewport */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(160deg, #fbe9ec 0%, #f7e3d9 40%, #f2ded9 70%, #ecd9e0 100%)",
        }}
      />
      {/* Painterly washes drifting slowly */}
      <div
        className="absolute -inset-40 pointer-events-none"
        aria-hidden
        style={{
          animation: "pc-drift-a 22s ease-in-out infinite",
          backgroundImage: [
            "radial-gradient(38% 32% at 22% 24%, rgba(255,255,255,0.85), transparent 65%)",
            "radial-gradient(30% 28% at 78% 18%, rgba(240,190,205,0.55), transparent 70%)",
          ].join(","),
        }}
      />
      <div
        className="absolute -inset-40 pointer-events-none"
        aria-hidden
        style={{
          animation: "pc-drift-b 28s ease-in-out infinite",
          backgroundImage: [
            "radial-gradient(34% 30% at 84% 82%, rgba(255,232,214,0.7), transparent 70%)",
            "radial-gradient(32% 28% at 14% 84%, rgba(228,200,214,0.6), transparent 72%)",
          ].join(","),
        }}
      />
      {/* Hand-drawn horizon arcs, one on each corner */}
      <svg
        className="absolute -top-40 -right-40 opacity-[0.11] pointer-events-none"
        width="820" height="820" viewBox="0 0 820 820" aria-hidden
      >
        {[180, 260, 360, 480, 620].map((r, i) => (
          <circle key={i} cx="640" cy="180" r={r} fill="none" stroke="#8a3a52" strokeWidth="1"
            strokeDasharray={i % 2 ? "2 6" : "0"} />
        ))}
      </svg>
      <svg
        className="absolute -bottom-52 -left-40 opacity-[0.10] pointer-events-none"
        width="900" height="900" viewBox="0 0 900 900" aria-hidden
      >
        {[220, 320, 440, 580, 740].map((r, i) => (
          <circle key={i} cx="180" cy="720" r={r} fill="none" stroke="#8a3a52" strokeWidth="1"
            strokeDasharray={i % 2 ? "3 7" : "0"} />
        ))}
      </svg>
      {/* Floating petal specks */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70" aria-hidden>
        {Array.from({ length: 34 }).map((_, i) => {
          const x = (i * 79) % 100;
          const y = (i * 137) % 100;
          const r = 1 + ((i * 11) % 3);
          return (
            <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r}
              fill={i % 3 === 0 ? "#e0a5b6" : i % 3 === 1 ? "#d6b39a" : "#c98aa2"}
              opacity={0.32} />
          );
        })}
      </svg>
      {/* Heavy film grain — full bleed */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply"
        aria-hidden
        style={{
          opacity: 0.34,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.35 0 0 0 0 0.42 0 0 0 0.95 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          opacity: 0.18,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='2.6' numOctaves='1' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Top-left brand & top-right trust — floating outside card */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-8 z-10">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <span
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.9)",
              backdropFilter: "blur(14px)",
            }}
          >
            <img src={logo} alt="" className="w-6 h-6 object-contain" />
          </span>
          <div className="leading-tight">
            <div className="text-[14px] tracking-tight"
              style={{ fontFamily: "'Fraunces', serif", color: "#3a2230", fontWeight: 600 }}>
              Peace Code
            </div>
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#7a4a5c" }}>
              a quiet doorway
            </div>
          </div>
        </Link>
      </div>

      <div className="hidden sm:flex absolute top-6 right-8 z-10 items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px]"
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(255,255,255,0.9)",
          color: "#7a4a5c",
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
                "radial-gradient(60% 50% at 50% 30%, rgba(255,255,255,0.55), transparent 70%), radial-gradient(60% 50% at 50% 90%, rgba(196,107,134,0.22), transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <div
            className="pc-card-scroll relative rounded-[30px] overflow-hidden"
            style={{
              maxHeight: "min(92vh, 780px)",
              overflowY: "auto",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,240,244,0.38) 100%)",
              backdropFilter: "blur(34px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.85)",
              boxShadow:
                "0 30px 90px -30px rgba(122,74,92,0.35), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.35)",
            }}
          >
            {/* top gloss */}
            <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.6), transparent)" }} />
            {/* etched hairline arcs inside card */}
            <svg className="absolute -top-24 -right-24 opacity-[0.14] pointer-events-none"
              width="360" height="360" viewBox="0 0 360 360" aria-hidden>
              {[80, 130, 190, 260].map((r, i) => (
                <circle key={i} cx="260" cy="100" r={r} fill="none" stroke="#8a3a52" strokeWidth="1"
                  strokeDasharray={i % 2 ? "2 6" : "0"} />
              ))}
            </svg>

            <div className="relative px-7 sm:px-9 py-8 sm:py-10 flex flex-col gap-6">
              {/* Breathing orb + eyebrow */}
              <div className="flex flex-col items-center gap-3">
                <span
                  className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid white",
                    boxShadow: "0 10px 30px -12px rgba(122,74,92,0.45)",
                    animation: "pc-breathe 6s ease-in-out infinite",
                  }}
                >
                  <img src={logo} alt="Peace Code" className="w-9 h-9 object-contain" />
                </span>

                {eyebrow && (
                  <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "#7a4a5c" }}>
                    {eyebrow}
                  </div>
                )}

                <h2
                  className="text-center leading-[1.05] tracking-[-0.01em]"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: "clamp(1.9rem, 3.6vw, 2.4rem)",
                    color: "#3a2230",
                    fontWeight: 500,
                  }}
                >
                  {title}{" "}
                  {titleAccent && (
                    <em className="italic" style={{ fontWeight: 500, color: "#8a3a52" }}>
                      {titleAccent}
                    </em>
                  )}
                </h2>

                <p
                  className="text-center text-[13.5px] leading-relaxed max-w-[340px]"
                  style={{ color: "#6a4454" }}
                >
                  {subtitle}
                </p>
              </div>

              {step && totalSteps && (
                <div>
                  <div className="flex items-center justify-between text-[10.5px] tracking-[0.18em] uppercase mb-2"
                    style={{ color: "#3a2230" }}>
                    <span className="font-semibold">Step {step} of {totalSteps}</span>
                    <span style={{ color: "#7a4a5c" }}>{stepLabel}</span>
                  </div>
                  <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(138,58,82,0.15)" }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${(step / totalSteps) * 100}%`,
                        background: "linear-gradient(90deg, #c46b86, #8a3a52)",
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
      <div className="text-[13px] font-semibold" style={{ color: "#3a2230" }}>
        {children}
      </div>
      {hint && (
        <div className="text-[11.5px] mt-0.5" style={{ color: "#7a4a5c" }}>
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
        background: "rgba(255,255,255,0.62)",
        border: "1px solid rgba(255,255,255,0.9)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
      }}
    >
      {icon && (
        <span className="shrink-0" style={{ color: "#8a3a52" }}>
          {icon}
        </span>
      )}
      <input
        {...props}
        className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#b98aa0]"
        style={{ color: "#3a2230" }}
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
        background: "rgba(255,255,255,0.62)",
        border: "1px solid rgba(255,255,255,0.9)",
      }}
    >
      {icon && (
        <span className="shrink-0" style={{ color: "#8a3a52" }}>
          {icon}
        </span>
      )}
      <select
        {...props}
        className="flex-1 bg-transparent outline-none text-[14px] appearance-none"
        style={{ color: "#3a2230" }}
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
        background: "linear-gradient(180deg, #c46b86 0%, #8a3a52 100%)",
        color: "white",
        boxShadow:
          "0 10px 24px -12px rgba(138,58,82,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
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
        background: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(255,255,255,0.85)",
      }}
    >
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.85)", color: "#8a3a52" }}
      >
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-[13.5px] font-semibold" style={{ color: "#3a2230" }}>
          {title}
        </div>
        <div className="text-[11.5px]" style={{ color: "#7a4a5c" }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
