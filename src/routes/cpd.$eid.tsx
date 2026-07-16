import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, FileText, ExternalLink, Send, ShieldCheck, Archive, History } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { getEntry, updateEntry, submitForVerification, applyToRenewal, retireEntry, useEntries, useCurrentCycle, CATEGORY_LABEL, TYPE_LABEL, FORMAT_LABEL, VERIFICATION_LABEL } from "@/lib/cpd-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/cpd/$eid")({
  component: CpdEntryDetail,
});

function CpdEntryDetail() {
  const { eid } = Route.useParams();
  const hydrated = useHydrated();
  const nav = useNavigate();
  useEntries(); // subscribe
  const cycle = useCurrentCycle();
  const [editing, setEditing] = useState(false);
  const entry = useMemo(() => (hydrated ? getEntry(eid) : undefined), [eid, hydrated]);
  const [reflection, setReflection] = useState(entry?.reflection ?? "");
  const [hours, setHours] = useState<number>(entry?.hoursClaimed ?? 0);

  if (!hydrated) return null;
  if (!entry) {
    return (
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 pb-16">
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.6)" }}>
          <p style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 20 }}>Entry not found.</p>
          <Link to="/cpd" className="inline-flex mt-4 items-center gap-1.5 text-[12px] underline" style={{ color: palette.muted }}><ArrowLeft className="h-3.5 w-3.5" />Back to ledger</Link>
        </div>
      </div>
    );
  }

  const applied = entry.appliedToRenewal === cycle?.id;

  return (
    <div className="max-w-[960px] mx-auto px-5 sm:px-8 pb-16">
      <Link to="/cpd" className="inline-flex items-center gap-1.5 text-[12px] mb-4" style={{ color: palette.muted }}><ArrowLeft className="h-3.5 w-3.5" /> Back to ledger</Link>

      <div className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)" }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{TYPE_LABEL[entry.type]} · {CATEGORY_LABEL[entry.category]}</div>
            <h1 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 28, marginTop: 4 }}>{entry.title}</h1>
            <div className="text-[12px] mt-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              {entry.provider} · {new Date(entry.startAt).toLocaleDateString()} — {new Date(entry.endAt).toLocaleDateString()} · {FORMAT_LABEL[entry.format]}
            </div>
          </div>
          <div className="text-right">
            <div style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 36 }}>{editing ? <input type="number" value={hours} step={0.5} onChange={(e) => setHours(Number(e.target.value))} className="w-20 border rounded px-2 py-1 text-right text-lg" style={{ borderColor: palette.border }} /> : `${entry.hoursClaimed}h`}</div>
            <div className="text-[11px]" style={{ color: palette.muted }}>{VERIFICATION_LABEL[entry.verification]}</div>
          </div>
        </div>

        {/* Evidence */}
        <section className="mt-8">
          <SectionHeader>Evidence</SectionHeader>
          {entry.evidence.length === 0 ? (
            <div className="text-[12px]" style={{ color: palette.muted }}>None attached yet.</div>
          ) : (
            <ul className="rounded-lg border divide-y" style={{ borderColor: palette.border, background: "#fff" }}>
              {entry.evidence.map((e) => (
                <li key={e.id} className="px-3 py-2 text-[12px] flex items-center justify-between">
                  <span className="inline-flex items-center gap-2" style={{ color: palette.ink }}>
                    {e.kind === "link" ? <ExternalLink className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                    {e.kind === "link" ? e.url : e.filename}
                  </span>
                  <span style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }} title="tamper-detection hash">
                    {e.kind} · #{e.hash?.slice(0, 6) ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Reflection */}
        <section className="mt-8">
          <SectionHeader>Reflection</SectionHeader>
          {editing ? (
            <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={5} className="w-full rounded-lg border p-3 text-[13px]" style={{ borderColor: palette.border, background: "#fff", fontFamily: "'Fraunces', serif", lineHeight: 1.6 }} />
          ) : (
            <p style={{ fontFamily: "'Fraunces', serif", color: entry.reflection ? palette.ink : palette.muted, fontSize: 15, lineHeight: 1.7 }}>
              {entry.reflection || "No reflection recorded — regulators may ask for one before this counts."}
            </p>
          )}
        </section>

        {/* Version history */}
        <section className="mt-8">
          <SectionHeader>Version history</SectionHeader>
          <ul className="text-[12px] space-y-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            {entry.versions.map((v, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <History className="h-3 w-3" />
                <span>{new Date(v.at).toLocaleString()}</span>
                <span>·</span>
                <span>{v.who}</span>
                <span>·</span>
                <span>{v.note}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t" style={{ borderColor: palette.border }}>
          {editing ? (
            <>
              <button
                onClick={() => { updateEntry(entry.id, { reflection: reflection.trim(), hoursClaimed: hours }); setEditing(false); }}
                className="rounded-full px-3 py-2 text-[12px]"
                style={{ background: palette.ink, color: "#fff" }}
              >Save changes</button>
              <button onClick={() => setEditing(false)} className="rounded-full px-3 py-2 text-[12px]" style={{ background: "transparent", color: palette.muted }}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="rounded-full px-3 py-2 text-[12px] border" style={{ borderColor: palette.border, color: palette.ink }}>Edit</button>
              {entry.verification === "self" && (
                <button onClick={() => submitForVerification(entry.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px]" style={{ background: palette.primary, color: "#fff" }}><Send className="h-3.5 w-3.5" />Submit for verification</button>
              )}
              {cycle && !applied && (
                <button onClick={() => applyToRenewal(entry.id, cycle.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] border" style={{ borderColor: palette.border, color: palette.ink }}><ShieldCheck className="h-3.5 w-3.5" />Apply to current renewal</button>
              )}
              {applied && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px]" style={{ background: "#E4EFE0", color: "#3E6A2E" }}><ShieldCheck className="h-3.5 w-3.5" />Applied to {cycle?.bodyLabel}</span>
              )}
              <button onClick={() => { retireEntry(entry.id); void nav({ to: "/cpd" }); }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] ml-auto" style={{ color: "#B85C4A" }}><Archive className="h-3.5 w-3.5" />Retire</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{children}</div>
  );
}
