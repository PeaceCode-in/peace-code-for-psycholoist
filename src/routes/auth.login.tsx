import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, UserRound } from "lucide-react";
import {
  AuthShell, FieldLabel, GlassInput, PrimaryButton, InlineFeedback,
} from "@/components/auth/AuthShell";
import { isRegistered, verifyPassword, startSession } from "@/lib/auth-store";

function skipAsGuest(nav: ReturnType<typeof useNavigate>) {
  if (typeof window !== "undefined") {
    localStorage.setItem("pc.auth.guest", "1");
    // Mint a lightweight guest session so downstream code sees a signed-in shape.
    localStorage.setItem(
      "pc.auth.session.v1",
      JSON.stringify({ email: "guest@peacecode.local", startedAt: Date.now() }),
    );
  }
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  nav({ to: (redirect && redirect.startsWith("/")) ? redirect : "/dashboard" });
}

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — PeaceCode · Practice" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const em = email.trim().toLowerCase();
      if (!isRegistered(em)) { setError("No practice account found for that email."); return; }
      if (!verifyPassword(em, password)) { setError("That password doesn't match our records."); return; }
      startSession(em);
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      nav({ to: (redirect && redirect.startsWith("/")) ? redirect : "/dashboard" });
    } finally { setBusy(false); }
  }

  return (
    <AuthShell
      eyebrow="For verified psychologists"
      title="Sign in to your"
      titleAccent="practice."
      subtitle="Access your schedule, patient roster, and clinical notes."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <FieldLabel hint="Use the email you registered your practice with">Practice email</FieldLabel>
          <GlassInput icon={<Mail className="w-4 h-4" />} type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.in" />
        </div>
        <div>
          <FieldLabel>Password</FieldLabel>
          <GlassInput icon={<Lock className="w-4 h-4" />} type="password" required
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <InlineFeedback kind="error">{error}</InlineFeedback>}
        <PrimaryButton disabled={busy}>{busy ? "Signing in…" : "Sign in"}</PrimaryButton>

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em]" style={{ color: "#8a6b58" }}>
          <span className="h-px flex-1" style={{ background: "rgba(120, 80, 60, 0.18)" }} />
          <span>or</span>
          <span className="h-px flex-1" style={{ background: "rgba(120, 80, 60, 0.18)" }} />
        </div>

        <button
          type="button"
          onClick={() => skipAsGuest(nav)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-medium transition-colors hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            borderColor: "rgba(120, 80, 60, 0.22)",
            background: palette.glass,
            color: "#3f2a1e",
          }}
        >
          <UserRound className="w-4 h-4" />
          Skip &amp; continue as guest
        </button>
        <p className="text-center text-[11px]" style={{ color: "#8a6b58" }}>
          Testing only · no data is saved to a real account.
        </p>

        <p className="text-center text-[12px]" style={{ color: "#5a4030" }}>
          New here? <Link to="/auth/signup" className="underline" style={{ color: "#1e3a8a" }}>Register your practice</Link>
        </p>
      </form>
    </AuthShell>
  );
}
