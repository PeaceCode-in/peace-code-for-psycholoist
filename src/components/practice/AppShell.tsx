import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarDays, MessageSquare, Users, ClipboardList, NotebookPen,
  Wallet, LineChart, BookOpen, Settings as SettingsIcon, Bell, Plus, Search, ShieldCheck,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { palette } from "./palette";
import { GlassFX } from "@/components/GlassFX";

export { palette };

const NAV = [
  {
    label: "Today",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Schedule", url: "/schedule", icon: CalendarDays },
      { title: "Messages", url: "/messages", icon: MessageSquare },
    ],
  },
  {
    label: "Clinical",
    items: [
      { title: "Patients", url: "/patients", icon: Users },
      { title: "Sessions", url: "/sessions", icon: ClipboardList },
      { title: "Notes", url: "/notes", icon: NotebookPen },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Billing", url: "/billing", icon: Wallet },
      { title: "Insights", url: "/insights", icon: LineChart },
      { title: "Resources", url: "/resources", icon: BookOpen },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", url: "/settings", icon: SettingsIcon }],
  },
] as const;

function SideNav() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-2 select-none">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[13px]"
            style={{ background: palette.primary, fontFamily: "'Fraunces', serif" }}
          >
            P
          </span>
          {!collapsed && (
            <span style={{ fontFamily: "'Fraunces', serif", color: palette.ink }} className="text-[15px] tracking-tight">
              PeaceCode <span style={{ color: palette.muted }}>· Practice</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {NAV.map((section) => (
          <SidebarGroup key={section.label}>
            {!collapsed && (
              <SidebarGroupLabel
                className="text-[10px] tracking-[0.22em] uppercase"
                style={{ color: palette.muted }}
              >
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link
                          to={item.url}
                          className="flex items-center gap-2.5 relative"
                          style={{ color: active ? palette.ink : palette.muted }}
                        >
                          <item.icon className="h-4 w-4" strokeWidth={1.8} />
                          {!collapsed && (
                            <span className="text-[13px]" style={{ color: active ? palette.ink : palette.muted }}>
                              {item.title}
                            </span>
                          )}
                          {active && !collapsed && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r"
                              style={{ background: palette.primary }}
                            />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div
          className="flex items-center gap-2 px-2 py-2 rounded-xl"
          style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}
        >
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] text-white shrink-0"
            style={{ background: palette.primary }}
          >
            DS
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[12px] truncate" style={{ color: palette.ink }}>Dr. Sharma</div>
              <div className="text-[10px] flex items-center gap-1" style={{ color: palette.muted }}>
                <ShieldCheck className="w-2.5 h-2.5" /> RCI · verified
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar({ crumb }: { crumb?: string }) {
  return (
    <header
      className="h-14 shrink-0 flex items-center gap-3 px-4 border-b"
      style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)", borderColor: palette.border }}
    >
      <SidebarTrigger />
      <div className="text-[12px] tracking-[0.18em] uppercase hidden sm:block" style={{ color: palette.muted }}>
        {crumb ?? "Practice"}
      </div>
      <div className="flex-1 flex justify-center">
        <div
          className="hidden md:flex items-center gap-2 px-3 h-9 rounded-full w-full max-w-md"
          style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: palette.muted }} />
          <input
            className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:opacity-60"
            placeholder="Search patients, notes, sessions…"
            style={{ color: palette.ink }}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: palette.surface, color: palette.muted, border: `1px solid ${palette.border}` }}>⌘K</kbd>
        </div>
      </div>
      <button
        className="hidden sm:flex items-center gap-1.5 px-2.5 h-8 rounded-full text-[11px]"
        style={{ background: "#E7F6EC", color: "#1F7A3E", border: "1px solid #C7E7D2" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" /> Available
      </button>
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center relative"
        style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}
        aria-label="Notifications"
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: palette.primary }} />
      </button>
      <button
        className="h-8 pl-2 pr-3 rounded-full text-[11.5px] flex items-center gap-1.5"
        style={{ background: palette.ink, color: "#fff" }}
      >
        <Plus className="w-3 h-3" /> New
      </button>
    </header>
  );
}

export function AppShell({ children, crumb }: { children: ReactNode; crumb?: string }) {
  return (
    <SidebarProvider>
      <GlassFX />
      <div className="min-h-screen flex w-full" style={{ color: palette.ink, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <SideNav />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar crumb={crumb} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
