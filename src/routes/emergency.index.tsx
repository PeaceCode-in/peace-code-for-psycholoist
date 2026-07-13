import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page, PageTitle, Card, BigAction, Chip, Divider } from "@/components/emergency/primitives";
import { loadContacts, loadPlan, HELPLINES, type Contact } from "@/lib/emergency-store";
import { palette } from "@/components/AppShell";
import { Phone, MessageCircle, HeartHandshake, Wind, ShieldCheck, Users, Bot, Sparkles, Compass, History, Box, MapPin } from "lucide-react";

const { surface2, border, muted, ink, primary, soft } = palette;

function HomeInner() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [planUpdated, setPlanUpdated] = useState<number>(0);

  useEffect(() => {
    setContacts(loadContacts());
    setPlanUpdated(loadPlan().updatedAt);
  }, []);

  const defaultContact = contacts.find((c) => c.isDefault) ?? contacts[0];
  const featured = HELPLINES.slice(0, 3);

  return (
    <Page>
      {/* Calm hero */}
      <header className="mb-8 lg:mb-10">
        <div className="text-[10px] tracking-[0.32em] uppercase mb-3" style={{ color: muted }}>Emergency Support</div>
        <h1 className="font-serif tracking-tight text-[32px] sm:text-[44px] leading-[1.02]" style={{ color: ink }}>
          How are you feeling right now?
        </h1>
        <p className="mt-3 text-[13.5px] max-w-2xl" style={{ color: muted }}>
          You're safe here. Take a slow breath — we'll go one gentle step at a time. Nothing you tap will hurt or expose you.
        </p>
      </header>

      {/* Three primary actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <BigAction to="/emergency/helplines" icon={<ShieldCheck className="w-4.5 h-4.5" strokeWidth={1.6} />} title="I need immediate help" sub="Trained people, available 24×7. One tap to call." />
        <BigAction to="/emergency/human"     icon={<HeartHandshake className="w-4.5 h-4.5" strokeWidth={1.6} />} title="I need someone to talk to" sub="Peace Buddy, counsellor, or a trusted person." />
        <BigAction to="/emergency/calm"      icon={<Wind className="w-4.5 h-4.5" strokeWidth={1.6} />} title="I need to calm down" sub="Breathing, grounding, and gentle audio." />
      </div>

      {/* Check-in tile */}
      <Card className="mt-6" tone="soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10.5px] tracking-[0.22em] uppercase mb-1" style={{ color: muted }}>Quick check-in</div>
            <div className="font-serif text-[19px] leading-tight">Name what you're feeling</div>
            <div className="text-[12.5px] mt-1" style={{ color: muted }}>We'll suggest the calmest next step.</div>
          </div>
          <Link to="/emergency/checkin" className="rounded-full h-10 px-4 text-[12px] flex items-center gap-1.5 shrink-0" style={{ background: ink, color: "var(--pc-bg)" }}>
            <Sparkles className="w-3.5 h-3.5" /> Open check-in
          </Link>
        </div>
      </Card>

      <Divider />

      {/* Grid: safety plan + trusted contacts + helplines */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Safety plan */}
        <Card>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-[10.5px] tracking-[0.22em] uppercase" style={{ color: muted }}>Safety plan</div>
              <div className="font-serif text-[19px] mt-1">Your personal plan</div>
            </div>
            <Compass className="w-4 h-4 opacity-60" strokeWidth={1.5} />
          </div>
          <p className="text-[12.5px]" style={{ color: muted }}>
            {planUpdated
              ? `Last edited ${new Date(planUpdated).toLocaleDateString()}. A short list of warning signs, people, and places that help.`
              : "Not written yet. A short plan can help a future difficult moment feel less alone."}
          </p>
          <div className="flex gap-2 mt-4">
            <Link to="/emergency/safety-plan" className="rounded-full h-9 px-4 text-[11.5px] flex items-center" style={{ background: surface2, border: `1px solid ${border}` }}>
              {planUpdated ? "Open plan" : "Start plan"}
            </Link>
            <Link to="/emergency/hope-box" className="rounded-full h-9 px-4 text-[11.5px] flex items-center gap-1.5" style={{ background: surface2, border: `1px solid ${border}` }}>
              <Box className="w-3.5 h-3.5" /> Hope Box
            </Link>
          </div>
        </Card>

        {/* Trusted contacts */}
        <Card>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-[10.5px] tracking-[0.22em] uppercase" style={{ color: muted }}>Trusted contacts</div>
              <div className="font-serif text-[19px] mt-1">People who love you</div>
            </div>
            <Users className="w-4 h-4 opacity-60" strokeWidth={1.5} />
          </div>
          {contacts.length === 0 ? (
            <p className="text-[12.5px]" style={{ color: muted }}>Add a parent, sibling, friend, or mentor. Even one name helps.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {contacts.slice(0, 3).map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium" style={{ background: soft, color: primary }}>
                    {(c.initials || c.name.slice(0, 1)).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] truncate">{c.name} {c.isDefault && <Chip>default</Chip>}</div>
                    <div className="text-[11px] truncate" style={{ color: muted }}>{c.relationship}</div>
                  </div>
                  {c.phone && (
                    <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: surface2, border: `1px solid ${border}` }} aria-label={`Call ${c.name}`}>
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.6} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2 mt-4">
            <Link to="/emergency/contacts" className="rounded-full h-9 px-4 text-[11.5px] flex items-center" style={{ background: surface2, border: `1px solid ${border}` }}>Manage contacts</Link>
            {defaultContact && (
              <Link to="/emergency/sos" className="rounded-full h-9 px-4 text-[11.5px] flex items-center gap-1.5" style={{ background: ink, color: "var(--pc-bg)" }}>
                <MessageCircle className="w-3.5 h-3.5" /> Send SOS
              </Link>
            )}
          </div>
        </Card>

        {/* Helplines */}
        <Card>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-[10.5px] tracking-[0.22em] uppercase" style={{ color: muted }}>Emergency numbers</div>
              <div className="font-serif text-[19px] mt-1">Someone kind is on call</div>
            </div>
            <ShieldCheck className="w-4 h-4 opacity-60" strokeWidth={1.5} />
          </div>
          <ul className="flex flex-col gap-2">
            {featured.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] truncate">{h.name}</div>
                  <div className="text-[11px]" style={{ color: muted }}>{h.hours}</div>
                </div>
                <a href={`tel:${h.number.replace(/[^0-9+]/g, "")}`} className="rounded-full h-9 px-3 text-[11px] flex items-center gap-1.5 shrink-0" style={{ background: surface2, border: `1px solid ${border}` }}>
                  <Phone className="w-3 h-3" strokeWidth={1.6}/> {h.number}
                </a>
              </li>
            ))}
          </ul>
          <Link to="/emergency/helplines" className="mt-4 inline-flex rounded-full h-9 px-4 text-[11.5px] items-center" style={{ background: surface2, border: `1px solid ${border}` }}>
            All helplines
          </Link>
        </Card>
      </div>

      <Divider />

      {/* Sub-navigation directory */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <BigAction to="/peacebot" icon={<Bot className="w-4.5 h-4.5" strokeWidth={1.6}/>} title="PeaceBot crisis mode" sub="Calm, grounded AI. Not a replacement for a human." />
        <BigAction to="/emergency/toolkit" icon={<Sparkles className="w-4.5 h-4.5" strokeWidth={1.6}/>} title="Calm toolkit" sub="Breathing, meditation, sleep story, gratitude." />
        <BigAction to="/emergency/location" icon={<MapPin className="w-4.5 h-4.5" strokeWidth={1.6}/>} title="Share live location" sub="With a trusted person. Time-limited." />
        <BigAction to="/emergency/recovery" icon={<HeartHandshake className="w-4.5 h-4.5" strokeWidth={1.6}/>} title="Recovery plan" sub="After the storm — kind next steps." />
        <BigAction to="/emergency/history" icon={<History className="w-4.5 h-4.5" strokeWidth={1.6}/>} title="Emergency history" sub="What helped, and when." />
        <BigAction to="/emergency/settings" icon={<ShieldCheck className="w-4.5 h-4.5" strokeWidth={1.6}/>} title="Emergency settings" sub="Default contact, SOS message, accessibility." />
      </div>
    </Page>
  );
}

export const Route = createFileRoute("/emergency/")({
  component: HomeInner,
});
