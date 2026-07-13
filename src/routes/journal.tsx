import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GlassFX } from "@/components/GlassFX";

export const Route = createFileRoute("/journal")({
  component: () => (
    <>
      <GlassFX />
      <Outlet />
    </>
  ),
});
