import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import {
  AuthShell, FieldLabel, GlassInput, PrimaryButton, InlineFeedback,
} from "@/components/auth/AuthShell";
import { isRegistered, verifyPassword, startSession } from "@/lib/auth-store";

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
        <p className="text-center text-[12px]" style={{ color: "#5a4030" }}>
          New here? <Link to="/auth/signup" className="underline" style={{ color: "#1e3a8a" }}>Register your practice</Link>
        </p>
      </form>
    </AuthShell>
  );
}
