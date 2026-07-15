// Cinema-mode layout for /welcome/* — no AppShell.
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { SAKURA } from "@/components/practice/onboarding/primitives";
import { isOnboardingComplete } from "@/lib/onboarding-store";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — PeaceCode" }] }),
  beforeLoad: ({ location }) => {
    // Allow re-entry only via explicit /welcome/complete or reset.
    if (typeof window !== "undefined" && isOnboardingComplete() && location.pathname === "/welcome") {
      throw redirect({ to: "/" });
    }
  },
  component: WelcomeLayout,
});

function WelcomeLayout() {
  return (
    <div className="min-h-screen w-full" style={{ background: SAKURA.bg, color: SAKURA.ink }}>
      {/* Grain overlay for warmth */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(1200px 800px at 20% 0%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(900px 600px at 80% 100%, rgba(255,214,232,0.4), transparent 60%)",
          mixBlendMode: "screen",
        }}
      />
      <div className="relative">
        <Outlet />
      </div>
    </div>
  );
}
