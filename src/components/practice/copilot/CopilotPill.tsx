// Global Copilot pill (bottom-right) + ⌘K command palette.
// Mounts once in AppShell, listens for ⌘K / Ctrl+K globally.

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { SemicolonMark, EthicsRibbon, AiDraftTag, CopilotPanel } from "./primitives";
import {
  generateSoapDraft, generateRecap, generateContinuityBrief,
  generateInterventions, generateTranslation, generateReply,
  createThread, appendMessage, useThreads,
} from "@/lib/copilot-store";
import { getPatient, listPatients } from "@/lib/patients-store";

type Verb = {
  id: string;
  label: string;
  hint: string;
  needsPatient?: boolean;
  action: (ctx: { patientId?: string; sessionId?: string }) => { toast: string; route?: string };
};

const VERBS: Verb[] = [
  {
    id: "summarize.5",
    label: "Summarize last 5 sessions",
    hint: "Pulls the five most recent SOAP notes into one paragraph",
    needsPatient: true,
    action: ({ patientId }) => {
      const d = generateRecap({ patientId: patientId! });
      return { toast: "Summary drafting…", route: "/copilot?draft=" + d.id };
    },
  },
  {
    id: "draft.soap",
    label: "Draft SOAP for today",
    hint: "Uses prior notes, assessments, and homework",
    needsPatient: true,
    action: ({ patientId, sessionId }) => {
      const d = generateSoapDraft({ patientId: patientId!, sessionId: sessionId ?? "adhoc" });
      return { toast: "SOAP drafting…", route: "/copilot?draft=" + d.id };
    },
  },
  {
    id: "flag.risk",
    label: "Flag risk trends",
    hint: "Read across active patients for elevations",
    action: () => ({ toast: "Risk scan complete", route: "/copilot?view=risk" }),
  },
  {
    id: "suggest.interventions",
    label: "Suggest interventions",
    hint: "Additive drafts, cited",
    needsPatient: true,
    action: ({ patientId }) => {
      const d = generateInterventions(patientId!);
      return { toast: "Interventions drafted", route: "/copilot?draft=" + d.id };
    },
  },
  {
    id: "translate.patient",
    label: "Translate note to patient-friendly language",
    hint: "Warm, non-jargon prose",
    action: () => ({ toast: "Open the translation canvas", route: "/copilot?view=translate" }),
  },
  {
    id: "prepare.next",
    label: "Prepare the next hour",
    hint: "Continuity brief for your next patient",
    needsPatient: true,
    action: ({ patientId }) => {
      const d = generateContinuityBrief(patientId!);
      return { toast: "Continuity brief ready", route: "/copilot?draft=" + d.id };
    },
  },
];

// Guess the patient in context from the current URL (/patients/:pid or /sessions/:id).
function useContextPatientId(): { patientId?: string; sessionId?: string } {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const m1 = pathname.match(/^\/patients\/([^/]+)/);
  if (m1) return { patientId: m1[1] };
  const m2 = pathname.match(/^\/sessions\/([^/]+)/);
  if (m2) {
    // best-effort: sessions store keys by id; we don't resolve here to avoid coupling
    return { sessionId: m2[1] };
  }
  return {};
}

export function CopilotPill() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [freeMode, setFreeMode] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ctx = useContextPatientId();
  const threads = useThreads();
  const patientInCtx = ctx.patientId ? getPatient(ctx.patientId) : undefined;

  // Hide pill on auth + portal + copilot itself (native UI already on the page)
  const hidden =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/copilot");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
        setReply(null);
        setFreeMode(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 40);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VERBS;
    return VERBS.filter((v) => v.label.toLowerCase().includes(q) || v.hint.toLowerCase().includes(q));
  }, [query]);

  function run(v: Verb) {
    let patientId = ctx.patientId;
    if (v.needsPatient && !patientId) {
      // fall back to first active patient — the prototype makes this deterministic
      patientId = listPatients()[0]?.id;
    }
    const out = v.action({ patientId, sessionId: ctx.sessionId });
    setOpen(false);
    setQuery("");
    if (out.route) navigate({ to: out.route.split("?")[0], search: (prev: Record<string, string>) => ({ ...prev, ...Object.fromEntries(new URLSearchParams(out.route!.split("?")[1] ?? "")) }) }).catch(() => navigate({ to: out.route!.split("?")[0] }));
  }

  function askFree() {
    const q = query.trim();
    if (!q) return;
    // Start (or reuse) a scratch thread and record turn
    const t = threads.find((t) => t.title === "Quick asks") ?? createThread({ title: "Quick asks", mode: "draft" });
    appendMessage(t.id, { role: "user", text: q });
    const answer = generateReply({ prompt: q });
    setReply(answer);
    window.setTimeout(() => appendMessage(t.id, { role: "copilot", text: answer }), 40);
  }

  return (
    <>
      {!hidden && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Copilot"
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 pl-2 pr-3 h-10 rounded-full outline-none focus-visible:ring-2 transition-all"
          style={{
            background: "rgba(255,247,250,0.86)",
            backdropFilter: "blur(18px) saturate(140%)",
            border: `1px solid ${palette.border}`,
            boxShadow: "0 6px 24px rgba(30,20,24,0.08)",
            color: palette.ink,
          }}
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(176,86,122,0.08)" }}
          >
            <SemicolonMark size={13} />
          </span>
          <span className="text-[11.5px]" style={{ fontFamily: "'Fraunces', serif" }}>Copilot</span>
          <kbd
            className="text-[9.5px] px-1.5 py-0.5 rounded"
            style={{ background: palette.surface2, color: palette.muted, border: `1px solid ${palette.border}` }}
          >⌘K</kbd>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
          <div className="absolute inset-0 bg-black/25" onClick={() => setOpen(false)} />
          <CopilotPanel className="relative w-full max-w-[600px] overflow-hidden" style={{ background: "rgba(255,255,255,0.96)" }}>
            <EthicsRibbon />
            <div className="p-3">
              <div className="flex items-center gap-2 px-2 pb-2 border-b" style={{ borderColor: palette.border }}>
                <SemicolonMark size={14} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setReply(null); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (filtered.length > 0 && !freeMode) run(filtered[0]);
                      else askFree();
                    }
                  }}
                  placeholder={patientInCtx ? `Ask about ${patientInCtx.preferredName ?? patientInCtx.fullName.split(" ")[0]}…` : "Draft, summarize, translate, or ask…"}
                  className="flex-1 h-9 bg-transparent outline-none text-[13px] placeholder:opacity-60"
                  style={{ color: palette.ink }}
                />
                <button
                  onClick={() => setFreeMode((v) => !v)}
                  className="text-[10px] px-2 h-6 rounded-full"
                  style={{
                    background: freeMode ? palette.ink : "transparent",
                    color: freeMode ? "#fff" : palette.muted,
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  Ask freely
                </button>
              </div>

              {patientInCtx && (
                <div className="px-2 py-2 text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  Context · Patient in view
                </div>
              )}

              {reply ? (
                <div className="p-3">
                  <div className="mb-2"><AiDraftTag /></div>
                  <p className="text-[13px] leading-relaxed" style={{ color: palette.ink }}>{reply}</p>
                </div>
              ) : freeMode ? (
                <div className="p-4 text-[12px]" style={{ color: palette.muted }}>
                  Press Enter to ask Copilot in plain language. It will draft — never decide.
                </div>
              ) : (
                <ul className="py-1">
                  {filtered.map((v, i) => (
                    <li key={v.id}>
                      <button
                        onClick={() => run(v)}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                        style={{ background: i === 0 ? palette.surface2 : "transparent" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = palette.surface2; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = i === 0 ? palette.surface2 : "transparent"; }}
                      >
                        <div className="min-w-0">
                          <div className="text-[13px] truncate" style={{ color: palette.ink }}>{v.label}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: palette.muted }}>{v.hint}</div>
                        </div>
                        <span className="text-[10px] shrink-0 tracking-[0.14em] uppercase" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Enter ⏎</span>
                      </button>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <li className="px-3 py-6 text-center text-[12px]" style={{ color: palette.muted }}>
                      Nothing matches. Try "Ask freely."
                    </li>
                  )}
                </ul>
              )}

              <div className="mt-1 pt-2 border-t flex items-center justify-between px-2" style={{ borderColor: palette.border }}>
                <span className="text-[10px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  esc to close · ⌘K anywhere
                </span>
                <button
                  onClick={() => { setOpen(false); navigate({ to: "/copilot" }); }}
                  className="text-[11px]"
                  style={{ color: palette.primary }}
                >
                  Open Copilot Home →
                </button>
              </div>
            </div>
          </CopilotPanel>
        </div>
      )}
    </>
  );
}
