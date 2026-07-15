// Global ? overlay — a beautiful glass grid of every keyboard shortcut.
// Grouped by module. Opened by pressing "?" (Shift+/) anywhere outside an input.
import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Shortcut = { keys: string[]; label: string };
type Group = { title: string; shortcuts: Shortcut[] };

const GROUPS: Group[] = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Command palette" },
      { keys: ["?"], label: "Keyboard shortcuts" },
      { keys: ["⌘", "⇧", "D"], label: "Data handling" },
      { keys: ["⌘", "."], label: "First-run checklist" },
      { keys: ["G", "H"], label: "Go home" },
      { keys: ["G", "P"], label: "Go to patients" },
      { keys: ["G", "C"], label: "Go to calendar" },
      { keys: ["G", "I"], label: "Go to inbox" },
    ],
  },
  {
    title: "Create",
    shortcuts: [
      { keys: ["N", "P"], label: "New patient" },
      { keys: ["N", "S"], label: "New session" },
      { keys: ["N", "N"], label: "New note" },
      { keys: ["N", "I"], label: "New invoice" },
      { keys: ["N", "D"], label: "New document" },
    ],
  },
  {
    title: "Sessions",
    shortcuts: [
      { keys: ["Space"], label: "Play / pause focus timer" },
      { keys: ["S"], label: "Save draft" },
      { keys: ["R"], label: "Ratify note" },
      { keys: ["⌘", "Enter"], label: "Confirm & continue" },
    ],
  },
  {
    title: "Copilot",
    shortcuts: [
      { keys: ["⌘", "J"], label: "Open Copilot" },
      { keys: ["⌘", "⇧", "S"], label: "Draft SOAP" },
      { keys: ["⌘", "⇧", "T"], label: "Translate selection" },
    ],
  },
  {
    title: "Inbox",
    shortcuts: [
      { keys: ["E"], label: "Archive" },
      { keys: ["Z"], label: "Snooze" },
      { keys: ["T"], label: "Convert to task" },
      { keys: ["J", "K"], label: "Next / previous" },
    ],
  },
];

function isEditable(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", on);
    const openEvt = () => setOpen(true);
    window.addEventListener("pc:open-shortcuts", openEvt);
    return () => {
      window.removeEventListener("keydown", on);
      window.removeEventListener("pc:open-shortcuts", openEvt);
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(20,26,44,0.34)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[86vh] overflow-auto rounded-2xl border animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          background: "rgba(255,253,252,0.96)",
          borderColor: "rgba(20,30,60,0.10)",
          boxShadow: "0 30px 80px -20px rgba(20,30,60,0.24)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(20,30,60,0.06)" }}>
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">A quiet keyboard</div>
            <div className="mt-0.5 text-[20px]" style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em" }}>
              Keyboard shortcuts
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-[rgba(20,30,60,0.05)]"
            aria-label="Close shortcuts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)] mb-3">
                {g.title}
              </div>
              <div className="space-y-1.5">
                {g.shortcuts.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-[13px] py-1.5">
                    <span>{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="px-1.5 py-0.5 rounded-md border text-[11px]"
                          style={{
                            fontFamily: "'DM Mono', ui-monospace, monospace",
                            background: "rgba(255,255,255,0.7)",
                            borderColor: "rgba(20,30,60,0.10)",
                            minWidth: 22,
                            textAlign: "center",
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          className="px-6 py-3 border-t text-[11px] text-[color:var(--muted-foreground)] flex items-center justify-between"
          style={{ borderColor: "rgba(20,30,60,0.06)" }}
        >
          <span>Press <kbd className="px-1 rounded bg-[rgba(20,30,60,0.05)]">?</kbd> anywhere to summon this panel.</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
