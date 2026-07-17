// Waitlist — priority scoring, bulk actions, offer-slot workflow, add-to-waitlist.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Mail, Phone, UserCheck, UserMinus, Clock, ArrowRight, Plus, X, Send, Bookmark, ChevronDown, CheckSquare, Square } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLivePatients, updatePatient, dischargePatient, createPatient, avatarUrl, RISK_META, type Patient } from "@/lib/patients-store";
import { useAllMeta, setMeta, clearMeta, SOURCE_LABEL, OFFER_TEMPLATES, type WaitlistSource, type WaitlistMeta } from "@/lib/waitlist-ops-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [
      { title: "Waitlist — PeaceCode · Practice" },
      { name: "description", content: "Prospective intake queue with priority scoring, bulk actions, and offer-slot workflow." },
    ],
  }),
  component: WaitlistPage,
});

const DAY = 86_400_000;
const RISK_WEIGHT = { crisis: 40, elevated: 20, monitor: 8, stable: 0 } as const;

function priorityScore(p: Patient, meta?: WaitlistMeta): number {
  const waited = Math.round((Date.now() - p.intakeDate) / DAY);
  const waitPts = Math.min(50, waited);
  const boostPts = (meta?.priorityBoost ?? 0) * 10;
  return RISK_WEIGHT[p.risk] + waitPts + boostPts;
}

function WaitlistPage() {
  const hydrated = useHydrated();
  const list = useLivePatients({ status: "waitlist" });
  const metaMap = useAllMeta();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"priority" | "waited" | "risk" | "name">("priority");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [offerFor, setOfferFor] = useState<Patient[] | null>(null);
  const [adding, setAdding] = useState(false);

  const scored = useMemo(() => list.map((p) => ({ p, meta: metaMap[p.id], score: priorityScore(p, metaMap[p.id]) })), [list, metaMap]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = scored.filter(({ p }) => !needle || p.fullName.toLowerCase().includes(needle) || p.primaryConcern.toLowerCase().includes(needle) || p.college.toLowerCase().includes(needle));
    const riskRank = { crisis: 0, elevated: 1, monitor: 2, stable: 3 } as const;
    return out.sort((a, b) => {
      if (sort === "priority") return b.score - a.score;
      if (sort === "waited") return a.p.intakeDate - b.p.intakeDate;
      if (sort === "risk") return riskRank[a.p.risk] - riskRank[b.p.risk];
      return a.p.fullName.localeCompare(b.p.fullName);
    });
  }, [scored, q, sort]);

  const avgDays = list.length ? Math.round(list.reduce((s, p) => s + (Date.now() - p.intakeDate) / DAY, 0) / list.length) : 0;
  const longest = list.length ? Math.round((Date.now() - Math.min(...list.map((p) => p.intakeDate))) / DAY) : 0;
  const urgent = scored.filter(({ score }) => score >= 60).length;
  const offered = Object.values(metaMap).filter((m) => m.offer && m.offer.status === "pending").length;

  const selectedPatients = filtered.filter(({ p }) => selected.has(p.id)).map(({ p }) => p);

  function toggle(id: string) {
    const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n);
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(({ p }) => p.id)));
  }
  function bulkConvert() {
    selectedPatients.forEach((p) => { updatePatient(p.id, { status: "active" }); clearMeta(p.id); });
    setSelected(new Set());
  }
  function bulkMessage() {
    const emails = selectedPatients.map((p) => p.email).filter(Boolean).join(",");
    if (emails) window.location.href = `mailto:?bcc=${emails}&subject=Update from PeaceCode`;
  }
  function bulkRemove() {
    if (!confirm(`Remove ${selectedPatients.length} from waitlist?`)) return;
    selectedPatients.forEach((p) => { dischargePatient(p.id, "waitlist removed"); clearMeta(p.id); });
    setSelected(new Set());
  }

  if (!hydrated) return <AppShell crumb="Waitlist"><div /></AppShell>;

  return (
    <AppShell crumb="Waitlist">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6 pb-16">
        <header className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Waitlist</h1>
            <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>
              {list.length} in queue · avg wait {avgDays}d · longest {longest}d
            </p>
          </div>
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
            <Plus className="h-3.5 w-3.5" /> Add to waitlist
          </button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="In queue" value={String(list.length)} sub="prospective patients" />
          <Stat label="High priority" value={String(urgent)} sub="score ≥ 60" tone={urgent ? "warn" : "ok"} />
          <Stat label="Slots offered" value={String(offered)} sub="awaiting response" />
          <Stat label="Longest wait" value={`${longest}d`} sub="prioritize first" tone={longest > 30 ? "warn" : "ok"} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, concern or college" className="w-full pl-8 pr-3 py-2 rounded-full border text-[12.5px] bg-white/70" style={{ borderColor: palette.border }} />
          </div>
          <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: palette.glass }}>
            {(["priority", "waited", "risk", "name"] as const).map((k) => (
              <button key={k} onClick={() => setSort(k)} className="rounded-full px-3 py-1 text-[11px] capitalize" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: sort === k ? palette.ink : "transparent", color: sort === k ? "#fff" : palette.muted }}>
                {k === "waited" ? "Wait time" : k}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3 rounded-full px-4 py-2" style={{ background: palette.ink, color: "#fff" }}>
            <span className="text-[12px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace" }}>{selected.size} selected</span>
            <button onClick={() => setOfferFor(selectedPatients)} className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] bg-white/15"><Send className="h-3 w-3" /> Offer slot</button>
            <button onClick={bulkMessage} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] bg-white/15"><Mail className="h-3 w-3" /> Email</button>
            <button onClick={bulkConvert} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] bg-white/15"><UserCheck className="h-3 w-3" /> Convert</button>
            <button onClick={bulkRemove} className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11.5px] bg-white/15"><UserMinus className="h-3 w-3" /> Remove</button>
            <button onClick={() => setSelected(new Set())} className="rounded-full p-1"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: palette.border, background: palette.glassStrong }}>
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-[13px]" style={{ color: palette.muted }}>Nothing on the waitlist{q ? " matches this search" : ""}.</div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 py-2 border-b text-[10.5px] uppercase tracking-[0.14em]" style={{ borderColor: palette.border, color: palette.muted, background: "rgba(0,0,0,0.02)", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                <button onClick={toggleAll} className="rounded p-0.5">{selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}</button>
                <span>#</span>
                <span className="ml-auto">Priority · Wait · Actions</span>
              </div>
              {filtered.map(({ p, meta, score }, i) => (
                <Row key={p.id} p={p} meta={meta} score={score} rank={i + 1}
                  checked={selected.has(p.id)} onCheck={() => toggle(p.id)}
                  onOffer={() => setOfferFor([p])} />
              ))}
            </>
          )}
        </div>
      </div>

      {offerFor && <OfferDialog patients={offerFor} onClose={() => { setOfferFor(null); setSelected(new Set()); }} />}
      {adding && <AddDialog onClose={() => setAdding(false)} />}
    </AppShell>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "ok" | "warn" }) {
  const accent = tone === "warn" ? "#B0384A" : palette.ink;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: palette.glass, backdropFilter: "blur(12px)" }}>
      <div className="text-[10.5px] tracking-[0.16em] uppercase" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</div>
      <div className="tabular-nums leading-none mt-2" style={{ fontFamily: "'Fraunces', serif", color: accent, fontSize: 32 }}>{value}</div>
      {sub && <div className="text-[11.5px] mt-1" style={{ color: palette.muted }}>{sub}</div>}
    </div>
  );
}

function Row({ p, meta, score, rank, checked, onCheck, onOffer }: { p: Patient; meta?: WaitlistMeta; score: number; rank: number; checked: boolean; onCheck: () => void; onOffer: () => void }) {
  const waited = Math.max(0, Math.round((Date.now() - p.intakeDate) / DAY));
  const rmeta = RISK_META[p.risk];
  const urgent = score >= 60;
  const offer = meta?.offer;
  const boost = meta?.priorityBoost ?? 0;

  return (
    <div className="grid grid-cols-[auto_28px_auto_1fr_auto] items-center gap-3 px-4 py-3 border-t" style={{ borderColor: palette.border, background: checked ? "rgba(0,0,0,0.03)" : undefined }}>
      <button onClick={onCheck} className="rounded p-0.5" style={{ color: palette.muted }}>{checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}</button>
      <span className="tabular-nums text-[13px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{rank}</span>
      <img src={avatarUrl(p.id)} alt="" className="h-10 w-10 rounded-full object-cover" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <Link to="/patients/$pid" params={{ pid: p.id }} className="text-[14px] hover:underline" style={{ color: palette.ink }}>{p.preferredName ?? p.fullName}</Link>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em]" style={{ background: rmeta.softToken, color: rmeta.token, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{rmeta.label}</span>
          {meta?.source && <span className="text-[10.5px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{SOURCE_LABEL[meta.source]}</span>}
          {offer && offer.status === "pending" && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px]" style={{ background: "rgba(59,110,143,0.10)", color: "#3B6E8F", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              offered · {new Date(offer.slotAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        <div className="text-[12px] mt-0.5 truncate" style={{ color: palette.muted }}>{p.primaryConcern} · {p.college}, {p.yearOfStudy}</div>
        {meta?.note && <div className="text-[11px] mt-0.5 italic truncate" style={{ color: palette.muted }}>“{meta.note}”</div>}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right hidden md:block">
          <div className="tabular-nums text-[16px] leading-none" style={{ fontFamily: "'Fraunces', serif", color: urgent ? "#B0384A" : palette.ink }}>{score}</div>
          <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>priority</div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]" style={{ color: urgent ? "#B0384A" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <Clock className="h-3 w-3" /> {waited}d
        </div>
        <button title={`Priority boost (${boost}/3)`} onClick={() => setMeta(p.id, { priorityBoost: (((boost + 1) % 4) as 0 | 1 | 2 | 3) })} className="inline-flex items-center gap-0.5 rounded-full border px-2 py-1 text-[11px]" style={{ borderColor: palette.border, color: boost > 0 ? "#B85A3E" : palette.muted }}>
          <Bookmark className="h-3 w-3" fill={boost > 0 ? "#B85A3E" : "none"} /> {boost}
        </button>
        <button onClick={onOffer} title="Offer slot" className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]" style={{ background: palette.primary, color: "#fff" }}>
          <Send className="h-3 w-3" /> Offer
        </button>
        <a href={`mailto:${p.email}`} title="Email" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}><Mail className="h-3.5 w-3.5" /></a>
        {p.phone && <a href={`tel:${p.phone}`} title="Call" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}><Phone className="h-3.5 w-3.5" /></a>}
        <button onClick={() => { updatePatient(p.id, { status: "active" }); clearMeta(p.id); }} title="Convert" className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: "#2F6A4A" }}><UserCheck className="h-3.5 w-3.5" /></button>
        <Link to="/patients/$pid" params={{ pid: p.id }} className="rounded-full border p-1.5" style={{ borderColor: palette.border, color: palette.muted }}><ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
    </div>
  );
}

function OfferDialog({ patients, onClose }: { patients: Patient[]; onClose: () => void }) {
  const defaultDate = new Date(Date.now() + 3 * DAY); defaultDate.setHours(15, 0, 0, 0);
  const [when, setWhen] = useState(defaultDate.toISOString().slice(0, 16));
  const [template, setTemplate] = useState<"warm" | "brief" | "urgent">("warm");
  const slotAt = new Date(when).getTime();
  const whenLabel = new Date(when).toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  const previewName = patients[0].preferredName ?? patients[0].fullName.split(" ")[0];
  const body = OFFER_TEMPLATES[template].body(previewName, whenLabel);

  function send() {
    patients.forEach((p) => {
      setMeta(p.id, { offer: { slotAt, template, sentAt: Date.now(), status: "pending" } });
    });
    const emails = patients.map((p) => p.email).filter(Boolean).join(",");
    const subj = encodeURIComponent(template === "urgent" ? "Priority intake slot" : "A slot has opened for us");
    const bod = encodeURIComponent(body);
    if (emails) window.location.href = `mailto:?bcc=${emails}&subject=${subj}&body=${bod}`;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,15,20,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl p-6" style={{ background: "#FFFDFB", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Offer intake slot</h2>
            <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
              {patients.length === 1 ? patients[0].preferredName ?? patients[0].fullName : `${patients.length} patients`}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full border p-1.5" style={{ borderColor: palette.border }}><X className="h-4 w-4" /></button>
        </div>

        <label className="block">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Slot date & time</span>
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
        </label>

        <label className="block mt-3">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Template</span>
          <div className="mt-1 inline-flex rounded-full border p-1" style={{ borderColor: palette.border, background: palette.glass }}>
            {(["warm", "brief", "urgent"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setTemplate(k)} className="rounded-full px-3 py-1 text-[11px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: template === k ? palette.ink : "transparent", color: template === k ? "#fff" : palette.muted }}>
                {OFFER_TEMPLATES[k].label}
              </button>
            ))}
          </div>
        </label>

        <div className="mt-4 rounded-xl border p-3 whitespace-pre-wrap text-[12.5px]" style={{ borderColor: palette.border, background: palette.glass, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          {body}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border px-4 py-2 text-[12px]" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
          <button onClick={send} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
            <Send className="h-3.5 w-3.5" /> Send & mark offered
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDialog({ onClose }: { onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [concern, setConcern] = useState("");
  const [source, setSource] = useState<WaitlistSource>("self");
  const [risk, setRisk] = useState<"stable" | "monitor" | "elevated" | "crisis">("monitor");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    const p = createPatient({
      fullName: fullName.trim(),
      pronouns: "they/them",
      age: 21,
      email: email.trim(),
      phone: phone.trim() || undefined,
      college: "—",
      yearOfStudy: "—",
      status: "waitlist",
      risk,
      primaryConcern: concern.trim() || "Intake pending",
      tags: [],
      intakeDate: Date.now(),
      consentSharing: false,
    });
    setMeta(p.id, { source });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,15,20,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl p-6" style={{ background: "#FFFDFB", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Add to waitlist</h2>
          <button type="button" onClick={onClose} className="rounded-full border p-1.5" style={{ borderColor: palette.border }}><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Full name" v={fullName} set={setFullName} req />
          <Field label="Email" v={email} set={setEmail} type="email" req />
          <Field label="Phone" v={phone} set={setPhone} />
          <Field label="Presenting concern" v={concern} set={setConcern} placeholder="e.g. Exam anxiety, sleep issues" />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Source</span>
              <select value={source} onChange={(e) => setSource(e.target.value as WaitlistSource)} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }}>
                {(Object.keys(SOURCE_LABEL) as WaitlistSource[]).map((k) => <option key={k} value={k}>{SOURCE_LABEL[k]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Initial risk</span>
              <select value={risk} onChange={(e) => setRisk(e.target.value as typeof risk)} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }}>
                <option value="stable">Stable</option><option value="monitor">Monitor</option><option value="elevated">Elevated</option><option value="crisis">Crisis</option>
              </select>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border px-4 py-2 text-[12px]" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
          <button type="submit" className="rounded-full px-4 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>Add</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, v, set, type = "text", req, placeholder }: { label: string; v: string; set: (v: string) => void; type?: string; req?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}{req && " *"}</span>
      <input type={type} required={req} value={v} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
    </label>
  );
}
