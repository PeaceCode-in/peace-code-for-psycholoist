import { createFileRoute } from "@tanstack/react-router";
import { palette } from "@/components/practice/palette";
import { TEMPLATE_META, type NoteTemplate } from "@/lib/notes-store";

export const Route = createFileRoute("/notes/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pb-24">
      <p className="text-[12.5px] mb-6 max-w-xl" style={{ color: palette.muted }}>
        Nine templates. Each with named sections. Choose one when starting a note — or build a custom template from any of them.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(TEMPLATE_META) as NoteTemplate[]).map((t) => {
          const meta = TEMPLATE_META[t];
          return (
            <div key={t} className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong }}>
              <div className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{t}</div>
              <h3 className="text-[18px] leading-tight tracking-tight mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{meta.label}</h3>
              <p className="text-[12px] mt-1.5" style={{ color: palette.muted }}>{meta.blurb}</p>
              <ul className="mt-4 space-y-1.5">
                {meta.sections.map((s) => (
                  <li key={s.key} className="text-[12.5px] pl-3 border-l-2" style={{ color: palette.ink, borderColor: palette.soft }}>{s.label}</li>
                ))}
              </ul>
            </div>
          );
        })}
        <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: palette.glassStrong }}>
          <div className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Group</div>
          <h3 className="text-[18px] leading-tight tracking-tight mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>Group note</h3>
          <p className="text-[12px] mt-1.5" style={{ color: palette.muted }}>Lives inside the Groups module. Shared with co-facilitators, never with members.</p>
        </div>
      </div>
    </div>
  );
}
