import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/practice/PageHeader";
import { Section, Row, TextField, Toggle, PrimaryButton, DangerButton } from "@/components/settings/primitives";
import { usePractice } from "@/lib/practice-settings-store";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/settings/services")({
  component: () => {
    const [s, set] = usePractice();
    return (
      <>
        <PageHeader title="Services & pricing" description="What you offer and what it costs (INR)." />
        <div className="space-y-4">
          {s.services.map((sv, idx) => (
            <div key={sv.id} className="rounded-2xl p-4" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1"><TextField value={sv.name} onChange={(v) => set((p) => { const arr = [...p.services]; arr[idx] = { ...arr[idx], name: v }; return { ...p, services: arr }; })} /></div>
                <Toggle checked={sv.active} onChange={(v) => set((p) => { const arr = [...p.services]; arr[idx] = { ...arr[idx], active: v }; return { ...p, services: arr }; })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: palette.muted }}>Minutes</div><TextField type="number" value={String(sv.minutes)} onChange={(v) => set((p) => { const arr = [...p.services]; arr[idx] = { ...arr[idx], minutes: Number(v) || 0 }; return { ...p, services: arr }; })} /></div>
                <div><div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: palette.muted }}>Price (₹)</div><TextField type="number" value={String(sv.priceINR)} onChange={(v) => set((p) => { const arr = [...p.services]; arr[idx] = { ...arr[idx], priceINR: Number(v) || 0 }; return { ...p, services: arr }; })} /></div>
              </div>
              <div className="mt-3 text-right">
                <DangerButton onClick={() => set((p) => ({ ...p, services: p.services.filter((x) => x.id !== sv.id) }))}>Remove</DangerButton>
              </div>
            </div>
          ))}
          <PrimaryButton onClick={() => set((p) => ({ ...p, services: [...p.services, { id: `sv-${Date.now()}`, name: "New service", minutes: 50, priceINR: 2000, active: true }] }))}>Add service</PrimaryButton>
        </div>
      </>
    );
  },
});

// Row unused but kept for consistency
void Row;
