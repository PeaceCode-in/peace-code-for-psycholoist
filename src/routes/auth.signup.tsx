import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, IdCard, GraduationCap, Building2 } from "lucide-react";
import {
  AuthShell, FieldLabel, GlassInput, GlassSelect, PrimaryButton, InlineFeedback,
} from "@/components/auth/AuthShell";
import { createUser, isRegistered, startSession } from "@/lib/auth-store";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Register — PeaceCode · Practice" }] }),
  component: SignupPage,
});

const CREDENTIALS = ["M.Phil Clinical Psychology", "PsyD", "PhD Clinical Psychology", "MA Counselling Psychology", "MSc Psychology", "Other"];

function SignupPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [credential, setCredential] = useState(CREDENTIALS[0]);
  const [clinic, setClinic] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const em = email.trim().toLowerCase();
    if (!em || !password || !fullName || !licenseNumber) { setError("Please fill out every field."); return; }
    if (password.length < 8) { setError("Use at least 8 characters for your password."); return; }
    if (isRegistered(em)) { setError("An account with that email already exists."); return; }
    setBusy(true);
    try {
      // We reuse auth-store's shape; therapist-specific fields are persisted to settings later.
      createUser({
        email: em, password, fullName,
        studentId: licenseNumber, // repurposed field: license number
        college: clinic || "Independent practice",
        course: credential,
        year: specializations || "General practice",
      });
      // Stash therapist meta for settings hydration on first visit.
      try {
        localStorage.setItem("pc.practice.signup.v1", JSON.stringify({
          licenseNumber, credential, clinic, specializations, email: em, fullName,
        }));
      } catch {}
      startSession(em);
      nav({ to: "/dashboard" });
    } finally { setBusy(false); }
  }

  return (
    <AuthShell
      eyebrow="For verified psychologists"
      title="Register your"
      titleAccent="practice."
      subtitle="We verify every clinician. You'll be able to accept patients once your license is confirmed (usually within 24 hours)."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <FieldLabel>Full name</FieldLabel>
          <GlassInput icon={<User className="w-4 h-4" />} required
            value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. Priya Sharma" />
        </div>
        <div>
          <FieldLabel>Practice email</FieldLabel>
          <GlassInput icon={<Mail className="w-4 h-4" />} type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.in" />
        </div>
        <div>
          <FieldLabel>Password</FieldLabel>
          <GlassInput icon={<Lock className="w-4 h-4" />} type="password" required minLength={8}
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="at least 8 characters" />
        </div>
        <div>
          <FieldLabel hint="RCI, APA, HCPC or your regulator's registration number">License number</FieldLabel>
          <GlassInput icon={<IdCard className="w-4 h-4" />} required
            value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. A54321" />
        </div>
        <div>
          <FieldLabel>Highest qualification</FieldLabel>
          <GlassSelect icon={<GraduationCap className="w-4 h-4" />}
            value={credential} onChange={(e) => setCredential(e.target.value)}>
            {CREDENTIALS.map((c) => <option key={c}>{c}</option>)}
          </GlassSelect>
        </div>
        <div>
          <FieldLabel hint="Optional — leave blank if independent">Clinic / hospital</FieldLabel>
          <GlassInput icon={<Building2 className="w-4 h-4" />}
            value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Fortis Mind, Delhi" />
        </div>
        <div>
          <FieldLabel hint="Comma-separated. e.g. CBT, adolescents, trauma">Specializations</FieldLabel>
          <GlassInput icon={<GraduationCap className="w-4 h-4" />}
            value={specializations} onChange={(e) => setSpecializations(e.target.value)} placeholder="CBT, anxiety, trauma-informed" />
        </div>
        {error && <InlineFeedback kind="error">{error}</InlineFeedback>}
        <PrimaryButton disabled={busy}>{busy ? "Creating…" : "Create practice account"}</PrimaryButton>
        <p className="text-center text-[12px]" style={{ color: "#5a4030" }}>
          Already registered? <Link to="/auth/login" className="underline" style={{ color: "#1e3a8a" }}>Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
