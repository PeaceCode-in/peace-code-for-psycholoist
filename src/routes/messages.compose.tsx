import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, X, Paperclip } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { listPatients, avatarUrl } from "@/lib/patients-store";
import {
  createThread, saveDraft, getDraft, clearDraft,
  validateSubject, validateBody, validateAttachment,
  useLiveSettings, ALLOWED_MIME, type Attachment,
} from "@/lib/messages-store";
import { fmtSize } from "@/components/practice/messages/primitives";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/messages/compose")({
  head: () => ({ meta: [{ title: "Compose — Messages · PeaceCode" }] }),
  component: ComposePage,
});

function ComposePage() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const patients = useMemo(() => hydrated ? listPatients({ status: "active" }) : [], [hydrated]);
  const [patientId, setPatientId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const settings = useLiveSettings();

  useEffect(() => {
    if (!hydrated) return;
    const d = getDraft(undefined, patientId);
    if (d) { setSubject(d.subject ?? ""); setBody(d.body); }
  }, [hydrated, patientId]);

  // Autosave every 3s
  useEffect(() => {
    if (!hydrated) return;
    const t = setInterval(() => {
      if (patientId || subject || body) saveDraft({ patientId, subject, body, updatedAt: new Date().toISOString() });
    }, 3000);
    return () => clearInterval(t);
  }, [hydrated, patientId, subject, body]);

  const send = () => {
    if (!patientId) { setError("Choose a patient first"); return; }
    const sv = validateSubject(subject);
    if (!sv.ok) { setError(sv.error); return; }
    const bv = validateBody(body);
    if (!bv.ok) { setError(bv.error); return; }
    const finalBody = settings.signatureEnabled ? `${body}\n\n${settings.signature}` : body;
    const t = createThread({ patientId, subject, body: finalBody, attachments });
    clearDraft(undefined, patientId);
    navigate({ to: "/messages/$threadId", params: { threadId: t.id } });
  };

  const filtered = query
    ? patients.filter((p) => p.fullName.toLowerCase().includes(query.toLowerCase()))
    : patients.slice(0, 6);

  return (
    <AppShell>
      <div className="min-h-[calc(100dvh-32px)] py-8 px-4" style={{ background: palette.surface2 }}>
        <div className="max-w-[680px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/messages" className="flex items-center gap-1.5 text-[12px]" style={{ color: palette.muted }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to inbox
            </Link>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10.5px", color: palette.muted }}>Draft auto-saves</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "28px", color: palette.ink, marginBottom: "24px" }}>New message</h1>

          <div className="rounded-2xl p-6" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
            {/* Patient picker */}
            <div className="mb-4">
              <label className="block text-[11px] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>TO</label>
              {patientId ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}>
                  <div className="flex items-center gap-2">
                    <img src={avatarUrl(patientId)} alt="" className="w-7 h-7 rounded-full" />
                    <div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: "13.5px", color: palette.ink }}>
                        {patients.find((p) => p.id === patientId)?.fullName}
                      </div>
                      <div style={{ fontSize: "11px", color: palette.muted }}>
                        {patients.find((p) => p.id === patientId)?.primaryConcern}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setPatientId("")}><X className="w-3.5 h-3.5" style={{ color: palette.muted }} /></button>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
                    <input
                      value={query} onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search patients…" autoFocus
                      className="w-full h-9 pl-8 pr-3 text-[13px] rounded-lg outline-none"
                      style={{ background: palette.surface2, border: `1px solid ${palette.border}` }}
                    />
                  </div>
                  <div className="mt-2 max-h-[200px] overflow-y-auto rounded-lg" style={{ border: `1px solid ${palette.border}` }}>
                    {filtered.map((p) => (
                      <button key={p.id} onClick={() => setPatientId(p.id)} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-black/[0.03] text-left border-b" style={{ borderColor: palette.border }}>
                        <img src={avatarUrl(p.id)} alt="" className="w-7 h-7 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <div style={{ fontFamily: "'Fraunces', serif", fontSize: "13px", color: palette.ink }}>{p.fullName}</div>
                          <div className="truncate" style={{ fontSize: "11px", color: palette.muted }}>{p.primaryConcern}</div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded" style={{ background: palette.surface2, fontSize: "10px", fontFamily: "'DM Mono', monospace", color: palette.muted }}>{p.risk}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="block text-[11px] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>SUBJECT</label>
              <input
                value={subject} onChange={(e) => setSubject(e.target.value.slice(0, 140))}
                placeholder="A short, descriptive line…"
                className="w-full h-10 px-3 rounded-lg outline-none"
                style={{ fontFamily: "'Fraunces', serif", fontSize: "17px", color: palette.ink, background: "transparent", border: `1px solid ${palette.border}` }}
              />
            </div>

            {/* Body */}
            <div className="mb-4">
              <label className="block text-[11px] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', monospace" }}>MESSAGE</label>
              <textarea
                value={body} onChange={(e) => setBody(e.target.value.slice(0, 8000))}
                rows={10} placeholder="Write your message…"
                className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: palette.ink, background: "transparent", border: `1px solid ${palette.border}`, lineHeight: 1.55 }}
              />
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {attachments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 px-2 py-1 rounded" style={{ border: `1px solid ${palette.border}`, background: palette.surface2 }}>
                    <span style={{ fontSize: "11px", color: palette.ink }}>{a.filename}</span>
                    <span style={{ fontSize: "10px", color: palette.muted, fontFamily: "'DM Mono', monospace" }}>{fmtSize(a.sizeBytes)}</span>
                    <button onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}><X className="w-3 h-3" style={{ color: palette.muted }} /></button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="mb-3 px-3 py-2 rounded text-[12px]" style={{ background: `${palette.primary}12`, color: palette.primary, border: `1px solid ${palette.primary}30` }}>{error}</div>
            )}

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: palette.border }}>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-1.5 text-[12px]" style={{ color: palette.muted }}>
                  <Paperclip className="w-3.5 h-3.5" /> Attach
                  <input type="file" hidden accept={ALLOWED_MIME.join(",")} multiple onChange={(e) => {
                    for (const f of Array.from(e.target.files ?? [])) {
                      const c = validateAttachment({ filename: f.name, sizeBytes: f.size, mimeType: f.type || "application/octet-stream" });
                      if (!c.ok) { setError(`${f.name}: ${c.error}`); continue; }
                      setAttachments((prev) => [...prev, {
                        id: `att_${Math.random().toString(36).slice(2, 8)}`,
                        filename: f.name.slice(0, 200), sizeBytes: f.size,
                        mimeType: f.type || "application/octet-stream", uploadedAt: new Date().toISOString(),
                      }]);
                    }
                  }} />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { clearDraft(undefined, patientId); setPatientId(""); setSubject(""); setBody(""); setAttachments([]); }} className="h-8 px-3 rounded-full text-[12px]" style={{ color: palette.muted }}>Discard</button>
                <button onClick={send} className="h-8 px-4 rounded-full text-white text-[12px]" style={{ background: palette.primary }}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
