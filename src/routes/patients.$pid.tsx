import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { PatientHeader } from "@/components/practice/patients/PatientHeader";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/patients/$pid")({
  head: ({ params }) => ({
    meta: [
      { title: `Patient chart — PeaceCode · Practice` },
      { name: "description", content: `Clinical chart, notes and timeline for patient ${params.pid}.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PatientLayout,
  notFoundComponent: PatientNotFound,
});

function PatientLayout() {
  const { pid } = Route.useParams();
  return (
    <AppShell crumb="Patient">
      <PatientHeader id={pid} />
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <Outlet />
      </div>
    </AppShell>
  );
}

function PatientNotFound() {
  return (
    <AppShell crumb="Patient not found">
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <h1 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: "1.6rem" }}>Patient not found</h1>
        <p className="mt-2 text-[12.5px]" style={{ color: palette.muted }}>This chart may have been discharged or the link is stale.</p>
      </div>
    </AppShell>
  );
}

export { notFound };
