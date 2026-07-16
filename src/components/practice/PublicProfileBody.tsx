// Shared public-profile body used by /p/$slug and the in-app preview.
import type { Profile } from "@/lib/profile-store";
import { MapPin, ShieldCheck, Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

const FORMAT_LABEL: Record<string, string> = { in_person: "In-person", video: "Video", phone: "Phone" };

export function PublicProfileBody({ profile: p }: { profile: Profile }) {
  return (
    <article className="font-sans" style={{ color: "#1a1a1a" }}>
      {/* Hero */}
      <header className="px-8 py-10 border-b" style={{ borderColor: "#e7e5e0", background: "#fbfaf7" }}>
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-[28px] flex-shrink-0" style={{ background: p.photoBg, color: "#fff", fontFamily: "'Fraunces', serif" }}>{p.photoInitials}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Clinical psychologist</div>
            <h1 className="mt-2 text-[36px] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>{p.displayName} <span className="text-[16px] font-normal" style={{ color: "#7a7770" }}>({p.pronouns})</span></h1>
            <p className="mt-3 text-[17px] leading-snug max-w-2xl" style={{ color: "#3a3a3a" }}>{p.headline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px]" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.city}</span>
              <span>·</span>
              <span>{p.languages.join(" · ")}</span>
              <span>·</span>
              <span>{p.sessionFormats.map((f) => FORMAT_LABEL[f]).join(" · ")}</span>
            </div>
          </div>
          {p.acceptingNew ? (
            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "#3B7A57", background: "rgba(59,122,87,0.06)" }}>
              <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "#3B7A57", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Accepting new patients</div>
              <div className="mt-1 text-[13px]" style={{ color: "#1a1a1a" }}>Next opening — {p.nextAvailability}</div>
              <button className="mt-3 rounded-full px-4 py-1.5 text-[12px] w-full" style={{ background: "#1a1a1a", color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Request first session</button>
            </div>
          ) : (
            <div className="rounded-2xl border px-4 py-3" style={{ borderColor: "#e7e5e0" }}>
              <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Waitlist only</div>
              <button className="mt-3 rounded-full px-4 py-1.5 text-[12px] w-full border" style={{ borderColor: "#1a1a1a", color: "#1a1a1a", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Join waitlist</button>
            </div>
          )}
        </div>
      </header>

      <div className="grid md:grid-cols-[1fr_280px] gap-10 px-8 py-10">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.16em] mb-4" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>About my practice</h2>
          <div className="text-[17px] leading-[1.7] whitespace-pre-line max-w-2xl" style={{ fontFamily: "'Fraunces', serif" }}>{p.bio}</div>

          <h2 className="mt-10 text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>What clients say</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {p.testimonials.filter((t) => t.approved).map((t) => (
              <blockquote key={t.id} className="rounded-2xl border p-5" style={{ borderColor: "#e7e5e0", background: "#fbfaf7" }}>
                <p className="text-[15px] leading-snug italic" style={{ fontFamily: "'Fraunces', serif" }}>"{t.quote}"</p>
                <cite className="mt-3 block text-[11px] not-italic" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>— {t.attribution}</cite>
              </blockquote>
            ))}
          </div>

          <h2 className="mt-10 text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Common questions</h2>
          <div>
            {p.faqs.map((f) => <FaqRow key={f.id} q={f.q} a={f.a} />)}
          </div>
        </div>

        <aside className="space-y-6">
          <SidebarSection title="Specialties">
            <div className="flex flex-wrap gap-1">
              {p.specialties.map((s) => <span key={s} className="text-[11px] rounded-full border px-2 py-0.5" style={{ borderColor: "#d9d6cf", color: "#3a3a3a", fontFamily: "'DM Mono', ui-monospace, monospace" }}>{s}</span>)}
            </div>
          </SidebarSection>
          <SidebarSection title="Approach">
            <div className="flex flex-wrap gap-1">
              {p.modalities.map((s) => <span key={s} className="text-[11px] rounded-full border px-2 py-0.5" style={{ borderColor: "#d9d6cf", color: "#3a3a3a", fontFamily: "'DM Mono', ui-monospace, monospace" }}>{s}</span>)}
            </div>
          </SidebarSection>
          <SidebarSection title="Credentials">
            {p.credentials.map((c) => (
              <div key={c.id} className="flex items-start gap-2 py-1 text-[12px]" style={{ color: "#3a3a3a" }}>
                {c.verified && <ShieldCheck className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "#3B7A57" }} />}
                <span>{c.label}{c.year ? ` · ${c.year}` : ""}</span>
              </div>
            ))}
          </SidebarSection>
          <SidebarSection title="Fees">
            <div className="text-[15px]" style={{ fontFamily: "'Fraunces', serif" }}>₹{p.feeRangeInr[0].toLocaleString("en-IN")} – ₹{p.feeRangeInr[1].toLocaleString("en-IN")}</div>
            <div className="text-[11px]" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>per 50-minute session</div>
            {p.slidingScale && p.slidingScaleNote && <p className="mt-2 text-[12px] italic" style={{ color: "#3a3a3a" }}>{p.slidingScaleNote}</p>}
          </SidebarSection>
          <SidebarSection title="Session formats">
            {p.sessionFormats.map((f) => <div key={f} className="text-[12px] py-0.5" style={{ color: "#3a3a3a" }}>· {FORMAT_LABEL[f]}</div>)}
          </SidebarSection>
        </aside>
      </div>

      <footer className="border-t px-8 py-6 text-[11px]" style={{ borderColor: "#e7e5e0", color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span>Listed on PeaceCode · verified {p.credentials.filter((c) => c.verified).length} credentials</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> Updated {new Date(p.lastEditedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </footer>
    </article>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: "#7a7770", fontFamily: "'DM Mono', ui-monospace, monospace" }}>{title}</div>
      {children}
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b py-3" style={{ borderColor: "#e7e5e0" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <span className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: "#1a1a1a" }}>{q}</span>
        <ChevronDown className="h-4 w-4 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none", color: "#7a7770" }} />
      </button>
      {open && <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "#3a3a3a" }}>{a}</p>}
    </div>
  );
}
