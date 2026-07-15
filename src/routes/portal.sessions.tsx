import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Video, MapPin, CalendarPlus, X as XIcon } from "lucide-react";
import { PortalShell, Card, Chip, portal } from "@/components/portal/PortalShell";
import { cancelSession, fmtDateWarm, saveSessionIntention, useCurrentClient, useMySessions } from "@/lib/portal-store";

export const Route = createFileRoute("/portal/sessions")({
  head: () => ({ meta: [{ title: "Your sessions" }, { name: "robots", content: "noindex" }] }),
  component: Sessions,
});

function Sessions() {
  const client = useCurrentClient();
  const sessions = useMySessions();
  const now = Date.now();
  const upcoming = sessions.filter(s => s.startsAt >= now - 30 * 60 * 1000 && s.status === "scheduled");
  const past = sessions.filter(s => s.status !== "scheduled" || s.startsAt < now - 30 * 60 * 1000).reverse();
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);
  const [intentionFor, setIntentionFor] = useState<string | null>(null);
  const [intention, setIntention] = useState("");

  if (!client) return null;

  return (
    <PortalShell title="Your sessions" subtitle="Everything scheduled, and everything you've shown up to.">
      <section className="mb-10">
        <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Coming up</h2>
        {upcoming.length === 0 ? (
          <Card><p style={{ color: portal.muted }}>Nothing scheduled right now.</p></Card>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map(s => (
              <Card key={s.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 22, letterSpacing: -0.3 }}>{fmtDateWarm(s.startsAt)}</p>
                    <p className="mt-1 text-[14px]" style={{ color: portal.muted }}>
                      {s.durationMin} minutes with {client.therapistName}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Chip tone="muted">
                        {s.modality === "telehealth" ? <><Video className="mr-1 inline h-3 w-3" strokeWidth={1.6} /> Telehealth</> : <><MapPin className="mr-1 inline h-3 w-3" strokeWidth={1.6} /> {s.location ?? "In-person"}</>}
                      </Chip>
                    </div>
                    {intentionFor === s.id ? (
                      <div className="mt-4">
                        <textarea
                          value={intention}
                          onChange={e => setIntention(e.target.value)}
                          placeholder="What would you like to bring in? One line is enough."
                          className="w-full rounded-xl border px-3 py-2 text-[14px] outline-none"
                          style={{ borderColor: portal.border, background: portal.paper, minHeight: 80 }}
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => { saveSessionIntention(s.id, intention); setIntentionFor(null); }}
                            className="rounded-full px-3 py-1.5 text-[13px]"
                            style={{ background: portal.rose, color: "#fff" }}
                          >Save note</button>
                          <button onClick={() => setIntentionFor(null)} className="rounded-full px-3 py-1.5 text-[13px]" style={{ color: portal.muted }}>Cancel</button>
                        </div>
                      </div>
                    ) : s.intention ? (
                      <div className="mt-4 rounded-xl p-3" style={{ background: "#FBF3F0" }}>
                        <p className="text-[12px]" style={{ color: portal.muted, letterSpacing: 0.4, textTransform: "uppercase" }}>Your note for this session</p>
                        <p className="mt-1 text-[14px]">{s.intention}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.joinUrl ? (
                      <a href={s.joinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px]" style={{ background: portal.rose, color: "#fff" }}>
                        <Video className="h-4 w-4" strokeWidth={1.6} /> Join
                      </a>
                    ) : null}
                    <button onClick={() => { setIntentionFor(s.id); setIntention(s.intention ?? ""); }} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>
                      {s.intention ? "Edit note" : "Add a note"}
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px]" style={{ background: portal.paper, color: portal.ink, border: `1px solid ${portal.border}` }}>
                      <CalendarPlus className="h-4 w-4" strokeWidth={1.6} /> Add to calendar
                    </button>
                  </div>
                </div>
                {confirmCancel === s.id ? (
                  <div className="mt-4 flex flex-col gap-2 rounded-xl p-4 md:flex-row md:items-center md:justify-between" style={{ background: portal.soft }}>
                    <div>
                      <p className="text-[14px]" style={{ color: portal.roseDeep, fontFamily: "'Fraunces', serif", fontSize: 16 }}>Cancel this session?</p>
                      <p className="text-[13px]" style={{ color: portal.muted }}>Cancellations less than 24 hours before your session may incur the full fee, per practice policy.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmCancel(null)} className="rounded-full px-3 py-1.5 text-[13px]" style={{ color: portal.muted }}>Keep it</button>
                      <button onClick={() => { cancelSession(s.id); setConfirmCancel(null); }} className="rounded-full px-3 py-1.5 text-[13px]" style={{ background: portal.roseDeep, color: "#fff" }}>Yes, cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmCancel(s.id)} className="mt-4 text-[13px]" style={{ color: portal.muted }}>
                    Need to cancel or reschedule?
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-[15px]" style={{ color: portal.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>Past sessions</h2>
        <div className="flex flex-col gap-2">
          {past.map(s => (
            <div key={s.id} className="rounded-2xl p-4" style={{ background: portal.paper, border: `1px solid ${portal.border}` }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p style={{ fontFamily: "'Fraunces', serif", fontSize: 17 }}>{fmtDateWarm(s.startsAt)}</p>
                  <p className="text-[13px]" style={{ color: portal.muted }}>{s.durationMin} min · {s.modality}{s.status === "cancelled" ? " · cancelled" : ""}</p>
                </div>
                {s.reflection ? <Chip tone="muted">Notes on file</Chip> : null}
              </div>
              {s.reflection ? <p className="mt-3 text-[14px]" style={{ color: portal.ink }}>{s.reflection}</p> : null}
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
