import { createFileRoute, redirect } from "@tanstack/react-router";
import { loadSession } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const s = loadSession();
    throw redirect({ to: s ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
