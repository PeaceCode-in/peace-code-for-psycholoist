import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, TextArea, PrimaryButton, GhostButton } from "@/components/settings/primitives";
import { palette } from "@/components/practice/palette";
import { usePersisted } from "@/lib/practice-settings";

export const Route = createFileRoute("/settings/support")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Support — Settings" }] }),
  component: SupportPage,
});

interface Ticket { id: string; kind: "bug" | "feature" | "question"; subject: string; body: string; createdAt: string; status: "open" | "sent" }

function SupportPage() {
  const [tickets, setTickets] = usePersisted<Ticket[]>("support-tickets", []);
  const [kind, setKind] = useState<Ticket["kind"]>("bug");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!subject.trim() || !body.trim()) { toast.error("Add a subject and details"); return; }
    const t: Ticket = { id: `t-${Date.now()}`, kind, subject: subject.trim(), body: body.trim(), createdAt: new Date().toISOString(), status: "sent" };
    setTickets((p) => [t, ...p]);
    const mail = `mailto:support@peacecode.in?subject=${encodeURIComponent(`[${kind.toUpperCase()}] ${subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mail;
    setSubject(""); setBody("");
    toast.success("Ticket logged", { description: "Your mail client opened with the message pre-filled." });
  };

  return (
    <>
      <PageHeader title="Support" description="Contact PeaceCode, submit a bug, request a feature." />

      <Section title="Talk to us">
        <Row label="Contact us" hint="support@peacecode.in · 2 business days"
          action={<GhostButton onClick={() => { window.location.href = "mailto:support@peacecode.in"; }}>Open mail</GhostButton>} />
        <Row label="Status page" hint="Uptime, incident history, planned maintenance."
          action={<GhostButton onClick={() => window.open("https://status.peacecode.in", "_blank", "noopener")}>Open status</GhostButton>} />
      </Section>

      <Section title="Submit a message">
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            {(["bug", "feature", "question"] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)} className="px-3 py-1.5 rounded-full text-[12px] capitalize"
                style={{ background: kind === k ? palette.primary : palette.surface2, color: kind === k ? "#fff" : palette.ink, border: `1px solid ${palette.border}` }}>
                {k}
              </button>
            ))}
          </div>
          <TextField value={subject} onChange={setSubject} placeholder="Subject" />
          <TextArea value={body} onChange={setBody} placeholder="What happened? What did you expect?" rows={5} />
          <div className="flex justify-end"><PrimaryButton onClick={submit}>Send</PrimaryButton></div>
        </div>
      </Section>

      {tickets.length > 0 && (
        <Section title="Recent tickets">
          <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
            {tickets.map((t) => (
              <div key={t.id} className="rounded-xl px-3 py-2 flex items-start justify-between gap-3" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
                <div className="min-w-0">
                  <div className="text-[12.5px] truncate" style={{ color: palette.ink }}>
                    <span className="uppercase text-[10px] mr-2" style={{ color: palette.primary, fontFamily: "'DM Mono', monospace" }}>{t.kind}</span>
                    {t.subject}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: palette.muted }}>{new Date(t.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={() => { setTickets((p) => p.filter((x) => x.id !== t.id)); toast.success("Dismissed"); }}
                  className="text-[11px]" style={{ color: palette.muted }}>Dismiss</button>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
