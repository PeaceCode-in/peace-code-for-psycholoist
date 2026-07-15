import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useTemplates, createInstance, sendInstance, CATEGORY_META,
  type DeliveryChannel, type Template,
} from "@/lib/documents-store";
import { useLivePatients } from "@/lib/patients-store";
import { CategoryChip, PaperThumbnail } from "@/components/practice/documents/primitives";
import { ArrowLeft, Send, Eye } from "lucide-react";

const searchSchema = z.object({ template: z.string().optional(), patient: z.string().optional() });

export const Route = createFileRoute("/documents/new")({
  head: () => ({ meta: [{ title: "Send a document — PeaceCode" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: SendFlow,
});

function SendFlow() {
  const templates = useTemplates();
  const patients = useLivePatients();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [tplId, setTplId] = useState<string | undefined>(search.template ?? templates[0]?.id);
  const [pid, setPid] = useState<string | undefined>(search.patient ?? patients[0]?.id);
  const [channel, setChannel] = useState<DeliveryChannel>("portal");
  const [note, setNote] = useState<string>("");
  const [schedule, setSchedule] = useState<"now" | "before-session" | "on-discharge">("now");

  const tpl = useMemo(() => templates.find((t) => t.id === tplId), [templates, tplId]);
  const pat = useMemo(() => patients.find((p) => p.id === pid), [patients, pid]);

  const send = () => {
    if (!tpl || !pat) return;
    const inst = createInstance({ templateId: tpl.id, patientId: pat.id, patientName: pat.fullName, channel, coveringNote: note });
    sendInstance(inst.id);
    navigate({ to: "/documents/$id", params: { id: inst.id } });
  };

  return (
    <AppShell crumb="Send document">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/documents" className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] mb-4"
          style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <ArrowLeft className="w-3 h-3" /> Library
        </Link>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: palette.ink, lineHeight: 1.1 }}>Send a document</h1>
        <p className="mt-2 text-[13.5px]" style={{ color: palette.muted }}>
          Choose a template and a patient. A signing link is generated and delivered on your channel of choice.
        </p>

        <div className="mt-8 grid lg:grid-cols-[1fr_1fr] gap-8">
          {/* Left: form */}
          <div className="space-y-6">
            <Section title="Template">
              <select value={tplId} onChange={(e) => setTplId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-[13px]"
                style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{CATEGORY_META[t.category].label} · {t.name}</option>
                ))}
              </select>
              {tpl && <p className="mt-2 text-[12.5px]" style={{ color: palette.muted }}>{tpl.description}</p>}
            </Section>

            <Section title="Patient">
              <select value={pid} onChange={(e) => setPid(e.target.value)}
                className="w-full h-10 px-3 rounded-lg text-[13px]"
                style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} — {p.college}</option>)}
              </select>
            </Section>

            <Section title="Covering note (optional)">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
                placeholder="A short note that appears above the document…"
                className="w-full p-3 rounded-lg text-[13px] outline-none resize-none"
                style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'Fraunces', serif" }} />
            </Section>

            <Section title="Delivery channel">
              <div className="grid grid-cols-3 gap-2">
                {(["portal", "email", "sms"] as DeliveryChannel[]).map((ch) => {
                  const on = channel === ch;
                  return (
                    <button key={ch} onClick={() => setChannel(ch)}
                      className="h-16 rounded-xl text-left px-3 transition-colors"
                      style={{
                        background: on ? palette.soft : "#fff",
                        border: `1px solid ${on ? palette.primary : palette.border}`,
                        color: on ? palette.primary : palette.ink,
                      }}>
                      <div className="uppercase text-[10px] tracking-[0.18em]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                        {ch === "portal" ? "Portal" : ch === "email" ? "Email" : "SMS"}
                      </div>
                      <div className="text-[12px] mt-1" style={{ color: on ? palette.primary : palette.muted }}>
                        {ch === "portal" ? "In their client portal" : ch === "email" ? "Signing link by email" : "Signing link by SMS"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="When">
              <div className="flex flex-wrap gap-2">
                {[
                  { k: "now" as const, label: "Send now" },
                  { k: "before-session" as const, label: "Before next session" },
                  { k: "on-discharge" as const, label: "On discharge" },
                ].map((opt) => {
                  const on = schedule === opt.k;
                  return (
                    <button key={opt.k} onClick={() => setSchedule(opt.k)}
                      className="h-9 px-3 rounded-full text-[12px]"
                      style={{
                        background: on ? palette.ink : "#fff",
                        color: on ? "#fff" : palette.ink,
                        border: `1px solid ${on ? palette.ink : palette.border}`,
                      }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {tpl && (
                <p className="mt-3 text-[11.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  Link expires in {tpl.expirationDays} days · retained {tpl.retentionDays} days
                </p>
              )}
            </Section>

            <div className="flex justify-end gap-2 pt-4">
              <Link to="/documents" className="h-10 px-4 rounded-full flex items-center text-[12.5px]"
                style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}>
                Cancel
              </Link>
              <button onClick={send} disabled={!tpl || !pat}
                className="h-10 px-5 rounded-full text-white text-[12.5px] flex items-center gap-1.5 disabled:opacity-40"
                style={{ background: palette.primary }}>
                <Send className="w-3.5 h-3.5" /> Send document
              </button>
            </div>
          </div>

          {/* Right: preview */}
          <div>
            <div className="uppercase mb-3" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
              <Eye className="w-3 h-3 inline mr-1 -mt-0.5" /> Patient will see
            </div>
            {tpl && pat ? (
              <PatientPreview tpl={tpl} patientName={pat.fullName} note={note} />
            ) : (
              <div className="text-[13px] p-10 rounded-xl text-center" style={{ background: "#FCF9FA", border: `1px dashed ${palette.border}`, color: palette.muted }}>
                Pick a template and patient to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2"
        style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{title}</div>
      {children}
    </div>
  );
}

function PatientPreview({ tpl, patientName, note }: { tpl: Template; patientName: string; note: string }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
      <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: palette.border }}>
        <div className="uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 9.5, letterSpacing: "0.18em", color: palette.muted }}>
          From Dr. Sharma — for {patientName.split(" ")[0]}
        </div>
        <div className="mt-1" style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink }}>{tpl.name}</div>
        {note && <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: palette.ink, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>{note}</p>}
      </div>
      <div className="p-6 space-y-3 max-h-[420px] overflow-y-auto">
        {tpl.blocks.slice(0, 6).map((b) => (
          <div key={b.id} className="text-[12.5px]">
            {b.type === "heading"
              ? <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, color: palette.ink, marginTop: 8 }}>{b.value}</div>
              : b.type === "text" || b.type === "info"
                ? <div style={{ color: palette.muted, fontFamily: "'Fraunces', serif" }}>{b.value}</div>
                : <div style={{ color: palette.ink }}>› {b.label ?? "Question"}</div>}
          </div>
        ))}
        {tpl.blocks.length > 6 && (
          <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            + {tpl.blocks.length - 6} more…
          </div>
        )}
      </div>
    </div>
  );
}
