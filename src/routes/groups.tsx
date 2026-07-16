// Groups — cohorts with attendance ledger, session logging, member stats,
// bulk messaging, duplicate.
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Users, Video, MapPin, X, Trash2, UserPlus, Mail, Copy, ClipboardCheck, Calendar } from "lucide-react";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useLiveGroups, createGroup, deleteGroup, addMember, removeMember, updateGroup, CADENCE_LABEL, STATUS_META, type Group, type GroupStatus, type GroupModality, type GroupCadence } from "@/lib/groups-store";
import { useLivePatients, avatarUrl, type Patient } from "@/lib/patients-store";
import { useGroupSessions, logSession, deleteSession, attendanceRate, ATTENDANCE_META, type Attendance } from "@/lib/group-attendance-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groups — PeaceCode · Practice" },
      { name: "description", content: "Therapy cohorts with attendance tracking, session logs, member stats and bulk messaging." },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  const hydrated = useHydrated();
  const groups = useLiveGroups();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | GroupStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return groups
      .filter((g) => status === "all" || g.status === status)
      .filter((g) => !needle || g.name.toLowerCase().includes(needle) || g.focus.toLowerCase().includes(needle));
  }, [groups, q, status]);

  const active = groups.filter((g) => g.status === "active").length;
  const totalMembers = groups.reduce((s, g) => s + g.memberIds.length, 0);
  const openGroup = openId ? groups.find((g) => g.id === openId) : null;

  if (!hydrated) return <AppShell crumb="Groups"><div /></AppShell>;

  return (
    <AppShell crumb="Groups">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-6 pb-16">
        <header className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Groups</h1>
            <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>{groups.length} groups · {active} active · {totalMembers} enrolled members</p>
          </div>
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}><Plus className="h-3.5 w-3.5" /> New group</button>
        </header>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: palette.muted }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or focus" className="w-full pl-8 pr-3 py-2 rounded-full border text-[12.5px] bg-white/70" style={{ borderColor: palette.border }} />
          </div>
          <div className="inline-flex items-center rounded-full border p-1" style={{ borderColor: palette.border, background: palette.glass }}>
            {(["all", "active", "forming", "closed"] as const).map((k) => (
              <button key={k} onClick={() => setStatus(k)} className="rounded-full px-3 py-1 text-[11px] capitalize" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: status === k ? palette.ink : "transparent", color: status === k ? "#fff" : palette.muted }}>{k}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border p-10 text-center text-[13px]" style={{ borderColor: palette.border, background: palette.glassStrong, color: palette.muted }}>No groups match.</div>
          ) : filtered.map((g) => <GroupCard key={g.id} g={g} onOpen={() => setOpenId(g.id)} />)}
        </div>
      </div>

      {openGroup && <GroupDrawer g={openGroup} onClose={() => setOpenId(null)} />}
      {creating && <CreateDialog onClose={() => setCreating(false)} />}
    </AppShell>
  );
}

function GroupCard({ g, onOpen }: { g: Group; onOpen: () => void }) {
  const meta = STATUS_META[g.status];
  const pct = Math.round((g.memberIds.length / g.capacity) * 100);
  const sessions = useGroupSessions(g.id);
  const next = g.nextSessionAt ? new Date(g.nextSessionAt) : null;
  return (
    <button onClick={onOpen} className="text-left rounded-2xl border p-4 transition-all hover:-translate-y-0.5" style={{ borderColor: palette.border, background: palette.glassStrong, backdropFilter: "blur(12px)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{g.name}</div>
          <div className="text-[12px] mt-1" style={{ color: palette.muted }}>{g.focus}</div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em]" style={{ background: meta.bg, color: meta.color, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
        <span className="inline-flex items-center gap-1">{g.modality === "video" ? <Video className="h-3 w-3" /> : g.modality === "in-person" ? <MapPin className="h-3 w-3" /> : <><Video className="h-3 w-3" /><MapPin className="h-3 w-3" /></>} {g.modality}</span>
        <span>·</span><span>{CADENCE_LABEL[g.cadence]}</span>
        <span>·</span><span>{sessions.length} logged</span>
        {next && (<><span>·</span><span>next {next.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></>)}
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {g.memberIds.length} / {g.capacity}</span>
          <span>{pct}% full</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
          <div className="h-full" style={{ width: `${pct}%`, background: pct >= 100 ? "#B0384A" : palette.primary }} />
        </div>
      </div>
    </button>
  );
}

function GroupDrawer({ g, onClose }: { g: Group; onClose: () => void }) {
  const patients = useLivePatients();
  const members = patients.filter((p) => g.memberIds.includes(p.id));
  const candidates = patients.filter((p) => !g.memberIds.includes(p.id) && p.status === "active");
  const sessions = useGroupSessions(g.id);
  const [tab, setTab] = useState<"roster" | "sessions">("roster");
  const [addOpen, setAddOpen] = useState(false);
  const [logging, setLogging] = useState(false);
  const meta = STATUS_META[g.status];

  function messageAll() {
    const emails = members.map((p) => p.email).filter(Boolean).join(",");
    if (emails) window.location.href = `mailto:?bcc=${emails}&subject=${encodeURIComponent(g.name)}`;
  }
  function duplicate() {
    const copy = createGroup({ ...g, name: `${g.name} (copy)`, status: "forming", memberIds: [] });
    onClose(); setTimeout(() => alert(`Created "${copy.name}"`), 100);
  }

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(20,15,20,0.35)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="ml-auto h-full w-full max-w-[560px] overflow-y-auto p-6" style={{ background: "#FFFDFB", borderLeft: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] uppercase tracking-[0.14em] mb-2" style={{ background: meta.bg, color: meta.color, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{meta.label}</span>
            <h2 className="text-[22px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{g.name}</h2>
            <p className="text-[12.5px] mt-1" style={{ color: palette.muted }}>{g.focus}</p>
          </div>
          <button onClick={onClose} className="rounded-full border p-1.5" style={{ borderColor: palette.border }}><X className="h-4 w-4" /></button>
        </div>

        <dl className="grid grid-cols-2 gap-3 mt-5 text-[12px]">
          <Field label="Facilitator" value={g.facilitator} />
          <Field label="Cadence" value={CADENCE_LABEL[g.cadence]} />
          <Field label="Modality" value={g.modality} />
          <Field label="Capacity" value={`${g.memberIds.length} / ${g.capacity}`} />
          <Field label="Started" value={new Date(g.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
          <Field label="Sessions logged" value={String(sessions.length)} />
        </dl>

        {g.notes && (
          <p className="mt-4 text-[12.5px] p-3 rounded-xl border italic" style={{ borderColor: palette.border, background: palette.glass, color: palette.muted }}>{g.notes}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setLogging(true)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}><ClipboardCheck className="h-3 w-3" /> Log session</button>
          <button onClick={messageAll} disabled={members.length === 0} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11.5px] disabled:opacity-40" style={{ borderColor: palette.border, color: palette.ink }}><Mail className="h-3 w-3" /> Message all</button>
          <button onClick={duplicate} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11.5px]" style={{ borderColor: palette.border, color: palette.ink }}><Copy className="h-3 w-3" /> Duplicate</button>
          <select value={g.status} onChange={(e) => updateGroup(g.id, { status: e.target.value as GroupStatus })} className="rounded-full border px-3 py-1 text-[11.5px] bg-white" style={{ borderColor: palette.border }}>
            <option value="forming">Forming</option><option value="active">Active</option><option value="closed">Closed</option>
          </select>
        </div>

        <div className="mt-6 inline-flex rounded-full border p-1" style={{ borderColor: palette.border, background: palette.glass }}>
          {(["roster", "sessions"] as const).map((k) => (
            <button key={k} onClick={() => setTab(k)} className="rounded-full px-3 py-1 text-[11.5px]" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", background: tab === k ? palette.ink : "transparent", color: tab === k ? "#fff" : palette.muted }}>
              {k === "roster" ? `Roster (${members.length})` : `Sessions (${sessions.length})`}
            </button>
          ))}
        </div>

        {tab === "roster" ? (
          <div className="mt-3">
            {g.memberIds.length < g.capacity && (
              <button onClick={() => setAddOpen((v) => !v)} className="mb-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px]" style={{ borderColor: palette.border, color: palette.ink }}><UserPlus className="h-3 w-3" /> Add member</button>
            )}
            {addOpen && (
              <div className="mb-3 rounded-xl border p-2 max-h-56 overflow-y-auto" style={{ borderColor: palette.border, background: palette.glass }}>
                {candidates.length === 0 ? (
                  <p className="p-3 text-[12px]" style={{ color: palette.muted }}>No eligible patients.</p>
                ) : candidates.map((p) => (
                  <button key={p.id} onClick={() => { addMember(g.id, p.id); setAddOpen(false); }} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-black/[0.03] text-left">
                    <img src={avatarUrl(p.id)} alt="" className="h-6 w-6 rounded-full" />
                    <span className="text-[12.5px]" style={{ color: palette.ink }}>{p.preferredName ?? p.fullName}</span>
                    <span className="ml-auto text-[10.5px]" style={{ color: palette.muted }}>{p.primaryConcern}</span>
                  </button>
                ))}
              </div>
            )}

            <ul className="space-y-1">
              {members.length === 0 ? (
                <li className="text-[12.5px] p-3 rounded-xl border text-center" style={{ borderColor: palette.border, color: palette.muted }}>No members yet.</li>
              ) : members.map((p) => {
                const rate = attendanceRate(sessions, p.id);
                return (
                  <li key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: palette.glass }}>
                    <img src={avatarUrl(p.id)} alt="" className="h-7 w-7 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] truncate" style={{ color: palette.ink }}>{p.preferredName ?? p.fullName}</div>
                      <div className="text-[11px] truncate" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                        {rate.total === 0 ? "no sessions logged" : `${rate.attended}/${rate.total} attended · ${rate.pct}%`}
                      </div>
                    </div>
                    <button onClick={() => removeMember(g.id, p.id)} className="rounded-full p-1 hover:bg-black/[0.05]" title="Remove">
                      <X className="h-3.5 w-3.5" style={{ color: palette.muted }} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {sessions.length === 0 ? (
              <p className="text-[12.5px] p-3 rounded-xl border text-center" style={{ borderColor: palette.border, color: palette.muted }}>No sessions logged yet.</p>
            ) : sessions.map((s) => {
              const present = Object.values(s.attendance).filter((a) => a === "present" || a === "late").length;
              return (
                <div key={s.id} className="rounded-xl border p-3" style={{ borderColor: palette.border, background: palette.glass }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[12.5px]" style={{ color: palette.ink }}>
                      <Calendar className="h-3.5 w-3.5" style={{ color: palette.muted }} />
                      {new Date(s.at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <span className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{present}/{Object.keys(s.attendance).length} attended</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {members.map((p) => {
                      const mark = s.attendance[p.id];
                      if (!mark) return null;
                      const am = ATTENDANCE_META[mark];
                      return <span key={p.id} className="text-[10.5px] rounded-full px-2 py-0.5" style={{ background: am.bg, color: am.color, fontFamily: "'DM Mono', ui-monospace, monospace" }} title={am.label}>{(p.preferredName ?? p.fullName).split(" ")[0]}</span>;
                    })}
                  </div>
                  {s.facilitatorNote && <p className="mt-2 text-[11.5px] italic" style={{ color: palette.muted }}>{s.facilitatorNote}</p>}
                  <button onClick={() => deleteSession(s.id)} className="mt-2 text-[10.5px]" style={{ color: "#B0384A" }}>Delete</button>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={() => { if (confirm(`Delete "${g.name}"? This cannot be undone.`)) { deleteGroup(g.id); onClose(); } }} className="mt-8 inline-flex items-center gap-1 text-[11.5px]" style={{ color: "#B0384A" }}>
          <Trash2 className="h-3.5 w-3.5" /> Delete group
        </button>
      </div>

      {logging && <LogSessionDialog g={g} members={members} onClose={() => setLogging(false)} />}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</dt>
      <dd className="mt-0.5 capitalize" style={{ color: palette.ink }}>{value}</dd>
    </div>
  );
}

function LogSessionDialog({ g, members, onClose }: { g: Group; members: Patient[]; onClose: () => void }) {
  const [when, setWhen] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [attendance, setAttendance] = useState<Record<string, Attendance>>(() =>
    Object.fromEntries(members.map((m) => [m.id, "present" as Attendance]))
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    logSession({ groupId: g.id, at: new Date(when).getTime(), facilitatorNote: note.trim() || undefined, attendance });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,15,20,0.4)", backdropFilter: "blur(4px)" }} onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <form onSubmit={submit} className="w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#FFFDFB", border: `1px solid ${palette.border}` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Log session · {g.name}</h2>
          <button type="button" onClick={onClose} className="rounded-full border p-1.5" style={{ borderColor: palette.border }}><X className="h-4 w-4" /></button>
        </div>
        <label className="block">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Date</span>
          <input type="date" value={when} onChange={(e) => setWhen(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
        </label>
        <div className="mt-4">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Attendance</span>
          <ul className="mt-2 space-y-1">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: palette.glass }}>
                <img src={avatarUrl(m.id)} alt="" className="h-6 w-6 rounded-full" />
                <span className="flex-1 text-[12.5px]" style={{ color: palette.ink }}>{m.preferredName ?? m.fullName}</span>
                <div className="inline-flex rounded-full border p-0.5" style={{ borderColor: palette.border, background: palette.solid }}>
                  {(["present", "late", "absent", "excused"] as const).map((k) => {
                    const on = attendance[m.id] === k;
                    const am = ATTENDANCE_META[k];
                    return (
                      <button key={k} type="button" onClick={() => setAttendance({ ...attendance, [m.id]: k })} className="rounded-full px-2 py-0.5 text-[10.5px]" style={{ background: on ? am.color : "transparent", color: on ? "#fff" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{am.label}</button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <label className="block mt-4">
          <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Facilitator note</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="What did the group work on?" className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border px-4 py-2 text-[12px]" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
          <button type="submit" className="rounded-full px-4 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>Save session</button>
        </div>
      </form>
    </div>
  );
}

function CreateDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [modality, setModality] = useState<GroupModality>("video");
  const [cadence, setCadence] = useState<GroupCadence>("weekly");
  const [capacity, setCapacity] = useState(8);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !focus.trim()) return;
    createGroup({ name: name.trim(), focus: focus.trim(), modality, cadence, capacity, status: "forming", facilitator: "Dr. R. Menon" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,15,20,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl p-6" style={{ background: "#FFFDFB", border: `1px solid ${palette.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>New group</h2>
          <button type="button" onClick={onClose} className="rounded-full border p-1.5" style={{ borderColor: palette.border }}><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <TextField label="Name" v={name} set={setName} placeholder="e.g. Anxiety skills cohort" />
          <TextField label="Focus" v={focus} set={setFocus} placeholder="What's the group for?" />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Modality</span>
              <select value={modality} onChange={(e) => setModality(e.target.value as GroupModality)} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }}>
                <option value="video">Video</option><option value="in-person">In person</option><option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Cadence</span>
              <select value={cadence} onChange={(e) => setCadence(e.target.value as GroupCadence)} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }}>
                <option value="weekly">Weekly</option><option value="biweekly">Every 2 weeks</option><option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Capacity</span>
            <input type="number" min={2} max={30} value={capacity} onChange={(e) => setCapacity(Number(e.target.value) || 2)} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border px-4 py-2 text-[12px]" style={{ borderColor: palette.border, color: palette.muted }}>Cancel</button>
          <button type="submit" className="rounded-full px-4 py-2 text-[12px]" style={{ background: palette.ink, color: "#fff" }}>Create</button>
        </div>
      </form>
    </div>
  );
}

function TextField({ label, v, set, placeholder }: { label: string; v: string; set: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{label}</span>
      <input value={v} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-lg border px-3 py-2 text-[13px] bg-white" style={{ borderColor: palette.border }} />
    </label>
  );
}
