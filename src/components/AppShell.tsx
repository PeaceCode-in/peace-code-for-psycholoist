import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen, Moon, Sun, Settings, Bell, Flame, Users, Wind, Search,
  Heart, PenLine, Bot, CalendarCheck, UserCheck, ClipboardList, Target, Activity, Brain,
  Menu, X, Home, LifeBuoy, CalendarDays,
} from "lucide-react";

import logo from "@/assets/peacecode-logo.png";
import { loadSettings, applyAppearance, applyAccessibility } from "@/lib/settings-store";
import { unreadCount as notifUnread } from "@/lib/notifications-store";

// ─── Themeable palette — every value is a CSS variable so light/dark ────
// can be swapped globally by toggling `.dark` on <html>. Tokens live in
// styles.css under `:root` and `.dark, [data-theme="dark"]`.
export const palette = {
  bg:       "var(--pc-bg)",
  surface:  "var(--pc-surface)",
  surface2: "var(--pc-surface2)",
  border:   "var(--pc-border)",
  ink:      "var(--pc-ink)",
  muted:    "var(--pc-muted)",
  primary:  "var(--pc-primary)",
  soft:     "var(--pc-soft)",
  lavender: "var(--pc-lavender)",
};

// ─── theme (persistent, cross-page) ─────────────────────────────────
const THEME_KEY = "peacecode.theme.v1";
export type Theme = "light" | "dark";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.setAttribute("data-theme", t);
  try { localStorage.setItem(THEME_KEY, t); } catch {}
  window.dispatchEvent(new CustomEvent("peacecode-theme", { detail: t }));
}
export function useTheme(): [Theme, (t: Theme) => void, () => void] {
  const [theme, setThemeState] = useState<Theme>("light");
  useEffect(() => {
    const t = getInitialTheme();
    setThemeState(t);
    applyTheme(t);
    const onSync = (e: Event) => {
      const next = (e as CustomEvent<Theme>).detail;
      if (next && next !== theme) setThemeState(next);
    };
    window.addEventListener("peacecode-theme", onSync);
    return () => window.removeEventListener("peacecode-theme", onSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setTheme = (t: Theme) => { setThemeState(t); applyTheme(t); };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return [theme, setTheme, toggle];
}



const { bg, surface, surface2, border, ink, muted, primary, soft } = palette;

type NavItem = { icon: typeof Home; label: string; to?: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Home",
    items: [
      { icon: Home, label: "Today", to: "/" },
      { icon: Search, label: "Search", to: "/search" },
      { icon: Bell, label: "Inbox", to: "/notifications" },
    ],
  },
  {
    label: "Core Care",
    items: [
      { icon: Bot, label: "Peace Bot", to: "/peacebot" },
      { icon: CalendarCheck, label: "Counselling", to: "/counselling" },
      { icon: UserCheck, label: "Peace Buddies", to: "/buddies" },
      { icon: ClipboardList, label: "Screening", to: "/screening" },
    ],
  },
  {
    label: "Wellness Tools",
    items: [
      { icon: Wind, label: "Breathe", to: "/breathe" },
      { icon: Target, label: "Focus", to: "/focus" },
      { icon: Heart, label: "Gratitude", to: "/gratitude" },
      { icon: PenLine, label: "Journal", to: "/journal" },
      { icon: Activity, label: "Mood Tracker" },
      { icon: Brain, label: "Mind Gym", to: "/mindgym" },
    ],
  },
  {
    label: "Community & Resources",
    items: [
      { icon: Users, label: "Community", to: "/community" },
      { icon: CalendarDays, label: "Events", to: "/events" },
      { icon: BookOpen, label: "Resources", to: "/resources" },
      { icon: LifeBuoy, label: "Emergency", to: "/emergency" },
    ],
  },
];


function Mark({ className = "w-5 h-5", opacity = 1 }: { className?: string; opacity?: number }) {
  return <img src={logo} alt="" className={className} style={{ opacity }} />;
}

export function AppShell({ children, showHeader = true }: { children: ReactNode; showHeader?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, , toggleTheme] = useTheme();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const refresh = () => { try { setUnread(notifUnread()); } catch {} };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    // Apply persisted appearance/accessibility once per mount.
    try { const s = loadSettings(); applyAppearance(s); applyAccessibility(s); } catch {}
    // Global ⌘K / Ctrl+K → Search Center
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (typeof window !== "undefined" && window.location.pathname !== "/search") {
          window.location.href = "/search";
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);

  // close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (to?: string) => {
    if (!to) return false;
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(to + "/");
  };


  return (
    <div className="min-h-screen w-full font-sans" style={{ background: bg, color: ink }}>
      {/* constant, calm aurora — same on every page, themeable */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 lg:-top-40 lg:-left-40 lg:w-[520px] lg:h-[520px] rounded-full opacity-45 blur-3xl"
             style={{ background: "radial-gradient(circle,var(--pc-aurora-a),transparent 70%)" }} />
        <div className="absolute top-1/3 -right-24 w-80 h-80 lg:-right-40 lg:w-[600px] lg:h-[600px] rounded-full opacity-30 blur-3xl"
             style={{ background: "radial-gradient(circle,var(--pc-aurora-b),transparent 70%)" }} />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 lg:-bottom-40 lg:left-1/3 lg:w-[500px] lg:h-[500px] rounded-full opacity-25 blur-3xl"
             style={{ background: "radial-gradient(circle,var(--pc-aurora-c),transparent 70%)" }} />
      </div>

      {/* ─── desktop sidebar ─── */}
      <aside
        className="hidden lg:flex fixed top-6 bottom-6 left-6 z-40 group flex-col py-6 rounded-[38px] backdrop-blur-2xl transition-[width] duration-300 ease-out hover:w-60 w-[80px] overflow-hidden"
        style={{ background: "var(--pc-shell)", border: `1px solid ${border}`, boxShadow: "0 30px 60px -30px rgba(0,0,0,0.28)" }}
      >

        <div className="flex items-center h-12 mb-8">
          <div className="w-[80px] shrink-0 flex justify-center"><Mark className="w-9 h-9" /></div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap -ml-1">
            <div className="font-serif text-[17px] leading-none">PeaceCode</div>
            <div className="text-[8px] tracking-[0.3em] uppercase opacity-50 mt-1.5">a soft place</div>
          </div>
        </div>

        <nav className="flex-1 min-h-0 flex flex-col gap-4 px-3 overflow-x-hidden overflow-y-hidden group-hover:overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <div className="h-4 flex items-center pl-4 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                <span className="text-[8.5px] tracking-[0.32em] uppercase whitespace-nowrap" style={{ color: muted }}>{group.label}</span>
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                const cls = "relative flex items-center h-11 rounded-2xl transition";
                const style = active ? { background: surface2, color: ink } : { color: muted };
                const inner = (
                  <>
                    <span className="w-[56px] shrink-0 flex justify-center">
                      <Icon className="w-[19px] h-[19px]" strokeWidth={1.4} />
                    </span>
                    <span className="text-[13px] tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">{item.label}</span>
                  </>
                );
                return item.to ? (
                  <Link key={item.label} to={item.to} className={cls} style={style}>{inner}</Link>
                ) : (
                  <button key={item.label} className={cls} style={style} aria-label={item.label}>{inner}</button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 mt-4 mx-3 pt-3 flex flex-col gap-1" style={{ borderTop: `1px solid ${border}` }}>
          <button onClick={toggleTheme} className="flex items-center h-10 rounded-2xl transition" style={{ color: muted }} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <span className="w-[56px] shrink-0 flex justify-center">
              {theme === "dark" ? <Sun className="w-[19px] h-[19px]" strokeWidth={1.4}/> : <Moon className="w-[19px] h-[19px]" strokeWidth={1.4}/>}
            </span>
            <span className="text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </button>
          <Link to="/settings" className="flex items-center h-10 rounded-2xl transition" style={{ color: muted }} aria-label="Settings">
            <span className="w-[56px] shrink-0 flex justify-center"><Settings className="w-[19px] h-[19px]" strokeWidth={1.4}/></span>
            <span className="text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">Settings</span>
          </Link>
          <Link to="/profile" className="mt-2 rounded-2xl flex items-center h-14 transition hover:opacity-90" style={{ background: surface2 }} aria-label="Open profile">
            <span className="w-[56px] shrink-0 flex justify-center">
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: soft }}>
                <Mark className="w-4 h-4"/>
              </span>
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap min-w-0 -ml-1">
              <div className="font-serif text-[13px] leading-none">Keya</div>
              <div className="flex items-center gap-1 mt-1 text-[9px]" style={{ color: primary }}>
                <Flame className="w-2.5 h-2.5" strokeWidth={1.5}/> 12 day streak
              </div>
            </div>
          </Link>
        </div>

      </aside>

      {/* ─── mobile top bar ─── */}
      {showHeader && (
        <header
          className={`lg:hidden sticky top-0 z-30 backdrop-blur-xl transition ${scrolled ? "border-b shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]" : ""}`}
          style={{ background: "var(--pc-header)", borderColor: border }}
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-5 py-3">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <Mark className="w-8 h-8 shrink-0"/>
              <div className="min-w-0">
                <div className="font-serif text-[15px] leading-none truncate">PeaceCode</div>
                <div className="text-[7.5px] tracking-[0.3em] uppercase mt-1 opacity-50 truncate">a soft place</div>
              </div>
            </Link>
            <Link to="/search" className="hidden xs:flex items-center gap-2 rounded-full px-3 py-1.5 mx-1 min-w-0" style={{ background: surface, border: `1px solid ${border}` }} aria-label="Open search">
              <Search className="w-3 h-3 opacity-40 shrink-0"/>
              <span className="text-[11px] opacity-40 truncate">search…</span>
            </Link>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px]" style={{ background: surface2, color: primary }}>
                <Flame className="w-3 h-3" strokeWidth={1.5}/> 12
              </div>
              <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}`, color: muted }} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" strokeWidth={1.5}/> : <Moon className="w-3.5 h-3.5" strokeWidth={1.5}/>}
              </button>
              <Link to="/notifications" className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }} aria-label={`notifications${unread ? `, ${unread} unread` : ""}`}>
                <Bell className="w-3.5 h-3.5 opacity-70" strokeWidth={1.5}/>
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-medium flex items-center justify-center" style={{ background: primary, color: "white" }}>
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(true)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }} aria-label="open navigation">
                <Menu className="w-4 h-4 opacity-70"/>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0" style={{ background: "var(--pc-scrim)" }} onClick={() => setMobileOpen(false)} />

          <div className="absolute top-0 right-0 bottom-0 w-[86%] max-w-sm p-5 flex flex-col overflow-y-auto"
               style={{ background: surface, borderLeft: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2"><Mark className="w-7 h-7"/>
                <div>
                  <div className="font-serif text-[15px] leading-none">PeaceCode</div>
                  <div className="text-[8px] tracking-[0.3em] uppercase opacity-50 mt-1">a soft place</div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface2 }} aria-label="close navigation">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <div className="text-[9px] tracking-[0.3em] uppercase opacity-50 mb-2 px-1" style={{ color: muted }}>{group.label}</div>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.to);
                      const cls = "flex items-center gap-3 h-11 px-3 rounded-2xl text-[13px]";
                      const style = active ? { background: surface2, color: ink } : { color: muted };
                      return item.to ? (
                        <Link key={item.label} to={item.to} className={cls} style={style}>
                          <Icon className="w-4 h-4" strokeWidth={1.5}/> {item.label}
                        </Link>
                      ) : (
                        <button key={item.label} className={cls} style={style}>
                          <Icon className="w-4 h-4" strokeWidth={1.5}/> {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <Link to="/settings" className="mt-6 flex items-center gap-3 h-11 px-3 rounded-2xl text-[13px]" style={{ background: surface2, color: ink }}>
              <Settings className="w-4 h-4" strokeWidth={1.5}/> Settings
            </Link>
            <button onClick={toggleTheme} className="mt-2 flex items-center gap-3 h-11 px-3 rounded-2xl text-[13px]" style={{ background: surface2, color: ink }} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? <Sun className="w-4 h-4" strokeWidth={1.5}/> : <Moon className="w-4 h-4" strokeWidth={1.5}/>}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      )}

      {/* content */}
      <div className="relative z-10 lg:pl-[120px] lg:pr-6">
        {children}
      </div>

      {/* ─── floating Emergency button (global, calm not scary) ─── */}
      {!pathname.startsWith("/emergency") && (
        <Link
          to="/emergency"
          aria-label="Open Emergency Center"
          className="fixed z-40 flex items-center gap-2 rounded-full pl-3 pr-4 h-11 backdrop-blur-xl transition hover:scale-[1.02] active:scale-[0.98]"
          style={{
            right: "18px",
            bottom: "22px",
            background: "var(--pc-surface)",
            border: `1px solid ${border}`,
            boxShadow: "0 18px 40px -20px rgba(0,0,0,0.25)",
            color: ink,
          }}
        >
          <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: soft }}>
            <LifeBuoy className="w-3.5 h-3.5" strokeWidth={1.6} />
          </span>
          <span className="text-[12px] tracking-wide">Emergency</span>
        </Link>
      )}
    </div>
  );
}

