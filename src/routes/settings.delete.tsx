import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, Toggle, DangerButton, GhostButton } from "@/components/settings/primitives";
import { usePersisted } from "@/lib/practice-settings";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/settings/delete")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }, { title: "Deactivate or delete — Settings" }] }),
  component: DeletePage,
});

interface AccountFlags {
  deactivated: boolean;
  deletionScheduledAt: string | null;
}
const DEFAULT: AccountFlags = { deactivated: false, deletionScheduledAt: null };

function DeletePage() {
  const [flags, setFlags] = usePersisted<AccountFlags>("account-flags", DEFAULT);
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const requestDelete = () => {
    if (confirm.trim().toUpperCase() !== "DELETE") {
      toast.error("Type DELETE to confirm");
      return;
    }
    const when = new Date(); when.setDate(when.getDate() + 30);
    setFlags((p) => ({ ...p, deletionScheduledAt: when.toISOString() }));
    toast.success("Deletion scheduled", { description: `Your account will be permanently deleted on ${when.toLocaleDateString()}. Cancel anytime before then.` });
    setConfirm("");
  };

  return (
    <>
      <PageHeader title="Deactivate or delete" description="Deactivate practice or delete account with 30-day grace and patient transfer flow." />

      <Section title="Deactivate practice" hint="Pause bookings without touching any data. Reverse anytime.">
        <Row label={flags.deactivated ? "Practice deactivated" : "Active"} hint={flags.deactivated ? "New bookings blocked. Existing sessions still visible." : "You appear in search and accept new bookings."}
          action={<Toggle checked={flags.deactivated}
            onChange={(v) => { setFlags((p) => ({ ...p, deactivated: v })); toast.success(v ? "Practice deactivated" : "Practice re-activated"); }} />} />
      </Section>

      <Section title="Delete account" hint="30-day grace period · patient transfer required before permanent deletion.">
        {flags.deletionScheduledAt ? (
          <div className="p-5 space-y-3">
            <div className="rounded-xl p-4" style={{ background: "#FCE8EC", border: "1px solid #F1C7D0", color: "#8A2E3E" }}>
              <div className="text-[13px] font-medium">Scheduled for deletion</div>
              <div className="text-[12px] mt-1">Your account and all data will be permanently deleted on {new Date(flags.deletionScheduledAt).toLocaleDateString()}.</div>
            </div>
            <div className="flex justify-end">
              <GhostButton onClick={() => { setFlags((p) => ({ ...p, deletionScheduledAt: null })); toast.success("Deletion cancelled"); }}>Cancel deletion</GhostButton>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <ul className="text-[12.5px] space-y-1.5" style={{ color: palette.muted }}>
              <li>· Transfer active patients to another clinician before proceeding.</li>
              <li>· A final export is emailed to you within 24 hours.</li>
              <li>· 30-day grace period — cancel any time before then.</li>
            </ul>
            <button onClick={() => navigate({ to: "/settings/data" })}
              className="text-[12px] underline underline-offset-2" style={{ color: palette.primary }}>
              Export your data first →
            </button>
            <div className="flex items-center gap-2 pt-2">
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type DELETE to confirm"
                className="flex-1 text-[13px] px-3 py-2 rounded-xl outline-none"
                style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }} />
              <DangerButton onClick={requestDelete}>Delete account</DangerButton>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
