import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { palette } from "@/components/practice/palette";
import { useProfile, updateProfile, seoScore } from "@/lib/profile-store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/profile-public/seo")({
  component: SeoPage,
});

function SeoPage() {
  const hydrated = useHydrated();
  const p = useProfile();
  if (!hydrated) return null;
  const { score, checks } = seoScore(p);

  return (
    <div className="max-w-[1000px] mx-auto px-5 sm:px-8 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        <div className="space-y-5">
          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>SEO title</div>
            <input value={p.seoTitle} onChange={(e) => updateProfile({ seoTitle: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-[14px]" style={{ borderColor: palette.border, fontFamily: "'Fraunces', serif" }} />
            <div className="mt-1 text-[11px] text-right" style={{ color: p.seoTitle.length >= 60 ? "#B85A3E" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.seoTitle.length} / 60</div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Meta description</div>
            <textarea value={p.seoDescription} onChange={(e) => updateProfile({ seoDescription: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-[13px]" style={{ borderColor: palette.border }} />
            <div className="mt-1 text-[11px] text-right" style={{ color: p.seoDescription.length < 120 || p.seoDescription.length > 160 ? "#B85A3E" : palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{p.seoDescription.length} / 160</div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>SERP preview</div>
            <div className="border rounded-lg p-4" style={{ borderColor: palette.border, background: "#fff" }}>
              <div className="text-[12px]" style={{ color: "#5f6368", fontFamily: "arial, sans-serif" }}>peacecode.app › p › {p.slug}</div>
              <div className="mt-1 text-[18px]" style={{ color: "#1a0dab", fontFamily: "arial, sans-serif" }}>{p.seoTitle}</div>
              <div className="mt-1 text-[13px]" style={{ color: "#4d5156", fontFamily: "arial, sans-serif" }}>{p.seoDescription}</div>
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-3" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Structured data</div>
            <label className="inline-flex items-center gap-2 text-[13px]" style={{ color: palette.ink }}>
              <input type="checkbox" checked={p.jsonLdEnabled} onChange={(e) => updateProfile({ jsonLdEnabled: e.target.checked })} />
              Emit JSON-LD schema.org/Person + FAQPage on /p/{p.slug}
            </label>
            <p className="text-[11px] mt-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>
              Makes you eligible for Google Rich Results (FAQ dropdown, credentials strip).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border p-5 text-center" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>SEO score</div>
            <div className="mt-2 text-[42px]" style={{ fontFamily: "'Fraunces', serif", color: score >= 80 ? palette.ink : "#B85A3E" }}>{score}</div>
            <div className="text-[11px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>out of 100</div>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: palette.border, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(14px)" }}>
            <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Checklist</div>
            {checks.map((c, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 text-[12px]" style={{ color: palette.ink }}>
                {c.ok ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5" style={{ color: "#3B7A57" }} /> : <Circle className="h-3.5 w-3.5 mt-0.5" style={{ color: "#B85A3E" }} />}
                <div className="min-w-0">
                  <div>{c.label}</div>
                  {c.hint && <div className="text-[10px]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>{c.hint}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
