import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, Plus, Trash2, Check, X } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useProfile, updateProfile, addTestimonial, removeTestimonial, addFaq, removeFaq, publish } from "@/lib/profile-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/profile-public/")({
  component: ProfileEditor,
});

function ProfileEditor() {
  const hydrated = useHydrated();
  const p = useProfile();

  if (!hydrated) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-16">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[12px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          Published {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "never"} · edited {new Date(p.lastEditedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/p/$slug" params={{ slug: p.slug }} target="_blank" className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px]" style={{ borderColor: palette.border, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <ExternalLink className="h-3.5 w-3.5" /> View public /p/{p.slug}
          </Link>
          <button onClick={publish} className="rounded-full px-4 py-1.5 text-[12px]" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>Publish changes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <Card title="Identity">
            <Row><Label>Display name</Label><Input value={p.displayName} onChange={(v) => updateProfile({ displayName: v })} /></Row>
            <Row><Label>Pronouns</Label><Input value={p.pronouns} onChange={(v) => updateProfile({ pronouns: v })} /></Row>
            <Row><Label>Slug (in /p/…)</Label><Input value={p.slug} onChange={(v) => updateProfile({ slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></Row>
            <Row><Label>City</Label><Input value={p.city} onChange={(v) => updateProfile({ city: v })} /></Row>
            <Row><Label>Headline (60-100 chars)</Label><Input value={p.headline} onChange={(v) => updateProfile({ headline: v })} /></Row>
            <div className="text-[11px] text-right" style={{ color: p.headline.length > 100 ? "#B85A3E" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.headline.length} / 100</div>
          </Card>

          <Card title="Long-form bio">
            <textarea value={p.bio} onChange={(e) => updateProfile({ bio: e.target.value })} rows={12} className="w-full border rounded-xl px-3 py-2 text-[14px] leading-relaxed" style={{ borderColor: palette.border, fontFamily: "'Fraunces', serif" }} />
            <div className="text-[11px] mt-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.bio.length} characters · {p.bio.split(/\s+/).length} words</div>
          </Card>

          <Card title="What you offer">
            <TagRow label="Specialties" values={p.specialties} onChange={(v) => updateProfile({ specialties: v })} />
            <TagRow label="Modalities" values={p.modalities} onChange={(v) => updateProfile({ modalities: v })} />
            <TagRow label="Age groups" values={p.ageGroups} onChange={(v) => updateProfile({ ageGroups: v })} />
            <TagRow label="Languages" values={p.languages} onChange={(v) => updateProfile({ languages: v })} />
            <Row>
              <Label>Session formats</Label>
              <div className="flex flex-wrap gap-2">
                {(["in_person", "video", "phone"] as const).map((k) => {
                  const on = p.sessionFormats.includes(k);
                  return (
                    <button key={k} onClick={() => updateProfile({ sessionFormats: on ? p.sessionFormats.filter((x) => x !== k) : [...p.sessionFormats, k] })} className="rounded-full px-3 py-1 text-[11px]" style={{ background: on ? palette.ink : "transparent", color: on ? "#fff" : palette.muted, border: `1px solid ${palette.border}`, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {k.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </Row>
            <Row><Label>Fee range (INR)</Label>
              <div className="flex items-center gap-2">
                <Input value={String(p.feeRangeInr[0])} onChange={(v) => updateProfile({ feeRangeInr: [+v || 0, p.feeRangeInr[1]] })} />
                <span style={{ color: palette.muted }}>→</span>
                <Input value={String(p.feeRangeInr[1])} onChange={(v) => updateProfile({ feeRangeInr: [p.feeRangeInr[0], +v || 0] })} />
              </div>
            </Row>
            <Row><Label>Sliding scale</Label>
              <label className="inline-flex items-center gap-2 text-[12px]" style={{ color: palette.ink }}>
                <input type="checkbox" checked={p.slidingScale} onChange={(e) => updateProfile({ slidingScale: e.target.checked })} />
                Offer sliding-scale slots
              </label>
            </Row>
            {p.slidingScale && <Row><Label>Sliding scale note</Label><Input value={p.slidingScaleNote ?? ""} onChange={(v) => updateProfile({ slidingScaleNote: v })} /></Row>}
          </Card>

          <Card title="Credentials">
            {p.credentials.map((c, i) => (
              <div key={c.id} className="grid grid-cols-[1fr_80px_60px_28px] gap-2 py-1">
                <Input value={c.label} onChange={(v) => { const next = [...p.credentials]; next[i] = { ...c, label: v }; updateProfile({ credentials: next }); }} />
                <Input value={String(c.year ?? "")} onChange={(v) => { const next = [...p.credentials]; next[i] = { ...c, year: +v || undefined }; updateProfile({ credentials: next }); }} />
                <button onClick={() => { const next = [...p.credentials]; next[i] = { ...c, verified: !c.verified }; updateProfile({ credentials: next }); }} className="text-[11px] rounded-full px-2 py-1" style={{ background: c.verified ? palette.ink : "transparent", color: c.verified ? "#fff" : palette.muted, border: `1px solid ${palette.border}`, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{c.verified ? "verified" : "unverified"}</button>
                <button onClick={() => updateProfile({ credentials: p.credentials.filter((x) => x.id !== c.id) })} style={{ color: palette.muted }}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <button onClick={() => updateProfile({ credentials: [...p.credentials, { id: `c-${Date.now()}`, label: "New credential", verified: false }] })} className="mt-2 inline-flex items-center gap-1 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}><Plus className="h-3 w-3" /> Add credential</button>
          </Card>

          <Card title="Testimonials">
            <p className="text-[11px] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Consented, attributed by initials + role + city only. Never full names.</p>
            {p.testimonials.map((t) => (
              <div key={t.id} className="rounded-xl border p-3 mb-2" style={{ borderColor: palette.border }}>
                <p className="text-[13px] italic" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>"{t.quote}"</p>
                <div className="mt-1 flex items-center justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <span>— {t.attribution}</span>
                  <button onClick={() => removeTestimonial(t.id)}><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
            <AddTestimonialForm />
          </Card>

          <Card title="FAQs">
            {p.faqs.map((f) => (
              <div key={f.id} className="rounded-xl border p-3 mb-2" style={{ borderColor: palette.border }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{f.q}</div>
                    <p className="text-[12px] mt-1" style={{ color: palette.muted }}>{f.a}</p>
                  </div>
                  <button onClick={() => removeFaq(f.id)} style={{ color: palette.muted }}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            <AddFaqForm />
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Availability">
            <Row><Label>Accepting new patients</Label>
              <label className="inline-flex items-center gap-2 text-[12px]" style={{ color: palette.ink }}>
                <input type="checkbox" checked={p.acceptingNew} onChange={(e) => updateProfile({ acceptingNew: e.target.checked })} /> Yes
              </label>
            </Row>
            <Row><Label>Waitlist length</Label><Input value={String(p.waitlistLength)} onChange={(v) => updateProfile({ waitlistLength: +v || 0 })} /></Row>
            <Row><Label>Next availability (blurb)</Label><Input value={p.nextAvailability ?? ""} onChange={(v) => updateProfile({ nextAvailability: v })} /></Row>
          </Card>

          <Card title="Privacy">
            <Row><Label>Temporarily private</Label>
              <label className="inline-flex items-center gap-2 text-[12px]" style={{ color: palette.ink }}>
                <input type="checkbox" checked={p.temporarilyPrivate} onChange={(e) => updateProfile({ temporarilyPrivate: e.target.checked })} /> Hide from search
              </label>
            </Row>
            {p.temporarilyPrivate && (
              <>
                <Row><Label>Reason</Label><Input value={p.temporarilyPrivateReason ?? ""} onChange={(v) => updateProfile({ temporarilyPrivateReason: v })} /></Row>
                <p className="text-[11px]" style={{ color: "#B85A3E", fontFamily: "'DM Mono', ui-monospace, monospace" }}>robots.txt will emit Disallow: /p/{p.slug}</p>
              </>
            )}
          </Card>

          <Card title="Photo">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-[22px]" style={{ background: p.photoBg, color: "#fff", fontFamily: "'Fraunces', serif" }}>{p.photoInitials}</div>
              <div className="flex-1">
                <Input value={p.photoInitials} onChange={(v) => updateProfile({ photoInitials: v.slice(0, 2).toUpperCase() })} />
                <input type="color" value={p.photoBg} onChange={(e) => updateProfile({ photoBg: e.target.value })} className="mt-2 h-8 w-full border rounded" style={{ borderColor: palette.border }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(14px)" }}>
      <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-[160px_1fr] gap-3 items-center py-1">{children}</div>; }
function Label({ children }: { children: React.ReactNode }) { return <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{children}</div>; }
function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full border rounded-lg px-2 py-1 text-[13px]" style={{ borderColor: palette.border }} />;
}
function TagRow({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [add, setAdd] = useState("");
  return (
    <Row>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1 items-center">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-[11px] rounded-full border px-2 py-0.5" style={{ borderColor: palette.border, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))}><X className="h-2.5 w-2.5" /></button>
          </span>
        ))}
        <input value={add} onChange={(e) => setAdd(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && add.trim()) { onChange([...values, add.trim()]); setAdd(""); } }} placeholder="+ add" className="text-[11px] border-none outline-none bg-transparent w-16" style={{ color: palette.muted }} />
      </div>
    </Row>
  );
}

function AddTestimonialForm() {
  const [quote, setQuote] = useState("");
  const [attr, setAttr] = useState("");
  return (
    <div className="pt-2 border-t mt-2" style={{ borderColor: palette.border }}>
      <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} placeholder="Consented quote" className="w-full border rounded-lg px-2 py-1 text-[12px] mb-1" style={{ borderColor: palette.border }} />
      <input value={attr} onChange={(e) => setAttr(e.target.value)} placeholder='Attribution: "R., adult client, Bengaluru"' className="w-full border rounded-lg px-2 py-1 text-[12px] mb-1" style={{ borderColor: palette.border }} />
      <button disabled={!quote || !attr} onClick={() => { addTestimonial({ quote, attribution: attr, approved: true }); setQuote(""); setAttr(""); }} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] disabled:opacity-40" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <Check className="h-3 w-3" /> Add testimonial
      </button>
    </div>
  );
}

function AddFaqForm() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  return (
    <div className="pt-2 border-t mt-2" style={{ borderColor: palette.border }}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Question" className="w-full border rounded-lg px-2 py-1 text-[12px] mb-1" style={{ borderColor: palette.border, fontFamily: "'Fraunces', serif" }} />
      <textarea value={a} onChange={(e) => setA(e.target.value)} rows={2} placeholder="Answer" className="w-full border rounded-lg px-2 py-1 text-[12px] mb-1" style={{ borderColor: palette.border }} />
      <button disabled={!q || !a} onClick={() => { addFaq(q, a); setQ(""); setA(""); }} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] disabled:opacity-40" style={{ background: palette.ink, color: "#fff", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <Plus className="h-3 w-3" /> Add FAQ
      </button>
    </div>
  );
}
