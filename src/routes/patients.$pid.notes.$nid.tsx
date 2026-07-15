import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit3, Trash2, Save, X, Video, Mic, Users, MessageSquare, ShieldAlert, Lock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { Button, Card, Label, SectionLabel, TextArea, Select, TextInput, fmtDateTime } from "@/components/practice/patients/primitives";
import { deleteNote, getNote, updateNote, type Modality, type SessionNote } from "@/lib/patients-store";

export const Route = createFileRoute("/patients/$pid/notes/$nid")({
  head: () => ({ meta: [{ title: "Note — Patient" }, { name: "robots", content: "noindex" }] }),
  component: NoteDetail,
});

const MOD_ICON: Record<Modality, React.ReactNode> = {
  video: <Video className="w-3.5 h-3.5" />,
  audio: <Mic className="w-3.5 h-3.5" />,
  "in-person": <Users className="w-3.5 h-3.5" />,
  chat: <MessageSquare className="w-3.5 h-3.5" />,
};

function NoteDetail() {
  const { pid, nid } = Route.useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<SessionNote | undefined>(() => getNote(nid));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SessionNote | undefined>(note);

  useEffect(() => {
    setNote(getNote(nid));
    setDraft(getNote(nid));
  }, [nid]);

  if (!note || !draft) {
    return (
      <div className="text-center py-16">
        <p style={{ color: palette.muted }}>Note not found.</p>
        <Link to="/patients/$pid/notes" params={{ pid }} className="mt-2 inline-block underline text-[12px]" style={{ color: palette.primary }}>Back to notes</Link>
      </div>
    );
  }

  function save() {
    if (!draft) return;
    const updated = updateNote(nid, draft);
    setNote(updated);
    setEditing(false);
  }

  function remove() {
    if (!confirm("Delete this note permanently? This cannot be undone.")) return;
    deleteNote(nid);
    navigate({ to: "/patients/$pid/notes", params: { pid } });
  }

  return (
    <div className="flex flex-col gap-5 pc-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/patients/$pid/notes" params={{ pid }} className="inline-flex items-center gap-1 text-[11.5px] hover:underline" style={{ color: palette.muted }}>
          <ArrowLeft className="w-3.5 h-3.5" /> All notes
        </Link>
        <div className="flex gap-2">
          {!editing && <Button variant="outline" onClick={() => setEditing(true)}><Edit3 className="w-4 h-4" /> Edit</Button>}
          {editing && <>
            <Button variant="ghost" onClick={() => { setDraft(note!); setEditing(false); }}><X className="w-4 h-4" /> Cancel</Button>
            <Button variant="primary" onClick={save}><Save className="w-4 h-4" /> Save</Button>
          </>}
          <Button variant="ghost" onClick={remove}><Trash2 className="w-4 h-4" style={{ color: "var(--pc-risk-crisis)" }} /></Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: palette.muted }}>
          <span className="tabular-nums">{fmtDateTime(note.sessionDate)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">{MOD_ICON[note.modality]} {note.modality}</span>
          <span>·</span>
          <span>{note.duration}m</span>
          {note.privateToTherapist && <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" /> private</span>}
          {note.riskFlagged && <span className="inline-flex items-center gap-1" style={{ color: "var(--pc-risk-crisis)" }}><ShieldAlert className="w-3 h-3" /> flagged</span>}
        </div>

        {!editing ? (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SoapView label="Subjective" text={note.subjective} />
            <SoapView label="Objective" text={note.objective} />
            <SoapView label="Assessment" text={note.assessment} />
            <SoapView label="Plan" text={note.plan} />
            {(typeof note.moodBefore === "number" || typeof note.moodAfter === "number") && (
              <div className="md:col-span-2 mt-2 pt-4 flex gap-6" style={{ borderTop: `1px dashed ${palette.border}` }}>
                <MoodChip label="Before" value={note.moodBefore ?? 0} />
                <MoodChip label="After" value={note.moodAfter ?? 0} />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Date &amp; time</Label><TextInput type="datetime-local" value={new Date(draft.sessionDate).toISOString().slice(0, 16)} onChange={(e) => setDraft({ ...draft, sessionDate: new Date(e.target.value).getTime() })} /></div>
              <div><Label>Duration (min)</Label><TextInput type="number" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })} /></div>
              <div><Label>Modality</Label>
                <Select value={draft.modality} onChange={(e) => setDraft({ ...draft, modality: e.target.value as Modality })}>
                  <option value="video">Video</option><option value="audio">Audio</option><option value="in-person">In-person</option><option value="chat">Chat</option>
                </Select>
              </div>
            </div>
            <div><Label>Subjective</Label><TextArea rows={3} value={draft.subjective} onChange={(e) => setDraft({ ...draft, subjective: e.target.value })} /></div>
            <div><Label>Objective</Label><TextArea rows={3} value={draft.objective} onChange={(e) => setDraft({ ...draft, objective: e.target.value })} /></div>
            <div><Label>Assessment</Label><TextArea rows={3} value={draft.assessment} onChange={(e) => setDraft({ ...draft, assessment: e.target.value })} /></div>
            <div><Label>Plan</Label><TextArea rows={3} value={draft.plan} onChange={(e) => setDraft({ ...draft, plan: e.target.value })} /></div>
          </div>
        )}
      </Card>
    </div>
  );
}

function SoapView({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      {text ? (
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: palette.ink }}>{text}</p>
      ) : (
        <p className="text-[12px] italic" style={{ color: palette.muted }}>Not recorded</p>
      )}
    </div>
  );
}

function MoodChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10.5px] tracking-[0.18em] uppercase" style={{ color: palette.muted }}>{label}</span>
      <span className="text-[1.6rem] tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}<span style={{ fontSize: 11, color: palette.muted }}> / 10</span></span>
    </div>
  );
}
