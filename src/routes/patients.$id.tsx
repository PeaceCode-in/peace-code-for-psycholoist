import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/practice/StubPage";
export const Route = createFileRoute("/patients/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <StubPage title={`Patient · ${id}`} blurb="Profile, history, notes, assessments, homework, billing — landing next." />;
  },
});
