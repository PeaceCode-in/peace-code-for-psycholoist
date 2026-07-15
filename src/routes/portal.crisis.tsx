import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Phone, Heart } from "lucide-react";
import { portal } from "@/components/portal/PortalShell";

export const Route = createFileRoute("/portal/crisis")({
  head: () => ({ meta: [{ title: "You're not alone" }, { name: "robots", content: "noindex" }] }),
  component: Crisis,
});

const LINES = [
  { name: "iCall", detail: "10am–8pm, Mon–Sat", phone: "9152987821", tel: "+919152987821" },
  { name: "Vandrevala Foundation", detail: "24/7, free & confidential", phone: "1860 2662 345", tel: "+911860266345" },
  { name: "AASRA", detail: "24/7 suicide prevention", phone: "91-9820466726", tel: "+919820466726" },
  { name: "iCall (email)", detail: "Reply within 24h", phone: "icall@tiss.edu", tel: "mailto:icall@tiss.edu" },
];

function Crisis() {
  return (
    <div className="min-h-screen" style={{ background: portal.bg, color: portal.ink, fontFamily: "'DM Sans', system-ui" }}>
      <div className="mx-auto max-w-md px-6 py-10 md:py-16">
        <Link to="/portal" className="inline-flex items-center gap-1 text-[13px]" style={{ color: portal.muted }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to portal
        </Link>

        <div className="mt-8 flex flex-col items-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full" style={{ background: portal.soft, color: portal.roseDeep }}>
            <Heart className="h-6 w-6" strokeWidth={1.4} />
          </span>
          <h1 className="mt-6" style={{ fontFamily: "'Fraunces', serif", fontSize: 32, letterSpacing: -0.5, lineHeight: 1.15 }}>You don't have to be alone right now.</h1>
          <p className="mt-3 text-[15px]" style={{ color: portal.muted }}>
            If you're in immediate danger, please call one of the numbers below. A person will pick up.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          {LINES.map(l => (
            <a key={l.name} href={l.tel.startsWith("mailto") ? l.tel : `tel:${l.tel}`} className="flex items-center gap-4 rounded-2xl p-4" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: portal.rose, color: "#fff" }}>
                <Phone className="h-4 w-4" strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <p style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>{l.name}</p>
                <p className="text-[13px]" style={{ color: portal.muted }}>{l.detail}</p>
              </div>
              <span className="text-[14px]" style={{ color: portal.roseDeep }}>{l.phone}</span>
            </a>
          ))}
        </div>

        <section className="mt-10 rounded-2xl p-6" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: 20 }}>Right now, try this</p>
          <ol className="mt-4 flex flex-col gap-3 text-[14.5px]" style={{ color: portal.ink }}>
            <li><span className="mr-2" style={{ color: portal.roseDeep, fontFamily: "'Fraunces', serif" }}>1.</span> Name 5 things you can see.</li>
            <li><span className="mr-2" style={{ color: portal.roseDeep, fontFamily: "'Fraunces', serif" }}>2.</span> Name 4 things you can touch.</li>
            <li><span className="mr-2" style={{ color: portal.roseDeep, fontFamily: "'Fraunces', serif" }}>3.</span> Name 3 things you can hear.</li>
            <li><span className="mr-2" style={{ color: portal.roseDeep, fontFamily: "'Fraunces', serif" }}>4.</span> Take a slow breath. In for 4, out for 6.</li>
            <li><span className="mr-2" style={{ color: portal.roseDeep, fontFamily: "'Fraunces', serif" }}>5.</span> Text or call one person from your emergency contacts.</li>
          </ol>
        </section>

        <p className="mt-8 text-center text-[13px]" style={{ color: portal.muted }}>
          When the wave passes, message your therapist. They'll be there next session.
        </p>
      </div>
    </div>
  );
}
