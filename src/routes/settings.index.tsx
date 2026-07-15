import { createFileRoute, Link } from "@tanstack/react-router";
import { SETTINGS_SECTIONS } from "@/components/practice/SettingsRail";
import { palette } from "@/components/practice/palette";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — PeaceCode · Practice" },
      { name: "description", content: "Configure your clinical profile, availability, payments, compliance, and preferences." },
    ],
  }),
  component: SettingsIndex,
});

function SettingsIndex() {
  const { ink, muted, primary, border, surface, soft } = palette;
  return (
    <main className="max-w-5xl mx-auto">
      <header className="mb-6">
        <div className="text-[10.5px] tracking-[0.24em] uppercase" style={{ color: primary }}>Settings</div>
        <h1 className="text-[clamp(1.6rem,2.4vw,2rem)] tracking-tight mt-1" style={{ fontFamily: "'Fraunces', serif", color: ink }}>
          Practice preferences
        </h1>
        <p className="text-[13px] mt-2 max-w-lg" style={{ color: muted }}>
          Everything that shapes your clinical workspace — your profile, hours, payments, compliance, and defaults.
        </p>
      </header>

      <div className="space-y-6">
        {SETTINGS_SECTIONS.map((section) => (
          <section key={section.label}>
            <div className="text-[10.5px] tracking-[0.24em] uppercase mb-2 px-1" style={{ color: muted }}>
              {section.label}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.items.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  className="group rounded-2xl p-4 flex items-start gap-3 transition-all hover:-translate-y-[1px]"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(14px) saturate(140%)",
                    border: `1px solid ${border}`,
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={{ background: soft, color: primary }}
                  >
                    <it.icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] flex items-center gap-1" style={{ color: ink }}>
                      {it.label}
                      <ChevronRight className="w-3 h-3 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: muted }}>
                      {descriptions[it.to] ?? "Manage this section."}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

const descriptions: Record<string, string> = {
  "/settings/profile": "Name, headline, bio, languages — what patients see.",
  "/settings/credentials": "Licence, RCI/state council, specialisations, degree.",
  "/settings/appearance": "Theme, accent, density, motion, grain.",
  "/settings/accessibility": "Font size, contrast, reduced motion.",
  "/settings/notifications": "Email, SMS, push, quiet hours.",
  "/settings/availability": "Weekly hours, session length, buffer, max/day.",
  "/settings/services": "Session types, prices, sliding scale, cancellation.",
  "/settings/payments": "Payout account, GST/PAN, invoice template.",
  "/settings/telehealth": "Video provider, waiting room, recording defaults.",
  "/settings/clinical-defaults": "Note format, auto-assigned assessments, templates.",
  "/settings/emergency-protocol": "On-call escalation, helplines, safety plan.",
  "/settings/privacy": "Profile visibility, review moderation, block list.",
  "/settings/security": "Password, 2FA, active sessions, devices.",
  "/settings/data": "Export patient records, retention, scheduled backups.",
  "/settings/compliance": "DPDP, consent template, audit log.",
  "/settings/team": "Invite associates, receptionist, supervisor.",
  "/settings/integrations": "Calendar, Zoom, WhatsApp, Razorpay, e-Rx.",
  "/settings/about": "Version, licence terms, RCI code of ethics.",
  "/settings/support": "Contact PeaceCode, submit bug, feature request.",
  "/settings/delete": "Deactivate practice, delete account.",
  "/settings/logout": "Sign out of PeaceCode · Practice.",
};
