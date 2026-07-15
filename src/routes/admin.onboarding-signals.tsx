// Internal-only surface: aggregated onboarding signals per session.
import { createFileRoute } from "@tanstack/react-router";
import { STEPS, getOnboarding } from "@/lib/onboarding-store";
import { palette } from "@/components/practice/palette";

export const Route = createFileRoute("/admin/onboarding-signals")({
  head: () => ({ meta: [{ title: "Onboarding signals · PeaceCode Admin" }, { name: "robots", content: "noindex" }] }),
  component: OnboardingSignals,
});

function OnboardingSignals() {
  const s = getOnboarding();
  const perStep = STEPS.map((st) => {
    const p = s.progress[st.id];
    const enters = s.signalLog.filter((x) => x.step === st.id && x.action === "enter").length;
    const completes = s.signalLog.filter((x) => x.step === st.id && x.action === "complete").length;
    const skips = s.signalLog.filter((x) => x.step === st.id && x.action === "skip").length;
    return { id: st.id, label: st.label, status: p?.status ?? "pending", ms: p?.ms ?? 0, enters, completes, skips };
  });

  return (
    <div style={{ background: "#0F1116", color: "#E6E6EA", minHeight: "100vh", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div style={{ color: "#7A8090", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}>PeaceCode · Internal</div>
        <h1 className="mt-2 text-[26px]" style={{ fontFamily: "'Fraunces', serif" }}>Onboarding signals</h1>
        <p className="mt-1 text-[12.5px]" style={{ color: "#7A8090" }}>Local-session view. No PII. Per-step dwell, completion, and skip.</p>

        <div className="mt-8 grid grid-cols-4 gap-3">
          <Kpi label="Started" value={s.startedAt ? new Date(s.startedAt).toLocaleString() : "—"} />
          <Kpi label="Completed" value={s.completedAt ? new Date(s.completedAt).toLocaleString() : "in-progress"} />
          <Kpi label="Sample data" value={s.sampleDataMode ? "on" : "off"} />
          <Kpi label="Practice type" value={s.practice.kind} />
        </div>

        <div className="mt-10 rounded-2xl" style={{ background: "#151821", border: "1px solid #24283A" }}>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ color: "#7A8090", borderBottom: "1px solid #24283A" }}>
                {["Step","Status","Dwell","Enters","Completes","Skips"].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perStep.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #1D202C" }}>
                  <td className="px-5 py-3" style={{ fontFamily: "'Fraunces', serif", fontSize: 14 }}>{row.label}</td>
                  <td className="px-5 py-3" style={{ color: row.status === "done" ? "#7BC49B" : row.status === "skipped" ? "#D4B27B" : "#7A8090" }}>{row.status}</td>
                  <td className="px-5 py-3">{row.ms ? `${Math.round(row.ms / 1000)}s` : "—"}</td>
                  <td className="px-5 py-3">{row.enters}</td>
                  <td className="px-5 py-3">{row.completes}</td>
                  <td className="px-5 py-3">{row.skips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 rounded-2xl p-5" style={{ background: "#151821", border: "1px solid #24283A" }}>
          <div style={{ color: "#7A8090", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Signal log (last {s.signalLog.length})</div>
          <div className="mt-3 max-h-64 overflow-auto text-[12px] space-y-1">
            {s.signalLog.slice().reverse().map((e, i) => (
              <div key={i} style={{ color: "#B6BACB" }}>
                <span style={{ color: palette.primary }}>{e.action.padEnd(9)}</span>
                <span> {e.step.padEnd(16)}</span>
                <span style={{ color: "#7A8090" }}> {new Date(e.at).toLocaleTimeString()}</span>
              </div>
            ))}
            {s.signalLog.length === 0 && <div style={{ color: "#7A8090" }}>No signals recorded yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#151821", border: "1px solid #24283A" }}>
      <div style={{ color: "#7A8090", fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" }}>{label}</div>
      <div className="mt-1.5 text-[15px]" style={{ fontFamily: "'Fraunces', serif" }}>{value}</div>
    </div>
  );
}
