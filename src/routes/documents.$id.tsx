import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import {
  useInstance, useTemplate, voidInstance, amendInstance, archiveInstance,
  countersignInstance, logDownload, absTime, relTime, retentionRemaining,
  type Block,
} from "@/lib/documents-store";
import { StatusPill, CategoryChip, AuditIcon } from "@/components/practice/documents/primitives";
import { ArrowLeft, Download, Printer, RotateCcw, Ban, GitBranch, Shield, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/documents/$id")({
  head: () => ({ meta: [{ title: "Document — PeaceCode" }, { name: "robots", content: "noindex" }] }),
  component: DocumentDetail,
});

function DocumentDetail() {
  const { id } = Route.useParams();
  const inst = useInstance(id);
  const tpl = useTemplate(inst?.templateId);
  const navigate = useNavigate();
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");

  if (!inst) {
    return (
      <AppShell crumb="Document">
        <div className="max-w-lg mx-auto py-16 text-center">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink }}>Document not found</div>
          <Link to="/documents" className="mt-4 inline-block text-[13px]" style={{ color: palette.primary }}>Back to library</Link>
        </div>
      </AppShell>
    );
  }

  const doDownload = () => { logDownload(inst.id); window.print(); };
  const doAmend = () => { const c = amendInstance(inst.id); if (c) navigate({ to: "/documents/$id", params: { id: c.id } }); };
  const doVoid = () => { if (!voidReason.trim()) return; voidInstance(inst.id, voidReason.trim()); setVoidOpen(false); };

  return (
    <AppShell crumb="Document">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/documents" className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] mb-4"
          style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <ArrowLeft className="w-3 h-3" /> Library
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <CategoryChip category={inst.category} />
              <StatusPill status={inst.status} />
              {inst.version > 1 && (
                <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-[2px] rounded-full"
                  style={{ background: palette.surface2, color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  version {inst.version}
                </span>
              )}
              {inst.supersededById && (
                <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-[2px] rounded-full"
                  style={{ background: "#F1D6E0", color: palette.primary, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  superseded
                </span>
              )}
            </div>
            <h1 className="mt-2" style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: palette.ink, lineHeight: 1.1 }}>
              {inst.templateName}
            </h1>
            <div className="mt-1 text-[13px]" style={{ color: palette.muted }}>
              For <Link to="/patients/$pid" params={{ pid: inst.patientId }} style={{ color: palette.ink }}>{inst.patientName}</Link>
              {" · "}sent {relTime(inst.sentAt ?? inst.createdAt)}
              {tpl && <>{" · retention "}<span style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{retentionRemaining(inst.createdAt, tpl.retentionDays)}</span></>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={doDownload} className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
              style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}>
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button onClick={() => window.print()} className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
              style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}>
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            {inst.status === "sent" || inst.status === "viewed" ? (
              <button onClick={() => {
                const url = `${window.location.origin}/portal/documents/${inst.token}`;
                navigator.clipboard.writeText(url);
                toast("Signing link copied to clipboard.");
              }} className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
                style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}>
                <ExternalLink className="w-3.5 h-3.5" /> Copy signing link
              </button>
            ) : null}
            {inst.status === "signed" && !inst.countersignedAt && tpl?.requiredSigners.includes("therapist") && (
              <button onClick={() => countersignInstance(inst.id)} className="h-9 px-3 rounded-full text-[12px] text-white flex items-center gap-1.5"
                style={{ background: palette.primary }}>
                Countersign
              </button>
            )}
            <button onClick={doAmend} className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
              style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink }}>
              <GitBranch className="w-3.5 h-3.5" /> Amend
            </button>
            {inst.status !== "voided" && (
              <button onClick={() => setVoidOpen(true)} className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
                style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.primary }}>
                <Ban className="w-3.5 h-3.5" /> Void
              </button>
            )}
            {inst.status !== "archived" && (
              <button onClick={() => archiveInstance(inst.id)} className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
                style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.muted }}>
                Archive
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Rendered document */}
          <article className="rounded-2xl p-8 sm:p-12" style={{ background: palette.solid, border: `1px solid ${palette.border}`, boxShadow: "0 20px 60px -30px rgba(30,20,24,0.14)" }}>
            {inst.blocks.map((b) => <RenderedBlock key={b.id} b={b} />)}
            {inst.certificate && (
              <div className="mt-10 pt-6 border-t" style={{ borderColor: palette.border }}>
                <Link to="/documents/certificate/$id" params={{ id: inst.id }}
                  className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: palette.primary }}>
                  <Shield className="w-3.5 h-3.5" /> View signature certificate
                </Link>
              </div>
            )}
          </article>

          {/* Audit trail */}
          <aside className="rounded-2xl p-5 self-start" style={{ background: "#FCF9FA", border: `1px solid ${palette.border}` }}>
            <div className="uppercase mb-3" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
              Audit trail
            </div>
            <ol className="space-y-3">
              {inst.audit.map((e) => (
                <li key={e.id} className="flex gap-2.5">
                  <AuditIcon action={e.action} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px]" style={{ color: palette.ink }}>
                      <span style={{ fontFamily: "'Fraunces', serif" }}>{titleFor(e.action)}</span>
                      <span className="text-[11.5px]" style={{ color: palette.muted }}> · {e.actor}</span>
                    </div>
                    <div className="text-[10.5px] tabular-nums" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                      {absTime(e.at)}
                    </div>
                    {e.detail && <div className="text-[11.5px] mt-0.5" style={{ color: palette.muted }}>{e.detail}</div>}
                    {e.meta?.ip && (
                      <div className="text-[10px] mt-0.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                        {e.meta.ip} · {e.meta.userAgent?.split(" ")[0]}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>

      {voidOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setVoidOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative rounded-2xl w-full max-w-md p-6" style={{ background: palette.solid, border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: palette.ink }}>Void this document?</div>
            <p className="mt-2 text-[12.5px]" style={{ color: palette.muted }}>The document remains in the audit trail. Voiding is permanent.</p>
            <textarea value={voidReason} onChange={(e) => setVoidReason(e.target.value)} rows={3}
              placeholder="Reason (required)…"
              className="mt-4 w-full p-3 rounded-lg text-[13px] outline-none resize-none"
              style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }} />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setVoidOpen(false)} className="h-9 px-3 rounded-full text-[12px]"
                style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}>Cancel</button>
              <button onClick={doVoid} className="h-9 px-3 rounded-full text-white text-[12px]"
                style={{ background: palette.primary }}>Void document</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function titleFor(action: string): string {
  return ({
    created: "Created", sent: "Sent", delivered: "Delivered", viewed: "Viewed",
    signed: "Signed", countersigned: "Countersigned by therapist",
    downloaded: "Downloaded", voided: "Voided", amended: "Amended",
    expired: "Expired", archived: "Archived",
  } as Record<string, string>)[action] ?? action;
}

function RenderedBlock({ b }: { b: Block }) {
  const answer = b.answer;
  if (b.type === "heading") return <h3 className="mt-6 mb-2" style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: palette.ink }}>{b.value}</h3>;
  if (b.type === "text") return <p className="text-[14px] leading-relaxed mb-3" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{b.value}</p>;
  if (b.type === "info") return (
    <div className="my-3 rounded-lg p-3 text-[12.5px]" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}>
      {b.value}
    </div>
  );
  if (b.type === "signature") {
    return (
      <div className="my-4">
        <div className="text-[11px] uppercase tracking-[0.16em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          {b.label ?? "Signature"} · {b.signerRole}
        </div>
        <div className="rounded-lg p-3 flex items-end justify-between"
          style={{ background: "linear-gradient(180deg,#FEFCFB,#F7F3F4)", border: `1px solid ${palette.border}`, minHeight: 96 }}>
          {b.signatureImage ? (
            <img src={b.signatureImage} alt="signature" style={{ maxHeight: 72 }} />
          ) : b.signatureTypedAs ? (
            <span style={{ fontFamily: "'Caveat', 'Homemade Apple', cursive", fontSize: 32, color: palette.ink }}>
              {b.signatureTypedAs}
            </span>
          ) : (
            <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Awaiting signature</span>
          )}
          {b.signedAt && (
            <span className="tabular-nums text-[10px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", color: palette.muted }}>
              {absTime(b.signedAt)}
            </span>
          )}
        </div>
      </div>
    );
  }
  if (b.type === "initials") {
    return (
      <div className="my-3 flex items-center gap-3">
        <span className="w-14 h-10 rounded-md flex items-center justify-center text-[14px]"
          style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'Caveat', cursive" }}>
          {typeof answer === "string" ? answer : ""}
        </span>
        <span className="text-[12.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{b.label}</span>
      </div>
    );
  }
  return (
    <div className="my-3">
      <div className="text-[12.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{b.label}</div>
      <div className="mt-1 text-[13px]" style={{ color: palette.muted }}>
        {Array.isArray(answer) ? answer.join(", ") : answer ? String(answer) : <span className="italic">— not answered —</span>}
      </div>
    </div>
  );
}
