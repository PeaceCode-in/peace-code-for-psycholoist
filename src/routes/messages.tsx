import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-store";

export const Route = createFileRoute("/messages")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getSession()) {
      throw redirect({ to: "/auth" });
    }
  },
  head: () => ({
    meta: [
      { title: "Messages — PeaceCode · Practice" },
      { name: "description", content: "Secure, HIPAA-shaped correspondence with your patients." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <Outlet />,
});
