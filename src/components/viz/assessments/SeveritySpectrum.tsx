import { SEVERITY_META, type Instrument } from "@/lib/assessments-store";

/**
 * Horizontal 5-band severity spectrum with tick marks + labels.
 * Draws a small notch at the current score when provided.
 */
export function SeveritySpectrum({
  instrument,
  score,
  height = 48,
  showLabels = true,
  compact = false,
}: {
  instrument: Instrument;
  score?: number;
  height?: number;
  showLabels?: boolean;
  compact?: boolean;
}) {
  const bands = instrument.scoring.ranges;
  const min = bands[0].min;
  const max = bands[bands.length - 1].max;
  const range = max - min || 1;

  return (
    <div className="w-full animate-in fade-in duration-200">
      <div className="flex w-full rounded-full overflow-hidden" style={{ height, background: "rgba(234,223,226,0.4)" }}>
        {bands.map((b, i) => {
          const width = ((b.max - b.min + 1) / (range + 1)) * 100;
          return (
            <div key={i} style={{ width: `${width}%`, background: SEVERITY_META[b.severity].soft, position: "relative" }}>
              {!compact && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9.5px] tracking-[0.12em] uppercase" style={{ color: SEVERITY_META[b.severity].color, fontFamily: "'Fraunces', serif" }}>
                    {SEVERITY_META[b.severity].label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {typeof score === "number" && (
        <div className="relative -mt-[1px] h-3">
          <div
            className="absolute w-0.5 -translate-x-1/2 rounded-full"
            style={{ left: `${((Math.max(min, Math.min(max, score)) - min) / range) * 100}%`, top: -height, height: height + 8, background: "#1E1418", transition: "left 220ms ease-out" }}
          />
        </div>
      )}

      {showLabels && (
        <div className="mt-2 flex justify-between text-[10px] tabular-nums" style={{ color: "#7B6A70" }}>
          {bands.map((b, i) => (
            <span key={i} style={{ width: `${((b.max - b.min + 1) / (range + 1)) * 100}%`, textAlign: "center" }}>
              {b.min}{b.max !== b.min ? `–${b.max}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
