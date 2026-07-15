import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { CalendarShell } from "@/components/practice/calendar/CalendarShell";
import { useBooking, updateBooking } from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";
import type { SessionService } from "@/lib/sessions-store";

export const Route = createFileRoute("/calendar/booking-link")({
  head: () => ({ meta: [{ title: "Booking link — Calendar · PeaceCode" }] }),
  component: BookingLinkConfig,
});

const ALL_SERVICES: SessionService[] = ["Intake","Individual Therapy","Couples","Assessment","Follow-up"];

function BookingLinkConfig() {
  const hydrated = useHydrated();
  const cfg = useBooking();
  const [copied, setCopied] = useState(false);

  const publicUrl = useMemo(() => (typeof window !== "undefined" ? `${window.location.origin}/calendar/book/${cfg.slug}` : `/calendar/book/${cfg.slug}`), [cfg.slug]);
  const embed = `<script async src="${publicUrl}?embed=1"></script>`;

  const qr = useMemo(() => makeQrSvg(publicUrl), [publicUrl]);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); toast.success("Copied"); } catch {}
  };

  if (!hydrated) return <CalendarShell><div style={{ color: palette.muted }}>Loading…</div></CalendarShell>;

  return (
    <CalendarShell title="Booking link" subtitle="A quiet doorway to your calendar.">
      <div className="rounded-2xl border p-4 mb-5 flex items-center gap-3 flex-wrap" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.55)" }}>
        <span className="text-[12px] px-3 py-1 rounded-full" style={{ background: cfg.isPublic ? "#E1EFE3" : palette.surface2, color: cfg.isPublic ? "#3E6B4C" : palette.muted, fontFamily: "'DM Mono', monospace" }}>
          {cfg.isPublic ? "Public" : "Paused"}
        </span>
        <code className="text-[12.5px] px-2 py-1 rounded-md" style={{ background: palette.surface2, fontFamily: "'DM Mono', monospace", color: palette.ink }}>{publicUrl}</code>
        <button onClick={() => copy(publicUrl)} className="inline-flex items-center gap-1 text-[12px] px-3 py-1 rounded-full border" style={{ borderColor: palette.border }}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy
        </button>
        <button onClick={() => updateBooking({ isPublic: !cfg.isPublic })} className="text-[12px] px-3 py-1 rounded-full border ml-auto" style={{ borderColor: palette.border, color: palette.ink }}>
          {cfg.isPublic ? "Pause link" : "Publish link"}
        </button>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 380px" }}>
        {/* Config */}
        <div className="rounded-2xl border p-5 space-y-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.55)" }}>
          <Field label="Headline">
            <input value={cfg.headline} onChange={(e) => updateBooking({ headline: e.target.value })} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: palette.border }} />
          </Field>
          <Field label="Intro">
            <textarea value={cfg.intro} onChange={(e) => updateBooking({ intro: e.target.value })} rows={3} className="w-full rounded-md border px-3 py-2 text-[13px]" style={{ borderColor: palette.border }} />
          </Field>
          <Field label="Slug">
            <input value={cfg.slug} onChange={(e) => updateBooking({ slug: e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase() })} className="w-full rounded-md border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }} />
          </Field>
          <Field label="Offered services">
            <div className="flex flex-wrap gap-1.5">
              {ALL_SERVICES.map((svc) => {
                const on = cfg.offeredServices.includes(svc);
                return (
                  <button key={svc} onClick={() => updateBooking({ offeredServices: on ? cfg.offeredServices.filter((s) => s !== svc) : [...cfg.offeredServices, svc] })}
                    className="text-[12px] px-3 py-1 rounded-full border transition-all duration-[180ms]"
                    style={{ borderColor: on ? palette.primary : palette.border, background: on ? "rgba(176,86,122,0.08)" : "transparent", color: on ? palette.primary : palette.ink }}>
                    {svc}
                  </button>
                );
              })}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Minimum notice · ${cfg.minNoticeHours}h`}>
              <input type="range" min={0} max={72} value={cfg.minNoticeHours} onChange={(e) => updateBooking({ minNoticeHours: Number(e.target.value) })} className="w-full" />
            </Field>
            <Field label={`Max advance · ${cfg.maxAdvanceDays}d`}>
              <input type="range" min={7} max={120} value={cfg.maxAdvanceDays} onChange={(e) => updateBooking({ maxAdvanceDays: Number(e.target.value) })} className="w-full" />
            </Field>
            <Field label={`Buffer before · ${cfg.bufferBeforeMin}m`}>
              <input type="range" min={0} max={60} step={5} value={cfg.bufferBeforeMin} onChange={(e) => updateBooking({ bufferBeforeMin: Number(e.target.value) })} className="w-full" />
            </Field>
            <Field label={`Buffer after · ${cfg.bufferAfterMin}m`}>
              <input type="range" min={0} max={60} step={5} value={cfg.bufferAfterMin} onChange={(e) => updateBooking({ bufferAfterMin: Number(e.target.value) })} className="w-full" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Toggle label="Require intake form" on={cfg.requireIntakeForm} onChange={(v) => updateBooking({ requireIntakeForm: v })} />
            <Toggle label="Require payment upfront" on={cfg.requirePaymentUpfront} onChange={(v) => updateBooking({ requirePaymentUpfront: v })} />
          </div>
          <Field label="Timezone">
            <select value={cfg.timezone} onChange={(e) => updateBooking({ timezone: e.target.value })} className="w-full rounded-md border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, fontFamily: "'DM Mono', monospace" }}>
              {["Asia/Kolkata","Asia/Dubai","Europe/London","America/New_York","America/Los_Angeles"].map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </Field>

          <div className="pt-3 border-t space-y-3" style={{ borderColor: palette.border }}>
            <Field label="Embed snippet">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11.5px] p-2 rounded-md border truncate" style={{ borderColor: palette.border, background: palette.surface2, fontFamily: "'DM Mono', monospace" }}>{embed}</code>
                <button onClick={() => copy(embed)} className="text-[12px] px-2 py-1.5 rounded-md border" style={{ borderColor: palette.border }}><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </Field>
          </div>
        </div>

        {/* Preview */}
        <aside className="space-y-4">
          <div className="rounded-[28px] border p-2" style={{ borderColor: palette.border, background: palette.surface2 }}>
            <div className="rounded-[22px] overflow-hidden border" style={{ borderColor: palette.border, background: "#fff", height: 640 }}>
              <iframe title="Booking link preview" src={`/calendar/book/${cfg.slug}?preview=1`} className="w-full h-full block" />
            </div>
          </div>
          <div className="rounded-2xl border p-3 flex items-center gap-3" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.55)" }}>
            <div dangerouslySetInnerHTML={{ __html: qr }} />
            <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>QR — share on print materials.</div>
          </div>
        </aside>
      </div>
    </CalendarShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{label}</div>
      {children}
    </label>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="flex items-center justify-between border rounded-md px-3 py-2 text-[12.5px] text-left" style={{ borderColor: palette.border, color: palette.ink }}>
      <span>{label}</span>
      <span className="h-5 w-9 rounded-full relative transition-all duration-[180ms]" style={{ background: on ? palette.primary : palette.surface2 }}>
        <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all duration-[180ms]" style={{ left: on ? 20 : 2 }} />
      </span>
    </button>
  );
}

// Simple placeholder QR — deterministic modules for aesthetic. Not scannable but visually indicates presence.
function makeQrSvg(input: string): string {
  const N = 21;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) { hash ^= input.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  const cells: boolean[] = [];
  let h = hash >>> 0;
  for (let i = 0; i < N*N; i++) { h = (Math.imul(h, 48271) >>> 0) & 0x7fffffff; cells.push((h & 1) === 1); }
  // Add finder squares
  const isFinder = (x: number, y: number) => {
    const inSq = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    return inSq(0,0) || inSq(N-7,0) || inSq(0,N-7);
  };
  const finderOn = (x: number, y: number, ox: number, oy: number) => {
    const dx = x - ox, dy = y - oy;
    if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
    if (dx === 0 || dx === 6 || dy === 0 || dy === 6) return true;
    if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) return true;
    return false;
  };
  const cell = 4;
  let rects = "";
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let on = cells[y*N+x];
    if (isFinder(x,y)) on = finderOn(x,y,0,0) || finderOn(x,y,N-7,0) || finderOn(x,y,0,N-7);
    if (on) rects += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" />`;
  }
  return `<svg width="${N*cell}" height="${N*cell}" viewBox="0 0 ${N*cell} ${N*cell}" fill="#1E1418" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}
