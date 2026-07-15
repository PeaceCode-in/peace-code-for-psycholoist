import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { Button, Card, Label, SectionLabel, TextArea, TextInput, Select, RiskBadge } from "@/components/practice/patients/primitives";
import { createPatient, type Pronouns, type RiskLevel } from "@/lib/patients-store";

export const Route = createFileRoute("/patients/new")({
  head: () => ({ meta: [{ title: "Add patient — PeaceCode · Practice" }, { name: "description", content: "Intake form for a new client — identity, context, risk, emergency contact and consent." }] }),
  component: NewPatient,
});

type Form = {
  fullName: string; preferredName: string; pronouns: Pronouns; age: string;
  email: string; phone: string; college: string; yearOfStudy: string;
  primaryConcern: string; tagsRaw: string; risk: RiskLevel;
  ecName: string; ecPhone: string; ecRelation: string;
  consentSharing: boolean; initialImpression: string;
};

const CONCERNS = ["Anxiety", "Depression", "Academic stress", "Relationship", "Family conflict", "OCD", "PTSD", "Grief", "Adjustment", "Sleep", "Burnout", "Other"];

function NewPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>({
    fullName: "", preferredName: "", pronouns: "she/her", age: "",
    email: "", phone: "", college: "", yearOfStudy: "",
    primaryConcern: "", tagsRaw: "", risk: "monitor",
    ecName: "", ecPhone: "", ecRelation: "",
    consentSharing: false, initialImpression: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  function upd<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })); }

  function submit() {
    const e: Partial<Record<keyof Form, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.email.trim()) e.email = "Required";
    if (!form.college.trim()) e.college = "Required";
    if (!form.age.trim() || Number(form.age) < 10) e.age = "Enter a valid age";
    if (!form.primaryConcern.trim()) e.primaryConcern = "Choose or type a concern";
    setErrors(e);
    if (Object.keys(e).length) return;

    const tags = form.tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const patient = createPatient({
      fullName: form.fullName.trim(),
      preferredName: form.preferredName.trim() || undefined,
      pronouns: form.pronouns,
      age: Number(form.age),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      college: form.college.trim(),
      yearOfStudy: form.yearOfStudy.trim(),
      status: "active",
      risk: form.risk,
      primaryConcern: form.primaryConcern.trim(),
      tags,
      intakeDate: Date.now(),
      consentSharing: form.consentSharing,
      emergencyContact: form.ecName.trim() ? { name: form.ecName.trim(), phone: form.ecPhone.trim(), relation: form.ecRelation.trim() } : undefined,
    });
    navigate({ to: "/patients/$pid", params: { pid: patient.id } });
  }

  return (
    <AppShell crumb="New patient">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 lg:py-12">
        <Link to="/patients" className="inline-flex items-center gap-1 text-[11.5px] hover:underline" style={{ color: palette.muted }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to patients
        </Link>
        <h1 className="mt-3 text-[clamp(1.8rem,3vw,2.4rem)] tracking-tight leading-[1.05]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
          Add a new patient
        </h1>
        <p className="text-[13px] mt-2 max-w-lg" style={{ color: palette.muted }}>Everything except emergency contact and impression is required to activate the chart.</p>

        <div className="mt-8 flex flex-col gap-5">
          <Card className="p-6">
            <SectionLabel>Identity</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div><Label>Full name</Label><TextInput value={form.fullName} onChange={(e) => upd("fullName", e.target.value)} />{errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}</div>
              <div><Label>Preferred name <span style={{ color: palette.muted }}>· optional</span></Label><TextInput value={form.preferredName} onChange={(e) => upd("preferredName", e.target.value)} /></div>
              <div>
                <Label>Pronouns</Label>
                <Select value={form.pronouns} onChange={(e) => upd("pronouns", e.target.value as Pronouns)}>
                  <option value="she/her">she/her</option><option value="he/him">he/him</option><option value="they/them">they/them</option><option value="other">other</option>
                </Select>
              </div>
              <div><Label>Age</Label><TextInput type="number" value={form.age} onChange={(e) => upd("age", e.target.value)} />{errors.age && <ErrorText>{errors.age}</ErrorText>}</div>
              <div><Label>Email</Label><TextInput type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} />{errors.email && <ErrorText>{errors.email}</ErrorText>}</div>
              <div><Label>Phone <span style={{ color: palette.muted }}>· optional</span></Label><TextInput type="tel" value={form.phone} onChange={(e) => upd("phone", e.target.value)} /></div>
            </div>
          </Card>

          <Card className="p-6">
            <SectionLabel>Context</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div><Label>College / institution</Label><TextInput value={form.college} onChange={(e) => upd("college", e.target.value)} />{errors.college && <ErrorText>{errors.college}</ErrorText>}</div>
              <div><Label>Year of study</Label><TextInput placeholder="e.g. 2nd Year B.Tech" value={form.yearOfStudy} onChange={(e) => upd("yearOfStudy", e.target.value)} /></div>
              <div className="md:col-span-2">
                <Label>Primary concern</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CONCERNS.map((c) => (
                    <button key={c} type="button" onClick={() => upd("primaryConcern", c)}
                      className="text-[11px] px-3 h-7 rounded-full transition-colors duration-150"
                      style={form.primaryConcern === c
                        ? { background: palette.ink, color: palette.surface, border: `1px solid ${palette.ink}` }
                        : { background: palette.surface, color: palette.muted, border: `1px solid ${palette.border}` }}>
                      {c}
                    </button>
                  ))}
                </div>
                <TextInput placeholder="Or type a custom concern" value={form.primaryConcern} onChange={(e) => upd("primaryConcern", e.target.value)} />
                {errors.primaryConcern && <ErrorText>{errors.primaryConcern}</ErrorText>}
              </div>
              <div className="md:col-span-2">
                <Label hint="comma-separated">Tags</Label>
                <TextInput placeholder="e.g. exam-stress, cbt, sleep" value={form.tagsRaw} onChange={(e) => upd("tagsRaw", e.target.value)} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <SectionLabel>Initial risk level</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {(["stable", "monitor", "elevated", "crisis"] as RiskLevel[]).map((r) => (
                <button key={r} type="button" onClick={() => upd("risk", r)}
                  className="text-left p-3 rounded-xl transition-colors duration-150"
                  style={form.risk === r
                    ? { background: palette.surface2, border: `1px solid ${palette.ink}` }
                    : { background: palette.surface, border: `1px solid ${palette.border}` }}>
                  <RiskBadge level={r} size="sm" />
                  <p className="text-[11px] mt-2" style={{ color: palette.muted }}>
                    {r === "stable" && "Presenting concerns manageable, no active safety issues."}
                    {r === "monitor" && "Moderate distress, watchful monitoring recommended."}
                    {r === "elevated" && "Significant symptoms or recent risk factors present."}
                    {r === "crisis" && "Active safety planning required. Escalation likely."}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <SectionLabel>Emergency contact <span className="normal-case tracking-normal" style={{ color: palette.muted }}>· recommended</span></SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div><Label>Name</Label><TextInput value={form.ecName} onChange={(e) => upd("ecName", e.target.value)} /></div>
              <div><Label>Phone</Label><TextInput type="tel" value={form.ecPhone} onChange={(e) => upd("ecPhone", e.target.value)} /></div>
              <div><Label>Relation</Label><TextInput placeholder="e.g. parent, sibling" value={form.ecRelation} onChange={(e) => upd("ecRelation", e.target.value)} /></div>
            </div>
          </Card>

          <Card className="p-6">
            <SectionLabel>Consent</SectionLabel>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-[13px]" style={{ color: palette.ink }}>Share notes with college counsellor</p>
                <p className="text-[11px] mt-0.5" style={{ color: palette.muted }}>Assessment and plan sections only. Can be revoked at any time.</p>
              </div>
              <button role="switch" aria-checked={form.consentSharing} onClick={() => upd("consentSharing", !form.consentSharing)}
                className="shrink-0 relative w-10 h-6 rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                style={{ background: form.consentSharing ? palette.primary : palette.border }}>
                <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-150" style={{ transform: form.consentSharing ? "translateX(16px)" : "none" }} />
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <SectionLabel>Initial impression <span className="normal-case tracking-normal" style={{ color: palette.muted }}>· optional</span></SectionLabel>
            <TextArea rows={4} value={form.initialImpression} onChange={(e) => upd("initialImpression", e.target.value)} placeholder="First-look formulation, presenting picture, immediate plan…" />
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Link to="/patients"><Button variant="ghost"><X className="w-4 h-4" /> Cancel</Button></Link>
            <Button variant="primary" onClick={submit}><Save className="w-4 h-4" /> Create patient</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] mt-1" style={{ color: "var(--pc-risk-crisis)" }}>{children}</p>;
}
