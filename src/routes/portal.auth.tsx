import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { portalSignIn } from "@/lib/portal-store";
import { portal } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/portal/auth")({
  head: () => ({ meta: [{ title: "Sign in — Client Portal" }, { name: "robots", content: "noindex" }] }),
  component: PortalAuth,
});

function PortalAuth() {
  const nav = useNavigate();
  const [email, setEmail] = useState("priya@demo.in");
  const [password, setPassword] = useState("peacecode");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = portalSignIn(email, password);
    if (!r.ok) { setErr(r.error ?? "Something went wrong."); return; }
    nav({ to: "/portal" });
  };

  return (
    <div className="min-h-screen" style={{ background: portal.bg, color: portal.ink, fontFamily: "'DM Sans', system-ui" }}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="mb-10">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: portal.soft, color: portal.roseDeep, fontFamily: "'Fraunces', serif", fontSize: 22 }}>p</span>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 400, letterSpacing: -0.6 }}>Welcome back</h1>
        <p className="mt-2 text-[15px]" style={{ color: portal.muted }}>Sign in to your portal. Your therapist is expecting you.</p>

        <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[13px]" style={{ color: portal.muted }}>
            Email
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="rounded-xl border px-4 py-3 text-[15px] outline-none"
              style={{ borderColor: portal.border, background: portal.paper, color: portal.ink }}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px]" style={{ color: portal.muted }}>
            Password
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="rounded-xl border px-4 py-3 text-[15px] outline-none"
              style={{ borderColor: portal.border, background: portal.paper, color: portal.ink }}
            />
          </label>
          {err ? <p className="text-[13px]" style={{ color: portal.roseDeep }}>{err}</p> : null}
          <button
            type="submit"
            className="mt-2 rounded-xl px-5 py-3 text-[15px] font-medium"
            style={{ background: portal.rose, color: "#FFFFFF" }}
          >
            Sign in
          </button>
        </form>

        <div className="mt-10 rounded-2xl p-4 text-[13px]" style={{ background: portal.paper, border: `1px solid ${portal.border}`, color: portal.muted }}>
          <p className="mb-2" style={{ color: portal.ink, fontFamily: "'Fraunces', serif", fontSize: 15 }}>Demo accounts</p>
          <p><strong>priya@demo.in</strong> — onboarded, has sessions & homework</p>
          <p><strong>arjun@demo.in</strong> — brand new, will see onboarding</p>
          <p className="mt-1">Password: <strong>peacecode</strong></p>
        </div>
      </div>
    </div>
  );
}
