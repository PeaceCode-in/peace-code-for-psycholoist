import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import {
  useInstanceByToken, markViewed, signInstance,
  type Block,
} from "@/lib/documents-store";
import { SignatureCanvas } from "@/components/practice/documents/primitives";
import { Check, PenTool, Type as TypeIcon } from "lucide-react";

export const Route = createFileRoute("/portal/documents/$token")({
  head: () => ({ meta: [{ title: "Please review and sign — PeaceCode" }, { name: "robots", content: "noindex" }] }),
  component: SignCeremony,
});

function SignCeremony() {
  const { token } = Route.useParams();
  const inst = useInstanceByToken(token);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (inst) setBlocks(JSON.parse(JSON.stringify(inst.blocks)));
    if (inst && !inst.viewedAt) {
      markViewed(inst.id, { ip: "203.0.113.42", userAgent: navigator.userAgent });
    }
  }, [inst?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Split into "sections" separated by headings for the multi-step ceremony
  const sections = useMemo(() => {
    const groups: { title: string; items: Block[] }[] = [];
    let current: { title: string; items: Block[] } | null = null;
    for (const b of blocks) {
      if (b.type === "heading") {
        if (current) groups.push(current);
        current = { title: b.value ?? "Section", items: [] };
      } else {
        if (!current) current = { title: "Details", items: [] };
        current.items.push(b);
      }
    }
    if (current) groups.push(current);
    return groups.length ? groups : [{ title: "Document", items: blocks }];
  }, [blocks]);

  if (!inst) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#FBF7F8" }}>
        <div className="text-center">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: palette.ink }}>
            This link isn't valid.
          </div>
          <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>It may have expired, been voided, or already been signed.</p>
          <Link to="/portal" className="mt-6 inline-block text-[13px]" style={{ color: palette.primary }}>Return to portal</Link>
        </div>
      </div>
    );
  }
  if (inst.status === "expired" || inst.status === "voided") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#FBF7F8" }}>
        <div className="text-center max-w-md">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: palette.ink }}>
            This document is no longer active.
          </div>
          <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>
            Please reach out to your therapist for a new copy.
          </p>
        </div>
      </div>
    );
  }

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, ...patch } : b));
  };

  const isLast = step >= sections.length - 1;
  const progress = ((step + 1) / sections.length) * 100;

  const finish = () => {
    signInstance(inst.id, blocks, { ip: "203.0.113.42", userAgent: navigator.userAgent });
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#FBF7F8" }}>
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "#DDEEE2", color: "#3F7A56" }}>
            <Check className="w-7 h-7" />
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: palette.ink, lineHeight: 1.1 }}>
            You've signed {inst.templateName}.
          </div>
          <p className="mt-3 text-[14px]" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
            A copy is on its way to your email. You may close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FBF7F8" }}>
      {/* Editorial rule progress */}
      <div className="fixed top-0 left-0 right-0 h-[3px]" style={{ background: "rgba(198,127,132,0.14)" }}>
        <div className="h-full transition-all" style={{ width: `${progress}%`, background: palette.primary }} />
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-10 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="uppercase text-[10.5px] tracking-[0.2em]"
            style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
            Section {step + 1} of {sections.length}
          </div>
          <div className="text-[11.5px]" style={{ color: palette.muted }}>
            For {inst.patientName.split(" ")[0]}
          </div>
        </div>

        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, color: palette.ink, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          {inst.templateName}
        </h1>
        {inst.coveringNote && (
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: palette.muted, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>
            {inst.coveringNote}
          </p>
        )}

        <div className="mt-8 rounded-2xl p-6 sm:p-8" style={{ background: "#fff", border: `1px solid ${palette.border}` }}>
          <div className="mb-5" style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: palette.ink }}>
            {sections[step].title}
          </div>
          <div className="space-y-6">
            {sections[step].items.map((b) => (
              <PatientBlock key={b.id} b={b} onChange={(p) => updateBlock(b.id, p)} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="h-10 px-4 rounded-full text-[12.5px] disabled:opacity-40"
            style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}
          >
            Back
          </button>
          {isLast ? (
            <button
              onClick={finish}
              className="h-11 px-6 rounded-full text-white text-[13px] flex items-center gap-2"
              style={{ background: palette.primary }}
            >
              I agree and sign
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => Math.min(sections.length - 1, s + 1))}
              className="h-11 px-6 rounded-full text-white text-[13px]"
              style={{ background: palette.ink }}
            >
              Continue
            </button>
          )}
        </div>

        <p className="mt-8 text-[11px] text-center" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          Your signature is legally binding under the Information Technology Act, 2000 (India).
        </p>
      </div>
    </div>
  );
}

function PatientBlock({ b, onChange }: { b: Block; onChange: (p: Partial<Block>) => void }) {
  if (b.type === "text") return <p className="text-[14px] leading-relaxed" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{b.value}</p>;
  if (b.type === "info") return (
    <div className="rounded-lg p-3.5 text-[13px]" style={{ background: palette.surface2, border: `1px solid ${palette.border}`, color: palette.ink }}>
      {b.value}
    </div>
  );
  if (b.type === "signature") return <SignatureBlock b={b} onChange={onChange} />;
  if (b.type === "initials") return <InitialsBlock b={b} onChange={onChange} />;

  const label = <label className="block text-[13.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{b.label}{b.required && <span style={{ color: palette.primary }}> *</span>}</label>;

  switch (b.type) {
    case "short":
      return <div>{label}<input type="text" value={String(b.answer ?? "")} onChange={(e) => onChange({ answer: e.target.value })} className="mt-1.5 w-full h-10 px-3 rounded-lg text-[13.5px]" style={inputStyle} /></div>;
    case "long":
      return <div>{label}<textarea rows={4} value={String(b.answer ?? "")} onChange={(e) => onChange({ answer: e.target.value })} className="mt-1.5 w-full p-3 rounded-lg text-[13.5px] resize-none" style={inputStyle} /></div>;
    case "date":
      return <div>{label}<input type="date" value={String(b.answer ?? "")} onChange={(e) => onChange({ answer: e.target.value })} className="mt-1.5 w-full h-10 px-3 rounded-lg text-[13.5px]" style={inputStyle} /></div>;
    case "time":
      return <div>{label}<input type="time" value={String(b.answer ?? "")} onChange={(e) => onChange({ answer: e.target.value })} className="mt-1.5 w-full h-10 px-3 rounded-lg text-[13.5px]" style={inputStyle} /></div>;
    case "dropdown":
      return (
        <div>{label}
          <select value={String(b.answer ?? "")} onChange={(e) => onChange({ answer: e.target.value })}
            className="mt-1.5 w-full h-10 px-3 rounded-lg text-[13.5px]" style={inputStyle}>
            <option value="">Choose one…</option>
            {(b.options ?? []).map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      );
    case "choice":
      return (
        <div>{label}
          <div className="mt-2 space-y-1.5">
            {(b.options ?? []).map((o) => {
              const on = b.answer === o;
              return (
                <button key={o} type="button" onClick={() => onChange({ answer: o })}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-[13px]"
                  style={{ background: on ? palette.soft : palette.surface, border: `1px solid ${on ? palette.primary : palette.border}`, color: palette.ink }}>
                  <span className="w-4 h-4 rounded-full border flex items-center justify-center"
                    style={{ borderColor: on ? palette.primary : palette.border, background: on ? palette.primary : "transparent" }}>
                    {on && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      );
    case "checkboxes": {
      const arr = Array.isArray(b.answer) ? b.answer : [];
      return (
        <div>{label}
          <div className="mt-2 space-y-1.5">
            {(b.options ?? []).map((o) => {
              const on = arr.includes(o);
              return (
                <button key={o} type="button" onClick={() => onChange({ answer: on ? arr.filter((x) => x !== o) : [...arr, o] })}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-[13px]"
                  style={{ background: on ? palette.soft : palette.surface, border: `1px solid ${on ? palette.primary : palette.border}`, color: palette.ink }}>
                  <span className="w-4 h-4 rounded-sm border flex items-center justify-center"
                    style={{ borderColor: on ? palette.primary : palette.border, background: on ? palette.primary : "transparent" }}>
                    {on && <Check className="w-3 h-3 text-white" />}
                  </span>
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    case "scale": {
      const val = typeof b.answer === "number" ? b.answer : -1;
      return (
        <div>{label}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Array.from({ length: (b.max ?? 10) - (b.min ?? 0) + 1 }).map((_, i) => {
              const n = (b.min ?? 0) + i;
              const on = val === n;
              return (
                <button key={n} type="button" onClick={() => onChange({ answer: n })}
                  className="w-9 h-9 rounded-md text-[12px] tabular-nums"
                  style={{
                    background: on ? palette.primary : palette.surface,
                    color: on ? "#fff" : palette.ink,
                    border: `1px solid ${on ? palette.primary : palette.border}`,
                    fontFamily: "'DM Mono', ui-monospace, monospace",
                  }}>{n}</button>
              );
            })}
          </div>
        </div>
      );
    }
    case "upload":
      return (
        <div>{label}
          <div className="mt-1.5 rounded-lg p-6 text-center text-[12px]"
            style={{ background: palette.surface2, border: `1px dashed ${palette.border}`, color: palette.muted }}>
            Tap to upload a photo or PDF
          </div>
        </div>
      );
    default: return null;
  }
}

function SignatureBlock({ b, onChange }: { b: Block; onChange: (p: Partial<Block>) => void }) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState<string>(b.signatureTypedAs ?? "");
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2"
        style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        {b.label ?? "Signature"} · {b.signerRole}
      </div>
      <div className="flex items-center gap-1 mb-2">
        <button type="button" onClick={() => setMode("draw")} className="h-7 px-3 rounded-full text-[11px] flex items-center gap-1"
          style={{ background: mode === "draw" ? palette.ink : palette.surface, color: mode === "draw" ? "#fff" : palette.ink, border: `1px solid ${mode === "draw" ? palette.ink : palette.border}` }}>
          <PenTool className="w-3 h-3" /> Draw
        </button>
        <button type="button" onClick={() => setMode("type")} className="h-7 px-3 rounded-full text-[11px] flex items-center gap-1"
          style={{ background: mode === "type" ? palette.ink : palette.surface, color: mode === "type" ? "#fff" : palette.ink, border: `1px solid ${mode === "type" ? palette.ink : palette.border}` }}>
          <TypeIcon className="w-3 h-3" /> Type
        </button>
      </div>
      {mode === "draw" ? (
        <SignatureCanvas onChange={(dataUrl) => onChange({ signatureImage: dataUrl ?? undefined, signedAt: Date.now() })} />
      ) : (
        <div>
          <input value={typed} onChange={(e) => { setTyped(e.target.value); onChange({ signatureTypedAs: e.target.value, signedAt: Date.now() }); }}
            placeholder="Type your full name"
            className="w-full h-14 px-4 rounded-lg outline-none"
            style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'Caveat', 'Homemade Apple', cursive", fontSize: 28 }} />
        </div>
      )}
    </div>
  );
}

function InitialsBlock({ b, onChange }: { b: Block; onChange: (p: Partial<Block>) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        maxLength={3}
        value={String(b.answer ?? "")}
        onChange={(e) => onChange({ answer: e.target.value.toUpperCase() })}
        placeholder="AA"
        className="w-16 h-12 rounded-md text-center outline-none"
        style={{ background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'Caveat', cursive", fontSize: 22 }}
      />
      <span className="text-[13px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{b.label}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = { background: "#fff", border: `1px solid ${palette.border}`, color: palette.ink, outline: "none" };
