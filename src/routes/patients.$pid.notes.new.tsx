import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, ArrowLeft, ShieldAlert, Lock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { Button, Card, Label, SectionLabel, TextArea, Select, TextInput } from "@/components/practice/patients/primitives";
import { createNote, loadDraft, saveDraft, clearDraft, useLivePatient, type Modality } from "@/lib/patients-store";

export const Route = createFileRoute("/patients/$pid/notes/new")({
  head: () => ({ meta: [{ title: "New note — Patient" }, { name: "robots", content: "noindex" }] }),
  component: NewNote,
});

type Draft = {
  sessionDate: string;
  duration: number;
  modality: Modality;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  moodBefore: number;
  moodAfter: number;
  riskFlagged: boolean;
  privateToTherapist: boolean;
};

const empty: Draft = {
  sessionDate: new Date().toISOString().slice(0, 16),
  duration: 50,
  modality: "video",
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
  moodBefore: 5,
  moodAfter: 5,
  riskFlagged: false,
  privateToTherapist: false,
};

function NewNote() {
  const { pid } = Route.useParams();
  const navigate = useNavigate();
  const patient = useLivePatient(pid);
  const [draft, setDraft] = useState<Draft>(empty);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    const d = loadDraft<Draft>(pid);
    if (d) setDraft({ ...empty, ...d });
  }, [pid]);

  // autosave
  useEffect(() => {
    const id = setTimeout(() => {
      saveDraft(pid, draft);
      setStatus("saved");
    }, 3000);
    setStatus("saving");
    return () => clearTimeout(id);
  }, [draft, pid]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft((d) => ({ ...d, [key]: value })); }
  function submit() {
    if (!draft.assessment.trim()) { toast("Add an assessment before saving."); return; }
    createNote({
      patientId: pid,
      sessionDate: new Date(draft.sessionDate).getTime(),
      duration: draft.duration,
      modality: draft.modality,
      subjective: draft.subjective.trim(),
      objective: draft.objective.trim(),
      assessment: draft.assessment.trim(),
      plan: draft.plan.trim(),
      moodBefore: draft.moodBefore,
      moodAfter: draft.moodAfter,
      riskFlagged: draft.riskFlagged,
      privateToTherapist: draft.privateToTherapist,
    });
    clearDraft(pid);
    navigate({ to: "/patients/$pid/notes", params: { pid } });
  }

  if (!patient) return null;

  return (
    <div className="flex flex-col gap-5 pc-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <SectionLabel><span className="inline-flex items-center gap-1.5"><ArrowLeft className="w-3 h-3" />New session note</span></SectionLabel>
          <p className="text-[13px]" style={{ color: palette.muted }}>Autosaves as you type · <span style={{ color: status === "saved" ? "var(--pc-risk-stable)" : palette.muted }}>{status === "saved" ? "Draft saved" : status === "saving" ? "Saving…" : "Ready"}</span></p>
        </div>
        <Button variant="primary" onClick={submit}><Save className="w-4 h-4" /> Save note</Button>
      </div>

      <Card className="p-6">
        <SectionLabel>Session details</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <Label>Session date &amp; time</Label>
            <TextInput type="datetime-local" value={draft.sessionDate} onChange={(e) => update("sessionDate", e.target.value)} />
          </div>
          <div>
            <Label>Duration <span style={{ color: palette.muted }}>(min)</span></Label>
            <TextInput type="number" min={5} max={240} value={draft.duration} onChange={(e) => update("duration", Number(e.target.value))} />
          </div>
          <div>
            <Label>Modality</Label>
            <Select value={draft.modality} onChange={(e) => update("modality", e.target.value as Modality)}>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="in-person">In-person</option>
              <option value="chat">Chat</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel>SOAP</SectionLabel>
        <div className="flex flex-col gap-4 mt-2">
          <div>
            <Label hint="what the patient said, in their own words">Subjective</Label>
            <TextArea value={draft.subjective} onChange={(e) => update("subjective", e.target.value)} placeholder="Reports…" rows={4} />
          </div>
          <div>
            <Label hint="observed affect, behaviour, appearance">Objective</Label>
            <TextArea value={draft.objective} onChange={(e) => update("objective", e.target.value)} placeholder="Presented with…" rows={4} />
          </div>
          <div>
            <Label hint="clinical impression / formulation">Assessment</Label>
            <TextArea value={draft.assessment} onChange={(e) => update("assessment", e.target.value)} placeholder="Continues to meet criteria for…" rows={4} />
          </div>
          <div>
            <Label hint="homework, next-session focus, referrals">Plan</Label>
            <TextArea value={draft.plan} onChange={(e) => update("plan", e.target.value)} placeholder="1) Continue…" rows={4} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel>Mood check</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <MoodSlider label="Before session" value={draft.moodBefore} onChange={(v) => update("moodBefore", v)} />
          <MoodSlider label="After session" value={draft.moodAfter} onChange={(v) => update("moodAfter", v)} />
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel>Flags</SectionLabel>
        <div className="flex flex-col gap-3 mt-2">
          <ToggleRow icon={<ShieldAlert className="w-3.5 h-3.5" />} label="Flag risk on this session" hint="Highlights this note in the timeline and alerts."
            checked={draft.riskFlagged} onChange={(v) => update("riskFlagged", v)} accent="var(--pc-risk-crisis)" />
          <ToggleRow icon={<Lock className="w-3.5 h-3.5" />} label="Private to therapist" hint="Never shared, even with consent enabled."
            checked={draft.privateToTherapist} onChange={(v) => update("privateToTherapist", v)} />
        </div>
      </Card>
    </div>
  );
}

function MoodSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="text-[16px] tabular-nums" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{value}<span style={{ color: palette.muted, fontSize: 11 }}> / 10</span></span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[color:var(--pc-primary,#B0567A)]" style={{ accentColor: palette.primary }} />
      <div className="flex justify-between text-[10px] mt-1" style={{ color: palette.muted }}><span>1 · low</span><span>10 · well</span></div>
    </div>
  );
}

function ToggleRow({ icon, label, hint, checked, onChange, accent }: { icon: React.ReactNode; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: palette.ink }}>{icon}{label}</div>
        <p className="text-[11px] mt-0.5" style={{ color: palette.muted }}>{hint}</p>
      </div>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className="shrink-0 relative w-10 h-6 rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
        style={{ background: checked ? (accent ?? palette.primary) : palette.border }}>
        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-150" style={{ transform: checked ? "translateX(16px)" : "none" }} />
      </button>
    </div>
  );
}
