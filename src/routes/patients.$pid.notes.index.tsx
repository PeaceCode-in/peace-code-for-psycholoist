import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Video, Mic, Users, MessageSquare, ShieldAlert, Lock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { Button, Card, EmptyState, SectionLabel, fmtDate } from "@/components/practice/patients/primitives";
import { useLiveNotes, type Modality } from "@/lib/patients-store";

export const Route = createFileRoute("/patients/$pid/notes/")({
  head: () => ({ meta: [{ title: "Notes — Patient" }, { name: "robots", content: "noindex" }] }),
  component: NotesList,
});

const MOD_ICON: Record<Modality, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  audio: <Mic className="w-3.5 h-3.5" />,
  "in-person": <Users className="w-3.5 h-3.5" />,
  chat: <MessageSquare className="w-3.5 h-3.5" />,
};

function NotesList() {
  const { pid } = Route.useParams();
  const notes = useLiveNotes(pid);

  return (
    <div className="flex flex-col gap-4 pc-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <SectionLabel>SOAP notes</SectionLabel>
          <p className="text-[13px]" style={{ color: palette.muted }}>{notes.length} {notes.length === 1 ? "note" : "notes"} on file.</p>
        </div>
        <Link to="/patients/$pid/notes/new" params={{ pid }}>
          <Button variant="primary"><Plus className="w-4 h-4" /> New note</Button>
        </Link>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          hint="Session notes appear here after each session. Add one to get started."
          action={<Link to="/patients/$pid/notes/new" params={{ pid }}><Button variant="primary"><Plus className="w-4 h-4" /> First note</Button></Link>}
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {notes.map((n) => (
            <Link key={n.id} to="/patients/$pid/notes/$nid" params={{ pid, nid: n.id }}>
              <Card className="p-4 hover:bg-[color:var(--pc-surface2,#F6F1F2)] transition-colors duration-150">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: palette.muted }}>
                      <span className="tabular-nums">{fmtDate(n.sessionDate, { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">{MOD_ICON[n.modality]} {n.modality}</span>
                      <span>·</span>
                      <span>{n.duration}m</span>
                      {n.privateToTherapist && <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> private</span>}
                    </div>
                    <p className="text-[13px] mt-2 line-clamp-2 leading-relaxed" style={{ color: palette.ink }}>{n.assessment}</p>
                  </div>
                  {n.riskFlagged && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10.5px] px-2 py-1 rounded-full" style={{ background: "var(--pc-risk-crisis-soft)", color: "var(--pc-risk-crisis)" }}>
                      <ShieldAlert className="w-3 h-3" /> flagged
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
