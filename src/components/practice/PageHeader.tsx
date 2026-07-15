// Local page header for settings sub-pages — no reliance on legacy SettingsShell.
import type { ReactNode } from "react";
import { palette } from "@/components/practice/palette";

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.5rem,2.2vw,1.9rem)] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{title}</h1>
        {description && <p className="text-[12.5px] mt-1.5 max-w-lg" style={{ color: palette.muted }}>{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </header>
  );
}
