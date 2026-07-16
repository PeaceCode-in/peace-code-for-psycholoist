import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Save, Lock, GitBranch, History, Copy, FileDown, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { palette } from "@/components/practice/palette";
import {
  useLiveNote, updateSections, signNote, verifyIntegrity, markExported,
  clinicianIdentity, type NoteSection,
} from "@/lib/notes-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/notes/$nid")({
  component: NoteEditor,
});

function NoteEditor() {
  const { nid } = Route.useParams();
  const hydrated = useHydrated();
  const note = useLiveNote(nid);
  const navigate = useNavigate();

  const [sections, setSections] = useState<NoteSection[]>(note?.sections ?? []);
  const [savedAt, setSavedAt] = useState<number | null>(note?.updatedAt ?? null);
  const [dirty, setDirty] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate local state when note first loads / changes id
  useEffect(() => {
    if (note && sections.length === 0) {
      setSections(note.sections);
      setSavedAt(note.updatedAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  // Autosave (10s debounce)
  useEffect(() => {
    if (!dirty || !note || note.status !== "draft") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const updated = updateSections(note.id, sections);
      if (updated) { setSavedAt(updated.updatedAt); setDirty(false); }
    }, 10_000);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [dirty, sections, note]);

  // Keyboard: Cmd/Ctrl+S save · Cmd/Ctrl+Enter sign
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === "s") { e.preventDefault(); manualSave(); }
      if (e.key === "Enter") { e.preventDefault(); doSign(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, sections]);

  if (!hydrated) return null;
  if (!note) return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
      <p className="text-[13px]" style={{ color: palette.muted }}>This note doesn't exist. It may have been deleted.</p>
      <Link to="/notes" className="text-[12px] underline mt-3 inline-block" style={{ color: palette.ink }}>Back to notes</Link>
    </div>
  );

  const patient = getPatient(note.patientId);
  const integrity = verifyIntegrity(note);
  const readOnly = note.status !== "draft";

  function updateField(idx: number, body: string) {
    const next = sections.map((s, i) => i === idx ? { ...s, body } : s);
    setSections(next);
    setDirty(true);
  }

  function manualSave() {
    if (!note || readOnly) return;
    const updated = updateSections(note.id, sections);
    if (updated) { setSavedAt(updated.updatedAt); setDirty(false); }
  }

  function doSign() {
    if (!note) return;
    if (note.status !== "draft") return;
    manualSave();
    const ok = window.confirm("Sign and lock this note? After signing, changes require an amendment.");
    if (!ok) return;
    signNote(note.id);
  }

  function copyRedacted() {
    const text = sections.map((s) => `${s.label}\n${s.body || "—"}`).join("\n\n");
    const redacted = text.replace(new RegExp(patient?.fullName ?? "___patient___", "gi"), "[patient]");
    navigator.clipboard?.writeText(redacted);
  }

  function exportPdf() {
    if (!note) return;
    if (note.status === "draft") { window.alert("Only signed notes can be exported to PDF."); return; }
    markExported(note.id);
    const win = window.open("", "_blank");
    if (!win) return;
    const html = renderPdfHtml(note, sections, patient?.fullName ?? "Unknown patient");
    win.document.write(html); win.document.close(); setTimeout(() => win.print(), 250);
  }


  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <div className="grid gap-5" style={{ gridTemplateColumns: "260px minmax(0,1fr) 280px" }}>

        {/* LEFT: patient rail */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl border p-4 sticky top-6" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <Link to="/notes" className="inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] mb-4" style={{ color: palette.muted }}>
              <ArrowLeft className="h-3 w-3" /> All notes
            </Link>
            {patient ? (
              <>
                <div className="text-[15px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{patient.fullName}</div>
                <div className="text-[11.5px] mt-1" style={{ color: palette.muted }}>{patient.pronouns} · {patient.age} · {patient.yearOfStudy}</div>
                <div className="text-[11.5px]" style={{ color: palette.muted }}>{patient.college}</div>
                <div className="mt-4 space-y-2 text-[11.5px]" style={{ color: palette.ink }}>
                  <div className="flex justify-between"><span style={{ color: palette.muted }}>Concern</span><span>{patient.primaryConcern}</span></div>
                  <div className="flex justify-between"><span style={{ color: palette.muted }}>Risk</span><span className="capitalize">{patient.risk}</span></div>
                  <div className="flex justify-between"><span style={{ color: palette.muted }}>Sessions</span><span>{patient.totalSessions}</span></div>
                </div>
                <Link to="/patients/$pid" params={{ pid: patient.id }} className="mt-4 inline-block text-[11.5px] underline" style={{ color: palette.ink }}>
                  Open chart →
                </Link>
              </>
            ) : (
              <div className="text-[11.5px]" style={{ color: palette.muted }}>Patient not found.</div>
            )}
          </div>
        </aside>

        {/* CENTER: editor */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                {note.type} · {new Date(note.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
              <StatusPill status={note.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: palette.muted }}>
                {dirty ? "Unsaved changes" : savedAt ? `Saved ${relTime(savedAt)}` : ""}
              </span>
              {!readOnly && (
                <>
                  <button onClick={manualSave} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.ink, background: palette.glassStrong }}>
                    <Save className="h-3.5 w-3.5" /> Save
                  </button>
                  <button onClick={doSign} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
                    <Lock className="h-3.5 w-3.5" /> Sign & lock
                  </button>
                </>
              )}
              {readOnly && (
                <>
                  <button onClick={copyRedacted} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.ink, background: palette.glassStrong }}>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                  <button onClick={exportPdf} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.ink, background: palette.glassStrong }}>
                    <FileDown className="h-3.5 w-3.5" /> Export PDF
                  </button>
                  <button onClick={() => navigate({ to: "/notes/$nid/amend", params: { nid: note.id } })} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
                    <GitBranch className="h-3.5 w-3.5" /> Amend
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Editor surface */}
          <div className="rounded-3xl border" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="p-6 lg:p-10 space-y-8">
              {sections.map((s, idx) => (
                <section key={s.key}>
                  <h3 className="text-[18px] leading-tight tracking-tight mb-3" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
                    {s.label}
                  </h3>
                  <textarea
                    value={s.body}
                    onChange={(e) => updateField(idx, e.target.value)}
                    readOnly={readOnly}
                    rows={Math.max(4, Math.ceil((s.body.length || 40) / 80))}
                    placeholder={readOnly ? "" : `Write the ${s.label.toLowerCase()}…`}
                    className="w-full resize-y outline-none bg-transparent text-[14px] leading-[1.7]"
                    style={{ color: palette.ink, fontFamily: "'DM Sans', sans-serif" }}
                  />
                </section>
              ))}
            </div>

            {/* Signature block */}
            {note.signedAt && (
              <div className="border-t px-6 lg:px-10 py-5" style={{ borderColor: palette.border }}>
                <div className="text-[10.5px] uppercase tracking-[0.16em] mb-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Signed</div>
                <div className="text-[13.5px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{note.signedBy}</div>
                <div className="text-[11.5px]" style={{ color: palette.muted }}>
                  {clinicianIdentity().license} · {new Date(note.signedAt).toLocaleString("en-IN")}
                </div>
                <div className="text-[10.5px] mt-1 inline-flex items-center gap-1.5" style={{ color: integrity.ok ? "#3E6A2E" : "#B0567A", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  {integrity.ok ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                  {integrity.ok ? "Integrity verified" : "Tamper detected"} · {note.lockedHash}
                </div>
              </div>
            )}

            {/* Amendments */}
            {note.amendments.map((a) => (
              <div key={a.id} className="border-t px-6 lg:px-10 py-6" style={{ borderColor: palette.border, background: "rgba(239,228,240,0.35)" }}>
                <div className="text-[10.5px] uppercase tracking-[0.16em] mb-2 inline-flex items-center gap-1.5" style={{ color: "#5F3F60", fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                  <GitBranch className="h-3 w-3" /> Amendment
                </div>
                <div className="text-[13px] mb-3" style={{ color: palette.ink }}>
                  <span style={{ color: palette.muted }}>Reason: </span>{a.reason}
                </div>
                <div className="space-y-4">
                  {a.sections.map((s) => (
                    <div key={s.key}>
                      <div className="text-[12.5px] mb-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{s.label}</div>
                      <div className="text-[13px] whitespace-pre-wrap leading-relaxed" style={{ color: palette.ink }}>{s.body || "—"}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[11px]" style={{ color: palette.muted }}>
                  Signed {a.signedBy} · {new Date(a.signedAt).toLocaleString("en-IN")} · {a.hash}
                </div>
              </div>
            ))}
          </div>

          {/* Versions drawer */}
          {note.versions.length > 0 && (
            <div className="mt-4">
              <button onClick={() => setShowVersions((v) => !v)} className="inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: palette.muted }}>
                <History className="h-3.5 w-3.5" /> {showVersions ? "Hide" : "Show"} version history ({note.versions.length})
              </button>
              {showVersions && (
                <ul className="mt-3 space-y-1.5 text-[11.5px]" style={{ color: palette.muted }}>
                  {note.versions.slice().reverse().map((v) => (
                    <li key={v.id} className="rounded-lg px-3 py-1.5 border" style={{ borderColor: palette.border, background: palette.glass }}>
                      Snapshot · {new Date(v.at).toLocaleString("en-IN")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: co-pilot suggestions */}
        <aside className="hidden xl:block">
          <div className="rounded-2xl border p-4 sticky top-6" style={{ borderColor: palette.border, background: palette.glassStrong }}>
            <div className="text-[10.5px] uppercase tracking-[0.16em] mb-3 inline-flex items-center gap-1.5" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              <Sparkles className="h-3 w-3" /> Co-pilot
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: palette.muted }}>
              Suggestions appear alongside — never in the note. Nothing is written for you.
            </p>
            <ul className="mt-4 space-y-3 text-[12px]" style={{ color: palette.ink }}>
              <li className="rounded-lg border p-2.5" style={{ borderColor: palette.border }}>
                Consider naming the presenting affect explicitly (e.g. constricted, congruent).
              </li>
              <li className="rounded-lg border p-2.5" style={{ borderColor: palette.border }}>
                Assessment section reads short. Add differential considerations?
              </li>
              <li className="rounded-lg border p-2.5" style={{ borderColor: palette.border }}>
                Plan mentions homework — confirm assignment in the Homework module.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    draft: { bg: "#F1E9DA", fg: "#7A5A18", label: "Draft" },
    signed: { bg: "#E4EFE0", fg: "#3E6A2E", label: "Signed" },
    amended: { bg: "#EFE4F0", fg: "#5F3F60", label: "Amended" },
    locked: { bg: "#EADFE2", fg: "#1E1418", label: "Locked" },
  };
  const m = map[status] ?? map.draft;
  return <span className="inline-block mt-1 text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: m.bg, color: m.fg, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{m.label}</span>;
}

function relTime(t: number) {
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(t).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function renderPdfHtml(note: ReturnType<typeof useLiveNote>, sections: NoteSection[], patientName: string) {
  const rows = sections.map((s) => `<h2 style="font-family:Georgia,serif;font-size:14pt;margin:16pt 0 4pt">${escapeHtml(s.label)}</h2><p style="white-space:pre-wrap;font-family:Georgia,serif;font-size:11pt;line-height:1.5;margin:0">${escapeHtml(s.body || "—")}</p>`).join("");
  const amendments = (note?.amendments ?? []).map((a) => `
    <div style="margin-top:18pt;padding-top:10pt;border-top:1px solid #ccc">
      <div style="font-family:Georgia,serif;font-size:10pt;color:#555">Amendment — ${escapeHtml(a.reason)}</div>
      ${a.sections.map((s) => `<h3 style="font-family:Georgia,serif;font-size:12pt;margin:8pt 0 2pt">${escapeHtml(s.label)}</h3><p style="white-space:pre-wrap;font-family:Georgia,serif;font-size:11pt">${escapeHtml(s.body)}</p>`).join("")}
      <div style="font-family:Georgia,serif;font-size:9pt;color:#777;margin-top:6pt">Signed ${escapeHtml(a.signedBy)} · ${new Date(a.signedAt).toLocaleString("en-IN")} · ${escapeHtml(a.hash)}</div>
    </div>`).join("");
  return `<!doctype html><html><head><title>Note · ${escapeHtml(patientName)}</title></head>
  <body style="max-width:640px;margin:40pt auto;padding:0 20pt;color:#1E1418">
    <div style="font-family:Georgia,serif;font-size:10pt;color:#7B6A70;text-transform:uppercase;letter-spacing:0.16em">${escapeHtml(note?.type ?? "")}</div>
    <h1 style="font-family:Georgia,serif;font-size:20pt;margin:4pt 0 2pt">${escapeHtml(patientName)}</h1>
    <div style="font-family:Georgia,serif;font-size:10pt;color:#7B6A70">${note?.createdAt ? new Date(note.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" }) : ""}</div>
    ${rows}
    ${note?.signedAt ? `<div style="margin-top:24pt;padding-top:10pt;border-top:1px solid #ccc;font-family:Georgia,serif;font-size:10pt;color:#7B6A70">Signed ${escapeHtml(note.signedBy ?? "")} · ${clinicianIdentity().license} · ${new Date(note.signedAt).toLocaleString("en-IN")}</div>` : ""}
    ${amendments}
  </body></html>`;
}
function escapeHtml(s: string) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!); }
