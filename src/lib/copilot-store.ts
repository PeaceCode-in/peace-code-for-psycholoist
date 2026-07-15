// PeaceCode · Practice — Copilot store.
// Local-first, event-bus backed. Simulates streaming drafts, tracks provenance,
// surfaces risk flags, holds thread history, and records what data was "sent"
// (locally pseudonymized) for the trust/transparency panel.

import { useEffect, useState, useSyncExternalStore } from "react";
import { listPatients, getPatient, listNotes } from "./patients-store";

// ─── Types ───────────────────────────────────────────────────
export type Tone = "formal" | "conversational" | "warm";
export type Length = "brief" | "standard" | "detailed";
export type Retention = "session" | "d30" | "d90";
export type Language = "en" | "hi" | "ta" | "bn" | "mr";

export type DraftKind =
  | "soap"
  | "recap"
  | "intervention"
  | "translation-clinical"
  | "translation-patient"
  | "translation-lang"
  | "continuity"
  | "freeform";

export type DraftStatus = "streaming" | "ready" | "approved" | "rejected";

export type Provenance = {
  model: string;
  promptId: string;
  inputHash: string;
  outputHash: string;
  contextItems: string[]; // human-readable list of what was included
  createdAt: number;
};

export type Draft = {
  id: string;
  kind: DraftKind;
  title: string;
  patientId?: string;    // pseudonymized as "Patient A/B/…" in the record
  sessionId?: string;
  blocks: DraftBlock[];
  status: DraftStatus;
  provenance: Provenance;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
};

export type DraftBlock = {
  id: string;
  label: string;
  body: string;
  streaming?: boolean;
  approved?: boolean;
};

export type Message = {
  id: string;
  role: "user" | "copilot";
  text: string;
  at: number;
  draftId?: string;
};

export type Thread = {
  id: string;
  title: string;
  mode: "draft" | "analyze" | "prepare" | "review";
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  patientId?: string;
};

export type RiskFlag = {
  id: string;
  patientId: string;
  signal: string;
  detail: string;
  severity: "low" | "medium" | "high";
  suggested: string;
  source: string; // e.g. "PHQ-9 · 3 assessments"
  detectedAt: number;
  status: "open" | "dismissed" | "escalated";
  dismissedReason?: string;
};

export type AuditEntry = {
  id: string;
  at: number;
  promptId: string;
  kind: DraftKind | "risk-scan" | "translation" | "chat";
  patientAlias?: string;      // "Patient A"
  inputHash: string;
  outputHash: string;
  contextItems: string[];
  outcome: "ok" | "error" | "aborted";
};

export type CopilotSettings = {
  tone: Tone;
  length: Length;
  autoDraft: boolean;
  voiceIngest: boolean;
  retention: Retention;
};

type Store = {
  threads: Thread[];
  drafts: Draft[];
  riskFlags: RiskFlag[];
  audit: AuditEntry[];
  settings: CopilotSettings;
  aliasMap: Record<string, string>; // patientId -> "Patient A"
};

// ─── Persistence + bus ───────────────────────────────────────
const KEY = "pc.copilot.v1";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function loadStore(): Store {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...defaultStore(), ...JSON.parse(raw) };
  } catch {}
  const s = seed(defaultStore());
  save(s);
  return s;
}

function save(s: Store) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

function defaultStore(): Store {
  return {
    threads: [],
    drafts: [],
    riskFlags: [],
    audit: [],
    aliasMap: {},
    settings: {
      tone: "warm",
      length: "standard",
      autoDraft: true,
      voiceIngest: false,
      retention: "d30",
    },
  };
}

let _s: Store | null = null;
function s(): Store {
  if (!_s) _s = loadStore();
  return _s;
}
function commit() { save(s()); emit(); }

// ─── Aliasing (pseudonymization) ─────────────────────────────
function aliasFor(patientId: string): string {
  const st = s();
  if (st.aliasMap[patientId]) return st.aliasMap[patientId];
  const idx = Object.keys(st.aliasMap).length;
  const letter = String.fromCharCode(65 + (idx % 26));
  const label = `Patient ${letter}${idx >= 26 ? Math.floor(idx / 26) + 1 : ""}`;
  st.aliasMap[patientId] = label;
  return label;
}

// ─── Hashing (tiny non-crypto for provenance display) ────────
function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i);
  return "h_" + (h >>> 0).toString(36);
}

// ─── Seed ────────────────────────────────────────────────────
function seed(store: Store): Store {
  const pats = typeof window !== "undefined" ? listPatients().slice(0, 6) : [];
  const now = Date.now();
  pats.forEach((p) => aliasFor(p.id));

  // Risk flags — synthesize from patients with elevated risk
  store.riskFlags = pats.slice(0, 4).map((p, i) => {
    const severities: RiskFlag["severity"][] = ["high", "medium", "medium", "low"];
    const signals = [
      { signal: "PHQ-9 Q9 rose 0 → 2 across last 3 assessments", suggested: "Consider adding a safety planning module", source: "PHQ-9 · 3 assessments · 21d" },
      { signal: "Two consecutive missed sessions", suggested: "Send a warm check-in message; offer flexible reschedule", source: "Sessions · 14d window" },
      { signal: "Journal language shift: sleep collapse markers", suggested: "Review sleep hygiene; consider brief behavioural intervention", source: "Journal entries · 7d" },
      { signal: "GAD-7 trending +6 in 30d", suggested: "Reintroduce grounding practices; assess triggers", source: "GAD-7 · 4 assessments · 30d" },
    ];
    const sig = signals[i] ?? signals[0];
    return {
      id: "rf_" + Math.random().toString(36).slice(2, 8),
      patientId: p.id,
      severity: severities[i] ?? "low",
      signal: sig.signal,
      detail: `Detected in ${aliasFor(p.id)}'s recent record. Review before next session.`,
      suggested: sig.suggested,
      source: sig.source,
      detectedAt: now - (i + 1) * 3600_000,
      status: "open",
    };
  });

  // A seeded thread
  const tid = "t_" + Math.random().toString(36).slice(2, 8);
  store.threads = [{
    id: tid,
    title: "Prep · morning block",
    mode: "prepare",
    messages: [
      { id: "m1", role: "user", text: "Prepare my 10am — anything I should watch for?", at: now - 2 * 3600_000 },
      { id: "m2", role: "copilot", text: "Last session touched on sleep and family expectations. Homework was a 5-minute evening wind-down; no logged compliance. Suggested opening: ask what the evenings have looked like this week.", at: now - 2 * 3600_000 + 12_000 },
    ],
    createdAt: now - 2 * 3600_000,
    updatedAt: now - 2 * 3600_000 + 12_000,
  }];

  // Audit entries
  store.audit = [
    {
      id: "a1", at: now - 3600_000, promptId: "continuity.v3", kind: "continuity",
      patientAlias: "Patient A", inputHash: hash("continuity·A"), outputHash: hash("brief·A"),
      contextItems: ["Last SOAP summary", "Homework compliance (7d)", "PHQ-9 delta (30d)"], outcome: "ok",
    },
    {
      id: "a2", at: now - 5400_000, promptId: "risk.scan.v2", kind: "risk-scan",
      inputHash: hash("scan·all"), outputHash: hash("flags·4"),
      contextItems: ["PHQ-9 responses (all active patients)", "Session attendance (14d)", "Journal text (7d, tokenized)"], outcome: "ok",
    },
    {
      id: "a3", at: now - 7200_000, promptId: "soap.draft.v4", kind: "soap",
      patientAlias: "Patient B", inputHash: hash("soap·B"), outputHash: hash("soap·B·out"),
      contextItems: ["Prior 3 SOAP notes", "Assessment scores (30d)", "Therapist shorthand"], outcome: "ok",
    },
  ];

  return store;
}

// ─── Subscription hooks ──────────────────────────────────────
function subscribe(l: () => void) { listeners.add(l); return () => listeners.delete(l); }
function useSlice<T>(sel: (st: Store) => T): T {
  return useSyncExternalStore(subscribe, () => sel(s()), () => sel(defaultStore()));
}

export function useCopilotSettings() { return useSlice((st) => st.settings); }
export function useThreads() { return useSlice((st) => st.threads); }
export function useThread(id: string | null | undefined) {
  return useSlice((st) => id ? st.threads.find((t) => t.id === id) ?? null : null);
}
export function useDrafts() { return useSlice((st) => st.drafts); }
export function useDraft(id: string | null | undefined) {
  return useSlice((st) => id ? st.drafts.find((d) => d.id === id) ?? null : null);
}
export function useRiskFlags() { return useSlice((st) => st.riskFlags); }
export function useAudit() { return useSlice((st) => st.audit); }
export function useAliasMap() { return useSlice((st) => st.aliasMap); }

// Client-friendly resolver: alias -> patient
export function useAliasResolver() {
  const map = useAliasMap();
  return (patientId: string) => map[patientId] ?? "Patient ?";
}

// ─── Mutations ───────────────────────────────────────────────
export function updateSettings(patch: Partial<CopilotSettings>) {
  s().settings = { ...s().settings, ...patch };
  commit();
}

export function createThread(input: { title: string; mode: Thread["mode"]; patientId?: string }): Thread {
  const t: Thread = {
    id: "t_" + Math.random().toString(36).slice(2, 8),
    title: input.title,
    mode: input.mode,
    patientId: input.patientId,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  s().threads = [t, ...s().threads];
  commit();
  return t;
}

export function appendMessage(threadId: string, msg: Omit<Message, "id" | "at">) {
  const t = s().threads.find((x) => x.id === threadId);
  if (!t) return;
  t.messages.push({ id: "m_" + Math.random().toString(36).slice(2, 8), at: Date.now(), ...msg });
  t.updatedAt = Date.now();
  commit();
}

export function deleteThread(id: string) {
  s().threads = s().threads.filter((t) => t.id !== id);
  commit();
}

export function dismissFlag(id: string, reason: string) {
  const f = s().riskFlags.find((x) => x.id === id);
  if (!f) return;
  f.status = "dismissed";
  f.dismissedReason = reason;
  commit();
}

export function escalateFlag(id: string) {
  const f = s().riskFlags.find((x) => x.id === id);
  if (!f) return;
  f.status = "escalated";
  commit();
}

// ─── Draft creation + simulated streaming ────────────────────
export function createDraft(input: {
  kind: DraftKind;
  title: string;
  patientId?: string;
  sessionId?: string;
  blocks: { label: string; body: string }[];
  contextItems: string[];
  promptId: string;
  streaming?: boolean;
}): Draft {
  const alias = input.patientId ? aliasFor(input.patientId) : undefined;
  const prov: Provenance = {
    model: "google/gemini-3-flash-preview",
    promptId: input.promptId,
    inputHash: hash(input.title + (alias ?? "") + input.contextItems.join("|")),
    outputHash: hash(input.blocks.map((b) => b.body).join("|")),
    contextItems: input.contextItems,
    createdAt: Date.now(),
  };
  const d: Draft = {
    id: "d_" + Math.random().toString(36).slice(2, 8),
    kind: input.kind,
    title: input.title,
    patientId: input.patientId,
    sessionId: input.sessionId,
    blocks: input.blocks.map((b, i) => ({
      id: "b_" + i + "_" + Math.random().toString(36).slice(2, 6),
      label: b.label,
      body: input.streaming ? "" : b.body,
      streaming: !!input.streaming,
      approved: false,
    })),
    status: input.streaming ? "streaming" : "ready",
    provenance: prov,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  s().drafts = [d, ...s().drafts];
  // Audit
  s().audit.unshift({
    id: "a_" + Math.random().toString(36).slice(2, 8),
    at: Date.now(),
    promptId: input.promptId,
    kind: input.kind,
    patientAlias: alias,
    inputHash: prov.inputHash,
    outputHash: prov.outputHash,
    contextItems: input.contextItems,
    outcome: "ok",
  });
  commit();

  if (input.streaming) {
    // Simulate a shimmer stream — char groups every 24ms
    input.blocks.forEach((target, idx) => {
      const draftId = d.id;
      const blockId = d.blocks[idx].id;
      const full = target.body;
      let cursor = 0;
      const step = () => {
        const draft = s().drafts.find((x) => x.id === draftId);
        if (!draft) return;
        const block = draft.blocks.find((b) => b.id === blockId);
        if (!block) return;
        cursor = Math.min(full.length, cursor + 6 + Math.floor(Math.random() * 8));
        block.body = full.slice(0, cursor);
        if (cursor >= full.length) {
          block.streaming = false;
          if (draft.blocks.every((b) => !b.streaming)) {
            draft.status = "ready";
            draft.updatedAt = Date.now();
          }
          commit();
          return;
        }
        commit();
        window.setTimeout(step, 24 + Math.random() * 24);
      };
      window.setTimeout(step, 120 + idx * 240);
    });
  }
  return d;
}

export function regenerateBlock(draftId: string, blockId: string) {
  const d = s().drafts.find((x) => x.id === draftId);
  if (!d) return;
  const b = d.blocks.find((x) => x.id === blockId);
  if (!b) return;
  const full = b.body + "\n\nAlternate framing: " + rephrase(b.body);
  b.body = "";
  b.streaming = true;
  d.status = "streaming";
  commit();
  let cursor = 0;
  const step = () => {
    const dd = s().drafts.find((x) => x.id === draftId);
    if (!dd) return;
    const bb = dd.blocks.find((x) => x.id === blockId);
    if (!bb) return;
    cursor = Math.min(full.length, cursor + 6 + Math.floor(Math.random() * 8));
    bb.body = full.slice(0, cursor);
    if (cursor >= full.length) {
      bb.streaming = false;
      if (dd.blocks.every((b) => !b.streaming)) dd.status = "ready";
      commit();
      return;
    }
    commit();
    window.setTimeout(step, 24 + Math.random() * 24);
  };
  window.setTimeout(step, 100);
}

export function approveBlock(draftId: string, blockId: string) {
  const d = s().drafts.find((x) => x.id === draftId);
  if (!d) return;
  const b = d.blocks.find((x) => x.id === blockId);
  if (!b) return;
  b.approved = true;
  commit();
}

export function ratifyDraft(draftId: string) {
  const d = s().drafts.find((x) => x.id === draftId);
  if (!d) return;
  d.status = "approved";
  d.approvedAt = Date.now();
  d.blocks.forEach((b) => (b.approved = true));
  commit();
}

// ─── Generators (deterministic prototype "AI") ──────────────
function rephrase(t: string): string {
  return t
    .replace(/reports/g, "describes")
    .replace(/appears/g, "presents as")
    .replace(/anxiety/g, "anxious ideation")
    .replace(/homework/g, "between-session practice");
}

export function generateSoapDraft(input: {
  patientId: string;
  sessionId: string;
  shorthand?: string;
  duration?: number;
}): Draft {
  const p = getPatient(input.patientId);
  const prior = listNotesForPatient(input.patientId).slice(0, 3);
  const name = p?.preferredName ?? p?.fullName?.split(" ")[0] ?? aliasFor(input.patientId);
  const lastConcern = p?.primaryConcern ?? "presenting concern";
  const tone = s().settings.tone;
  const brief = s().settings.length === "brief";

  const S = `${name} arrives on time and settles quickly. ${tone === "warm" ? "Warmth in eye contact; less guarded than last week." : "Engagement is steady."} Reports the ${lastConcern.toLowerCase()} pattern continues, particularly around sleep onset. ${input.shorthand ? `Notes from session: ${input.shorthand}` : "Brief mention of a difficult call with parents earlier this week."}`;
  const O = `Affect ${tone === "formal" ? "congruent to content" : "brighter than last visit"}. Speech normal rate and prosody. No signs of acute distress. Cognition intact. ${brief ? "" : "Mild psychomotor agitation early in the session, resolved by mid-hour."}`;
  const A = `${brief ? "Continued symptoms consistent with prior formulation. Modest improvement in coping." : `Continued moderate ${lastConcern.toLowerCase()}, consistent with prior formulation. Modest improvement in coping strategy use. No indication of imminent risk today.`}`;
  const P = `Continue weekly individual sessions. Assign a brief evening wind-down practice (10 min). Reintroduce PHQ-9 next session. ${brief ? "" : "If sleep onset does not improve within 2 weeks, review sleep hygiene formally."}`;

  const prov = prior.length > 0 ? `Prior ${prior.length} SOAP notes` : "No prior notes";

  return createDraft({
    kind: "soap",
    title: `SOAP · ${name}`,
    patientId: input.patientId,
    sessionId: input.sessionId,
    promptId: "soap.draft.v4",
    contextItems: [
      prov,
      "Session duration + modality",
      "Assessment scores (last 30d)",
      "Homework check-ins (last 30d)",
      input.shorthand ? "Therapist shorthand" : "No therapist shorthand",
    ],
    blocks: [
      { label: "Subjective", body: S },
      { label: "Objective", body: O },
      { label: "Assessment", body: A },
      { label: "Plan", body: P },
    ],
    streaming: true,
  });
}

export function generateRecap(input: { patientId: string; sessionId?: string }): Draft {
  const p = getPatient(input.patientId);
  const name = p?.preferredName ?? p?.fullName?.split(" ")[0] ?? aliasFor(input.patientId);
  const body = `Sixty-second recap. The session with ${name} moved from a slow, careful opening about work stress into a more grounded conversation about boundaries. Two notable moments: the shift from "I have to" to "I want to" around setting a phone-free evening, and a small, unforced laugh at minute 32 — the first in three weeks. Homework: 10-minute evening wind-down, three nights this week. Next session, watch for follow-through and the pattern around Sunday evenings, which continue to be the most vulnerable.`;
  return createDraft({
    kind: "recap",
    title: `Recap · ${name}`,
    patientId: input.patientId,
    sessionId: input.sessionId,
    promptId: "recap.v2",
    contextItems: ["Session transcript (if provided)", "Prior recap", "Homework logged this week"],
    blocks: [{ label: "60-second recap", body }],
    streaming: true,
  });
}

export function generateContinuityBrief(patientId: string): Draft {
  const p = getPatient(patientId);
  const name = p?.preferredName ?? p?.fullName?.split(" ")[0] ?? aliasFor(patientId);
  return createDraft({
    kind: "continuity",
    title: `Prep · ${name}`,
    patientId,
    promptId: "continuity.v3",
    contextItems: ["Last SOAP summary", "Homework compliance (7d)", "PHQ-9 / GAD-7 deltas (30d)", "Journal excerpts (7d)"],
    blocks: [
      { label: "Since last session", body: `Last SOAP: continued moderate anxiety with mild sleep onset difficulty. Homework was a 10-minute evening wind-down; ${name} logged 2 of 3 planned nights.` },
      { label: "Assessment deltas", body: `PHQ-9: 12 → 10 (−2). GAD-7: 11 → 11 (0). No critical items endorsed.` },
      { label: "A gentle observation", body: `${name} has moved from "I have to" to "I want to" in the last four sessions when talking about self-care. It's small and it's real.` },
      { label: "Openings you could use", body: `• "How did the evenings feel this week — not just the wind-down, the whole evening?"\n• "You mentioned Sunday last time. What's it like now?"\n• "What did you notice about yourself between sessions?"` },
    ],
    streaming: false,
  });
}

export function generateInterventions(patientId: string): Draft {
  const p = getPatient(patientId);
  const name = p?.preferredName ?? aliasFor(patientId);
  return createDraft({
    kind: "intervention",
    title: `Interventions · ${name}`,
    patientId,
    promptId: "intervention.v2",
    contextItems: ["Presenting concern", "Prior interventions tried", "Assessment scores (30d)"],
    blocks: [
      { label: "CBT · Behavioural activation", body: "Structured scheduling of small, meaningful activities to interrupt withdrawal. Fits current low-motivation presentation.\n\nWhy: Cuijpers et al., 2007 · Ekers et al., 2014." },
      { label: "ACT · Cognitive defusion", body: "Language-based exercises (e.g. 'I'm having the thought that…') to loosen fusion with rumination.\n\nWhy: Hayes et al., 2006 · Levin et al., 2012." },
      { label: "DBT · TIPP for acute distress", body: "Temperature, Intense exercise, Paced breathing, Paired muscle relaxation — for the Sunday-evening spikes.\n\nWhy: Linehan, 2015 · Neacsiu et al., 2014." },
    ],
    streaming: false,
  });
}

const INDIC_LEX: Record<Language, Record<string, string>> = {
  en: {},
  hi: {
    "You are doing meaningful work.": "आप सार्थक कार्य कर रहे हैं।",
    "Thank you for sharing.": "साझा करने के लिए धन्यवाद।",
    "Between sessions": "सत्रों के बीच",
    "Try to notice": "ध्यान देने का प्रयास करें",
  },
  ta: { "You are doing meaningful work.": "நீங்கள் அர்த்தமுள்ள வேலை செய்கிறீர்கள்." },
  bn: { "You are doing meaningful work.": "আপনি অর্থপূর্ণ কাজ করছেন।" },
  mr: { "You are doing meaningful work.": "तुम्ही अर्थपूर्ण काम करत आहात." },
};

export function generateTranslation(input: {
  direction: "clinical-to-patient" | "patient-to-clinical" | "language";
  targetLang?: Language;
  source: string;
}): Draft {
  let body = input.source;
  let title = "Translation";
  if (input.direction === "clinical-to-patient") {
    title = "Clinical → Patient-friendly";
    body = input.source
      .replace(/persistent depressive disorder/gi, "a long-lasting low mood")
      .replace(/generalized anxiety disorder/gi, "ongoing anxiety that shows up across many situations")
      .replace(/cognitive behavioural therapy|cognitive behavioral therapy/gi, "a talking practice that helps you notice thoughts and choose responses")
      .replace(/psychoeducation/gi, "learning about how this works")
      .replace(/adherence/gi, "keeping to the plan")
      + "\n\nIn short: we're taking this a step at a time, together. Nothing here is a verdict — it's a working understanding.";
  } else if (input.direction === "patient-to-clinical") {
    title = "Patient → Structured concerns";
    body = "Presenting concerns extracted:\n\n• Sleep disturbance (onset > 60 min, four nights past week)\n• Social withdrawal (declined two invitations)\n• Rumination cluster around workplace evaluation\n• No acute risk endorsed";
  } else if (input.direction === "language" && input.targetLang) {
    title = `English → ${({ hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi", en: "English" } as const)[input.targetLang]}`;
    const dict = INDIC_LEX[input.targetLang] ?? {};
    body = Object.entries(dict).reduce((acc, [k, v]) => acc.replaceAll(k, v), input.source);
  }
  return createDraft({
    kind: input.direction === "language" ? "translation-lang" : input.direction === "clinical-to-patient" ? "translation-patient" : "translation-clinical",
    title,
    promptId: "translate.v2",
    contextItems: ["Source text only. No patient identifiers included."],
    blocks: [{ label: title, body }],
    streaming: true,
  });
}

// Freeform copilot reply for the command palette + chat
export function generateReply(input: { prompt: string; context?: string }): string {
  const p = input.prompt.toLowerCase();
  if (p.includes("risk") || p.includes("watch")) {
    return "I'm surfacing four open risk signals right now. The most notable: a PHQ-9 Q9 rise from 0 → 2 for Patient A over the last three assessments. I've suggested adding a safety planning module. Open the watch list for lineage.";
  }
  if (p.includes("summar")) {
    return "Summary drafted from the last five sessions. Themes are converging around sleep, family expectations, and Sunday-evening dread. Homework compliance has climbed from 33% to 67% in the same window.";
  }
  if (p.includes("soap")) {
    return "I can draft a SOAP for today's session. I'll pull the prior three notes, the last month of assessment scores, and any homework check-ins. You'll ratify each block before anything saves.";
  }
  if (p.includes("intervention") || p.includes("suggest")) {
    return "Three intervention drafts are in the treatment plan panel. All are additive — none replace what you have. Each links to two or three references.";
  }
  if (p.includes("translate")) {
    return "I can translate in three directions: clinical to patient-friendly, patient message to structured concerns, or English to Hindi/Tamil/Bengali/Marathi. No patient identifiers leave your device.";
  }
  return "I've drafted a short reply. Adjust, or ask me to try again in a different tone.";
}
