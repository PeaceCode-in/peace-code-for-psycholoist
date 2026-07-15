// Generic stub page used by every not-yet-built module.
import { AppShell, palette } from "@/components/practice/AppShell";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function StubPage({ title, blurb, crumb, children }: { title: string; blurb: string; crumb?: string; children?: ReactNode }) {
  const { surface, border, ink, muted, primary, soft } = palette;
  return (
    <AppShell crumb={crumb ?? title}>
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 lg:py-16">
        <div className="text-[11px] tracking-[0.22em] uppercase mb-4 flex items-center gap-2" style={{ color: muted }}>
          <Link to="/dashboard" className="hover:underline flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Dashboard</Link>
          <span>·</span><span style={{ color: ink }}>{title}</span>
        </div>
        <div className="rounded-3xl p-8 lg:p-12" style={{ background: surface, border: `1px solid ${border}` }}>
          <div className="inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-1 rounded-full mb-4" style={{ background: soft, color: primary }}>
            <Sparkles className="w-3 h-3" /> Coming next
          </div>
          <h1 className="text-[clamp(1.75rem,3vw,2.4rem)] tracking-tight leading-[1.05]" style={{ fontFamily: "'Fraunces', serif", color: ink }}>{title}</h1>
          <p className="text-[13.5px] mt-3 max-w-lg leading-relaxed" style={{ color: muted }}>{blurb}</p>
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </AppShell>
  );
}
