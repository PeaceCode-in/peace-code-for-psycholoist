import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Lock } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveNotes, signNote, noteExcerpt } from "@/lib/notes-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/notes/drafts")({
  component: DraftsPage,
});

function DraftsPage() {
  const hydrated = useHydrated();
  const drafts = useLiveNotes().filter((n) => n.status === "draft");
  if (!hydrated) return null;

  const now = Date.now();
  const H72 = 72 * 60 * 60 * 1000;

  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <p className="text-[12.5px] mb-6 max-w-xl" style={{ color: palette.muted }}>
        Unsigned notes. Sorted by age. Anything unsigned after 72 hours is flagged as a compliance risk.
      </p>

      {drafts.length === 0 ? (
        <div className="rounded-3xl border p-16 text-center" style={{ borderColor: palette.border, background: palette.glass }}>
          <p className="text-[15px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>All caught up.</p>
          <p className="text-[12.5px] mt-2" style={{ color: palette.muted }}>No drafts waiting to be signed.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {drafts.map((n) => {
            const p = getPatient(n.patientId);
            const age = now - n.createdAt;
            const risk = age > H72;
            return (
              <li key={n.id} className="rounded-2xl border p-4 flex items-start gap-4" style={{ borderColor: risk ? "#B0567A" : palette.border, background: palette.glassStrong }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
                    <span>{n.type}</span><span>·</span>
                    <span>{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                    {risk && <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "#B0567A" }}><AlertTriangle className="h-3 w-3" /> 72h overdue</span>}
                  </div>
                  <Link to="/notes/$nid" params={{ nid: n.id }} className="text-[15px] leading-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
                    {p?.fullName ?? "Unknown patient"}
                  </Link>
                  <p className="text-[12px] mt-1 line-clamp-2" style={{ color: palette.muted }}>{noteExcerpt(n, 160) || "No content yet."}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/notes/$nid" params={{ nid: n.id }} className="inline-flex items-center h-8 px-3 rounded-full border text-[12px]" style={{ borderColor: palette.border, color: palette.ink }}>Open</Link>
                  <button onClick={() => { if (window.confirm("Sign this note now?")) signNote(n.id); }} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px]" style={{ background: palette.ink, color: "#fff" }}>
                    <Lock className="h-3.5 w-3.5" /> Sign
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
