import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Download, Check, Cable } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useLiveSessions } from "@/lib/sessions-store";
import { useLiveBlocks, toICS, occurrencesInRange } from "@/lib/schedule-store";
import { getPatient } from "@/lib/patients-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/schedule/export")({
  head: () => ({ meta: [{ title: "Export — Schedule" }] }),
  component: ExportPage,
});

function ExportPage() {
  const hydrated = useHydrated();
  const sessions = useLiveSessions();
  const blocks = useLiveBlocks();
  const [copied, setCopied] = useState(false);

  const ics = useMemo(() => {
    const from = new Date(); from.setDate(from.getDate() - 7);
    const to = new Date(); to.setDate(to.getDate() + 90);
    const sessionEvts = sessions.filter((s) => s.status !== "cancelled").map((s) => ({
      uid: s.id, title: `${getPatient(s.patientId)?.fullName ?? "Session"} · ${s.service}`,
      startsAt: s.startsAt, durationMin: s.durationMin, description: `${s.service} · ${s.modality}`,
    }));
    const blockEvts = occurrencesInRange(from.toISOString(), to.toISOString()).map((o) => ({
      uid: o.blockId + "-" + o.startsAt, title: o.block.title, startsAt: o.startsAt, durationMin: o.block.durationMin,
    }));
    return toICS([...sessionEvts, ...blockEvts]);
  }, [sessions, blocks]);

  if (!hydrated) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const webcalUrl = origin.replace(/^https?:/, "webcal:") + "/schedule/feed.ics";

  const download = () => {
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "peacecode-schedule.ics";
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyUrl = async () => {
    try { await navigator.clipboard.writeText(webcalUrl); setCopied(true); setTimeout(() => setCopied(false), 1600); }
    catch { /* ignore */ }
  };

  return (
    <div className="max-w-[900px] mx-auto px-5 sm:px-8 pb-24">
      <div className="mb-6">
        <h2 className="text-[20px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Export & subscribe</h2>
        <p className="text-[12px] mt-1" style={{ color: palette.muted }}>
          Keep your other calendars in sync. This feed is read-only — bookings stay in PeaceCode.
        </p>
      </div>

      <div className="rounded-2xl border p-6 mb-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Cable className="w-4 h-4" style={{ color: palette.primary }} />
          <h3 className="text-[14px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Subscribe URL</h3>
        </div>
        <p className="text-[12px] mb-3" style={{ color: palette.muted }}>
          Add this webcal URL to Apple Calendar, Google Calendar, or Outlook. Updates flow one-way, auto-refreshed by the client.
        </p>
        <div className="flex items-center gap-2 p-3 rounded-lg border tabular-nums" style={{ borderColor: palette.border, background: "#faf6f7" }}>
          <code className="text-[12px] truncate flex-1" style={{ color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{webcalUrl}</code>
          <button onClick={copyUrl} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11.5px]" style={{ background: palette.ink, color: "#fff" }}>
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        <p className="text-[11px] mt-2" style={{ color: palette.muted }}>
          Note: in this preview build the feed is served locally per browser. For a live cross-device feed, connect Google Calendar or Outlook under Availability → Integrations.
        </p>
      </div>

      </div>

      <div className="rounded-2xl border p-6 mb-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4" style={{ color: palette.primary }} />
          <h3 className="text-[14px]" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Download .ics</h3>
        </div>
        <p className="text-[12px] mb-3" style={{ color: palette.muted }}>
          One-shot download of the next 90 days. Import into any calendar that accepts iCalendar files.
        </p>
        <button onClick={download} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[12.5px] border" style={{ borderColor: palette.border, background: "#fff", color: palette.ink }}>
          <Download className="w-3.5 h-3.5" /> peacecode-schedule.ics
        </button>
      </div>

      <div className="rounded-2xl border p-6" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)" }}>
        <div className="text-[10.5px] tracking-[0.14em] uppercase mb-2" style={{ color: palette.muted }}>Preview</div>
        <pre className="text-[10.5px] overflow-auto max-h-[240px] p-3 rounded-lg" style={{ background: "#faf6f7", color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
{ics.split("\r\n").slice(0, 40).join("\n")}
{ics.split("\r\n").length > 40 ? "\n…" : ""}
        </pre>
      </div>
    </div>
  );
}
