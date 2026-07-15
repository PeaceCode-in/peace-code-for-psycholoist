// ⌘⇧D — a quick, calm view into where data lives, who sees it, how long it stays.
// Not a legal document — a promise of transparency.
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, Shield } from "lucide-react";

type Row = { name: string; location: string; audience: string; retention: string };

const ROWS: Row[] = [
  { name: "Patient records",     location: "Encrypted at rest — India region",  audience: "You, assigned clinicians",       retention: "As long as the practice is active + 7 years" },
  { name: "Session notes",       location: "Encrypted at rest — India region",  audience: "You, co-clinicians on consent",  retention: "7 years from last activity" },
  { name: "Assessment results",  location: "Encrypted at rest — India region",  audience: "You, patient (on release)",      retention: "7 years from last activity" },
  { name: "Messages",            location: "Encrypted at rest, TLS in transit", audience: "Sender & recipients only",       retention: "3 years, then archived" },
  { name: "Billing & invoices",  location: "Encrypted, held for tax records",   audience: "You, your accountant on export", retention: "7 years — statutory" },
  { name: "Copilot prompts",     location: "Pseudonymized before model call",   audience: "AI gateway only, not trained on",retention: "24-hour audit log, then discarded" },
  { name: "Audit trail",         location: "Append-only ledger",                audience: "You, DPO, regulator on request", retention: "10 years — statutory" },
  { name: "Uploaded files",      location: "Object storage — India region",     audience: "You, patient (if shared)",       retention: "Follows parent record" },
];

function isEditable(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function DataHandlingSheet() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.shiftKey && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", on);
    const openEvt = () => setOpen(true);
    window.addEventListener("pc:open-data-handling", openEvt);
    return () => {
      window.removeEventListener("keydown", on);
      window.removeEventListener("pc:open-data-handling", openEvt);
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[95] flex items-end md:items-center justify-center md:justify-end p-0 md:p-6"
      style={{ background: "rgba(20,26,44,0.34)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-lg h-[86vh] md:h-[86vh] overflow-auto rounded-t-2xl md:rounded-2xl border animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-200"
        style={{
          background: "rgba(255,253,252,0.98)",
          borderColor: "rgba(20,30,60,0.10)",
          boxShadow: "0 30px 80px -20px rgba(20,30,60,0.24)",
        }}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(20,30,60,0.06)" }}>
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]">
              <Shield className="w-3 h-3" /> Data handling
            </div>
            <div className="mt-1 text-[20px] leading-tight" style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em" }}>
              Where things live, who can see them.
            </div>
            <div className="mt-1 text-[12px] text-[color:var(--muted-foreground)]">
              Compliant with DPDP Act 2023. HIPAA-aligned controls where applicable.
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-[rgba(20,30,60,0.05)]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {ROWS.map((r) => (
            <div
              key={r.name}
              className="rounded-xl border p-4"
              style={{ borderColor: "rgba(20,30,60,0.08)", background: "rgba(255,255,255,0.6)" }}
            >
              <div className="text-[13px] font-medium">{r.name}</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-[color:var(--muted-foreground)]">
                <div>
                  <div className="uppercase tracking-[0.12em] text-[9px] mb-0.5">Location</div>
                  <div className="text-[color:var(--foreground)]">{r.location}</div>
                </div>
                <div>
                  <div className="uppercase tracking-[0.12em] text-[9px] mb-0.5">Audience</div>
                  <div className="text-[color:var(--foreground)]">{r.audience}</div>
                </div>
                <div>
                  <div className="uppercase tracking-[0.12em] text-[9px] mb-0.5">Retention</div>
                  <div className="text-[color:var(--foreground)]">{r.retention}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t text-[12px] flex items-center justify-between" style={{ borderColor: "rgba(20,30,60,0.06)" }}>
          <Link to="/governance" className="underline underline-offset-2 hover:opacity-80 transition-opacity duration-150">
            Full governance view
          </Link>
          <span className="text-[color:var(--muted-foreground)]" style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.02em" }}>
            ⌘⇧D
          </span>
        </div>
      </aside>
    </div>
  );
}
