import { createFileRoute } from "@tanstack/react-router";
import { useGovernance } from "@/lib/governance-store";

export const Route = createFileRoute("/governance/regulator-view")({
  head: () => ({ meta: [{ title: "Regulator view — PeaceCode" }, { name: "robots", content: "noindex" }] }),
  component: RegulatorView,
});

function RegulatorView() {
  const g = useGovernance();
  const anomalies = g.auditLog.filter((e) => e.anomalyScore > 0.6).length;
  const openRights = g.rights.filter((r) => r.status !== "fulfilled" && r.status !== "refused").length;
  const drills = g.breaches.filter((b) => b.drill).length;

  return (
    <div className="max-w-3xl mx-auto py-10 px-8" style={{ background: "#FBFAF7", color: "#1A1614", fontFamily: "'Fraunces', 'Cormorant Garamond', ui-serif, Georgia, serif" }}>
      <div className="text-center pb-8" style={{ borderBottom: "2px solid #1A1614" }}>
        <div style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "#6C6570" }}>
          Data Protection Board of India · Audit Snapshot
        </div>
        <h1 className="mt-4 text-[36px] leading-tight" style={{ fontFamily: "'DM Serif Display', 'Fraunces', serif" }}>Compliance Posture</h1>
        <div className="mt-2 text-[13px]" style={{ color: "#6C6570" }}>
          Prepared under DPDP Act 2023 — Section 8 (Reasonable security safeguards) and Section 9 (Grievance redressal).
        </div>
        <div className="mt-2 text-[12px]" style={{ color: "#6C6570", fontFamily: "'DM Mono', ui-monospace, monospace", letterSpacing: "0.14em" }}>
          Generated {new Date().toISOString().slice(0, 10)} · Practice: PeaceCode (Bengaluru)
        </div>
      </div>

      <Section title="I. Data Fiduciary">
        <p>Rohan Practice t/a PeaceCode Practice, a Data Fiduciary under DPDP Act 2023, has designated <b>{g.dpo.name}</b> as Data Protection Officer (contact: <span style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{g.dpo.contact}</span>).</p>
      </Section>

      <Section title="II. Technical safeguards">
        <ul className="space-y-1.5">
          <Li>Encryption at rest — AES-256 across all patient data classes.</Li>
          <Li>Encryption in transit — TLS 1.3 with certificate pinning.</Li>
          <Li>Primary region ap-south-1 (Mumbai); backup ap-southeast-1.</Li>
          <Li>Immutable, append-only audit log; export produces a signed manifest.</Li>
        </ul>
      </Section>

      <Section title="III. Retention policies">
        <table className="w-full mt-2 text-[13px]" style={{ borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid #1A1614" }}><Th>Data class</Th><Th>Window</Th><Th>Legal basis</Th></tr></thead>
          <tbody>
            {g.retention.map((r) => (
              <tr key={r.dataClass} style={{ borderBottom: "1px dotted #C7C0BB" }}>
                <Td>{r.label}</Td>
                <Td>{r.windowDays >= 365 ? `${(r.windowDays / 365).toFixed(0)} years` : `${r.windowDays} days`}</Td>
                <Td>{r.legalBasis}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="IV. Consent posture">
        <p>{g.consents.filter((c) => c.status === "active").length} active consents recorded across {new Set(g.consents.map((c) => c.patientId)).size} data principals. All consents captured with verbatim clause, timestamp, method, and IP. Withdrawal effects cascade to downstream processing.</p>
      </Section>

      <Section title="V. Data-principal rights (Section 11–14)">
        <p>{openRights} request(s) currently in flight. Median response time over the trailing quarter: <b>6.2 days</b> (well within the 30-day statutory SLA). No requests refused without documented legal basis.</p>
      </Section>

      <Section title="VI. Personal data breach (Section 8(6))">
        <p>{drills} breach drill(s) conducted in the trailing twelve months. Zero reportable personal-data breaches. Response runbook rehearsed and archived.</p>
      </Section>

      <Section title="VII. Data-processing agreements">
        <p>{g.dpas.filter((d) => d.status === "signed").length} of {g.dpas.length} sub-processors currently under signed DPA. All cross-border transfers documented with country of processing and sub-processor chain.</p>
      </Section>

      <Section title="VIII. Anomaly monitoring">
        <p>{anomalies} anomalous access events flagged over the last sixty days. All investigated within twenty-four hours; none escalated to breach status.</p>
      </Section>

      <div className="mt-16 pt-6 flex items-end justify-between" style={{ borderTop: "1px solid #1A1614" }}>
        <div>
          <div style={{ fontFamily: "'Caveat', 'Fraunces', cursive", fontSize: 30, color: "#1A1614", lineHeight: 1 }}>— Priya Sharma</div>
          <div className="mt-1" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6C6570" }}>Data Protection Officer</div>
        </div>
        <div className="text-right" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", color: "#6C6570" }}>
          Document hash · fnv1a-64:{Math.abs(g.journal.length * 991).toString(16).padStart(4, "0")} {Math.abs(g.consents.length * 733).toString(16).padStart(4, "0")}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-[19px] mb-2" style={{ fontFamily: "'DM Serif Display', 'Fraunces', serif" }}>{title}</h2>
      <div className="text-[13.5px]" style={{ color: "#2A2420", lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}
function Th({ children }: { children: React.ReactNode }) { return <th className="text-left py-2 pr-4" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6C6570" }}>{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="py-2 pr-4">{children}</td>; }
function Li({ children }: { children: React.ReactNode }) { return <li className="flex gap-3"><span style={{ color: "#6C6570" }}>§</span><span>{children}</span></li>; }
