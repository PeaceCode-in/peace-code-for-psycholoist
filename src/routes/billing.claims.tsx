import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/billing/claims")({ component: () => <Outlet /> });
