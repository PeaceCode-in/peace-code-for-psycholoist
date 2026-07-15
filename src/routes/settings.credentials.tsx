import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, Select } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/settings/credentials")({
  component: () => {
    const [s, set] = usePractice();
    const verified = s.credentials.verified;
    return (
      <>
        <PageHeader title="Credentials" description="Only verified psychologists can accept patients on PeaceCode." />
        <Section title="Verification status">
          <Row label={verified ? "License verified" : "Verification pending"}
               hint={verified ? "You can accept patients." : "Usually within 24 hours of signup."}
               action={verified
                 ? <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full" style={{ background: "#E7F6EC", color: "#1F7A3E" }}><ShieldCheck className="w-3 h-3" /> Verified</span>
                 : <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full" style={{ background: palette.soft, color: palette.primary }}><ShieldAlert className="w-3 h-3" /> Pending</span>} />
        </Section>
        <Section title="Registration">
          <Row label="Regulator"><div className="mt-2"><Select value={s.credentials.regulator} onChange={(v) => set((p) => ({ ...p, credentials: { ...p.credentials, regulator: v } }))} options={[{ value: "RCI", label: "RCI (India)" }, { value: "APA", label: "APA (US)" }, { value: "HCPC", label: "HCPC (UK)" }, { value: "Other", label: "Other" }]} /></div></Row>
          <Row label="License number"><div className="mt-2 max-w-xs"><TextField value={s.credentials.licenseNumber} onChange={(v) => set((p) => ({ ...p, credentials: { ...p.credentials, licenseNumber: v } }))} /></div></Row>
          <Row label="Degree"><div className="mt-2 max-w-md"><TextField value={s.credentials.degree} onChange={(v) => set((p) => ({ ...p, credentials: { ...p.credentials, degree: v } }))} /></div></Row>
          <Row label="Years of experience"><div className="mt-2 max-w-[120px]"><TextField type="number" value={String(s.credentials.yearsExperience)} onChange={(v) => set((p) => ({ ...p, credentials: { ...p.credentials, yearsExperience: Number(v) || 0 } }))} /></div></Row>
          <Row label="Specializations" hint="Comma separated"><div className="mt-2"><TextField value={s.credentials.specializations} onChange={(v) => set((p) => ({ ...p, credentials: { ...p.credentials, specializations: v } }))} /></div></Row>
        </Section>
      </>
    );
  },
});
