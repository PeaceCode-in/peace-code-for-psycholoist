import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/practice/AppShell";
import { palette } from "@/components/practice/palette";
import { useTasks, addTask, toggleTask, removeTask, absTime } from "@/lib/notifications-store";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/inbox/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — PeaceCode · Practice" },
      { name: "description", content: "Lightweight tasks converted from notifications." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const tasks = useTasks();
  const [draft, setDraft] = useState("");
  const [due, setDue] = useState("");

  const open = tasks.filter((t) => !t.doneAt);
  const done = tasks.filter((t) => t.doneAt);

  const submit = () => {
    if (!draft.trim()) return;
    addTask(draft.trim(), due ? new Date(due).getTime() : null);
    setDraft(""); setDue("");
  };

  return (
    <AppShell crumb="Tasks">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Link to="/inbox" className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] mb-6"
          style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          <ArrowLeft className="w-3 h-3" /> Back to inbox
        </Link>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, color: palette.ink, lineHeight: 1.1 }}>Tasks</h1>
        <div className="mt-1 uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10.5, letterSpacing: "0.18em", color: palette.muted }}>
          {open.length} open · {done.length} done
        </div>

        <div className="mt-8 rounded-2xl p-4 flex items-center gap-2" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Add a task…"
            className="flex-1 h-9 px-2 outline-none text-[13.5px] bg-transparent"
            style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}
          />
          <input
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="h-9 px-2 rounded-lg text-[11.5px]"
            style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink, fontFamily: "'DM Mono', ui-monospace, monospace" }}
          />
          <button onClick={submit} className="h-9 px-3 rounded-full text-white flex items-center gap-1 text-[12px]" style={{ background: palette.primary }}>
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        <ul className="mt-6 space-y-2">
          {open.map((t) => (
            <li key={t.id} className="flex items-start gap-3 px-4 py-3 rounded-xl group"
              style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
              <button onClick={() => toggleTask(t.id)} className="mt-0.5 w-4 h-4 rounded border shrink-0"
                style={{ borderColor: palette.border, background: "transparent" }} aria-label="Complete task" />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{t.title}</div>
                {t.dueAt && (
                  <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px]"
                    style={{
                      background: t.dueAt < Date.now() ? "rgba(198,127,132,0.10)" : palette.surface,
                      color: t.dueAt < Date.now() ? palette.primary : palette.muted,
                      fontFamily: "'DM Mono', ui-monospace, monospace",
                    }}>
                    due {absTime(t.dueAt)}
                  </div>
                )}
              </div>
              <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: palette.muted }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
          {open.length === 0 && (
            <li className="py-16 text-center" style={{ color: palette.muted }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: palette.ink }}>Deck is clear.</div>
              <div className="mt-1 text-[12.5px]">Convert any notification with <kbd>T</kbd>.</div>
            </li>
          )}
        </ul>

        {done.length > 0 && (
          <>
            <div className="mt-8 mb-2 uppercase" style={{ fontFamily: "'DM Mono', ui-monospace, monospace", fontSize: 10, letterSpacing: "0.18em", color: palette.muted }}>
              done
            </div>
            <ul className="space-y-1">
              {done.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-2 text-[13px] rounded-lg"
                  style={{ color: palette.muted, textDecoration: "line-through" }}>
                  <button onClick={() => toggleTask(t.id)} className="w-4 h-4 rounded border shrink-0 flex items-center justify-center"
                    style={{ borderColor: palette.primary, background: palette.primary }}>
                    <span className="w-2 h-2 rounded-sm bg-white" />
                  </button>
                  {t.title}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AppShell>
  );
}
