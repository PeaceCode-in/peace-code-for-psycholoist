import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { EthicsRibbon, AiDraftTag, CopilotPanel, SemicolonMark, ShimmerText, ProvenancePopover } from "@/components/practice/copilot/primitives";
import {
  useThreads, useDrafts, useRiskFlags, createThread, appendMessage,
  generateReply, generateSoapDraft, generateRecap, generateInterventions,
  generateContinuityBrief, generateTranslation, regenerateBlock, approveBlock,
  ratifyDraft, dismissFlag, escalateFlag, useAliasResolver,
  type Language,
} from "@/lib/copilot-store";
import { listPatients, getPatient } from "@/lib/patients-store";
import { toast } from "sonner";

type Search = { draft?: string; view?: "risk" | "translate" | "chat" | "drafts"; thread?: string };

export const Route = createFileRoute("/copilot")({
  head: () => ({ meta: [
    { title: "Copilot — PeaceCode · Practice" },
    { name: "description", content: "A quiet AI colleague for therapists — drafts, summaries, and gentle observations." },
  ]}),
  validateSearch: (s: Record<string, unknown>): Search => ({
    draft: typeof s.draft === "string" ? s.draft : undefined,
    view: (s.view === "risk" || s.view === "translate" || s.view === "chat" || s.view === "drafts") ? s.view : undefined,
    thread: typeof s.thread === "string" ? s.thread : undefined,
  }),
  component: CopilotHome,
});

function CopilotHome() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const threads = useThreads();
  const drafts = useDrafts();
  const flags = useRiskFlags();

  const view: NonNullable<Search["view"]> = search.view ?? (search.draft ? "drafts" : "chat");
  const activeThread = threads.find((t) => t.id === search.thread) ?? threads[0];
  const activeDraft = drafts.find((d) => d.id === search.draft);

  return (
    <AppShell crumb="Copilot">
      <EthicsRibbon />
      <div className="grid md:grid-cols-[280px_1fr] min-h-[calc(100vh-56px-30px)]">
        {/* Left: thread + section rail */}
        <aside className="border-r hidden md:flex flex-col" style={{ borderColor: palette.border, background: palette.surface }}>
          <div className="p-4 border-b" style={{ borderColor: palette.border }}>
            <div className="flex items-center gap-2 mb-2">
              <SemicolonMark size={14} />
              <span className="text-[13px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Copilot</span>
            </div>
            <button
              onClick={() => {
                const t = createThread({ title: "New thread", mode: "draft" });
                navigate({ to: "/copilot", search: { view: "chat", thread: t.id } });
              }}
              className="w-full h-8 rounded-lg text-[12px] flex items-center justify-center gap-1.5"
              style={{ background: palette.ink, color: "#fff" }}
            >
              + New thread
            </button>
          </div>
          <nav className="px-2 py-2">
            {[
              { v: "chat", label: "Conversation" },
              { v: "drafts", label: "Drafts" },
              { v: "risk", label: "Watch list" },
              { v: "translate", label: "Translate" },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => navigate({ to: "/copilot", search: { view: s.v as Search["view"] } })}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[12.5px] transition-colors"
                style={{ color: view === s.v ? palette.ink : palette.muted, background: view === s.v ? palette.surface2 : "transparent" }}
              >
                {s.label}
                {s.v === "risk" && flags.filter(f => f.status === "open").length > 0 && (
                  <span className="text-[9.5px] tabular-nums px-1.5 h-4 rounded-full flex items-center" style={{ background: "#F1D6DA", color: "#B54848" }}>
                    {flags.filter(f => f.status === "open").length}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="px-3 pt-3 pb-2 text-[9.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Threads</div>
          <ul className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
            {threads.length === 0 && (
              <li className="px-2 py-4 text-[12px]" style={{ color: palette.muted }}>Nothing to draft. Sometimes the room is enough.</li>
            )}
            {threads.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => navigate({ to: "/copilot", search: { view: "chat", thread: t.id } })}
                  className="w-full text-left px-2 py-1.5 rounded-lg transition-colors"
                  style={{ background: activeThread?.id === t.id && view === "chat" ? palette.surface2 : "transparent" }}
                >
                  <div className="text-[12.5px] truncate" style={{ color: palette.ink }}>{t.title}</div>
                  <div className="text-[10px] tracking-[0.12em] uppercase" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    {t.mode} · {new Date(t.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right: canvas */}
        <main className="p-6 md:p-10">
          {view === "chat" && <ChatCanvas threadId={activeThread?.id} />}
          {view === "drafts" && <DraftsCanvas activeDraftId={activeDraft?.id ?? drafts[0]?.id} />}
          {view === "risk" && <RiskCanvas />}
          {view === "translate" && <TranslateCanvas />}
        </main>
      </div>
    </AppShell>
  );
}

function ChatCanvas({ threadId }: { threadId?: string }) {
  const threads = useThreads();
  const thread = threads.find((t) => t.id === threadId);
  const [text, setText] = useState("");
  const navigate = useNavigate();

  function send() {
    const q = text.trim();
    if (!q) return;
    let t = thread;
    if (!t) {
      t = createThread({ title: q.slice(0, 40), mode: "draft" });
      navigate({ to: "/copilot", search: { view: "chat", thread: t.id } });
    }
    appendMessage(t.id, { role: "user", text: q });
    setText("");
    window.setTimeout(() => appendMessage(t!.id, { role: "copilot", text: generateReply({ prompt: q }) }), 120);
  }

  if (!thread) {
    return (
      <div className="max-w-[640px] mx-auto py-20 text-center">
        <SemicolonMark size={22} />
        <h1 className="mt-4 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>A quiet colleague.</h1>
        <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>Start a thread. Copilot drafts — you decide.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button
            className="h-9 px-4 rounded-full text-[12px]"
            style={{ background: palette.ink, color: "#fff" }}
            onClick={() => {
              const t = createThread({ title: "New thread", mode: "draft" });
              navigate({ to: "/copilot", search: { view: "chat", thread: t.id } });
            }}
          >New thread</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto flex flex-col h-[calc(100vh-56px-30px-100px)]">
      <div>
        <div className="text-[10.5px] tracking-[0.14em] uppercase" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{thread.mode} · thread</div>
        <h2 className="mt-1 text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{thread.title}</h2>
      </div>
      <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-2">
        {thread.messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            {m.role === "user" ? (
              <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-br-md text-[13px]" style={{ background: palette.ink, color: "#fff" }}>
                {m.text}
              </div>
            ) : (
              <CopilotPanel className="max-w-[80%] px-3 py-2.5">
                <div className="mb-1"><AiDraftTag /></div>
                <p className="text-[13px] leading-relaxed" style={{ color: palette.ink }}>{m.text}</p>
              </CopilotPanel>
            )}
          </div>
        ))}
        {thread.messages.length === 0 && (
          <div className="text-[12px]" style={{ color: palette.muted }}>Nothing here yet. Ask below.</div>
        )}
      </div>
      <div className="mt-4 flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={2}
          placeholder="Ask Copilot… (Enter to send)"
          className="flex-1 min-h-[52px] max-h-[160px] rounded-xl p-2.5 text-[13px] outline-none focus:ring-2"
          style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink }}
        />
        <button onClick={send} className="h-9 px-4 rounded-lg text-[12px]" style={{ background: palette.ink, color: "#fff" }}>Send</button>
      </div>
    </div>
  );
}

function DraftsCanvas({ activeDraftId }: { activeDraftId?: string }) {
  const drafts = useDrafts();
  const navigate = useNavigate();
  const draft = drafts.find((d) => d.id === activeDraftId);
  const alias = useAliasResolver();

  if (drafts.length === 0) {
    return (
      <div className="max-w-[520px] mx-auto py-16 text-center">
        <h2 className="text-[18px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>No drafts yet.</h2>
        <p className="mt-2 text-[13px]" style={{ color: palette.muted }}>Open ⌘K on any patient page and ask Copilot to draft something.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[240px_1fr] gap-6">
      <aside>
        <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Drafts</div>
        <ul className="space-y-1">
          {drafts.map((d) => (
            <li key={d.id}>
              <button
                onClick={() => navigate({ to: "/copilot", search: { view: "drafts", draft: d.id } })}
                className="w-full text-left px-2 py-1.5 rounded-lg"
                style={{ background: d.id === draft?.id ? palette.surface2 : "transparent" }}
              >
                <div className="text-[12.5px] truncate" style={{ color: palette.ink }}>{d.title}</div>
                <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{d.kind} · {d.status}</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main>
        {draft && (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {draft.kind}{draft.patientId ? ` · ${alias(draft.patientId)}` : ""}
                </div>
                <h1 className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{draft.title}</h1>
              </div>
              {draft.status !== "approved" ? (
                <button
                  onClick={() => { ratifyDraft(draft.id); toast.success("Ratified. Saved to the record."); }}
                  className="h-9 px-4 rounded-full text-[12px]"
                  style={{ background: palette.ink, color: "#fff" }}
                >
                  Ratify draft
                </button>
              ) : (
                <span className="text-[11px] px-2.5 h-8 rounded-full inline-flex items-center" style={{ background: "#E7F6EC", color: "#1F7A3E" }}>Approved</span>
              )}
            </div>
            <div className="space-y-4">
              {draft.blocks.map((b) => (
                <CopilotPanel key={b.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{b.label}</span>
                      {!b.approved && (
                        <ProvenancePopover prov={draft.provenance}>
                          <AiDraftTag />
                        </ProvenancePopover>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button onClick={() => regenerateBlock(draft.id, b.id)} style={{ color: palette.muted }}>Regenerate</button>
                      <span style={{ color: palette.border }}>·</span>
                      <button onClick={() => approveBlock(draft.id, b.id)} style={{ color: b.approved ? "#1F7A3E" : palette.primary }}>{b.approved ? "Approved" : "Approve"}</button>
                    </div>
                  </div>
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: palette.ink }}>
                    <ShimmerText text={b.body} streaming={b.streaming} />
                  </p>
                </CopilotPanel>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function RiskCanvas() {
  const flags = useRiskFlags();
  const [expanded, setExpanded] = useState<string | null>(flags[0]?.id ?? null);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const open = flags.filter((f) => f.status === "open");
  const closed = flags.filter((f) => f.status !== "open");

  return (
    <div className="max-w-[820px] mx-auto">
      <div className="mb-6">
        <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Watch list</div>
        <h1 className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Signals to consider.</h1>
        <p className="mt-1 text-[13px]" style={{ color: palette.muted }}>Copilot reads across records on a schedule. It surfaces — you decide.</p>
      </div>

      {open.length === 0 && (
        <CopilotPanel className="p-6 text-center">
          <p className="text-[13px]" style={{ color: palette.muted }}>Nothing to flag right now.</p>
        </CopilotPanel>
      )}

      <ul className="space-y-3">
        {open.map((f) => {
          const p = getPatient(f.patientId);
          const isOpen = expanded === f.id;
          return (
            <li key={f.id}>
              <CopilotPanel className="p-4">
                <button className="w-full text-left" onClick={() => setExpanded(isOpen ? null : f.id)}>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: f.severity === "high" ? "#B54848" : f.severity === "medium" ? "#C77A5A" : palette.muted }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px]" style={{ color: palette.ink }}>{f.signal}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                        {p?.preferredName ?? p?.fullName ?? "Patient"} · {f.source} · {new Date(f.detectedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: palette.border }}>
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Detail</div>
                      <p className="text-[12.5px]" style={{ color: palette.ink }}>{f.detail}</p>
                    </div>
                    <div>
                      <div className="text-[10.5px] uppercase tracking-[0.14em] mb-1" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Suggested action</div>
                      <p className="text-[12.5px]" style={{ color: palette.ink }}>{f.suggested}</p>
                    </div>
                    {dismissing === f.id ? (
                      <div className="flex gap-2 items-center">
                        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why dismiss?" className="flex-1 h-8 px-2 text-[12px] rounded-lg" style={{ border: `1px solid ${palette.border}`, background: palette.surface, color: palette.ink }} />
                        <button onClick={() => { dismissFlag(f.id, reason || "no reason"); setDismissing(null); setReason(""); }} className="h-8 px-3 rounded-lg text-[11.5px]" style={{ background: palette.muted, color: "#fff" }}>Dismiss</button>
                        <button onClick={() => setDismissing(null)} className="h-8 px-3 rounded-lg text-[11.5px]" style={{ color: palette.muted }}>Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setDismissing(f.id)} className="h-8 px-3 rounded-lg text-[11.5px]" style={{ background: palette.surface2, color: palette.muted, border: `1px solid ${palette.border}` }}>Dismiss with reason</button>
                        <button onClick={() => { escalateFlag(f.id); toast.success("Escalated to supervision."); }} className="h-8 px-3 rounded-lg text-[11.5px]" style={{ background: "#B54848", color: "#fff" }}>Escalate to supervision</button>
                      </div>
                    )}
                  </div>
                )}
              </CopilotPanel>
            </li>
          );
        })}
      </ul>

      {closed.length > 0 && (
        <div className="mt-8">
          <div className="text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Closed</div>
          <ul className="space-y-1.5">
            {closed.map((f) => (
              <li key={f.id} className="text-[12px] px-3 py-2 rounded-lg" style={{ background: palette.surface2, color: palette.muted }}>
                {f.signal} — <span style={{ color: f.status === "escalated" ? "#B54848" : palette.muted }}>{f.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TranslateCanvas() {
  const [dir, setDir] = useState<"clinical-to-patient" | "patient-to-clinical" | "language">("clinical-to-patient");
  const [lang, setLang] = useState<Language>("hi");
  const [src, setSrc] = useState("");
  const [outputId, setOutputId] = useState<string | null>(null);
  const drafts = useDrafts();
  const draft = drafts.find((d) => d.id === outputId);

  function run() {
    if (!src.trim()) return;
    const d = generateTranslation({ direction: dir, targetLang: lang, source: src });
    setOutputId(d.id);
  }

  return (
    <div className="max-w-[820px] mx-auto">
      <div className="mb-6">
        <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Translate</div>
        <h1 className="mt-1 text-[24px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Move between voices.</h1>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {([
          ["clinical-to-patient", "Clinical → Patient"],
          ["patient-to-clinical", "Patient → Structured"],
          ["language", "English → Indic"],
        ] as const).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setDir(v)}
            className="h-8 px-3 rounded-full text-[12px]"
            style={{
              background: dir === v ? palette.ink : "transparent",
              color: dir === v ? "#fff" : palette.muted,
              border: `1px solid ${palette.border}`,
            }}
          >{l}</button>
        ))}
        {dir === "language" && (
          <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="h-8 px-2 rounded-full text-[12px]" style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink }}>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="bn">Bengali</option>
            <option value="mr">Marathi</option>
          </select>
        )}
      </div>

      <textarea value={src} onChange={(e) => setSrc(e.target.value)} rows={6} placeholder="Paste text here…" className="w-full rounded-xl p-3 text-[13px] outline-none focus:ring-2" style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink }} />
      <div className="mt-2 flex justify-end">
        <button onClick={run} className="h-9 px-4 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}>Translate</button>
      </div>

      {draft && (
        <CopilotPanel className="p-4 mt-6">
          <div className="mb-2"><AiDraftTag /></div>
          {draft.blocks.map((b) => (
            <p key={b.id} className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: palette.ink }}>
              <ShimmerText text={b.body} streaming={b.streaming} />
            </p>
          ))}
        </CopilotPanel>
      )}
    </div>
  );
}
