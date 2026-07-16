import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileText, ShieldCheck, AlertTriangle } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useCycles, useEntries, generateRenewalPacket, summarizeCycle, CATEGORY_LABEL, type RenewalCycle } from "@/lib/cpd-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/cpd/renewal")({
  component: CpdRenewal;
});

function CpdRenewal() {
  const hydrated = useHydrated();
  const cycles = useCycles();
  const entries = useEntries();
  const current = cycles.find((c) => c.status === "current");
  const [packet, setPacket] = useState<{ url: string; filename: string; count: number; hours: number } | null>(null);
  const summary = useMemo(() => summarizeCycle(entries, current), [entries, current]);

  function handleGenerate() {
    if (!current) return;
    const p = generateRenewalPacket(current.id);
    setPacket({ url: p.pdfUrl, filename: p.filename, count: p.entryCount, hours: p.hoursTotal });
  }

  if (!hydrated) return null;

  return (
    <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pb-16 space-y-8">
      {current && (
        <section className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)" }}>
          <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Current licence</div>
          <h2 className="mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 26 }}>{current.bodyLabel}</h2>
          <div className="text-[12px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {current.licenseNumber} · issued {new Date(current.issueDate).toLocaleDateString()} · expires {new Date(current.expiryDate).toLocaleDateString()}
          </div>

          <CycleTimeline cycle={current} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <Stat label="Claimed" value={`${summary.hoursTotal.toFixed(1)}h`} />
            <Stat label="Required" value={`${summary.hoursRequired}h`} />
            <Stat label="Remaining" value={`${Math.max(0, summary.hoursRequired - summary.hoursTotal).toFixed(1)}h`} tone={summary.behind ? "warn" : "ok"} />
            <Stat label="Days left" value={String(summary.daysUntilRenewal)} />
          </div>

          <div className="mt-6">
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Category minima</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(summary.byCategory).map(([cat, v]) => {
                const short = v.min > 0 && v.hours < v.min;
                return (
                  <div key={cat} className="flex items-center justify-between rounded-lg border px-3 py-2 text-[12px]" style={{ borderColor: palette.border, background: "#fff" }}>
                    <span style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{CATEGORY_LABEL[cat as keyof typeof CATEGORY_LABEL]}</span>
                    <span style={{ color: short ? "#B85C4A" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{v.hours.toFixed(1)}{v.min > 0 ? ` / ${v.min}` : ""}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)" }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h3 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 20 }}>Renewal packet</h3>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
              One PDF: coversheet in the council's format, every verified entry, reflections, certificate hashes.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!current}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] disabled:opacity-40"
            style={{ background: palette.ink, color: "#fff" }}
          >
            <FileText className="h-3.5 w-3.5" /> Generate packet
          </button>
        </div>

        {packet && (
          <div className="mt-4 rounded-lg border px-4 py-3 flex items-center justify-between" style={{ borderColor: palette.border, background: "#F6F1E9" }}>
            <div className="text-[12px]" style={{ color: "#7A5A18" }}>
              <ShieldCheck className="h-4 w-4 inline mr-1.5" />
              {packet.count} entries · {packet.hours.toFixed(1)}h · signed by clinician on generation
            </div>
            <a href={packet.url} download={packet.filename} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
              <Download className="h-3.5 w-3.5" />Download
            </a>
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)" }}>
        <h3 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 20 }}>Regulatory watchlist</h3>
        <ul className="mt-3 space-y-2 text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
          <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: "#B85C4A" }} /><span>RCI proposed doubling ethics minimum from 5h to 10h per cycle — draft consultation open through Q1.</span></li>
          <li className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: palette.muted }} /><span>IAP added reflective-note requirement for all clinical hours claimed from June 2025.</span></li>
        </ul>
        <p className="mt-3 text-[11px]" style={{ color: palette.muted }}>Watchlist entries are manually curated for now. Anything urgent surfaces in /alerts.</p>
      </section>

      <section>
        <h3 className="mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 18 }}>Past cycles</h3>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: "#fff" }}>
          {cycles.filter((c) => c.status === "past").map((c, i) => {
            const s = summarizeCycle(entries, c);
            return (
              <div key={c.id} className="grid grid-cols-[1fr_auto] gap-3 items-baseline px-5 py-4" style={{ borderTop: i === 0 ? "none" : `1px solid ${palette.border}` }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 15 }}>{c.bodyLabel}</div>
                  <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{c.licenseNumber} · {new Date(c.issueDate).toLocaleDateString()} → {new Date(c.expiryDate).toLocaleDateString()}</div>
                </div>
                <div className="text-right text-[12px]" style={{ color: palette.muted }}>{s.hoursTotal.toFixed(1)} of {c.hoursRequired}h</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function CycleTimeline({ cycle }: { cycle: RenewalCycle }) {
  const now = Date.now();
  const elapsed = Math.max(0, Math.min(1, (now - cycle.issueDate) / (cycle.expiryDate - cycle.issueDate)));
  return (
    <div className="mt-6">
      <div className="h-1 rounded-full relative" style={{ background: palette.border }}>
        <div className="h-1 rounded-full" style={{ width: `${elapsed * 100}%`, background: palette.primary }} />
        <div className="absolute -top-1 w-3 h-3 rounded-full" style={{ left: `calc(${elapsed * 100}% - 6px)`, background: palette.ink }} />
      </div>
      <div className="flex justify-between text-[10px] mt-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span>{new Date(cycle.issueDate).toLocaleDateString()}</span>
        <span>you are here</span>
        <span>{new Date(cycle.expiryDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: palette.border, background: "#fff" }}>
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", color: tone === "warn" ? "#B85C4A" : palette.ink, fontSize: 20 }}>{value}</div>
    </div>
  );
}
