import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, palette } from "@/components/practice/AppShell";
import { useReviews, respondToReview, acknowledgeReview, flagReview, toggleVisibility, type Review } from "@/lib/reviews-store";
import { Heart, MessageCircle, Flag, EyeOff, Eye, Reply, Check } from "lucide-react";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews & feedback — PeaceCode · Practice" },
      { name: "description", content: "Patient ratings and structured post-session feedback." },
    ],
  }),
  component: ReviewsPage,
});

type FilterKey = "all" | "new" | "flagged" | "public";

function ReviewsPage() {
  const reviews = useReviews();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const avg = useMemo(
    () => reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) : 0,
    [reviews],
  );
  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    reviews.forEach((r) => { d[r.rating - 1]++; });
    return d;
  }, [reviews]);
  const subAvg = useMemo(() => {
    if (!reviews.length) return { warmth: 0, clarity: 0, pace: 0, outcome: 0 };
    const keys = ["warmth", "clarity", "pace", "outcome"] as const;
    const out = { warmth: 0, clarity: 0, pace: 0, outcome: 0 };
    keys.forEach((k) => {
      out[k] = reviews.reduce((a, r) => a + r.helpful[k], 0) / reviews.length;
    });
    return out;
  }, [reviews]);

  const filtered = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "new") return r.status === "new";
    if (filter === "flagged") return r.status === "flagged";
    if (filter === "public") return r.visibility === "public";
    return true;
  });

  const counts = {
    all: reviews.length,
    new: reviews.filter((r) => r.status === "new").length,
    flagged: reviews.filter((r) => r.status === "flagged").length,
    public: reviews.filter((r) => r.visibility === "public").length,
  };

  return (
    <AppShell crumb="Reviews">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="uppercase text-[10.5px] tracking-[0.22em]" style={{ color: palette.muted, fontFamily: "'DM Mono', ui-monospace, monospace" }}>Growth · Reviews</div>
          <h1 className="mt-1 text-[26px] leading-tight tracking-tight" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>
            What patients say, in their words
          </h1>
          <p className="text-[13px] mt-1" style={{ color: palette.muted }}>Post-session and monthly feedback. You choose what's public.</p>
        </div>

        {/* Summary card */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-4">
          <div className="rounded-2xl p-5" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
            <div className="text-[11px] uppercase tracking-wider" style={{ color: palette.muted }}>Overall</div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-[42px] tabular-nums leading-none" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{avg.toFixed(1)}</div>
              <div className="text-[12px]" style={{ color: palette.muted }}>/ 5 · {reviews.length} reviews</div>
            </div>
            <Stars value={Math.round(avg)} />
            <div className="mt-4 space-y-1.5">
              {dist.map((n, i) => {
                const pct = reviews.length ? Math.round((n / reviews.length) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-2 text-[11.5px]">
                    <span className="w-4 tabular-nums" style={{ color: palette.muted }}>{5 - i}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: palette.surface2 }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: palette.primary }} />
                    </div>
                    <span className="w-8 text-right tabular-nums" style={{ color: palette.muted }}>{dist[4 - i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
            <div className="text-[13.5px]" style={{ color: palette.ink }}>Sub-score averages</div>
            <div className="text-[11.5px] mb-4" style={{ color: palette.muted }}>What patients rate you strongest on</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["warmth", "clarity", "pace", "outcome"] as const).map((k) => (
                <div key={k} className="rounded-xl p-3" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
                  <div className="text-[10.5px] uppercase tracking-wider" style={{ color: palette.muted }}>{k}</div>
                  <div className="text-[22px] tabular-nums leading-none mt-1" style={{ fontFamily: "'Fraunces', serif", color: palette.ink }}>{subAvg[k].toFixed(1)}</div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: palette.surface2 }}>
                    <div className="h-full rounded-full" style={{ width: `${(subAvg[k] / 5) * 100}%`, background: palette.primary }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-1 overflow-x-auto">
          {(["all", "new", "flagged", "public"] as FilterKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="h-8 px-3 rounded-full text-[12px] whitespace-nowrap transition-colors"
              style={{
                background: filter === k ? palette.ink : "transparent",
                color: filter === k ? "#fff" : palette.muted,
                border: `1px solid ${filter === k ? palette.ink : palette.border}`,
              }}
            >
              {k[0].toUpperCase() + k.slice(1)} · {counts[k]}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <div className="rounded-2xl p-8 text-center text-[13px]" style={{ background: palette.solid, border: `1px solid ${palette.border}`, color: palette.muted }}>
              Nothing here yet in this view.
            </div>
          )}
          {filtered.map((r) => (
            <ReviewCard
              key={r.id}
              r={r}
              expanded={openId === r.id}
              draft={draft[r.id] ?? ""}
              onToggle={() => setOpenId(openId === r.id ? null : r.id)}
              onDraft={(v) => setDraft((d) => ({ ...d, [r.id]: v }))}
              onSend={() => { const b = (draft[r.id] ?? "").trim(); if (!b) return; respondToReview(r.id, b); setDraft((d) => ({ ...d, [r.id]: "" })); setOpenId(null); }}
              onAck={() => acknowledgeReview(r.id)}
              onFlag={() => flagReview(r.id)}
              onToggleVis={() => toggleVisibility(r.id)}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function ReviewCard({ r, expanded, draft, onToggle, onDraft, onSend, onAck, onFlag, onToggleVis }: {
  r: Review; expanded: boolean; draft: string;
  onToggle: () => void; onDraft: (v: string) => void; onSend: () => void;
  onAck: () => void; onFlag: () => void; onToggleVis: () => void;
}) {
  const rel = relTime(r.at);
  const statusTone = STATUS[r.status];
  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: palette.solid, border: `1px solid ${palette.border}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Stars value={r.rating} size={13} />
            <span className="text-[12px]" style={{ color: palette.muted }}>{r.patientName} · {rel} · {r.channel.replace("_", " ")}</span>
            <span className="text-[10.5px] px-2 h-5 rounded-full inline-flex items-center" style={{ background: statusTone.bg, color: statusTone.fg }}>{statusTone.label}</span>
            {r.visibility === "public" && (
              <span className="text-[10.5px] px-2 h-5 rounded-full inline-flex items-center gap-1" style={{ background: "#EAF3EE", color: "#3F7A55" }}>
                <Eye className="w-3 h-3" /> Public
              </span>
            )}
          </div>
          <div className="mt-2 text-[14px]" style={{ color: palette.ink, fontFamily: "'Fraunces', serif" }}>{r.headline}</div>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: palette.ink, opacity: 0.85 }}>{r.body}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {r.tags.map((t) => (
              <span key={t} className="text-[10.5px] px-2 h-5 rounded-full inline-flex items-center" style={{ background: palette.surface, color: palette.muted, border: `1px solid ${palette.border}` }}>{t}</span>
            ))}
          </div>
          {r.response && (
            <div className="mt-3 rounded-xl p-3" style={{ background: palette.surface, border: `1px solid ${palette.border}` }}>
              <div className="text-[10.5px] uppercase tracking-wider mb-1" style={{ color: palette.muted }}>Your response · {relTime(r.response.at)}</div>
              <div className="text-[12.5px]" style={{ color: palette.ink }}>{r.response.body}</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {r.status === "new" && (
          <button onClick={onAck} className="h-8 px-3 rounded-full text-[12px] inline-flex items-center gap-1.5 transition-colors" style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}>
            <Check className="w-3.5 h-3.5" /> Acknowledge
          </button>
        )}
        {!r.response && (
          <button onClick={onToggle} className="h-8 px-3 rounded-full text-[12px] inline-flex items-center gap-1.5 transition-colors" style={{ background: palette.ink, color: "#fff" }}>
            <Reply className="w-3.5 h-3.5" /> {expanded ? "Cancel" : "Reply privately"}
          </button>
        )}
        <button onClick={onToggleVis} className="h-8 px-3 rounded-full text-[12px] inline-flex items-center gap-1.5 transition-colors" style={{ background: palette.surface, color: palette.ink, border: `1px solid ${palette.border}` }}>
          {r.visibility === "public" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {r.visibility === "public" ? "Hide from profile" : "Feature on profile"}
        </button>
        {r.status !== "flagged" && (
          <button onClick={onFlag} className="h-8 px-3 rounded-full text-[12px] inline-flex items-center gap-1.5 transition-colors" style={{ background: "#FDECEC", color: "#B54848", border: "1px solid #F3C7C7" }}>
            <Flag className="w-3.5 h-3.5" /> Flag for supervisor
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3">
          <textarea
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            placeholder="Reply in your own words. This is sent only to the patient, not published."
            className="w-full min-h-[92px] rounded-xl p-3 text-[13px] outline-none resize-y"
            style={{ background: palette.surface, border: `1px solid ${palette.border}`, color: palette.ink }}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={onSend} className="h-8 px-3 rounded-full text-[12px] inline-flex items-center gap-1.5" style={{ background: palette.primary, color: "#fff" }}>
              <MessageCircle className="w-3.5 h-3.5" /> Send response
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS: Record<Review["status"], { label: string; bg: string; fg: string }> = {
  new:          { label: "New",          bg: "#F3E4EE", fg: "#8B4A6A" },
  acknowledged: { label: "Acknowledged", bg: "#EAF3EE", fg: "#3F7A55" },
  responded:    { label: "Responded",    bg: "#E8ECF6", fg: "#4A5C8A" },
  flagged:      { label: "Flagged",      bg: "#FDECEC", fg: "#B54848" },
};

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Heart key={n} style={{ width: size, height: size }} className={n <= value ? "fill-current" : ""} strokeWidth={1.7} color={n <= value ? "#C89A2E" : palette.border} />
      ))}
    </div>
  );
}
function relTime(ts: number): string {
  const d = Math.round((ts - Date.now()) / 86_400_000);
  if (d === 0) return "today";
  if (d === -1) return "yesterday";
  if (d < 0 && d > -30) return `${-d}d ago`;
  if (d < -30) return `${Math.round(-d / 30)}mo ago`;
  return "";
}
