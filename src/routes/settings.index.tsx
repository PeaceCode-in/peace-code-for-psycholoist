import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  User, Bell, Shield, Palette, Accessibility, Bot, PenLine, Wind,
  Users, BookOpen, Database, Link2, LifeBuoy, HelpCircle, Info, LogOut, ChevronRight, Clock, Sparkles,
} from "lucide-react";
import { palette } from "@/components/AppShell";
import { SettingsSearch } from "@/components/settings/primitives";
import { loadActivity, useSettings } from "@/lib/settings-store";
import { loadSessions as loadBreathSessions } from "@/lib/breathe-store";

export const Route = createFileRoute("/settings/")({
  head: () => ({ meta: [{ title: "Settings — PeaceCode" }] }),
  component: SettingsHome,
});

const { surface, surface2, border, ink, muted, primary } = palette;

const CATEGORIES: { icon: React.ElementType; label: string; to: string; hint: string }[] = [
  { icon: User, label: "Profile", to: "/settings/profile", hint: "Name, college, bio, interests" },
  { icon: Bell, label: "Notifications", to: "/settings/notifications", hint: "Reminders, quiet hours, DND" },
  { icon: Shield, label: "Privacy & Security", to: "/settings/privacy", hint: "Password, 2FA, biometrics" },
  { icon: Palette, label: "Appearance", to: "/settings/appearance", hint: "Theme, accent, typography" },
  { icon: Accessibility, label: "Accessibility", to: "/settings/accessibility", hint: "Contrast, motion, dyslexia" },
  { icon: Bot, label: "PeaceBot", to: "/settings/peacebot", hint: "AI personality, voice, memory" },
  { icon: PenLine, label: "Journal", to: "/settings/journal", hint: "Autosave, prompts, streak" },
  { icon: Wind, label: "Breathing", to: "/settings/breathing", hint: "Sessions, background sounds" },
  { icon: Users, label: "Community", to: "/settings/community", hint: "Anonymity, requests, mutes" },
  { icon: BookOpen, label: "Resources", to: "/settings/resources", hint: "Topics & content types" },
  { icon: Database, label: "Data & Storage", to: "/settings/data", hint: "Cache, backup, offline" },
  { icon: Link2, label: "Connected Accounts", to: "/settings/connected", hint: "Google, wearables, SSO" },
  { icon: LifeBuoy, label: "Emergency & Safety", to: "/settings/emergency", hint: "SOS, helplines, quick call" },
  { icon: HelpCircle, label: "Support", to: "/settings/support", hint: "Help centre, feedback" },
  { icon: Sparkles, label: "Product Hub", to: "/hub", hint: "What's new, themes, integrations" },
  { icon: Info, label: "About PeaceCode", to: "/settings/about", hint: "Version, team, roadmap" },
];

function SettingsHome() {
  const [s] = useSettings();
  const [activity, setActivity] = useState(() => loadActivity());
  const [breathCount, setBreathCount] = useState(0);
  useEffect(() => {
    setActivity(loadActivity());
    setBreathCount(loadBreathSessions().length);
  }, []);

  const suggestions: { text: string; to: string }[] = [];
  if (!s.notifications.types.journalReminders) suggestions.push({ text: "You journal often — turn on nightly reminders?", to: "/settings/notifications" });
  if (breathCount === 0) suggestions.push({ text: "Haven't tried breathing this week — set a gentle reminder?", to: "/settings/breathing" });
  if (!s.privacy.twoFA) suggestions.push({ text: "Add two-factor for extra peace of mind.", to: "/settings/privacy" });
  if (!s.privacy.journalLock) suggestions.push({ text: "Lock your journal with a PIN?", to: "/settings/privacy" });

  const completion = calcCompletion(s.profile);

  return (
    <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[11px] tracking-[0.3em] uppercase mb-2" style={{ color: muted }}>settings</div>
        <h1 className="font-serif text-[clamp(2rem,4.5vw,3rem)] leading-[1.02] tracking-tight" style={{ color: ink }}>Everything in one calm place.</h1>
        <p className="text-[13.5px] mt-3 max-w-lg" style={{ color: muted }}>Configure the way PeaceCode feels, remembers, and looks after you. Every change saves instantly.</p>
      </header>

      <div className="mb-8"><SettingsSearch /></div>

      {/* Profile summary */}
      <Link to="/settings/profile" className="block mb-8 rounded-2xl p-5 sm:p-6 transition hover:-translate-y-[1px]" style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-serif text-[22px]" style={{ background: `linear-gradient(135deg, ${primary}, var(--pc-lavender))`, color: "#fff" }}>
            {(s.profile.preferredName || s.profile.fullName || "K").slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[19px] leading-tight" style={{ color: ink }}>{s.profile.fullName}</div>
            <div className="text-[12px] mt-0.5" style={{ color: muted }}>{s.profile.college} · Sem {s.profile.semester}</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: surface2 }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, background: primary }} />
              </div>
              <div className="text-[11px]" style={{ color: muted }}>Profile {completion}%</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-40" />
        </div>
      </Link>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.to} to={c.to} className="group rounded-2xl p-5 transition hover:-translate-y-[2px]" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: surface2, color: primary }}>
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium" style={{ color: ink }}>{c.label}</div>
                  <div className="text-[11.5px] mt-0.5 line-clamp-2" style={{ color: muted }}>{c.hint}</div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70 transition" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Smart suggestions */}
      {suggestions.length > 0 && (
        <section className="mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: primary }}>gentle suggestions</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.slice(0, 4).map((sug) => (
              <Link key={sug.to + sug.text} to={sug.to} className="rounded-2xl p-4 flex items-center justify-between gap-3" style={{ background: surface, border: `1px solid ${border}` }}>
                <span className="text-[12.5px]" style={{ color: ink }}>{sug.text}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent activity */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: primary }}>recent activity</div>
          <span className="text-[10px]" style={{ color: muted }}>last {activity.length}</span>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
          {activity.length === 0 && <div className="px-5 py-4 text-[12px]" style={{ color: muted }}>No changes yet — anything you tweak will show up here.</div>}
          {activity.slice(0, 6).map((a) => (
            <div key={a.id} className="px-5 py-3 flex items-center justify-between text-[12.5px] border-t first:border-0" style={{ borderColor: border, color: ink }}>
              <div className="flex items-center gap-2"><Clock className="w-3 h-3 opacity-50" />{a.label}</div>
              <span className="text-[11px]" style={{ color: muted }}>{timeAgo(a.ts)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Log out */}
      <Link to="/settings/logout" className="w-full flex items-center justify-between p-5 rounded-2xl mb-3" style={{ background: surface, border: `1px solid ${border}`, color: "#B54848" }}>
        <span className="inline-flex items-center gap-2 text-[13px]"><LogOut className="w-4 h-4" /> Log out</span>
        <ChevronRight className="w-4 h-4 opacity-40" />
      </Link>

      <p className="text-center text-[11px] mt-8" style={{ color: muted }}>PeaceCode · made softly, for you.</p>
    </main>
  );
}

function calcCompletion(p: { fullName: string; preferredName: string; college: string; degree: string; bio: string; pronouns: string; birthday: string; wellnessGoal: string; interests: string[]; emergencyName: string }) {
  const fields = [p.fullName, p.preferredName, p.college, p.degree, p.bio, p.pronouns, p.birthday, p.wellnessGoal, p.emergencyName];
  let done = fields.filter((v) => v && v.trim().length > 0).length;
  if (p.interests.length > 0) done++;
  return Math.round((done / (fields.length + 1)) * 100);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
