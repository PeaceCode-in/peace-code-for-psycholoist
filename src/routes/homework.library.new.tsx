import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { saveTemplate, type FieldType, type Modality, type TemplateField } from "@/lib/homework-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/homework/library/new")({
  component: NewTemplate,
});

const FIELD_TYPES: Array<{ v: FieldType; label: string }> = [
  { v: "short", label: "Short text" }, { v: "long", label: "Long text" },
  { v: "scale", label: "Scale 0–10" }, { v: "mood", label: "Mood picker" },
  { v: "checklist", label: "Checklist" }, { v: "image", label: "Image upload" },
  { v: "voice", label: "Voice memo" }, { v: "timer", label: "Timer log" },
];

function NewTemplate() {
  const hydrated = useHydrated();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [modality, setModality] = useState<Modality>("CBT");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [fields, setFields] = useState<TemplateField[]>([{ key: "note", label: "Note", type: "long" }]);

  if (!hydrated) return null;

  function addField() {
    setFields([...fields, { key: `f${fields.length + 1}`, label: "New field", type: "short" }]);
  }
  function updateField(idx: number, patch: Partial<TemplateField>) {
    setFields(fields.map((f, i) => i === idx ? { ...f, ...patch } : f));
  }
  function removeField(idx: number) {
    setFields(fields.filter((_, i) => i !== idx));
  }
  function save() {
    if (!name.trim()) return;
    const id = `t-custom-${Date.now()}`;
    saveTemplate({
      id, name: name.trim(), modality, description: description.trim(),
      defaultInstructions: instructions.trim() || "Custom template.",
      fields, isCustom: true,
    });
    nav({ to: "/homework/library" });
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
      <Link to="/homework/library" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-6" style={{ color: palette.muted }}>
        <ArrowLeft className="h-3 w-3" /> Library
      </Link>

      <div className="rounded-3xl border p-8 lg:p-10" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.85)" }}>
        <h2 className="text-[24px] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>New template</h2>
        <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>Compose from blocks. This becomes reusable across patients.</p>

        <div className="grid gap-5 mt-6">
          <Row label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
          </Row>
          <Row label="Modality">
            <select value={modality} onChange={(e) => setModality(e.target.value as Modality)} className="w-full h-10 px-3 rounded-xl border text-[13px] bg-white" style={{ borderColor: palette.border, color: palette.ink }}>
              {["CBT", "DBT", "ACT", "Mindfulness", "Behavioral", "Reflective"].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Row>
          <Row label="Description">
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-10 px-3 rounded-xl border text-[13px] outline-none" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
          </Row>
          <Row label="Default instructions">
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} className="w-full rounded-xl border p-3 text-[13px] outline-none" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }} />
          </Row>

          <div>
            <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Fields</div>
            <ul className="space-y-2">
              {fields.map((f, idx) => (
                <li key={idx} className="rounded-xl border p-3 flex items-center gap-2" style={{ borderColor: palette.border, background: "#fff" }}>
                  <GripVertical className="h-3.5 w-3.5" style={{ color: palette.muted }} />
                  <input value={f.label} onChange={(e) => updateField(idx, { label: e.target.value })} className="flex-1 h-8 px-2 rounded border text-[13px] outline-none" style={{ borderColor: palette.border, color: palette.ink }} />
                  <select value={f.type} onChange={(e) => updateField(idx, { type: e.target.value as FieldType })} className="h-8 px-2 rounded border text-[12px] bg-white" style={{ borderColor: palette.border, color: palette.ink }}>
                    {FIELD_TYPES.map((ft) => <option key={ft.v} value={ft.v}>{ft.label}</option>)}
                  </select>
                  <button onClick={() => removeField(idx)} className="grid place-items-center h-8 w-8 rounded border" style={{ borderColor: palette.border, color: "#8A2E4E" }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={addField} className="mt-2 inline-flex items-center gap-1.5 text-[12px]" style={{ color: palette.ink }}>
              <Plus className="h-3.5 w-3.5" /> Add field
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={save} disabled={!name.trim()} className="inline-flex items-center h-10 px-5 rounded-full text-[12.5px] disabled:opacity-40" style={{ background: palette.ink, color: "#fff" }}>Save template</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      {children}
    </div>
  );
}
