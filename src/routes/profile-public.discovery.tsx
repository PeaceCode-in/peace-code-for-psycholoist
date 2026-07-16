import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Eye, MousePointerClick, Users } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useProfile, updateProfile } from "@/lib/profile-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/profile-public/discovery")({
  component: DiscoveryPage,
});

function DiscoveryPage() {
  const hydrated = useHydrated();
  const p = useProfile();
  if (!hydrated) return null;

  const impressions = 1284;
  const clicks = 213;
  const bookings = 18;
  const ctr = Math.round((clicks / impressions) * 100 * 10) / 10;
  const cvr = Math.round((bookings / clicks) * 100 * 10) / 10;

  return (
    <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={<Eye className="h-3.5 w-3.5" />} label="Impressions · 30d" value={impressions.toLocaleString("en-IN")} sub="in PeaceCode directory" />
        <Stat icon={<MousePointerClick className="h-3.5 w-3.5" />} label="Profile clicks" value={String(clicks)} sub={`${ctr}% CTR`} />
        <Stat icon={<Users className="h-3.5 w-3.5" />} label="Enquiries" value="27" sub="from public page" />
        <Stat icon={<Sparkles className="h-3.5 w-3.5" />} label="Bookings converted" value={String(bookings)} sub={`${cvr}% of clicks`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
          <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Directory listing</div>
          <p className="text-[12px] mb-3" style={{ color: palette.muted }}>
            How you're indexed on the PeaceCode public directory. Facets that patients filter by.
          </p>
          <Row label="Discipline">Clinical psychologist</Row>
          <Row label="City">{p.city}</Row>
          <Row label="Focus areas">{p.specialties.join(", ")}</Row>
          <Row label="Modalities">{p.modalities.join(", ")}</Row>
          <Row label="Accepting">{p.acceptingNew ? "Yes — waitlist " + p.waitlistLength : "Not accepting"}</Row>
          <Row label="Session formats">{p.sessionFormats.join(", ")}</Row>
          <Row label="Fee range">₹{p.feeRangeInr[0].toLocaleString("en-IN")} – ₹{p.feeRangeInr[1].toLocaleString("en-IN")}</Row>
          <Row label="Sliding scale">{p.slidingScale ? "Offered" : "Not offered"}</Row>
        </div>

        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
          <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Discovery levers</div>
          <Toggle label="Boost 'accepting new' badge" checked={p.acceptingNew} onChange={(v) => updateProfile({ acceptingNew: v })} hint="Shown at top of directory when on" />
          <Toggle label="Highlight sliding-scale slots" checked={p.slidingScale} onChange={(v) => updateProfile({ slidingScale: v })} hint="Signals access-forward practice" />
          <Toggle label="JSON-LD on public page" checked={p.jsonLdEnabled} onChange={(v) => updateProfile({ jsonLdEnabled: v })} hint="Google Rich Results eligibility" />
          <div className="pt-3 mt-3 border-t" style={{ borderColor: palette.border }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Copilot suggestion</div>
            <p className="text-[12px]" style={{ color: palette.ink }}>Your CTR (16.6%) is above directory median (11.4%). Your conversion from click → booking (8.5%) is <em>below</em> median (12%). The likely lever is availability clarity — try tightening "Next availability" to a specific week rather than "Mid-August".</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
        <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Top search queries you appeared for</div>
        <div className="space-y-1 text-[13px]" style={{ color: palette.ink }}>
          {[
            { q: "trauma therapist bengaluru", imp: 412, pos: 3 },
            { q: "EMDR therapist indiranagar", imp: 218, pos: 2 },
            { q: "cbt psychologist bangalore online", imp: 187, pos: 5 },
            { q: "psychologist for anxiety bangalore", imp: 176, pos: 9 },
            { q: "sliding scale therapist india", imp: 89, pos: 4 },
          ].map((q) => (
            <div key={q.q} className="grid grid-cols-[1fr_100px_60px] gap-3 py-1 border-b last:border-0" style={{ borderColor: palette.border }}>
              <span>{q.q}</span>
              <span className="text-[11px] text-right" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{q.imp} impressions</span>
              <span className="text-[11px] text-right" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>pos {q.pos}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
      <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{icon} {label}</div>
      <div className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}</div>
      <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{sub}</div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5 text-[12px]" style={{ color: palette.ink }}>
      <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}
function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint: string }) {
  return (
    <label className="flex items-start gap-2 py-2 text-[12px] cursor-pointer" style={{ color: palette.ink }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5" />
      <div>
        <div>{label}</div>
        <div className="text-[11px] mt-0.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{hint}</div>
      </div>
    </label>
  );
}
