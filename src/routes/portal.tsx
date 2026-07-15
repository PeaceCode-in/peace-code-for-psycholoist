import { createFileRoute, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentClient } from "@/lib/portal-store";

export const Route = createFileRoute("/portal")({
  component: PortalGate,
});

function PortalGate() {
  const client = useCurrentClient();
  const location = useLocation();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  const publicPaths = ["/portal/auth", "/portal/crisis"];
  const isPublic = publicPaths.some(p => location.pathname === p || location.pathname.startsWith(p + "/"));

  if (!ready) {
    return <div className="min-h-screen" style={{ background: "#FBF6F4" }} />;
  }
  if (!client && !isPublic) {
    if (typeof window !== "undefined") window.location.href = "/portal/auth";
    return null;
  }
  if (client && !client.onboarded && location.pathname !== "/portal/onboarding" && !isPublic) {
    if (typeof window !== "undefined") window.location.href = "/portal/onboarding";
    return null;
  }
  return <Outlet />;
}
