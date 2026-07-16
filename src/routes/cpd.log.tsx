import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Upload, Sparkles, Link as LinkIcon, Check } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { createEntry, parseCertificate, CATEGORY_LABEL, TYPE_LABEL, FORMAT_LABEL, type CpdCategory, type CpdType, type CpdFormat, type Evidence } from "@/lib/cpd-store";

export const Route = createFileRoute("/cpd/log")({
  component: CpdLog,
});

const REFLECTION_TEMPLATE = "One thing I understood differently after this training was ___. In my next 3 sessions I will try ___. I noticed this because ___.";

function CpdLog() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<CpdType>("workshop");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [hours, setHours] = useState<number>(1);
  const [category, setCategory] = useState<CpdCategory>("clinical");
  const [format, setFormat] = useState<CpdFormat>("online_live");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evUrl, setEvUrl] = useState("");
  const [reflection, setReflection] = useState("");
  const [parseHint, setParseHint] = useState<string | null>(null);

  const canNext =
    (step === 1) ||
    (step === 2 && title.trim() && provider.trim() && hours > 0) ||
    (step === 3) ||
    (step === 4 && reflection.trim().length >= 20);

  function handleParseCert(filename: string) {
    const guess = parseCertificate(filename);
    setParseHint(`Co-Pilot suggests: ${guess.provider ?? "—"} · ${guess.hours ?? "?"}h · ${(guess.confidence * 100).toFixed(0)}% confidence. Nothing was saved automatically.`);
    if (!provider && guess.provider) setProvider(guess.provider);
    if (!title && guess.title) setTitle(guess.title);
    if (guess.hours) setHours(guess.hours);
  }

  function handleFakeUpload() {
    const filename = `certificate-${Date.now()}.pdf`;
    setEvidence([...evidence, { id: `ev-${Date.now()}`, kind: "certificate", filename, uploadedAt: Date.now(), size: 148_000, mime: "application/pdf" }]);
    handleParseCert(filename);
  }

  function handleAddLink() {
    if (!evUrl.trim()) return;
    setEvidence([...evidence, { id: `ev-${Date.now()}`, kind: "link", url: evUrl.trim(), uploadedAt: Date.now() }]);
    setEvUrl("");
  }

  function submit() {
    const entry = createEntry({
      type,
      title: title.trim(),
      provider: provider.trim(),
      startAt: new Date(startDate).getTime(),
      endAt: new Date(endDate).getTime(),
      hoursClaimed: hours,
      category,
      format,
      evidence,
      reflection: reflection.trim(),
      verification: evidence.some((e) => e.kind === "certificate") ? "provider" : "self",
    });
    void nav({ to: "/cpd/$eid", params: { eid: entry.id } });
  }

  return (
    <div className="max-w-[860px] mx-auto px-5 sm:px-8 pb-16">
      <div className="rounded-2xl border p-6 sm:p-8" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(14px)" }}>
        <StepDots step={step} of={4} labels={["Type", "Basics", "Evidence", "Reflection"]} />

        {step === 1 && (
          <section className="mt-6">
            <h2 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 22 }}>What kind of training?</h2>
            <p className="text-[12px] mt-1 mb-4" style={{ color: palette.muted }}>Pick the closest match. You can change it later.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(Object.keys(TYPE_LABEL) as CpdType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="text-left rounded-xl border px-3 py-3 transition-all duration-[150ms]"
                  style={{
                    borderColor: type === t ? palette.ink : palette.border,
                    background: type === t ? "#FFF" : "rgba(255,255,255,0.5)",
                  }}
                >
                  <div className="text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{TYPE_LABEL[t]}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-6 space-y-4">
            <h2 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 22 }}>Basics</h2>
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: "#fff" }} placeholder="e.g. Ethical consent in digital therapy" />
            </Field>
            <Field label="Provider">
              <input value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: "#fff" }} placeholder="IAP Ethics Committee" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start"><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: "#fff" }} /></Field>
              <Field label="End"><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: "#fff" }} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Hours">
                <input type="number" min={0.5} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: "#fff" }} />
              </Field>
              <Field label="Category">
                <select value={category} onChange={(e) => setCategory(e.target.value as CpdCategory)} className="w-full rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: "#fff" }}>
                  {(Object.keys(CATEGORY_LABEL) as CpdCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                </select>
              </Field>
              <Field label="Format">
                <select value={format} onChange={(e) => setFormat(e.target.value as CpdFormat)} className="w-full rounded-lg border px-3 py-2 text-[13px]" style={{ borderColor: palette.border, background: "#fff" }}>
                  {(Object.keys(FORMAT_LABEL) as CpdFormat[]).map((c) => <option key={c} value={c}>{FORMAT_LABEL[c]}</option>)}
                </select>
              </Field>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-6 space-y-4">
            <h2 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 22 }}>Evidence</h2>
            <p className="text-[12px]" style={{ color: palette.muted }}>Attach a certificate or a link. Co-Pilot will read certificates and suggest fields — nothing auto-commits.</p>

            <div className="flex flex-wrap gap-2">
              <button onClick={handleFakeUpload} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
                <Upload className="h-3.5 w-3.5" /> Upload certificate
              </button>
              <div className="inline-flex items-center gap-1.5 rounded-full border overflow-hidden" style={{ borderColor: palette.border }}>
                <LinkIcon className="h-3.5 w-3.5 ml-3" style={{ color: palette.muted }} />
                <input value={evUrl} onChange={(e) => setEvUrl(e.target.value)} placeholder="Or paste a link (recording, invoice)" className="text-[12px] px-2 py-2 outline-none w-64" />
                <button onClick={handleAddLink} className="text-[12px] px-3 py-2" style={{ background: palette.surface2, color: palette.ink }}>Add</button>
              </div>
            </div>

            {parseHint && (
              <div className="rounded-lg border px-3 py-2 text-[12px] flex items-start gap-2" style={{ borderColor: palette.border, background: "#F6F1E9" }}>
                <Sparkles className="h-4 w-4 mt-0.5" style={{ color: "#7A5A18" }} /><span style={{ color: "#7A5A18" }}>{parseHint}</span>
              </div>
            )}

            {evidence.length > 0 && (
              <ul className="rounded-lg border divide-y" style={{ borderColor: palette.border, background: "#FFF" }}>
                {evidence.map((e) => (
                  <li key={e.id} className="px-3 py-2 text-[12px] flex items-center justify-between">
                    <span style={{ color: palette.ink }}>{e.kind === "link" ? e.url : e.filename}</span>
                    <span style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{e.kind}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {step === 4 && (
          <section className="mt-6 space-y-3">
            <h2 style={{ fontFamily: "'Fraunces', serif", color: palette.ink, fontSize: 22 }}>Reflection</h2>
            <p className="text-[12px]" style={{ color: palette.muted }}>Regulators increasingly ask for what changed in your practice. Two or three sentences is enough.</p>
            <button onClick={() => !reflection && setReflection(REFLECTION_TEMPLATE)} className="text-[11px] underline" style={{ color: palette.muted }}>Insert draft template</button>
            <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={6} className="w-full rounded-lg border p-3 text-[13px]" style={{ borderColor: palette.border, background: "#fff", fontFamily: "'Fraunces', serif", lineHeight: 1.6 }} placeholder="What changed?" />
            <div className="text-[11px]" style={{ color: reflection.trim().length >= 20 ? "#3E6A2E" : palette.muted }}>
              {reflection.trim().length}/20 minimum
            </div>
          </section>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => (step === 1 ? nav({ to: "/cpd" }) : setStep(step - 1))}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px]"
            style={{ background: "transparent", color: palette.muted }}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 4 ? (
            <button
              disabled={!canNext}
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] disabled:opacity-40"
              style={{ background: palette.ink, color: "#fff" }}
            >
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              disabled={!canNext}
              onClick={submit}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] disabled:opacity-40"
              style={{ background: palette.ink, color: "#fff" }}
            >
              <Check className="h-3.5 w-3.5" /> Save entry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepDots({ step, of, labels }: { step: number; of: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-3 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
      {labels.map((l, i) => {
        const n = i + 1;
        const on = n === step, done = n < step;
        return (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px]" style={{ background: on || done ? palette.ink : palette.border, color: on || done ? "#fff" : palette.muted }}>
              {done ? "✓" : n}
            </span>
            <span style={{ color: on ? palette.ink : palette.muted }}>{l}</span>
            {n < of && <span className="mx-1">·</span>}
          </div>
        );
      })}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      {children}
    </div>
  );
}
