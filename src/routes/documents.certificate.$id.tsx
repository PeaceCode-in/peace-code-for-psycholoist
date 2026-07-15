import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useInstance, absTime } from "@/lib/documents-store";
import { ArrowLeft, Shield, Printer } from "lucide-react";

export const Route = createFileRoute("/documents/certificate/$id")({
  head: () => ({ meta: [{ title: "Signature Certificate — PeaceCode" }, { name: "robots", content: "noindex" }] }),
  component: CertificatePage,
});

function CertificatePage() {
  const { id } = Route.useParams();
  const inst = useInstance(id);
  if (!inst || !inst.certificate) {
    return (
      <AppShell crumb="Certificate">
        <div className="max-w-md mx-auto py-16 text-center">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: palette.ink }}>No certificate available</div>
          <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>A certificate is created only after a document is signed.</p>
          <Link to="/documents/$id" params={{ id }} className="mt-4 inline-block text-[13px]" style={{ color: palette.primary }}>Back to document</Link>
        </div>
      </AppShell>
    );
  }
  const cert = inst.certificate;
  return (
    <AppShell crumb="Certificate">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/documents/$id" params={{ id }} className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em]"
            style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <ArrowLeft className="w-3 h-3" /> Document
          </Link>
          <button onClick={() => window.print()} className="h-9 px-3 rounded-full text-[12px] flex items-center gap-1.5"
            style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink }}>
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1px solid ${palette.border}`, boxShadow: "0 20px 60px -30px rgba(30,20,24,0.16)" }}>
          <div className="px-10 py-8 border-b flex items-center justify-between" style={{ borderColor: palette.border, background: "linear-gradient(180deg,#FCF9FA,#FFFFFF)" }}>
            <div>
              <div className="uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.22em", color: palette.muted }}>
                Signature Certificate
              </div>
              <div className="mt-1" style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: palette.ink, letterSpacing: "-0.01em" }}>
                {inst.templateName}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: palette.muted }}>
                Issued by PeaceCode · Practice
              </div>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: palette.soft, color: palette.primary }}>
              <Shield className="w-7 h-7" />
            </div>
          </div>

          <div className="px-10 py-8 space-y-6">
            <Row label="Document">{inst.templateName} · v{inst.version}</Row>
            <Row label="Document ID"><Mono>{inst.id}</Mono></Row>
            <Row label="Document hash (SHA-256)"><Mono>{cert.documentHash}</Mono></Row>

            <div className="border-t pt-6" style={{ borderColor: palette.border }} />

            <Row label="Signer">{cert.signerName}</Row>
            <Row label="Signer email"><Mono>{cert.signerEmail}</Mono></Row>
            <Row label="Signed at"><Mono>{absTime(cert.signedAt)}</Mono></Row>
            <Row label="IP address"><Mono>{cert.ip}</Mono></Row>
            <Row label="User agent"><Mono>{cert.userAgent}</Mono></Row>

            <div className="border-t pt-6" style={{ borderColor: palette.border }} />

            <div>
              <div className="text-[10.5px] uppercase tracking-[0.18em] mb-1.5"
                style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                Consent
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>
                {cert.consentText}
              </p>
            </div>

            <div>
              <div className="text-[10.5px] uppercase tracking-[0.18em] mb-1.5"
                style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                Jurisdiction
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: palette.ink }}>
                {cert.jurisdiction === "IN-IT-2000"
                  ? "This electronic signature is executed under the Information Technology Act, 2000 (India), Sections 3 and 5, and is legally recognized as equivalent to a wet-ink signature for the purposes of Section 10A."
                  : "This electronic signature is executed under the Electronic Signatures in Global and National Commerce Act (ESIGN, 15 U.S.C. §7001) and is legally recognized as equivalent to a wet-ink signature."}
              </p>
            </div>
          </div>

          <div className="px-10 py-5 border-t text-[10.5px] uppercase tracking-[0.18em] flex items-center justify-between"
            style={{ borderColor: palette.border, background: "#FCF9FA", color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            <span>Certificate ID · {cert.id}</span>
            <span>Generated by PeaceCode e-Signature v1.0</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 items-baseline">
      <div className="text-[10.5px] uppercase tracking-[0.16em]"
        style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="text-[13px]" style={{ color: palette.ink }}>{children}</div>
    </div>
  );
}
function Mono({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{children}</span>;
}
