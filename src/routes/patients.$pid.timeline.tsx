import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, StickyNote, ClipboardList, MessageSquare, FileText, ShieldAlert, RefreshCcw, Award } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { Card, Pill, SectionLabel, EmptyState, fmtDateTime, timeAgo } from "@/components/practice/patients/primitives";
import { useLiveTimeline, type TimelineKind } from "@/lib/patients-store";

export const Route = createFileRoute("/patients/$pid/timeline")({
  head: () => ({ meta: [{ title: "Timeline — Patient" }, { name: "robots", content: "noindex" }] }),
  component: TimelineTab,
});

const KIND_META: Record<TimelineKind, { label: string; icon: React.ReactNode; color: string }> = {
  session:         { label: "Session",       icon: <Calendar className="w-3 h-3" />,       color: "var(--pc-status-active)" },
  note:            { label: "Note",          icon: <StickyNote className="w-3 h-3" />,     color: "var(--pc-risk-stable)" },
  assessment:      { label: "Assessment",    icon: <ClipboardList className="w-3 h-3" />,  color: "var(--pc-risk-monitor)" },
  message:         { label: "Message",       icon: <MessageSquare className="w-3 h-3" />,  color: "var(--pc-status-active)" },
  document:        { label: "Document",      icon: <FileText className="w-3 h-3" />,       color: "var(--pc-status-paused)" },
  "risk-change":   { label: "Risk change",   icon: <ShieldAlert className="w-3 h-3" />,    color: "var(--pc-risk-crisis)" },
  "status-change": { label: "Status change", icon: <RefreshCcw className="w-3 h-3" />,     color: "var(--pc-status-active)" },
  homework:        { label: "Homework",      icon: <Award className="w-3 h-3" />,          color: "var(--pc-risk-monitor)" },
};

const FILTERS: Array<{ key: "all" | TimelineKind; label: string }> = [
  { key: "all", label: "All" },
  { key: "session", label: "Sessions" },
  { key: "note", label: "Notes" },
  { key: "assessment", label: "Assessments" },
  { key: "status-change", label: "Status" },
  { key: "risk-change", label: "Risk" },
];

function TimelineTab() {
  const { pid } = Route.useParams();
  const events = useLiveTimeline(pid);
  const [filter, setFilter] = useState<"all" | TimelineKind>("all");

  const filtered = useMemo(() => filter === "all" ? events : events.filter((e) => e.kind === filter), [events, filter]);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((e) => {
      const key = new Date(e.at).toLocaleDateString(undefined, { month: "long", year: "numeric" });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="flex flex-col gap-5 pc-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <SectionLabel>Timeline</SectionLabel>
          <p className="text-[13px]" style={{ color: palette.muted }}>{events.length} events on file · most recent first.</p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <Pill key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Pill>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing to show here yet" hint="Sessions, notes and status changes appear on this timeline automatically." />
      ) : (
        <div>
          {grouped.map(([month, items]) => (
            <div key={month} className="mb-6">
              <div className="sticky top-[168px] z-10 py-2 mb-2" style={{ background: palette.surface2 }}>
                <span className="text-[10.5px] tracking-[0.22em] uppercase" style={{ color: palette.muted }}>{month}</span>
              </div>
              <Card className="p-5">
                <ol className="relative" style={{ borderLeft: `1px solid ${palette.border}`, marginLeft: 6 }}>
                  {items.map((e) => {
                    const meta = KIND_META[e.kind];
                    return (
                      <li key={e.id} className="ml-5 pb-5 last:pb-0 relative">
                        <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: palette.surface, border: `2px solid ${meta.color}` }} />
                        <div className="flex items-baseline gap-2">
                          <span className="inline-flex items-center gap-1 text-[10.5px] px-1.5 py-[1px] rounded-md" style={{ background: palette.surface2, color: meta.color, border: `1px solid ${palette.border}` }}>
                            {meta.icon}{meta.label}
                          </span>
                          <span className="text-[10.5px] tabular-nums" title={fmtDateTime(e.at)} style={{ color: palette.muted }}>{timeAgo(e.at)}</span>
                        </div>
                        <p className="text-[13px] mt-1" style={{ color: palette.ink }}>{e.title}</p>
                        {e.summary && <p className="text-[12px] mt-1 leading-relaxed" style={{ color: palette.muted }}>{e.summary}</p>}
                      </li>
                    );
                  })}
                </ol>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
