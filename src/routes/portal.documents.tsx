import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileSignature, FileText } from "lucide-react";
import { PortalShell, Card, Chip, portal } from "@/components/portal/PortalShell";
import { fmtDateWarm, signDocument, useCurrentClient, useMyDocuments } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/documents")({
  head: () => ({ meta: [{ title: "Documents" }, { name: "robots", content: "noindex" }] }),
  component: Documents,
});

function Documents() {
  const documents = useMyDocuments();
  const client = useCurrentClient();
  const [signing, setSigning] = useState<string | null>(null);
  const [name, setName] = useState(client ? `${client.firstName} ${client.lastName}` : "");

  const needSign = documents.filter(d => d.requiresSignature && !d.signedAt);
  const rest = documents.filter(d => !(d.requiresSignature && !d.signedAt));

  return (
    <PortalShell title="Documents" subtitle="Forms, consents, and anything your therapist has shared with you.">
      {needSign.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Needs your signature</h2>
          <div className="flex flex-col gap-3">
            {needSign.map(d => (
              <Card key={d.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full" style={{ background: portal.soft, color: portal.roseDeep }}>
                      <FileSignature className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <div>
                      <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>{d.title}</p>
                      <p className="text-[13px]" style={{ color: portal.muted }}>Shared {fmtDateWarm(d.sharedAt).toLowerCase()}</p>
                    </div>
                  </div>
                  <button onClick={() => setSigning(d.id)} className="rounded-full px-4 py-2 text-[13px]" style={{ background: portal.rose, color: "#fff" }}>Review & sign</button>
                </div>
                {signing === d.id ? (
                  <div className="mt-4 rounded-xl p-4" style={{ background: "#FDF9F7", border: `1px solid ${portal.border}` }}>
                    <p className="text-[13px]" style={{ color: portal.muted }}>By typing your full name below, you confirm you've read and agree to this document.</p>
                    <input
                      value={name} onChange={e => setName(e.target.value)}
                      className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-[15px] outline-none"
                      style={{ borderColor: portal.border, fontFamily: "'Fraunces', serif" }}
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button onClick={() => setSigning(null)} className="rounded-full px-3 py-1.5 text-[13px]" style={{ color: portal.muted }}>Cancel</button>
                      <button
                        disabled={!name.trim()}
                        onClick={() => { signDocument(d.id); setSigning(null); }}
                        className="rounded-full px-3 py-1.5 text-[13px] disabled:opacity-40"
                        style={{ background: portal.rose, color: "#fff" }}
                      >Sign</button>
                    </div>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>On file</h2>
        <div className="flex flex-col gap-2">
          {rest.map(d => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-2xl p-4" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: portal.soft, color: portal.roseDeep }}>
                <FileText className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 16 }}>{d.title}</p>
                <p className="text-[12px]" style={{ color: portal.muted }}>
                  {d.signedAt ? `Signed ${fmtDateWarm(d.signedAt).toLowerCase()}` : `Shared ${fmtDateWarm(d.sharedAt).toLowerCase()}`}
                </p>
              </div>
              {d.signedAt ? <Chip tone="calm">Signed</Chip> : null}
              <button className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>
                <Download className="h-3 w-3" /> Download
              </button>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
