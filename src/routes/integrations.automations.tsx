import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { IntegrationsFrame } from "@/components/practice/integrations/IntegrationsFrame";
import { CopyRow, Section } from "@/components/practice/integrations/primitives";
import { ix } from "@/components/practice/integrations/tokens";
import { AUTOMATIONS } from "@/lib/integrations-store";

export const Route = createFileRoute("/integrations/automations")({
  head: () => ({ meta: [{ title: "Automations · Integrations" }, { name: "robots", content: "noindex" }] }),
  component: AutomationsPage,
});

function AutomationsPage() {
  return (
    <IntegrationsFrame>
      <Section title="No-code automations">
        <p className="mb-6 text-[14px]" style={{ color: ix.muted, maxWidth: 640 }}>
          Copy a trigger URL into Zapier, Make, or n8n and it starts firing on real events from your practice. No custom code, no server to run.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {AUTOMATIONS.map(a => (
            <div key={a.id} className="flex flex-col gap-4 rounded-2xl p-5" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
              <div>
                <p style={{ fontFamily: ix.serif, fontSize: 17, letterSpacing: -0.2, color: ix.ink }}>{a.title}</p>
                <div className="mt-3 flex items-center gap-2 text-[12.5px]">
                  <code className="rounded-md px-2 py-0.5" style={{ background: ix.soft, color: ix.roseDeep, fontFamily: ix.mono }}>when</code>
                  <span style={{ color: ix.ink }}>{a.when}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-[12.5px]">
                  <code className="rounded-md px-2 py-0.5" style={{ background: ix.sageBg, color: "#4E7358", fontFamily: ix.mono }}>then</code>
                  <span style={{ color: ix.ink }}>{a.then}</span>
                </div>
              </div>
              <div className="mt-auto">
                <p className="mb-1.5 text-[11px] uppercase" style={{ color: ix.muted, letterSpacing: 1 }}>Trigger URL</p>
                <CopyRow value={a.triggerUrl} />
                <div className="mt-3 flex items-center gap-2 text-[11.5px]" style={{ color: ix.muted }}>
                  Works with:
                  {a.tools.map(t => <span key={t} className="rounded-full px-2 py-0.5" style={{ background: ix.grayBg, color: "#5D5459", fontFamily: ix.mono }}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Bring your own recipe">
        <div className="rounded-2xl p-6" style={{ background: ix.paper, border: `1px solid ${ix.border}` }}>
          <p className="text-[14px]" style={{ color: ix.ink }}>Need a custom flow? Subscribe your own endpoint from the Webhooks tab, then wire whatever runs on the other side.</p>
          <a href="/integrations/webhooks" className="mt-3 inline-flex items-center gap-1 text-[13px]" style={{ color: ix.roseDeep }}>
            Create a webhook <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </Section>
    </IntegrationsFrame>
  );
}
