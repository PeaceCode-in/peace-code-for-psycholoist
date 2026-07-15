import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { palette } from "@/components/practice/palette";
import { useBooking, getFreeSlots, bookPublicSession, addDays } from "@/lib/calendar-store";
import { useHydrated } from "@/lib/use-hydrated";
import type { SessionService } from "@/lib/sessions-store";

export const Route = createFileRoute("/calendar/book/$slug")({
  head: () => ({ meta: [
    { title: "Book a session" },
    { name: "description", content: "Pick a service and time. Confirmation is instant." },
    { name: "robots", content: "noindex" },
  ] }),
  component: PublicBookingFlow,
});

// Service defaults (mirrors sessions-store fees). Public route — self-contained.
const SERVICE_DEFAULTS: Record<SessionService, { duration: number; fee: number; blurb: string }> = {
  "Intake":             { duration: 60, fee: 3500, blurb: "Our first meeting — history, hopes, and a shared plan." },
  "Individual Therapy": { duration: 50, fee: 2500, blurb: "Weekly one-on-one work in a calm, structured room." },
  "Couples":            { duration: 75, fee: 4200, blurb: "Two of you, one shared conversation. 75 minutes." },
  "Assessment":         { duration: 90, fee: 5500, blurb: "Structured evaluation with a written report." },
  "Follow-up":          { duration: 45, fee: 2200, blurb: "Shorter check-ins between full sessions." },
};

function PublicBookingFlow() {
  const hydrated = useHydrated();
  const cfg = useBooking();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [service, setService] = useState<SessionService | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", intake: "", consent: false });

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1)), []);
  const activeDay = days[dayIdx];
  const svcDef = service ? SERVICE_DEFAULTS[service] : null;
  const slots = useMemo(() => (service && hydrated ? getFreeSlots(activeDay, svcDef!.duration, service) : []), [service, activeDay, hydrated, svcDef]);

  if (!hydrated) return <PublicShell><div style={{ color: palette.muted }}>Loading…</div></PublicShell>;

  if (!cfg.isPublic) {
    return (
      <PublicShell>
        <div className="mt-24 text-center">
          <h1 className="text-[32px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Booking is paused</h1>
          <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>Please reach out directly to schedule.</p>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[clamp(1.8rem,3.4vw,2.6rem)] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{cfg.headline}</h1>
        <p className="mt-3 max-w-2xl text-[14px]" style={{ color: palette.muted }}>{cfg.intro}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1,2,3].map((n) => (
          <span key={n} className="h-1.5 flex-1 rounded-full" style={{ background: step > n ? palette.primary : step === n ? "#F1C7D6" : palette.surface2 }} />
        ))}
      </div>

      {step === 1 && (
        <section>
          <h2 className="text-[13px] uppercase tracking-wider mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>1 · Choose service</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {cfg.offeredServices.map((svc) => {
              const def = SERVICE_DEFAULTS[svc];
              const on = service === svc;
              return (
                <button key={svc} onClick={() => setService(svc)}
                  className="text-left rounded-2xl border p-5 transition-all duration-[180ms] hover:bg-white"
                  style={{ borderColor: on ? palette.primary : palette.border, background: on ? "rgba(176,86,122,0.05)" : "rgba(255,255,255,0.7)" }}>
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-[18px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{svc}</h3>
                    <span className="text-[12px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{def.duration}m · ₹{def.fee.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-[13px]" style={{ color: palette.muted }}>{def.blurb}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <button disabled={!service} onClick={() => setStep(2)} className="rounded-full px-5 py-2 text-[13px] transition-all duration-[180ms]"
              style={{ background: service ? palette.ink : palette.surface2, color: service ? "#fff" : palette.muted }}>
              Continue →
            </button>
          </div>
        </section>
      )}

      {step === 2 && service && (
        <section>
          <h2 className="text-[13px] uppercase tracking-wider mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>2 · Choose time</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {days.map((d, i) => {
              const on = i === dayIdx;
              return (
                <button key={i} onClick={() => { setDayIdx(i); setSlot(null); }}
                  className="shrink-0 rounded-2xl border px-3 py-2 text-center transition-all duration-[180ms]"
                  style={{ borderColor: on ? palette.primary : palette.border, background: on ? palette.primary : "rgba(255,255,255,0.7)", color: on ? "#fff" : palette.ink, minWidth: 68 }}>
                  <div className="text-[10.5px] uppercase" style={{ opacity: 0.8 }}>{d.toLocaleDateString(undefined,{weekday:"short"})}</div>
                  <div className="text-[16px]" style={{ fontFamily: "'DM Mono', monospace" }}>{d.getDate()}</div>
                </button>
              );
            })}
          </div>
          {slots.length ? (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
              {slots.map((iso) => {
                const on = slot === iso;
                return (
                  <button key={iso} onClick={() => setSlot(iso)}
                    className="rounded-full border py-2 text-[12.5px] transition-all duration-[180ms]"
                    style={{ borderColor: on ? palette.primary : palette.border, background: on ? palette.primary : "rgba(255,255,255,0.7)", color: on ? "#fff" : palette.ink, fontFamily: "'DM Mono', monospace" }}>
                    {new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-[13px] py-8 text-center" style={{ color: palette.muted }}>No open slots this day.</div>
          )}
          <div className="mt-4 text-[11.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Times shown in {cfg.timezone}</div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(1)} className="text-[13px]" style={{ color: palette.muted }}>← Back</button>
            <button disabled={!slot} onClick={() => setStep(3)} className="rounded-full px-5 py-2 text-[13px]" style={{ background: slot ? palette.ink : palette.surface2, color: slot ? "#fff" : palette.muted }}>Continue →</button>
          </div>
        </section>
      )}

      {step === 3 && service && slot && (
        <section>
          <h2 className="text-[13px] uppercase tracking-wider mb-4" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>3 · Your details</h2>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
            <label className="block sm:col-span-2">
              <div className="text-[11px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Full name</div>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: palette.border }} />
            </label>
            <label className="block">
              <div className="text-[11px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Email</div>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: palette.border }} />
            </label>
            <label className="block">
              <div className="text-[11px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Phone (optional)</div>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-md border px-3 py-2 text-[14px]" style={{ borderColor: palette.border }} />
            </label>
            {cfg.requireIntakeForm && (
              <label className="block sm:col-span-2">
                <div className="text-[11px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>What brings you here? (a sentence or two)</div>
                <textarea value={form.intake} onChange={(e) => setForm({ ...form, intake: e.target.value })} rows={3} className="w-full rounded-md border px-3 py-2 text-[13px]" style={{ borderColor: palette.border }} />
              </label>
            )}
            <label className="sm:col-span-2 flex items-start gap-2 text-[12.5px]" style={{ color: palette.ink }}>
              <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5" />
              I consent to the storage of my details for the purpose of this booking, per the practice's privacy policy.
            </label>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(2)} className="text-[13px]" style={{ color: palette.muted }}>← Back</button>
            <button
              disabled={!form.name || !form.email || !form.consent || (cfg.requireIntakeForm && !form.intake.trim())}
              onClick={() => {
                bookPublicSession({
                  patientName: form.name, email: form.email, phone: form.phone,
                  startsAt: slot!, durationMin: SERVICE_DEFAULTS[service!].duration,
                  service: service!, modality: "telehealth", fee: SERVICE_DEFAULTS[service!].fee,
                });
                toast.success("Session booked");
                setStep(4);
              }}
              className="rounded-full px-5 py-2 text-[13px]"
              style={{ background: palette.ink, color: "#fff" }}>
              Confirm · {new Date(slot!).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})} · {new Date(slot!).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})}
            </button>
          </div>
        </section>
      )}

      {step === 4 && service && slot && (
        <section className="pt-6">
          <h2 className="text-[clamp(2.4rem,5vw,4rem)] leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Booked.</h2>
          <div className="mt-6 rounded-2xl border p-5 max-w-xl" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
            <dl className="space-y-2 text-[13.5px]" style={{ color: palette.ink }}>
              <Row k="Service" v={service} />
              <Row k="When" v={`${new Date(slot).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"})} · ${new Date(slot).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"})}`} />
              <Row k="Duration" v={`${SERVICE_DEFAULTS[service].duration} minutes`} />
              <Row k="Confirmation" v={`Sent to ${form.email}`} />
            </dl>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={makeGCalUrl(service, slot!)} target="_blank" rel="noreferrer" className="rounded-full px-4 py-2 text-[12.5px]" style={{ background: palette.ink, color: "#fff" }}>Add to Google Calendar</a>
            <a href={"data:text/calendar;charset=utf-8," + encodeURIComponent(makeIcs(service, slot!))} download="session.ics" className="rounded-full px-4 py-2 text-[12.5px] border" style={{ borderColor: palette.border, color: palette.ink }}>Download .ics</a>
          </div>
        </section>
      )}
    </PublicShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-6"><dt style={{ color: palette.muted, fontFamily: "'DM Mono', monospace", fontSize: 11.5 }}>{k}</dt><dd className="text-right">{v}</dd></div>
  );
}

function makeGCalUrl(service: string, iso: string): string {
  const start = new Date(iso);
  const def = SERVICE_DEFAULTS[service as SessionService];
  const end = new Date(start.getTime() + def.duration * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service + " — Dr. Kavya Rao")}&dates=${fmt(start)}/${fmt(end)}`;
}
function makeIcs(service: string, iso: string): string {
  const start = new Date(iso);
  const def = SERVICE_DEFAULTS[service as SessionService];
  const end = new Date(start.getTime() + def.duration * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:${service} — Dr. Kavya Rao\nEND:VEVENT\nEND:VCALENDAR`;
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#FBF6F4 0%,#F5EDEC 100%)", color: palette.ink }}>
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full" style={{ background: palette.primary }} />
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 16 }}>PeaceCode · Practice</span>
        </div>
        <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>Secure booking</span>
      </header>
      <main className="max-w-3xl mx-auto px-6 pb-24">{children}</main>
    </div>
  );
}
