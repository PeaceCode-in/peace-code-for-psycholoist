// Public reader shell — no AppShell chrome. Sakura backdrop, editorial type.
import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/writing")({
  head: () => ({
    meta: [
      { title: "Writing — PeaceCode" },
      { name: "description", content: "Articles, guides, and worksheets from a working psychotherapy practice." },
      { property: "og:title", content: "Writing — PeaceCode" },
      { property: "og:description", content: "Articles, guides, and worksheets from a working psychotherapy practice." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/writing" },
    ],
    links: [{ rel: "canonical", href: "/writing" }],
  }),
  component: WritingLayout,
});

function WritingLayout() {
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, #FDF7F8 0%, #F6F1F2 100%)`, color: palette.ink }}>
      <header className="border-b" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link to="/writing" className="text-[15px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            PeaceCode <span className="italic" style={{ color: palette.primary }}>writing</span>
          </Link>
          <nav className="flex items-center gap-5 text-[12.5px]" style={{ color: palette.muted }}>
            <Link to="/writing" className="hover:underline">All</Link>
            <Link to="/p/$slug" params={{ slug: "dr-sample" }} className="hover:underline">About the practice</Link>
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="border-t mt-20 py-10" style={{ borderColor: palette.border }}>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 text-[11px] flex items-center justify-between" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <span>PeaceCode · Practice</span>
          <span>Written by clinicians. Read by anyone.</span>
        </div>
      </footer>
    </div>
  );
}
