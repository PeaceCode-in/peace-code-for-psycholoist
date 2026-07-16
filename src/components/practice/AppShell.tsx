import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, Inbox as InboxIcon, BellRing,
  Users, UserPlus, UsersRound, Share2,
  Video, NotebookPen, ClipboardList, Target, BookOpenCheck, Pill, ShieldAlert, MessagesSquare,
  Clock, Tag, Wallet, Banknote, FileSignature, Files, Receipt, Mail,
  LineChart, Star, Sparkles, Library, GraduationCap,
  Handshake, UserCog, Microscope,
  FileLock2, History, Download,
  Search, Bell, Plus, LifeBuoy, Settings as SettingsIcon, LogOut, Menu, ShieldCheck, ChevronDown, ChevronRight, AlertOctagon, X,
  Stethoscope, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { palette } from "./palette";
import peacecodeLogo from "@/assets/peacecode-logo.png";
import { GlassFX } from "@/components/GlassFX";
import { INBOX_UNREAD, ALERTS_HIGH } from "@/lib/practice-store";
import { useTodayRemaining } from "@/lib/sessions-store";
import { useCriticalFlagCount } from "@/lib/assessments-store";
import { useOverdueCount } from "@/lib/billing-store";
import { useUnreadThreadCount } from "@/lib/messages-store";
import { endSession } from "@/lib/auth-store";
import { useSidebarPinned, useSettings } from "@/lib/settings-store";
import { BellPeek } from "@/components/practice/notifications/BellPeek";
import { CopilotPill } from "@/components/practice/copilot/CopilotPill";
import { ChecklistDrawer } from "@/components/practice/onboarding/ChecklistDrawer";
import { ShortcutsOverlay } from "@/components/practice/polish/ShortcutsOverlay";
import { DataHandlingSheet } from "@/components/practice/polish/DataHandlingSheet";

export { palette };

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; badge?: number | "dot" };
type FlyoutItem = { title: string; url: string; badge?: number | "dot" };

type Category = {
  key: string;
  label: string;
  meta: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  items: FlyoutItem[];
};

// Sidebar shows unique destinations only. Sub-tabs (calendar views, billing
// tabs, team tabs, notes tabs, governance tabs) live inside the destination
// page and are intentionally NOT duplicated here.
const CATEGORIES: Category[] = [
  {
    key: "today", label: "Today", meta: "5 views", icon: LayoutDashboard,
    items: [
      { title: "Overview", url: "/dashboard" },
      { title: "Schedule", url: "/schedule" },
      { title: "Inbox", url: "/inbox", badge: INBOX_UNREAD },
      { title: "Alerts", url: "/alerts", badge: ALERTS_HIGH ? "dot" : undefined },
      { title: "Copilot", url: "/copilot" },
    ],
  },
  {
    key: "patients", label: "Patients", meta: "4 lists", icon: Users,
    items: [
      { title: "All Patients", url: "/patients" },
      { title: "Waitlist", url: "/waitlist" },
      { title: "Groups", url: "/groups" },
      { title: "Referrals", url: "/referrals" },
    ],
  },
  {
    key: "clinical", label: "Clinical", meta: "8 tools", icon: Stethoscope,
    items: [
      { title: "Sessions", url: "/sessions" },
      { title: "Notes", url: "/notes" },
      { title: "Assessments", url: "/assessments" },
      { title: "Treatment Plans", url: "/treatment-plans" },
      { title: "Homework", url: "/homework" },
      { title: "Prescriptions", url: "/prescriptions" },
      { title: "Risk & Safety", url: "/risk" },
      { title: "Case Conferences", url: "/case-conferences" },
    ],
  },
  {
    key: "calendar", label: "Calendar", meta: "3 tools", icon: CalendarDays,
    items: [
      // Calendar page has its own Week / Day / Month / Agenda view switcher.
      { title: "Calendar", url: "/calendar" },
      { title: "Availability", url: "/calendar/availability" },
      { title: "Booking Link", url: "/calendar/booking-link" },
    ],
  },
  {
    key: "practice", label: "Practice", meta: "4 tools", icon: Receipt,
    items: [
      // Billing has its own tab bar (Overview/Invoices/Claims/Payments/Services/Reports).
      { title: "Messages", url: "/messages" },
      { title: "Billing", url: "/billing" },
      { title: "Documents", url: "/documents" },
      { title: "Services & Pricing", url: "/settings/services" },
    ],
  },
  {
    key: "growth", label: "Growth", meta: "7 tools", icon: Sparkles,
    items: [
      { title: "Analytics", url: "/analytics" },
      { title: "Reviews", url: "/reviews" },
      { title: "Marketing Profile", url: "/profile-public" },
      { title: "Content Library", url: "/library" },
      { title: "CPD", url: "/cpd" },
      { title: "Peer Network", url: "/peers" },
      { title: "Research", url: "/research" },
    ],
  },
  {
    key: "team", label: "Team", meta: "1 hub", icon: UsersRound,
    items: [
      // Team page has its own tab bar (Roster/Roles/Supervision/Handoffs/Referrals/Coverage/Analytics/Audit/Invite).
      { title: "Team", url: "/team" },
    ],
  },
  {
    key: "settings", label: "Settings", meta: "5 pages", icon: SettingsIcon,
    items: [
      // Governance page has its own tab bar for Consent/Audit/Retention/etc.
      { title: "Settings", url: "/settings" },
      { title: "Copilot", url: "/settings/copilot" },
      { title: "Integrations", url: "/integrations" },
      { title: "Notifications", url: "/notifications" },
      { title: "Governance", url: "/governance" },
      { title: "Help & Support", url: "/settings/support" },
    ],
  },
];

// Legacy section view for the mobile drawer only.
const NAV: { label: string; items: NavItem[] }[] = CATEGORIES.map((c) => ({
  label: c.label,
  items: c.items.map((it) => ({ title: it.title, url: it.url, badge: it.badge, icon: c.icon })),
}));

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
  const liveSessions = useTodayRemaining();
  const criticalFlags = useCriticalFlagCount();
  const overdue = useOverdueCount();
  const msgUnread = useUnreadThreadCount();
  const badge = item.url === "/sessions"
    ? (liveSessions > 0 ? liveSessions : undefined)
    : item.url === "/assessments"
      ? (criticalFlags > 0 ? criticalFlags : undefined)
      : item.url === "/billing"
        ? (overdue > 0 ? overdue : undefined)
        : item.url === "/messages"
          ? (msgUnread > 0 ? "dot" as const : undefined)
          : item.badge;
  const isBilling = item.url === "/billing";
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
      {!compact && typeof badge === "number" && badge > 0 && (
        <span
          className="ml-auto text-[9.5px] tabular-nums px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center"
          style={{
            background: isBilling ? "#F3E4CE" : palette.primary,
            color: isBilling ? "#B6763A" : "#fff",
          }}
        >
          {badge}
        </span>
      )}
      {!compact && badge === "dot" && (
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

// ─── Accordion group used inside pinned sidebar (click-to-open only) ────
function AccordionGroup({
  category, activeKey, isActive,
}: {
  category: Category;
  activeKey: string | null;
  isActive: (url: string) => boolean;
}) {
  const containsActive = activeKey === category.key;
  const [open, setOpen] = useState(containsActive);

  useEffect(() => { if (containsActive) setOpen(true); }, [containsActive]);

  const liveSessions = useTodayRemaining();
  const criticalFlags = useCriticalFlagCount();
  const overdue = useOverdueCount();
  const msgUnread = useUnreadThreadCount();
  const badgeFor = (url: string, base?: number | "dot"): number | "dot" | undefined => {
    if (url === "/sessions" && liveSessions > 0) return liveSessions;
    if (url === "/assessments" && criticalFlags > 0) return criticalFlags;
    if (url === "/billing" && overdue > 0) return overdue;
    if (url === "/messages" && msgUnread > 0) return "dot";
    return base;
  };

  let headerCount = 0;
  let headerDot = false;
  for (const it of category.items) {
    const b = badgeFor(it.url, it.badge);
    if (typeof b === "number") headerCount += b;
    else if (b === "dot") headerDot = true;
  }

  const Icon = category.icon;

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full flex items-center gap-2.5 h-9 px-2.5 rounded-xl text-[12.5px] transition-colors outline-none focus-visible:ring-2"
        style={{
          background: containsActive ? "rgba(255,255,255,0.72)" : open ? palette.soft : "transparent",
          color: containsActive ? palette.ink : palette.muted,
          border: containsActive ? `1px solid ${palette.border}` : "1px solid transparent",
        }}
        onMouseEnter={(e) => { if (!containsActive && !open) e.currentTarget.style.background = "rgba(255,255,255,0.45)"; }}
        onMouseLeave={(e) => { if (!containsActive && !open) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon className="w-[15px] h-[15px] shrink-0" strokeWidth={1.8} style={{ color: containsActive ? palette.primary : palette.muted }} />
        <span className="flex-1 text-left truncate" style={{ fontWeight: containsActive ? 500 : 400 }}>{category.label}</span>
        {!open && headerCount > 0 && (
          <span className="text-[9.5px] tabular-nums px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center" style={{ background: palette.primary, color: "#fff" }}>{headerCount}</span>
        )}
        {!open && headerCount === 0 && headerDot && (
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: palette.primary }} />
        )}
        <ChevronRight
          className="w-3.5 h-3.5 transition-transform duration-150 shrink-0"
          strokeWidth={2}
          style={{ color: palette.muted, transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      </button>

      <div
        className="overflow-hidden transition-[grid-template-rows] duration-200 ease-out grid"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0">
          <div className="pl-3 ml-3 mt-0.5 mb-1 space-y-0.5 border-l" style={{ borderColor: palette.border }}>
            {category.items.map((it) => {
              const active = isActive(it.url);
              const b = badgeFor(it.url, it.badge);
              const isBilling = it.url === "/billing";
              return (
                <Link
                  key={it.url}
                  to={it.url}
                  className="relative flex items-center h-8 gap-2 px-2.5 rounded-lg text-[12.5px] transition-colors outline-none focus-visible:ring-2"
                  style={{
                    color: active ? palette.primary : palette.muted,
                    background: active ? palette.soft : "transparent",
                    fontWeight: active ? 500 : 400,
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.55)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span className="flex-1 truncate">{it.title}</span>
                  {typeof b === "number" && b > 0 && (
                    <span className="text-[9.5px] tabular-nums px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center" style={{ background: isBilling ? "#F3E4CE" : palette.primary, color: isBilling ? "#B6763A" : "#fff" }}>{b}</span>
                  )}
                  {b === "dot" && <span className="w-1.5 h-1.5 rounded-full" style={{ background: palette.primary }} />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}



function useActiveCategoryKey(): string | null {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  for (const c of CATEGORIES) {
    for (const it of c.items) {
      if (pathname === it.url || pathname.startsWith(it.url + "/")) return c.key;
    }
  }
  // Fallbacks by prefix so patient/session detail pages still light up.
  if (pathname.startsWith("/patients")) return "patients";
  if (pathname.startsWith("/sessions")) return "clinical";
  if (pathname.startsWith("/notes")) return "clinical";
  if (pathname.startsWith("/assessments")) return "clinical";
  if (pathname.startsWith("/calendar")) return "calendar";
  if (pathname.startsWith("/billing")) return "practice";
  if (pathname.startsWith("/messages")) return "practice";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/compliance")) return "settings";
  if (pathname.startsWith("/team")) return "team";
  if (pathname === "/dashboard" || pathname === "/schedule" || pathname === "/inbox" || pathname === "/alerts") return "today";
  return null;
}

function RailButton({
  category, active, hovered, onEnter, onFocus, onClick, refCb,
}: {
  category: Category;
  active: boolean;
  hovered: boolean;
  onEnter: () => void;
  onFocus: () => void;
  onClick: () => void;
  refCb: (el: HTMLButtonElement | null) => void;
}) {
  const Icon = category.icon;
  const showRose = active || hovered;
  return (
    <div className="relative w-full flex items-center justify-center" onMouseEnter={onEnter}>
      {/* active rose bar */}
      <span
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] rounded-r-full transition-all duration-150"
        style={{
          height: active ? 20 : 0,
          background: palette.primary,
          opacity: active ? 1 : 0,
        }}
      />
      <button
        ref={refCb}
        onFocus={onFocus}
        onClick={onClick}
        aria-label={category.label}
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors outline-none focus-visible:ring-2"
        style={{
          background: hovered && !active ? palette.soft : active ? palette.soft : "transparent",
          color: showRose ? palette.primary : palette.muted,
        }}
      >
        <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
      </button>
    </div>
  );
}

function Flyout({
  category, activeUrl, panelRef, onMouseEnter, onMouseLeave, onNavigate, firstItemRefCb,
}: {
  category: Category;
  activeUrl: string | null;
  panelRef: (el: HTMLDivElement | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate: () => void;
  firstItemRefCb: (el: HTMLAnchorElement | null) => void;
}) {
  const liveSessions = useTodayRemaining();
  const criticalFlags = useCriticalFlagCount();
  const overdue = useOverdueCount();
  const msgUnread = useUnreadThreadCount();

  const badgeFor = (url: string, base?: number | "dot"): number | "dot" | undefined => {
    if (url === "/sessions" && liveSessions > 0) return liveSessions;
    if (url === "/assessments" && criticalFlags > 0) return criticalFlags;
    if (url === "/billing" && overdue > 0) return overdue;
    if (url === "/messages" && msgUnread > 0) return "dot";
    return base;
  };

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label={category.label}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="h-full flex flex-col py-4 px-3"
      style={{
        width: 240,
        background: "rgba(255,247,250,0.96)",
        borderLeft: `1px solid ${palette.border}`,
        borderRight: `1px solid ${palette.border}`,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        boxShadow: "10px 0 28px -24px rgba(63,18,38,0.28)",
      }}
    >
      <div className="px-2 pb-3 mb-1 border-b" style={{ borderColor: palette.border }}>
        <div style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 15, lineHeight: 1.2 }}>
          {category.label}
        </div>
        <div
          className="mt-1 uppercase"
          style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", color: palette.muted }}
        >
          {category.meta}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-[2px] pr-1">
        {category.items.map((it, i) => {
          const active = activeUrl === it.url;
          const badge = badgeFor(it.url, it.badge);
          const isBilling = it.url === "/billing";
          return (
            <Link
              key={it.url}
              ref={i === 0 ? firstItemRefCb : undefined}
              to={it.url}
              role="menuitem"
              onClick={onNavigate}
              className="relative flex items-center h-9 pl-3 pr-2 rounded-lg text-[13.5px] transition-colors outline-none focus-visible:ring-2"
              style={{
                color: active ? palette.primary : palette.ink,
                background: active ? "transparent" : "transparent",
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = palette.soft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r-full"
                  style={{ background: palette.primary }}
                />
              )}
              <span className="flex-1 truncate">{it.title}</span>
              {typeof badge === "number" && badge > 0 && (
                <span
                  className="ml-2 text-[9.5px] tabular-nums px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center"
                  style={{
                    background: isBilling ? "#F3E4CE" : palette.primary,
                    color: isBilling ? "#B6763A" : "#fff",
                  }}
                >
                  {badge}
                </span>
              )}
              {badge === "dot" && (
                <span className="ml-2 w-1.5 h-1.5 rounded-full" style={{ background: palette.primary }} />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function DesktopTubeSidebar({
  onDuty, setOnDuty, pinned, setPinned,
}: {
  onDuty: boolean; setOnDuty: (v: boolean) => void;
  pinned: boolean; setPinned: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const activeKey = useActiveCategoryKey();
  const isActive = useIsActive();

  const signOut = () => { endSession(); navigate({ to: "/auth" }); };

  return (
    <aside
      className="pc-sidebar hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col transition-[width] duration-150 ease-out"

      style={{
        width: pinned ? 288 : 72,
        background: "linear-gradient(180deg, #FFF9FB 0%, #F8E3EB 100%)",
        // No hard right-border — topbar shares the same wash so the two surfaces meet seamlessly.
        boxShadow: "18px 0 40px -32px rgba(63,18,38,0.22)",
      }}
    >
      <div className="h-full flex flex-col p-3">
        <div className={pinned ? "flex items-center gap-3 px-1.5 pt-1 pb-3" : "flex items-center justify-center pt-2 pb-3"}>
          <Link
            to="/dashboard"
            className="group w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] shrink-0"
            aria-label="PeaceCode Psychologist"
            style={{ background: "transparent" }}
          >
            <img
              src={peacecodeLogo}
              alt="PeaceCode"
              className="w-9 h-9 object-contain transition-transform duration-200 group-hover:rotate-[-4deg]"
              style={{ background: "transparent", filter: "drop-shadow(0 2px 6px rgba(120,50,80,0.18))" }}
            />
          </Link>
          {pinned && (
            <div className="min-w-0">
              <div className="text-[15.5px] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>PeaceCode</div>
              <div className="text-[10px] uppercase tracking-[0.22em] mt-0.5" style={{ color: palette.primary, fontFamily: "'DM Mono', monospace" }}>Psychologist</div>
            </div>
          )}
        </div>

        <div className={pinned ? "h-px mb-3" : "w-8 h-px mx-auto mb-3"} style={{ background: `linear-gradient(90deg, transparent, ${palette.border}, transparent)` }} />

        <nav className={pinned ? "flex-1 overflow-y-auto pr-1 space-y-0.5" : "flex-1 flex flex-col items-center gap-1"} aria-label="Practice navigation">
          {pinned ? CATEGORIES.map((c) => (
            <AccordionGroup key={c.key} category={c} activeKey={activeKey} isActive={isActive} />
          )) : CATEGORIES.map((c) => {
            const active = activeKey === c.key;
            return (
              <Link
                key={c.key}
                to={c.items[0].url}
                data-rail-key={c.key}
                aria-label={c.label}
                aria-current={active ? "page" : undefined}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors outline-none focus-visible:ring-2"
                style={{
                  background: active ? palette.soft : "transparent",
                  color: active ? palette.primary : palette.muted,
                }}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r-full"
                    style={{ background: palette.primary }}
                  />
                )}
                <c.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </Link>
            );
          })}
        </nav>


        <div className={pinned ? "mt-3 pt-3 border-t space-y-2" : "mt-3 pt-3 border-t flex flex-col items-center gap-2"} style={{ borderColor: palette.border }}>
          {pinned && <SidebarProfileCard onDuty={onDuty} setOnDuty={setOnDuty} />}
          <button
            onClick={() => setPinned(!pinned)}
            aria-label={pinned ? "Collapse sidebar" : "Expand sidebar"}
            aria-pressed={pinned}
            className={pinned ? "w-full h-9 rounded-xl flex items-center justify-center gap-2 text-[12px] transition-colors" : "w-9 h-9 rounded-lg flex items-center justify-center transition-colors"}
            style={{
              background: pinned ? "rgba(255,255,255,0.62)" : palette.soft,
              border: pinned ? `1px solid ${palette.border}` : "1px solid transparent",
              color: pinned ? palette.ink : palette.primary,
            }}
          >
            {pinned ? <PanelLeftClose className="w-[15px] h-[15px]" strokeWidth={1.8} />
                    : <PanelLeftOpen className="w-[15px] h-[15px]" strokeWidth={1.8} />}
            {pinned && <span>Collapse</span>}
          </button>

          <Link
            to="/settings"
            aria-label="Open settings"
            className={pinned ? "w-full h-9 rounded-xl flex items-center justify-center gap-2 text-[12px] transition-colors" : "w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px]"}
            style={pinned ? { color: palette.muted } : { background: palette.primary }}
            title="Dr. Sharma"
          >
            {pinned ? <><SettingsIcon className="w-[15px] h-[15px]" strokeWidth={1.8} /> Settings</> : "DS"}
          </Link>

          <button
            onClick={signOut}
            aria-label="Sign out"
            className={pinned ? "w-full h-9 rounded-xl flex items-center justify-center gap-2 text-[12px] transition-colors" : "w-9 h-9 rounded-lg flex items-center justify-center transition-colors"}
            style={{ color: palette.muted }}
          >
            <LogOut className="w-[15px] h-[15px]" strokeWidth={1.8} />
            {pinned && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileDrawer({ open, onClose, onDuty, setOnDuty }: { open: boolean; onClose: () => void; onDuty: boolean; setOnDuty: (v: boolean) => void }) {
  const isActive = useIsActive();
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-[60] flex">
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{ background: "rgba(30,20,24,0.32)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
        onClick={onClose}
      />
      <aside
        className="pc-sidebar relative w-[86%] max-w-[320px] h-full flex flex-col animate-in slide-in-from-left duration-200"
        style={{
          background: "linear-gradient(180deg, rgba(255,249,251,0.98) 0%, rgba(248,227,235,0.98) 100%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "18px 0 40px -20px rgba(63,18,38,0.28)",
        }}
      >
        <div className="h-14 px-3 flex items-center justify-between shrink-0" style={{ borderBottom: `1px solid ${palette.border}` }}>
          <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2 min-w-0">
            <img src={peacecodeLogo} alt="" className="w-8 h-8 object-contain shrink-0" style={{ background: "transparent", filter: "drop-shadow(0 2px 4px rgba(120,50,80,0.18))" }} />
            <span className="min-w-0 truncate" style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 15 }}>
              PeaceCode <span style={{ color: palette.primary, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>· Psychologist</span>
            </span>
          </Link>
          <button onClick={onClose} aria-label="Close menu" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/70 active:scale-95" style={{ color: palette.ink }}>
            <X className="w-4 h-4" />
          </button>
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
            <NavLinkRow item={{ title: "Help & Support", url: "/settings/support", icon: LifeBuoy }} isActive={isActive("/settings/support")} />
            <NavLinkRow item={{ title: "Settings", url: "/settings", icon: SettingsIcon }} isActive={isActive("/settings")} />
            <button onClick={() => { endSession(); navigate({ to: "/auth" }); }} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg" style={{ color: palette.muted }}>
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
        background: "rgba(255,255,255,0.96)",
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

function TopBar({ crumb, onToggleSidebar, onOpenMobile, pinned }: { crumb?: string; onToggleSidebar: () => void; onOpenMobile: () => void; pinned: boolean }) {
  const [emergency, setEmergency] = useState(false);
  return (
    <header
      className="pc-topbar sticky top-0 z-30 h-14 shrink-0 flex items-center gap-2 px-3 sm:px-4"
      style={{
        // Continuous surface with the sidebar — same blush wash, no hard seam or border.
        background: "linear-gradient(180deg, rgba(255,249,251,0.96) 0%, rgba(255,247,250,0.94) 100%)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.75) inset, 0 8px 24px -22px rgba(63,18,38,0.22)",
      }}
    >
      <button
        className="md:hidden p-1.5 -ml-1 rounded-lg transition-all duration-150 hover:bg-white/70 active:scale-95"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" style={{ color: palette.ink }} />
      </button>
      <button
        className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 hover:bg-white/70 hover:shadow-sm active:scale-95"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        style={{ color: palette.ink }}
      >
        {pinned ? <PanelLeftClose className="w-[17px] h-[17px]" strokeWidth={1.7} /> : <PanelLeftOpen className="w-[17px] h-[17px]" strokeWidth={1.7} />}
      </button>

      {/* Logo lockup on the left — shown when sidebar is collapsed so the brand never disappears */}
      {!pinned && (
        <Link
          to="/dashboard"
          className="group hidden md:flex items-center gap-2 pl-1 pr-2.5 h-9 rounded-xl transition-all duration-150 hover:bg-white/70"
          aria-label="PeaceCode Psychologist"
        >
          <img
            src={peacecodeLogo}
            alt=""
            className="w-7 h-7 object-contain transition-transform duration-200 group-hover:rotate-[-4deg]"
            style={{ background: "transparent", filter: "drop-shadow(0 2px 4px rgba(120,50,80,0.16))" }}
          />
          <span className="text-[14px] leading-none tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            PeaceCode
          </span>
        </Link>
      )}

      <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] tracking-[0.18em] uppercase pl-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span>Psychologist</span>
        {crumb && <><span className="opacity-40">/</span><span style={{ color: palette.ink }}>{crumb}</span></>}
      </div>

      <div className="flex-1 flex justify-center min-w-0">
        <div
          className="group hidden md:flex items-center gap-1.5 h-8 pl-2.5 pr-1 rounded-full w-full max-w-[380px] transition-all duration-150 focus-within:max-w-[440px] focus-within:shadow-[0_0_0_3px_rgba(184,80,120,0.10)]"
          style={{
            background: "rgba(255,255,255,0.72)",
            border: `1px solid ${palette.border}`,
            boxShadow: "0 1px 0 rgba(255,255,255,0.8) inset",
          }}
        >
          <Search className="w-3.5 h-3.5 shrink-0 transition-colors group-focus-within:text-[color:var(--pc-primary,#B85078)]" style={{ color: palette.muted }} />
          <input
            className="flex-1 bg-transparent outline-none text-[12px] placeholder:opacity-60 min-w-0"
            placeholder="Search patients, notes, sessions…"
            style={{ color: palette.ink }}
          />
          <kbd className="text-[9.5px] px-1.5 py-0.5 rounded shrink-0" style={{ background: palette.surface, color: palette.muted, border: `1px solid ${palette.border}` }}>⌘K</kbd>
        </div>
      </div>

      <button
        onClick={() => setEmergency(true)}
        className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-full text-[11px] transition-all duration-150 hover:brightness-95 hover:shadow-sm active:scale-95"
        style={{ background: "#FDECEC", color: "#B54848", border: "1px solid #F3C7C7" }}
      >
        <AlertOctagon className="w-3.5 h-3.5" strokeWidth={1.9} /> Emergency
      </button>

      <ChecklistDrawer />
      <BellPeek />

      <QuickAddMenu />
      <EmergencyDialog open={emergency} onClose={() => setEmergency(false)} />
    </header>
  );
}


export function AppShell({ children, crumb }: { children: ReactNode; crumb?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [onDuty, setOnDuty] = useState(true);
  const [pinned, setPinned] = useSidebarPinned();
  // Drive appearance tokens (accent, density, radius, motion) from stored settings.
  useSettings();
  return (
    <>
      <GlassFX />
      <div
        className="min-h-screen flex w-full"
        style={{ color: "var(--pc-ink, #1E1418)", fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        <DesktopTubeSidebar
          onDuty={onDuty}
          setOnDuty={setOnDuty}
          pinned={pinned}
          setPinned={setPinned}
        />
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} onDuty={onDuty} setOnDuty={setOnDuty} />
        <div
          className="flex-1 flex flex-col min-w-0 transition-[padding] duration-[220ms] ease-out"
          style={{ paddingLeft: `var(--pc-shell-pad, 0px)` }}
        >
          <TopBar
            crumb={crumb}
            onToggleSidebar={() => setPinned(!pinned)}
            onOpenMobile={() => setMobileOpen(true)}
            pinned={pinned}

          />
          <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
        </div>
        <MobileBottomPill />
        <CopilotPill />
        <ShortcutsOverlay />
        <DataHandlingSheet />
      </div>
      {/* Responsive shell padding: rail is 72px, +240px when pinned. Mobile: 0. */}
      <style>{`
        @media (min-width: 768px) {
          :root { --pc-shell-pad: ${pinned ? 312 : 72}px; }
        }
        @media (max-width: 767.98px) {
          :root { --pc-shell-pad: 0px; }
        }
      `}</style>
    </>
  );
}
