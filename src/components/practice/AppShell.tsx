import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, Inbox as InboxIcon, BellRing,
  Users, UserPlus, UsersRound, Share2,
  Video, NotebookPen, ClipboardList, Target, BookOpenCheck, Pill, ShieldAlert, MessagesSquare,
  Clock, Tag, Wallet, Banknote, FileSignature, Files,
  LineChart, Star, Sparkles, Library, GraduationCap,
  Handshake, UserCog, Microscope,
  FileLock2, History, Download,
  Search, Bell, Plus, LifeBuoy, Settings as SettingsIcon, LogOut, Menu, ShieldCheck, ChevronDown, AlertOctagon, X,
} from "lucide-react";
import { palette } from "./palette";
import { GlassFX } from "@/components/GlassFX";
import { INBOX_UNREAD, ALERTS_HIGH } from "@/lib/practice-store";
import { clearSession } from "@/lib/auth-store";

export { palette };

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; badge?: number | "dot" };
type NavSection = { label: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    label: "Today",
    items: [
      { title: "Home", url: "/dashboard", icon: LayoutDashboard },
      { title: "Schedule", url: "/schedule", icon: CalendarDays },
      { title: "Inbox", url: "/inbox", icon: InboxIcon, badge: INBOX_UNREAD },
      { title: "Alerts", url: "/alerts", icon: BellRing, badge: ALERTS_HIGH ? "dot" : undefined },
    ],
  },
  {
    label: "Clients",
    items: [
      { title: "Patients", url: "/patients", icon: Users },
      { title: "Waitlist", url: "/waitlist", icon: UserPlus },
      { title: "Groups", url: "/groups", icon: UsersRound },
      { title: "Referrals", url: "/referrals", icon: Share2 },
    ],
  },
  {
    label: "Clinical",
    items: [
      { title: "Sessions", url: "/sessions", icon: Video },
      { title: "Notes", url: "/notes", icon: NotebookPen },
      { title: "Assessments", url: "/assessments", icon: ClipboardList },
      { title: "Treatment Plans", url: "/treatment-plans", icon: Target },
      { title: "Homework", url: "/homework", icon: BookOpenCheck },
      { title: "Prescriptions", url: "/prescriptions", icon: Pill },
      { title: "Risk & Safety", url: "/risk", icon: ShieldAlert },
      { title: "Case Conferences", url: "/case-conferences", icon: MessagesSquare },
    ],
  },
  {
    label: "Practice",
    items: [
      { title: "Availability", url: "/availability", icon: Clock },
      { title: "Services & Pricing", url: "/services", icon: Tag },
      { title: "Payments", url: "/payments", icon: Wallet },
      { title: "Payouts", url: "/payouts", icon: Banknote },
      { title: "Documents", url: "/documents", icon: FileSignature },
      { title: "Templates", url: "/templates", icon: Files },
    ],
  },
  {
    label: "Growth",
    items: [
      { title: "Analytics", url: "/analytics", icon: LineChart },
      { title: "Reviews", url: "/reviews", icon: Star },
      { title: "Marketing Profile", url: "/profile-public", icon: Sparkles },
      { title: "Content Library", url: "/library", icon: Library },
      { title: "CPD & Supervision", url: "/cpd", icon: GraduationCap },
    ],
  },
  {
    label: "Collaborate",
    items: [
      { title: "Peer Network", url: "/peers", icon: Handshake },
      { title: "Supervision", url: "/supervision", icon: UserCog },
      { title: "Research", url: "/research", icon: Microscope },
    ],
  },
  {
    label: "Compliance",
    items: [
      { title: "Consent & DPDP", url: "/compliance/consent", icon: FileLock2 },
      { title: "Audit Log", url: "/compliance/audit", icon: History },
      { title: "Data Export", url: "/compliance/export", icon: Download },
    ],
  },
];

// Flat list used by mobile bottom pill nav — 5 most important.
const MOBILE_PILL: NavItem[] = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Schedule", url: "/schedule", icon: CalendarDays },
  { title: "Inbox", url: "/inbox", icon: InboxIcon, badge: INBOX_UNREAD },
  { title: "Patients", url: "/patients", icon: Users },
  { title: "Alerts", url: "/alerts", icon: BellRing, badge: ALERTS_HIGH ? "dot" : undefined },
];

function useIsActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (url: string) => pathname === url || pathname.startsWith(url + "/");
}

function NavLinkRow({ item, isActive, compact }: { item: NavItem; isActive: boolean; compact?: boolean }) {
  return (
    <Link
      to={item.url}
      className="group relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors"
      style={{
        color: isActive ? palette.ink : palette.muted,
        background: isActive ? palette.soft : "transparent",
      }}
    >
      <item.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
      {!compact && <span className="text-[12.5px] truncate">{item.title}</span>}
      {!compact && typeof item.badge === "number" && item.badge > 0 && (
        <span
          className="ml-auto text-[9.5px] tabular-nums px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center"
          style={{ background: palette.primary, color: "#fff" }}
        >
          {item.badge}
        </span>
      )}
      {!compact && item.badge === "dot" && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#DC3B4A" }} />
      )}
    </Link>
  );
}

function SidebarProfileCard({ collapsed, onDuty, setOnDuty }: { collapsed?: boolean; onDuty: boolean; setOnDuty: (v: boolean) => void }) {
  return (
    <div
      className="rounded-xl p-2.5"
      style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] text-white shrink-0"
          style={{ background: palette.primary }}
        >
          DS
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-[12.5px] truncate" style={{ color: palette.ink }}>Dr. Sharma</span>
              <ShieldCheck className="w-3 h-3 shrink-0" style={{ color: palette.primary }} aria-label="Verified" />
            </div>
            <div className="text-[10.5px] leading-tight truncate" style={{ color: palette.muted }}>
              Clinical Psychologist · MPhil · RCI
            </div>
          </div>
        )}
      </div>
      {!collapsed && (
        <button
          onClick={() => setOnDuty(!onDuty)}
          className="mt-2.5 w-full flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg transition-colors"
          style={{
            background: onDuty ? "#E7F6EC" : palette.surface,
            border: `1px solid ${onDuty ? "#C7E7D2" : palette.border}`,
            color: onDuty ? "#1F7A3E" : palette.muted,
          }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: onDuty ? "#22c55e" : palette.muted }} />
            {onDuty ? "On-duty" : "Off-duty"}
          </span>
          <span className="text-[9.5px] opacity-70">Accepting {onDuty ? "requests" : "none"}</span>
        </button>
      )}
    </div>
  );
}

function DesktopSidebar({ collapsed, onDuty, setOnDuty }: { collapsed: boolean; onDuty: boolean; setOnDuty: (v: boolean) => void }) {
  const isActive = useIsActive();
  const navigate = useNavigate();
  const width = collapsed ? "w-[64px]" : "w-[248px]";

  const signOut = () => {
    clearSession();
    navigate({ to: "/auth" });
  };

  return (
    <aside
      className={`${width} shrink-0 hidden md:flex flex-col transition-[width] duration-200`}
      style={{ minHeight: "100dvh" }}
    >
      {/* Floating glass tube */}
      <div
        className="m-3 flex-1 flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(18px) saturate(140%)",
          border: `1px solid ${palette.border}`,
        }}
      >
        {/* Header: profile card */}
        <div className="p-3">
          <Link to="/dashboard" className="flex items-center gap-2 px-1.5 pb-3 select-none">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[13px]"
              style={{ background: palette.primary, fontFamily: "'Fraunces', serif" }}
            >
              P
            </span>
            {!collapsed && (
              <span style={{ fontFamily: "'Fraunces', serif", color: palette.ink }} className="text-[14px] tracking-tight">
                PeaceCode <span style={{ color: palette.muted }}>· Practice</span>
              </span>
            )}
          </Link>
          <SidebarProfileCard collapsed={collapsed} onDuty={onDuty} setOnDuty={setOnDuty} />
        </div>

        {/* Nav — scrollable, hover-reveal scrollbar */}
        <nav
          className="flex-1 overflow-y-auto px-3 pb-2 hover-scroll"
          style={{ scrollbarGutter: "stable" }}
        >
          {NAV.map((section) => (
            <div key={section.label} className="mt-3 first:mt-0">
              {!collapsed && (
                <div
                  className="text-[9.5px] tracking-[0.24em] uppercase px-2.5 pb-1"
                  style={{ color: palette.muted, opacity: 0.75 }}
                >
                  {section.label}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((it) => (
                  <NavLinkRow key={it.url} item={it} isActive={isActive(it.url)} compact={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom pinned */}
        <div className="p-3 border-t space-y-0.5" style={{ borderColor: palette.border }}>
          <NavLinkRow item={{ title: "Notifications", url: "/notifications", icon: Bell }} isActive={isActive("/notifications")} compact={collapsed} />
          <NavLinkRow item={{ title: "Help & Support", url: "/support", icon: LifeBuoy }} isActive={isActive("/support")} compact={collapsed} />
          <NavLinkRow item={{ title: "Settings", url: "/settings", icon: SettingsIcon }} isActive={isActive("/settings")} compact={collapsed} />
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ color: palette.muted }}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
            {!collapsed && <span className="text-[12.5px]">Sign out</span>}
          </button>
        </div>
      </div>

      <style>{`
        .hover-scroll::-webkit-scrollbar { width: 6px; }
        .hover-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }
        .hover-scroll:hover::-webkit-scrollbar-thumb { background: ${palette.border}; }
      `}</style>
    </aside>
  );
}

function MobileDrawer({ open, onClose, onDuty, setOnDuty }: { open: boolean; onClose: () => void; onDuty: boolean; setOnDuty: (v: boolean) => void }) {
  const isActive = useIsActive();
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside
        className="relative w-[86%] max-w-[320px] h-full flex flex-col"
        style={{ background: "#fff", borderRight: `1px solid ${palette.border}` }}
      >
        <div className="p-3 flex items-center justify-between border-b" style={{ borderColor: palette.border }}>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[13px]" style={{ background: palette.primary, fontFamily: "'Fraunces', serif" }}>P</span>
            <span style={{ fontFamily: "'Fraunces', serif", color: palette.ink }} className="text-[14px]">PeaceCode <span style={{ color: palette.muted }}>· Practice</span></span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ color: palette.muted }}><X className="w-4 h-4" /></button>
        </div>
        <div className="p-3">
          <SidebarProfileCard onDuty={onDuty} setOnDuty={setOnDuty} />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4" onClick={onClose}>
          {NAV.map((section) => (
            <div key={section.label} className="mt-3 first:mt-0">
              <div className="text-[9.5px] tracking-[0.24em] uppercase px-2.5 pb-1" style={{ color: palette.muted }}>{section.label}</div>
              <div className="space-y-0.5">
                {section.items.map((it) => (
                  <NavLinkRow key={it.url} item={it} isActive={isActive(it.url)} />
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 pt-3 border-t space-y-0.5" style={{ borderColor: palette.border }}>
            <NavLinkRow item={{ title: "Notifications", url: "/notifications", icon: Bell }} isActive={isActive("/notifications")} />
            <NavLinkRow item={{ title: "Help & Support", url: "/support", icon: LifeBuoy }} isActive={isActive("/support")} />
            <NavLinkRow item={{ title: "Settings", url: "/settings", icon: SettingsIcon }} isActive={isActive("/settings")} />
            <button onClick={() => { clearSession(); navigate({ to: "/auth" }); }} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg" style={{ color: palette.muted }}>
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} /><span className="text-[12.5px]">Sign out</span>
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
}

function MobileBottomPill() {
  const isActive = useIsActive();
  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around px-2 h-14 rounded-full"
      style={{
        background: "rgba(255,255,255,0.86)",
        backdropFilter: "blur(18px) saturate(140%)",
        border: `1px solid ${palette.border}`,
        boxShadow: "0 6px 24px rgba(30,20,24,0.08)",
      }}
    >
      {MOBILE_PILL.map((it) => {
        const active = isActive(it.url);
        return (
          <Link
            key={it.url}
            to={it.url}
            className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-full"
            style={{ color: active ? palette.ink : palette.muted }}
          >
            <it.icon className="w-4 h-4" strokeWidth={1.8} />
            <span className="text-[9.5px]">{it.title}</span>
            {typeof it.badge === "number" && it.badge > 0 && (
              <span className="absolute top-0 right-1 min-w-[14px] h-[14px] px-1 rounded-full text-[8.5px] flex items-center justify-center text-white" style={{ background: palette.primary }}>{it.badge}</span>
            )}
            {it.badge === "dot" && <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full" style={{ background: "#DC3B4A" }} />}
          </Link>
        );
      })}
    </nav>
  );
}

function QuickAddMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const items: { label: string; to: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "New session", to: "/sessions", icon: Video },
    { label: "New patient", to: "/patients", icon: UserPlus },
    { label: "New note", to: "/notes", icon: NotebookPen },
    { label: "Block time", to: "/availability", icon: Clock },
  ];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-8 pl-2 pr-3 rounded-full text-[11.5px] flex items-center gap-1.5"
        style={{ background: palette.ink, color: "#fff" }}
      >
        <Plus className="w-3 h-3" /> New <ChevronDown className="w-3 h-3 opacity-70" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1.5 z-40 min-w-[180px] rounded-xl p-1"
            style={{ background: "#fff", border: `1px solid ${palette.border}`, boxShadow: "0 8px 28px rgba(30,20,24,0.08)" }}
          >
            {items.map((it) => (
              <button
                key={it.label}
                onClick={() => { setOpen(false); navigate({ to: it.to }); }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] hover:bg-black/[0.03]"
                style={{ color: palette.ink }}
              >
                <it.icon className="w-3.5 h-3.5" />
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmergencyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative rounded-2xl w-full max-w-md p-6"
        style={{ background: "#fff", border: `1px solid #F3C7C7` }}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertOctagon className="w-4 h-4" style={{ color: "#B54848" }} />
          <span className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "#B54848" }}>Emergency escalation</span>
        </div>
        <h3 className="text-[18px] tracking-tight mb-2" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          On-call escalation
        </h3>
        <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: palette.muted }}>
          Use this line only if a patient is in immediate danger. It will alert the on-call clinical supervisor and log a compliance entry.
        </p>
        <div className="space-y-2 text-[12.5px]" style={{ color: palette.ink }}>
          <a href="tel:9152987821" className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: palette.surface2 }}>
            <span>iCall crisis line</span><span className="tabular-nums" style={{ color: palette.primary }}>+91 91529 87821</span>
          </a>
          <a href="tel:104" className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: palette.surface2 }}>
            <span>Vandrevala helpline</span><span className="tabular-nums" style={{ color: palette.primary }}>1860 2662 345</span>
          </a>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 h-8 rounded-full text-[11.5px]" style={{ background: palette.surface2, color: palette.ink, border: `1px solid ${palette.border}` }}>Close</button>
          <button onClick={onClose} className="px-3 h-8 rounded-full text-[11.5px] text-white" style={{ background: "#B54848" }}>Escalate now</button>
        </div>
      </div>
    </div>
  );
}

function TopBar({ crumb, onToggleSidebar, onOpenMobile }: { crumb?: string; onToggleSidebar: () => void; onOpenMobile: () => void }) {
  const [emergency, setEmergency] = useState(false);
  const scopes = ["All", "Patients", "Notes", "Sessions", "Documents"];
  const [scope, setScope] = useState(scopes[0]);
  return (
    <header
      className="sticky top-0 z-30 h-14 shrink-0 flex items-center gap-2 px-3 sm:px-4 border-b"
      style={{ background: "rgba(255,255,255,0.78)", backdropFilter: "blur(14px) saturate(140%)", borderColor: palette.border }}
    >
      <button className="md:hidden p-1.5 -ml-1 rounded-lg" onClick={onOpenMobile} aria-label="Open menu"><Menu className="w-5 h-5" style={{ color: palette.ink }} /></button>
      <button className="hidden md:flex p-1.5 rounded-lg" onClick={onToggleSidebar} aria-label="Toggle sidebar"><Menu className="w-4 h-4" style={{ color: palette.muted }} /></button>

      <div className="hidden sm:flex items-center gap-1 text-[11px] tracking-[0.16em] uppercase" style={{ color: palette.muted }}>
        <span>Practice</span>
        {crumb && <><span className="opacity-40">/</span><span style={{ color: palette.ink }}>{crumb}</span></>}
      </div>

      <div className="flex-1 flex justify-center">
        <div
          className="hidden md:flex items-center gap-1.5 h-9 pl-3 pr-1 rounded-full w-full max-w-xl"
          style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: palette.muted }} />
          <input
            className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:opacity-60 min-w-0"
            placeholder="Search patients, notes, sessions, documents…"
            style={{ color: palette.ink }}
          />
          <div className="hidden lg:flex items-center gap-0.5">
            {scopes.map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className="text-[10.5px] px-2 h-6 rounded-full transition-colors"
                style={{
                  background: scope === s ? palette.ink : "transparent",
                  color: scope === s ? "#fff" : palette.muted,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: palette.surface, color: palette.muted, border: `1px solid ${palette.border}` }}>⌘K</kbd>
        </div>
      </div>

      <button
        onClick={() => setEmergency(true)}
        className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[11px]"
        style={{ background: "#FDECEC", color: "#B54848", border: "1px solid #F3C7C7" }}
      >
        <AlertOctagon className="w-3 h-3" /> Emergency
      </button>

      <Link
        to="/notifications"
        className="w-8 h-8 rounded-full flex items-center justify-center relative"
        style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}
        aria-label="Notifications"
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: palette.primary }} />
      </Link>

      <QuickAddMenu />
      <EmergencyDialog open={emergency} onClose={() => setEmergency(false)} />
    </header>
  );
}

export function AppShell({ children, crumb }: { children: ReactNode; crumb?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onDuty, setOnDuty] = useState(true);
  return (
    <>
      <GlassFX />
      <div
        className="min-h-screen flex w-full"
        style={{ color: palette.ink, fontFamily: "'DM Sans', system-ui, sans-serif", background: "#FBF7F8" }}
      >
        <DesktopSidebar collapsed={collapsed} onDuty={onDuty} setOnDuty={setOnDuty} />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onDuty={onDuty} setOnDuty={setOnDuty} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            crumb={crumb}
            onToggleSidebar={() => setCollapsed((v) => !v)}
            onOpenMobile={() => setMobileOpen(true)}
          />
          <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
        </div>
        <MobileBottomPill />
      </div>
    </>
  );
}
