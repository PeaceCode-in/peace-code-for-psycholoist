import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadSession } from "@/lib/auth-store";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    const s = loadSession();
    router.navigate({ to: s ? "/dashboard" : "/auth", replace: true });
  }, [router]);
  return <div style={{ minHeight: "100vh", background: "#F5F9FF" }} />;
}
