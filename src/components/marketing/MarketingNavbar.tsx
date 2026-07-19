/* Shared frosted-glass marketing navbar.
   Applied identically across /for-psychologists, /features/*, and /company/*. */
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X, Sun, Moon } from "lucide-react";
import { FEATURE_SLUGS, FEATURE_GROUPS } from "@/routes/for-psychologists";

const LOGIN_URL = "/auth";

type NavColumn = { header?: string; items: Array<{ label: string; href: string }> };
type NavItem = { label: string; href: string; dropdown?: { columns: NavColumn[] } };

function buildFeatureNav(): NavItem[] {
  const bySlug = Object.fromEntries(FEATURE_SLUGS.map((f) => [f.slug, f]));
  return FEATURE_GROUPS.map((g) => ({
    label: g.title,
    href: "/features",
    dropdown: {
      columns: [
        {
          header: g.title.toUpperCase(),
          items: g.slugs
            .map((s) => bySlug[s])
            .filter(Boolean)
            .map((f) => ({ label: f.name, href: `/features/${f.slug}` })),
        },
      ],
    },
  }));
}

const NAV_ITEMS: NavItem[] = [
  ...buildFeatureNav(),
  {
    label: "Company",
    href: "/company/story",
    dropdown: { columns: [{ header: "COMPANY", items: [
      { label: "Our story", href: "/company/story" },
      { label: "Product updates", href: "/company/updates" },
      { label: "FAQs", href: "/company/faq" },
      { label: "Contact", href: "/company/contact" },
    ]}]},
  },
];

import { useMarketingTheme } from "@/lib/use-marketing-theme";

export function MarketingNavbar({ darkMode: darkModeProp, onToggleDark: onToggleDarkProp }: { darkMode?: boolean; onToggleDark?: () => void } = {}) {
  const theme = useMarketingTheme();
  const darkMode = darkModeProp ?? theme.darkMode;
  const onToggleDark = onToggleDarkProp ?? theme.toggleDark;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openNow = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 140);
  };

  return (
    <header
      className={`fixed z-50 left-0 right-0 flex justify-center transition-all duration-300 ${scrolled ? "top-3 px-3" : "top-4 px-3"}`}
    >
      <div
        className={`w-full max-w-[1040px] grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-full border py-2 pl-4 pr-2 transition-all duration-300 ${
          scrolled
            ? "shadow-[0_10px_40px_-12px_rgba(138,51,85,0.25)]"
            : "shadow-[0_6px_24px_-14px_rgba(138,51,85,0.20)]"
        }`}
        style={{
          background: "color-mix(in oklab, var(--sakura-cream) 65%, transparent)",
          backdropFilter: "blur(22px) saturate(140%)",
          borderColor: "color-mix(in oklab, var(--sakura-ink) 8%, transparent)",
        }}
      >
        <Link to="/for-psychologists" className="flex min-w-0 items-center gap-2 shrink-0 pl-1" aria-label="PeaceCode">
          <img
            src="/nav-bar-logo.svg"
            alt=""
            aria-hidden="true"
            className="h-7 w-auto object-contain shrink-0"
            style={{ filter: "brightness(0)" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <span className="pc-serif text-[18px] leading-none truncate" style={{ fontWeight: 500, color: "var(--sakura-ink)" }}>
            PeaceCode
          </span>
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-0.5 min-w-0">
          {NAV_ITEMS.map((item) => {
            const isOpen = openDropdown === item.label;
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && openNow(item.label)}
                onMouseLeave={() => item.dropdown && closeSoon()}
              >
                <a
                  href={item.href}
                  onFocus={() => item.dropdown && openNow(item.label)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13.5px] font-medium whitespace-nowrap transition-colors"
                  style={{
                    color: "var(--sakura-ink)",
                    background: isOpen ? "color-mix(in oklab, var(--sakura-petal) 55%, transparent)" : "transparent",
                  }}
                >
                  {item.label}
                  {item.dropdown ? <ChevronDown className={`h-3 w-3 opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`} /> : null}
                </a>
                {item.dropdown && isOpen ? (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 min-w-[240px] z-10">
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: "color-mix(in oklab, var(--sakura-cream) 92%, transparent)",
                        backdropFilter: "blur(28px) saturate(150%)",
                        border: "1px solid color-mix(in oklab, var(--sakura-ink) 10%, transparent)",
                        boxShadow: "0 20px 60px -25px rgba(138,51,85,0.28)",
                      }}
                    >
                      {item.dropdown.columns.map((col, ci) => (
                        <div key={ci}>
                          {col.header ? (
                            <div className="pc-label mb-3" style={{ color: "var(--sakura-muted)", fontSize: 10.5 }}>{col.header}</div>
                          ) : null}
                          <ul className="space-y-1.5">
                            {col.items.map((li) => (
                              <li key={li.label}>
                                <a
                                  href={li.href}
                                  className="block rounded-lg px-2 py-1.5 text-[13.5px] transition-colors"
                                  style={{ color: "var(--sakura-ink)" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "color-mix(in oklab, var(--sakura-petal) 60%, transparent)"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                >
                                  {li.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleDark ? (
            <button
              type="button"
              onClick={onToggleDark}
              aria-pressed={darkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Light mode" : "Dark mode"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5"
              style={{
                color: "var(--sakura-ink)",
                background: "color-mix(in oklab, var(--sakura-petal) 55%, transparent)",
                border: "1px solid color-mix(in oklab, var(--sakura-ink) 10%, transparent)",
              }}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          ) : null}
          <a
            href={LOGIN_URL}
            className="hidden sm:inline-flex items-center rounded-full px-5 py-2 text-[13.5px] font-medium transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--sakura-ink)", color: "var(--sakura-cream)" }}
          >
            Login
          </a>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full"
            style={{ color: "var(--sakura-ink)", background: "color-mix(in oklab, var(--sakura-petal) 55%, transparent)" }}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          className="lg:hidden absolute top-full left-3 right-3 mt-2 rounded-2xl p-4"
          style={{
            background: "color-mix(in oklab, var(--sakura-cream) 92%, transparent)",
            backdropFilter: "blur(24px)",
            border: "1px solid color-mix(in oklab, var(--sakura-ink) 10%, transparent)",
            boxShadow: "0 20px 50px -20px rgba(138,51,85,0.25)",
          }}
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((i) => (
              <li key={i.label}>
                {i.dropdown ? (
                  <details className="group">
                    <summary className="flex items-center justify-between py-2 px-2 text-[14.5px] font-medium cursor-pointer list-none rounded-lg" style={{ color: "var(--sakura-ink)" }}>
                      <span>{i.label}</span>
                      <ChevronDown className="h-4 w-4 opacity-60 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="pl-4 pb-2 space-y-1">
                      {i.dropdown.columns.flatMap((c) => c.items).map((li) => (
                        <li key={li.label}>
                          <a
                            href={li.href}
                            className="block py-1.5 px-2 text-[13.5px] rounded-md"
                            style={{ color: "var(--sakura-muted)" }}
                            onClick={() => setMobileOpen(false)}
                          >
                            {li.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <a
                    href={i.href}
                    className="block py-2 px-2 text-[14.5px]"
                    style={{ color: "var(--sakura-ink)" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {i.label}
                  </a>
                )}
              </li>
            ))}
            <li className="pt-3 mt-2" style={{ borderTop: "1px solid color-mix(in oklab, var(--sakura-ink) 10%, transparent)" }}>
              <a
                href={LOGIN_URL}
                className="inline-flex items-center rounded-full px-5 py-2 text-[13.5px] font-medium"
                style={{ background: "var(--sakura-ink)", color: "var(--sakura-cream)" }}
              >
                Login
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
