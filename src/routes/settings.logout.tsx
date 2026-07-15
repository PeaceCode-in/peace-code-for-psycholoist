import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { endSession } from "@/lib/auth-store";
import { palette } from "@/components/practice/palette";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/settings/logout")({
  head: () => ({ meta: [
      { name: "robots", content: "noindex" },{ title: "Sign out — PeaceCode · Practice" }] }),
  component: LogoutPage,
});

function LogoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<"idle" | "signing-out">("idle");

  const doSignOut = async () => {
    setState("signing-out");
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      endSession();
    } finally {
      navigate({ to: "/auth", replace: true });
    }
  };

  useEffect(() => { const t = setTimeout(doSignOut, 400); return () => clearTimeout(t); }, []);

  return (
    <main className="max-w-md mx-auto py-16 text-center">
      <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-4"
        style={{ background: palette.soft, color: palette.primary }}>
        <LogOut className="w-5 h-5" />
      </div>
      <h1 className="text-[22px] tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
        {state === "signing-out" ? "Signing you out…" : "Sign out?"}
      </h1>
      <p className="text-[13px] mt-2" style={{ color: palette.muted }}>
        Clearing your session and returning to sign in.
      </p>
    </main>
  );
}
