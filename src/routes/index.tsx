import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Home,
  Sparkles,
  Compass,
  BookOpen,
  Users,
  Trophy,
  Focus,
  HeartPulse,
  Settings,
  Bell,
  Search,
  Wind,
  Cloud,
  Sun,
  CloudRain,
  Moon,
  Star,
  Flower2,
  Trees,
  Play,
  Timer,
  Music,
  Waves,
  Brain,
  MessageCircle,
  ArrowUpRight,
  Feather,
  ChevronRight,
  Phone,
  ShieldAlert,
  Zap,
  Coffee,
  Leaf,
  Award,
  Quote,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

/* ============================================================
   Root
   ============================================================ */
function Dashboard() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-aurora animate-aurora opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -10%, oklch(0.98 0.02 260 / 0.9), transparent 60%)",
        }}
      />

      <Sidebar />
      <Header />

      <main className="mx-auto max-w-[1240px] px-6 pb-32 pt-8 lg:pl-[112px] lg:pr-10">
        <Hero />
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <PeaceOrbCard />
          <AICompanionCard />
        </div>
        <EmotionalWeather />
        <CampusPulse />
        <AcademicTimeline />
        <FocusIsland />
        <KarmaForest />
        <WellnessRoadmap />
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <MemoryJournal />
          <StudyRhythm />
        </div>
        <Achievements />
        <ExploreGrid />
        <EmergencyCorner />
        <WeeklyReflection />
        <DailyQuote />
      </main>
    </div>
  );
}

/* ============================================================
   Sidebar — floating glass
   ============================================================ */
function Sidebar() {
  const items = [
    { icon: Home, label: "Home", active: true },
    { icon: Sparkles, label: "Peace AI", glow: true },
    { icon: Compass, label: "Explore" },
    { icon: BookOpen, label: "Journal" },
    { icon: Users, label: "Community" },
    { icon: Focus, label: "Focus" },
    { icon: Trophy, label: "Growth" },
    { icon: HeartPulse, label: "Wellness" },
  ];
  return (
    <aside className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <nav className="glass-strong flex flex-col gap-1 rounded-[28px] p-2">
        {items.map(({ icon: Icon, label, active, glow }) => (
          <button
            key={label}
            className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 hover:bg-white ${
              active ? "bg-white shadow-[var(--shadow-soft)]" : ""
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] transition-colors ${
                active ? "text-navy" : "text-navy-soft group-hover:text-navy"
              }`}
              strokeWidth={1.75}
            />
            {glow && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-ember animate-pulse-soft" />
            )}
            {/* Hover label */}
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl bg-navy px-3 py-1.5 text-xs font-medium text-cream opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
              {label}
            </span>
          </button>
        ))}
        <div className="my-1 h-px bg-border" />
        <button className="group flex h-11 w-11 items-center justify-center rounded-2xl transition hover:bg-white">
          <Settings className="h-[18px] w-[18px] text-navy-soft group-hover:text-navy" strokeWidth={1.75} />
        </button>
      </nav>
    </aside>
  );
}

/* ============================================================
   Header
   ============================================================ */
function Header() {
  return (
    <header className="sticky top-4 z-30 mx-auto mt-4 max-w-[1240px] px-6 lg:pl-[112px] lg:pr-10">
      <div className="glass flex items-center justify-between rounded-full px-3 py-2.5 pl-5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-editorial text-cream">
            <Leaf className="h-4 w-4" strokeWidth={2} />
          </div>
          <span className="text-editorial text-xl text-navy">PeaceCode</span>
        </div>
        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm text-muted-foreground ring-soft">
            <Search className="h-3.5 w-3.5" />
            <span>Search practices, journals, friends…</span>
            <kbd className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-navy-soft">
              ⌘K
            </kbd>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/70 transition">
            <Bell className="h-4 w-4 text-navy-soft" strokeWidth={1.75} />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-white/80 py-1 pl-1 pr-3 ring-soft">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-lavender to-sky text-navy text-xs font-semibold">
              J
            </div>
            <span className="text-sm font-medium text-navy">Jai</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   Hero
   ============================================================ */
function Hero() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const t = new Date();
    setTime(
      t.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" }),
    );
  }, []);

  return (
    <section className="relative mt-10 overflow-hidden rounded-[36px] bg-hero p-10 md:p-14 shadow-[var(--shadow-float)]">
      {/* Blobs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-lavender/70 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full bg-peach/70 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky/70 blur-3xl animate-float-slow" style={{ animationDelay: "4s" }} />

      <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="animate-rise">
          <p className="text-sm font-medium tracking-wide text-navy-soft">
            {time || "Tuesday"} · Evening
          </p>
          <h1 className="mt-3 text-editorial text-5xl leading-[1.02] text-navy md:text-[64px]">
            Good evening,<br />
            <em className="not-italic bg-editorial bg-clip-text text-transparent italic">Jai</em> <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-navy-soft">
            You've maintained your focus for three consecutive days. Today is a great
            opportunity to build momentum — softly, without pressure.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-cream shadow-[var(--shadow-float)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-blue)]">
              Continue Journey
              <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/70 px-6 py-3 text-sm font-medium text-navy backdrop-blur transition hover:bg-white">
              <Sparkles className="h-4 w-4" /> Talk to Peace AI
            </button>
          </div>
        </div>

        {/* Breathing orb */}
        <div className="relative mx-auto grid h-64 w-64 place-items-center md:h-80 md:w-80">
          <div className="absolute inset-0 rounded-full bg-white/40 blur-2xl" />
          <div
            className="absolute inset-0 rounded-full animate-breathe"
            style={{ background: "var(--gradient-orb)", boxShadow: "var(--shadow-glow-blue)" }}
          />
          <div className="absolute inset-6 rounded-full animate-breathe" style={{ background: "var(--gradient-orb)", animationDelay: "1s", filter: "blur(6px)", opacity: 0.7 }} />
          <div className="relative z-10 text-center text-cream">
            <div className="text-[11px] uppercase tracking-[0.24em] opacity-90">Peace Score</div>
            <div className="text-editorial text-6xl leading-none">82</div>
            <div className="mt-1 text-xs opacity-90">Balanced · ↑ 4 today</div>
          </div>
          {/* orbiting stars */}
          <div className="pointer-events-none absolute inset-0 animate-drift">
            <Star className="absolute left-2 top-6 h-3 w-3 text-white/80 fill-white/80" />
            <Star className="absolute right-4 top-16 h-2 w-2 text-white/70 fill-white/70" />
            <Star className="absolute bottom-8 left-14 h-2 w-2 text-white/70 fill-white/70" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Peace Score details
   ============================================================ */
function PeaceOrbCard() {
  const dims = [
    { label: "Focus", value: 86, color: "oklch(0.78 0.09 245)" },
    { label: "Mood", value: 74, color: "oklch(0.85 0.09 55)" },
    { label: "Sleep", value: 68, color: "oklch(0.82 0.06 300)" },
    { label: "Stress", value: 42, color: "oklch(0.75 0.12 35)" },
    { label: "Social", value: 79, color: "oklch(0.82 0.06 155)" },
    { label: "Confidence", value: 81, color: "oklch(0.78 0.09 210)" },
  ];
  return (
    <div className="card-float col-span-12 p-8 lg:col-span-7">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Daily Wellness Snapshot
          </div>
          <h2 className="text-editorial mt-2 text-3xl text-navy">How you're doing, softly.</h2>
        </div>
        <button className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-navy hover:bg-accent">
          Today
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {dims.map((d) => (
          <div
            key={d.label}
            className="group relative overflow-hidden rounded-2xl bg-muted/60 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{d.label}</span>
              <span className="font-semibold text-navy">{d.value}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110"
                style={{ width: `${d.value}%`, background: d.color }}
              />
            </div>
            {/* mini spark */}
            <svg viewBox="0 0 100 24" className="mt-3 h-6 w-full opacity-60">
              <path
                d={`M0 ${20 - d.value / 8} Q 25 ${10 + (d.value % 10)}, 50 ${18 - d.value / 10} T 100 ${12 - d.value / 12}`}
                fill="none"
                stroke={d.color}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

function AICompanionCard() {
  return (
    <div className="col-span-12 overflow-hidden rounded-[28px] p-8 lg:col-span-5 relative"
      style={{ background: "linear-gradient(160deg, oklch(0.28 0.06 265), oklch(0.4 0.09 275))" }}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-lavender/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2 text-cream/80 text-xs uppercase tracking-[0.22em]">
          <Sparkles className="h-3.5 w-3.5" /> Today's insight
        </div>
        <p className="text-editorial mt-4 text-2xl leading-tight text-cream">
          "Looks like your productivity dips after 8&nbsp;PM. Want me to design a gentler evening routine?"
        </p>
        <div className="mt-6 flex items-center gap-1.5 text-cream/70 text-xs">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cream" />
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cream" style={{ animationDelay: "0.2s" }} />
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-cream" style={{ animationDelay: "0.4s" }} />
          <span className="ml-2">Peace AI is thinking with you…</span>
        </div>
        <div className="mt-7 flex flex-wrap gap-2">
          {["Generate Plan", "Start Focus", "Journal", "Talk to AI"].map((a) => (
            <button
              key={a}
              className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-cream backdrop-blur transition hover:bg-white/20"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Section wrapper
   ============================================================ */
function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</div>
        <h2 className="text-editorial mt-2 text-3xl text-navy md:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   Emotional Weather
   ============================================================ */
function EmotionalWeather() {
  const week = [
    { d: "Mon", icon: Sun, tint: "oklch(0.9 0.08 80)", label: "Bright" },
    { d: "Tue", icon: Cloud, tint: "oklch(0.9 0.02 260)", label: "Calm" },
    { d: "Wed", icon: CloudRain, tint: "oklch(0.82 0.05 240)", label: "Heavy" },
    { d: "Thu", icon: Sun, tint: "oklch(0.9 0.09 60)", label: "Uplifted" },
    { d: "Fri", icon: Moon, tint: "oklch(0.75 0.05 300)", label: "Reflective" },
    { d: "Sat", icon: Star, tint: "oklch(0.9 0.06 55)", label: "Content" },
    { d: "Sun", icon: Cloud, tint: "oklch(0.92 0.02 260)", label: "Soft" },
  ];
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Section 03" title="Your emotional weather" />
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="col-span-12 lg:col-span-8 card-float relative overflow-hidden p-8"
          style={{ background: "linear-gradient(180deg, oklch(0.95 0.03 240), oklch(0.99 0.01 60))" }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-10 top-8 h-16 w-32 rounded-full bg-white/70 blur-xl animate-float-slow" />
            <div className="absolute right-14 top-16 h-12 w-24 rounded-full bg-white/60 blur-xl animate-float-slow" style={{ animationDelay: "2s" }} />
            <div className="absolute right-1/3 top-4 h-10 w-20 rounded-full bg-white/60 blur-lg animate-float-slow" style={{ animationDelay: "4s" }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-navy-soft"><Sun className="h-4 w-4" /> <span className="text-xs uppercase tracking-widest">Today</span></div>
            <h3 className="text-editorial mt-3 text-4xl text-navy">Golden hour, gentle winds.</h3>
            <p className="mt-2 text-navy-soft max-w-md">A warm, uplifted mood with a hint of quiet. Perfect weather for a slow journal entry.</p>
            <div className="mt-8 grid grid-cols-7 gap-2">
              {week.map(({ d, icon: I, tint, label }) => (
                <div key={d} className="group text-center">
                  <div
                    className="mx-auto grid h-14 w-14 place-items-center rounded-2xl transition group-hover:-translate-y-1"
                    style={{ background: tint }}
                  >
                    <I className="h-5 w-5 text-navy" strokeWidth={1.75} />
                  </div>
                  <div className="mt-2 text-[11px] font-medium text-navy">{d}</div>
                  <div className="text-[10px] text-muted-foreground opacity-0 transition group-hover:opacity-100">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 card-float p-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Triggers this week</div>
          <ul className="mt-4 space-y-3">
            {[
              { label: "Late-night scrolling", pct: 62 },
              { label: "Skipped meals", pct: 28 },
              { label: "Skipped sunlight", pct: 41 },
              { label: "Conflict with friend", pct: 15 },
            ].map((t) => (
              <li key={t.label} className="group">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy">{t.label}</span>
                  <span className="text-muted-foreground text-xs">{t.pct}%</span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-editorial transition-all duration-700 group-hover:brightness-110" style={{ width: `${t.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-navy hover:gap-2 transition-all">
            View full analysis <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Campus Pulse — bubbles
   ============================================================ */
function CampusPulse() {
  const bubbles = [
    { label: "Meditating", count: 128, x: 15, y: 30, size: 96, tint: "oklch(0.88 0.06 155)" },
    { label: "Studying", count: 412, x: 45, y: 15, size: 140, tint: "oklch(0.85 0.07 245)" },
    { label: "Journaling", count: 87, x: 72, y: 40, size: 82, tint: "oklch(0.88 0.06 300)" },
    { label: "Grateful", count: 214, x: 30, y: 65, size: 110, tint: "oklch(0.9 0.06 55)" },
    { label: "Seeking help", count: 34, x: 62, y: 70, size: 68, tint: "oklch(0.85 0.09 25)" },
    { label: "Breathing", count: 156, x: 82, y: 18, size: 90, tint: "oklch(0.88 0.05 210)" },
  ];
  return (
    <section className="mt-14">
      <SectionHeader
        eyebrow="Section 04"
        title="Campus pulse, right now."
        action={
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-moss animate-pulse-soft" /> 1,031 students online
          </div>
        }
      />
      <div
        className="card-float relative mt-6 h-[420px] overflow-hidden p-6"
        style={{ background: "radial-gradient(ellipse at center, oklch(0.98 0.02 240), oklch(0.94 0.03 290))" }}
      >
        {bubbles.map((b) => (
          <div
            key={b.label}
            className="group absolute cursor-pointer"
            style={{ left: `${b.x}%`, top: `${b.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div
              className="grid animate-float-slow place-items-center rounded-full text-center transition group-hover:scale-105"
              style={{
                width: b.size,
                height: b.size,
                background: `radial-gradient(circle at 30% 30%, white, ${b.tint} 70%)`,
                boxShadow: "0 20px 40px -12px oklch(0.24 0.06 265 / 0.2), inset 0 1px 0 white",
                animationDelay: `${b.x / 20}s`,
              }}
            >
              <div>
                <div className="text-editorial text-2xl leading-none text-navy">{b.count}</div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-navy-soft mt-1">{b.label}</div>
              </div>
            </div>
            <div className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-xl bg-navy px-3 py-1.5 text-xs text-cream opacity-0 shadow-lg transition group-hover:opacity-100">
              "Someone just found calm here."
            </div>
          </div>
        ))}
        {/* floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-navy/20 animate-float-slow"
            style={{
              left: `${(i * 83) % 100}%`,
              top: `${(i * 47) % 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Academic Timeline
   ============================================================ */
function AcademicTimeline() {
  const events = [
    { day: "Mon", label: "DS Quiz", load: 32, tone: "sky" },
    { day: "Tue", label: "Group Project", load: 55, tone: "lavender" },
    { day: "Wed", label: "Recovery Day", load: 15, tone: "moss" },
    { day: "Thu", label: "Midterm Prep", load: 82, tone: "peach" },
    { day: "Fri", label: "Midterm Exam", load: 96, tone: "ember" },
    { day: "Sat", label: "Rest", load: 12, tone: "sky" },
    { day: "Sun", label: "Reflect", load: 25, tone: "lavender" },
  ];
  const tone = (t: string) =>
    ({
      sky: "oklch(0.82 0.09 245)",
      lavender: "oklch(0.82 0.06 300)",
      moss: "oklch(0.82 0.08 155)",
      peach: "oklch(0.85 0.09 55)",
      ember: "oklch(0.75 0.14 30)",
    }) as any;
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Section 05" title="This week's academic journey" />
      <div className="card-float mt-6 overflow-x-auto p-8">
        <div className="relative flex min-w-[720px] items-end gap-4">
          {/* baseline */}
          <div className="absolute inset-x-6 bottom-16 h-px bg-border" />
          {events.map((e) => {
            const h = 40 + (e.load / 100) * 180;
            return (
              <div key={e.day} className="group relative flex-1 flex flex-col items-center">
                <div className="text-[11px] font-medium text-muted-foreground mb-2 opacity-0 group-hover:opacity-100 transition">
                  Load {e.load}%
                </div>
                <div
                  className="w-14 rounded-2xl transition-all duration-500 group-hover:brightness-110 group-hover:-translate-y-1"
                  style={{
                    height: h,
                    background: `linear-gradient(180deg, white, ${(tone(e.tone) as any) as string})`,
                    boxShadow: "0 12px 24px -12px oklch(0.24 0.06 265 / 0.2), inset 0 1px 0 white",
                  }}
                />
                <div className="mt-4 text-xs font-semibold text-navy">{e.day}</div>
                <div className="text-[10px] text-muted-foreground text-center max-w-[80px] leading-tight">{e.label}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-muted/70 p-4 text-sm text-navy-soft">
          <Brain className="h-4 w-4 text-navy" />
          <span>
            Peace&nbsp;AI predicts <span className="font-semibold text-navy">Thursday–Friday</span> as your
            heaviest stretch. I've reserved a Saturday recovery ritual for you.
          </span>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Focus Island
   ============================================================ */
function FocusIsland() {
  const buildings = [
    { icon: Timer, label: "Pomodoro", tint: "oklch(0.85 0.09 55)" },
    { icon: Focus, label: "Deep Work", tint: "oklch(0.82 0.09 245)" },
    { icon: Music, label: "Music", tint: "oklch(0.82 0.07 300)" },
    { icon: Trees, label: "Nature", tint: "oklch(0.85 0.08 155)" },
    { icon: Waves, label: "White Noise", tint: "oklch(0.88 0.05 210)" },
    { icon: Sparkles, label: "AI Focus", tint: "oklch(0.82 0.09 275)" },
  ];
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Section 06" title="Focus Island" action={<div className="text-sm text-muted-foreground">Pick a building to dock.</div>} />
      <div className="card-float relative mt-6 overflow-hidden p-8"
        style={{ background: "linear-gradient(180deg, oklch(0.97 0.02 240), oklch(0.93 0.05 210))" }}>
        <div className="pointer-events-none absolute -bottom-10 left-1/2 h-40 w-[80%] -translate-x-1/2 rounded-[50%] bg-white/70 blur-2xl" />
        <div className="relative grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {buildings.map(({ icon: I, label, tint }) => (
            <button
              key={label}
              className="group relative flex flex-col items-center gap-3 rounded-2xl p-5 transition hover:-translate-y-1"
            >
              <div
                className="grid h-20 w-20 place-items-center rounded-[28px] transition group-hover:brightness-110"
                style={{
                  background: `linear-gradient(160deg, white, ${tint})`,
                  boxShadow: "0 20px 40px -12px oklch(0.24 0.06 265 / 0.18), inset 0 1px 0 white",
                }}
              >
                <I className="h-7 w-7 text-navy" strokeWidth={1.6} />
              </div>
              <div className="text-sm font-medium text-navy">{label}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                Launch
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Karma Forest
   ============================================================ */
function KarmaForest() {
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Section 07" title="Karma Forest" action={<div className="text-sm text-muted-foreground">14 trees · planted with 3 friends</div>} />
      <div className="card-float relative mt-6 overflow-hidden p-10"
        style={{ background: "var(--gradient-forest)" }}>
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white animate-pulse-soft"
              style={{ left: `${(i * 61) % 100}%`, top: `${(i * 37) % 90}%`, animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
        {/* Ground */}
        <div className="relative flex items-end justify-around gap-2 h-56">
          {[
            { icon: Trees, size: 88, delay: 0 },
            { icon: Flower2, size: 56, delay: 0.5 },
            { icon: Trees, size: 108, delay: 1 },
            { icon: Leaf, size: 48, delay: 1.5 },
            { icon: Trees, size: 96, delay: 2 },
            { icon: Flower2, size: 60, delay: 2.5 },
            { icon: Trees, size: 76, delay: 3 },
          ].map(({ icon: I, size, delay }, i) => (
            <div key={i} className="group flex flex-col items-center animate-float-slow" style={{ animationDelay: `${delay}s` }}>
              <I style={{ width: size, height: size }} className="text-navy/80 transition group-hover:text-navy group-hover:scale-105" strokeWidth={1.2} />
            </div>
          ))}
        </div>
        <div className="relative mt-4 grid gap-4 md:grid-cols-3">
          {[
            { by: "You", note: "Grateful for a slow evening." },
            { by: "Ananya", note: "Planted after finishing thesis draft." },
            { by: "Rohan", note: "A tree for calling home today." },
          ].map((s) => (
            <div key={s.by} className="glass rounded-2xl p-4 transition hover:-translate-y-0.5">
              <div className="text-xs uppercase tracking-widest text-navy-soft">{s.by}</div>
              <div className="text-editorial mt-1 text-lg text-navy leading-snug">"{s.note}"</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Wellness Roadmap
   ============================================================ */
function WellnessRoadmap() {
  const stages = [
    { label: "Self Assessment", icon: Feather, done: true },
    { label: "Healing", icon: HeartPulse, done: true },
    { label: "Growth", icon: Leaf, done: true },
    { label: "Confidence", icon: Zap, done: false, active: true },
    { label: "Mindfulness", icon: Wind, done: false },
    { label: "Leadership", icon: Compass, done: false },
    { label: "Peace Ambassador", icon: Award, done: false },
  ];
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Section 08" title="Your wellness roadmap" />
      <div className="card-float mt-6 p-8">
        <div className="relative">
          <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-navy/40 via-lavender to-transparent" />
          <ul className="space-y-6">
            {stages.map(({ label, icon: I, done, active }, i) => (
              <li key={label} className="group relative flex items-start gap-5 pl-1">
                <div
                  className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition ${
                    done
                      ? "bg-editorial text-cream"
                      : active
                      ? "bg-white text-navy ring-2 ring-navy/60 shadow-[var(--shadow-glow-blue)] animate-pulse-soft"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <I className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-editorial text-2xl text-navy">{label}</span>
                    {done && <span className="rounded-full bg-moss/40 px-2 py-0.5 text-[10px] font-medium text-navy">Completed</span>}
                    {active && <span className="rounded-full bg-peach/60 px-2 py-0.5 text-[10px] font-medium text-navy">In progress</span>}
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-navy-soft opacity-80 transition group-hover:opacity-100">
                    {[
                      "You mapped your baseline. Bravely done.",
                      "You met yourself with tenderness in hard weeks.",
                      "You built small, repeatable practices.",
                      "You're learning to trust your own voice, one week at a time.",
                      "The art of stillness begins here.",
                      "You start guiding others — quietly, generously.",
                      "You become the calm you once searched for.",
                    ][i]}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Memory Journal
   ============================================================ */
function MemoryJournal() {
  const notes = [
    { color: "oklch(0.95 0.08 55)", mood: "Grateful", text: "Watched sunset from hostel roof. Long call with amma.", rot: -3 },
    { color: "oklch(0.92 0.06 300)", mood: "Reflective", text: "I said no to a plan. It felt strange. Also freeing.", rot: 2 },
    { color: "oklch(0.92 0.05 210)", mood: "Calm", text: "Finished DSA chapter without checking phone.", rot: -1 },
  ];
  return (
    <div className="col-span-12 lg:col-span-7">
      <SectionHeader eyebrow="Section 09" title="Memory journal" action={<button className="text-sm font-medium text-navy hover:underline">Open notebook →</button>} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {notes.map((n) => (
          <div
            key={n.text}
            className="group rounded-3xl p-5 transition-transform duration-500 hover:!rotate-0 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]"
            style={{ background: n.color, transform: `rotate(${n.rot}deg)`, boxShadow: "0 10px 24px -12px oklch(0.24 0.06 265 / 0.25)" }}
          >
            <div className="text-[10px] uppercase tracking-widest text-navy/70">{n.mood}</div>
            <p className="text-editorial mt-2 text-lg leading-snug text-navy">"{n.text}"</p>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] text-navy/60">
              <Sparkles className="h-3 w-3" /> AI: keywords tagged
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Study Rhythm
   ============================================================ */
function StudyRhythm() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const rhythm = [40, 68, 55, 82, 60, 30, 45];
  return (
    <div className="col-span-12 lg:col-span-5">
      <SectionHeader eyebrow="Section 10" title="Study rhythm" />
      <div className="card-float mt-6 p-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">This week's flow</div>
        <svg viewBox="0 0 300 120" className="mt-3 w-full">
          <defs>
            <linearGradient id="rhythmG" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.78 0.09 245)" />
              <stop offset="60%" stopColor="oklch(0.85 0.08 300)" />
              <stop offset="100%" stopColor="oklch(0.85 0.09 55)" />
            </linearGradient>
            <linearGradient id="rhythmFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.09 245 / 0.4)" />
              <stop offset="100%" stopColor="oklch(0.78 0.09 245 / 0)" />
            </linearGradient>
          </defs>
          {(() => {
            const pts = rhythm.map((v, i) => `${(i * 300) / 6},${110 - (v / 100) * 90}`);
            const path = `M${pts[0]} ${pts.map((p, i) => (i === 0 ? "" : `L${p}`)).join(" ")}`;
            const area = `${path} L300,120 L0,120 Z`;
            return (
              <>
                <path d={area} fill="url(#rhythmFill)" />
                <path d={path} fill="none" stroke="url(#rhythmG)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {rhythm.map((v, i) => (
                  <circle key={i} cx={(i * 300) / 6} cy={110 - (v / 100) * 90} r="4" fill="white" stroke="oklch(0.78 0.09 245)" strokeWidth="2" />
                ))}
              </>
            );
          })()}
        </svg>
        <div className="mt-2 grid grid-cols-7 text-center text-[11px] text-muted-foreground">
          {days.map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="mt-5 flex items-center justify-between text-sm">
          <div>
            <div className="text-editorial text-3xl text-navy">6.2h</div>
            <div className="text-xs text-muted-foreground">avg deep work</div>
          </div>
          <div className="text-right">
            <div className="text-editorial text-3xl text-navy">7.1h</div>
            <div className="text-xs text-muted-foreground">avg sleep</div>
          </div>
          <div className="text-right">
            <div className="text-editorial text-3xl text-navy">92%</div>
            <div className="text-xs text-muted-foreground">consistency</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Achievements
   ============================================================ */
function Achievements() {
  const awards = [
    { label: "7-Day Calm", icon: Wind, tint: "oklch(0.9 0.07 210)" },
    { label: "Finished CBT", icon: Brain, tint: "oklch(0.9 0.07 300)" },
    { label: "Helped a Friend", icon: HeartPulse, tint: "oklch(0.9 0.09 25)" },
    { label: "Focus Marathon", icon: Focus, tint: "oklch(0.9 0.09 245)" },
    { label: "Journal Streak", icon: BookOpen, tint: "oklch(0.9 0.08 55)" },
    { label: "Kindness Karma", icon: Flower2, tint: "oklch(0.9 0.07 155)" },
  ];
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Section 11" title="Trophy shelf" action={<div className="text-sm text-muted-foreground">Hover to hear the story</div>} />
      <div className="card-float mt-6 p-8" style={{ background: "linear-gradient(180deg, oklch(0.97 0.015 260), white)" }}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {awards.map(({ label, icon: I, tint }) => (
            <div key={label} className="group perspective-[1000px] text-center">
              <div
                className="mx-auto grid h-24 w-24 place-items-center rounded-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
                style={{
                  background: `radial-gradient(circle at 30% 30%, white, ${tint})`,
                  boxShadow: "0 24px 40px -12px oklch(0.24 0.06 265 / 0.2), inset 0 2px 0 white",
                }}
              >
                <I className="h-8 w-8 text-navy" strokeWidth={1.6} />
              </div>
              <div className="mt-3 text-sm font-medium text-navy">{label}</div>
              <div className="mt-1 text-[11px] text-muted-foreground opacity-0 transition group-hover:opacity-100">
                Earned last week
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Explore Grid
   ============================================================ */
function ExploreGrid() {
  const items = [
    { icon: Wind, label: "Meditation" },
    { icon: BookOpen, label: "Journal" },
    { icon: Users, label: "Community" },
    { icon: MessageCircle, label: "Counselor" },
    { icon: HeartPulse, label: "Screening" },
    { icon: Sparkles, label: "Peace AI" },
    { icon: Timer, label: "Focus Timer" },
    { icon: Cloud, label: "Mood Tracker" },
    { icon: Coffee, label: "Resources" },
    { icon: ShieldAlert, label: "Emergency" },
  ];
  return (
    <section className="mt-14">
      <SectionHeader eyebrow="Section 12" title="Explore PeaceCode" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {items.map(({ icon: I, label }) => (
          <button
            key={label}
            className="group glass flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl p-6 transition hover:-translate-y-1"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 shadow-[var(--shadow-soft)] transition group-hover:scale-110">
              <I className="h-5 w-5 text-navy" strokeWidth={1.75} />
            </div>
            <div className="text-sm font-medium text-navy">{label}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Emergency Corner
   ============================================================ */
function EmergencyCorner() {
  return (
    <section className="mt-14">
      <div
        className="card-float relative overflow-hidden p-8"
        style={{ background: "linear-gradient(135deg, oklch(0.97 0.02 30), oklch(0.94 0.05 25))" }}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ember/20 blur-3xl animate-pulse-soft" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-navy-soft">
              <ShieldAlert className="h-4 w-4 text-ember" /> Always here for you
            </div>
            <h2 className="text-editorial mt-3 text-3xl text-navy">If today feels heavy, you don't have to carry it alone.</h2>
            <p className="mt-2 max-w-lg text-navy-soft">A counselor is a tap away. All of this is confidential. All of this is okay.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: Phone, label: "Call Counselor", primary: true },
              { icon: Wind, label: "Grounding" },
              { icon: HeartPulse, label: "Breathing" },
              { icon: ShieldAlert, label: "SOS" },
            ].map(({ icon: I, label, primary }) => (
              <button
                key={label}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 ${
                  primary
                    ? "bg-navy text-cream shadow-[var(--shadow-float)]"
                    : "bg-white/80 text-navy backdrop-blur"
                }`}
              >
                <I className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Weekly Reflection
   ============================================================ */
function WeeklyReflection() {
  const stats = [
    { k: "+16%", v: "more consistent" },
    { k: "+41%", v: "focus sessions" },
    { k: "3×", v: "helped a friend" },
    { k: "−12%", v: "evening scroll" },
  ];
  return (
    <section className="mt-14">
      <div className="relative overflow-hidden rounded-[36px] p-10 md:p-14 text-cream"
        style={{ background: "linear-gradient(120deg, oklch(0.24 0.06 265), oklch(0.36 0.09 280) 60%, oklch(0.48 0.1 240))" }}>
        <div className="pointer-events-none absolute inset-0 opacity-40 animate-aurora"
          style={{ background: "radial-gradient(ellipse at 20% 20%, oklch(0.75 0.1 300 / 0.6), transparent 55%), radial-gradient(ellipse at 80% 80%, oklch(0.75 0.12 220 / 0.6), transparent 55%)" }} />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.24em] text-cream/70">Peace AI · weekly reflection</div>
          <h2 className="text-editorial mt-4 text-4xl leading-tight md:text-6xl">
            This week, you became softer<br />with yourself — and stronger with your time.
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.v}>
                <div className="text-editorial text-4xl text-cream">{s.k}</div>
                <div className="mt-1 text-sm text-cream/70">{s.v}</div>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-cream/80">
            Sleep dipped on Thursday. Let's rebuild it gently this week with a 10-minute wind-down at 10&nbsp;PM.
            I'll be beside you.
          </p>
          <button className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-cream backdrop-blur transition hover:bg-white/20">
            Build my plan <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Daily Quote
   ============================================================ */
function DailyQuote() {
  return (
    <section className="mt-14">
      <div className="relative overflow-hidden rounded-[36px] bg-hero p-14 text-center md:p-20">
        <div className="pointer-events-none absolute inset-0 animate-aurora opacity-70"
          style={{ backgroundImage: "var(--gradient-aurora)" }} />
        <div className="relative">
          <Quote className="mx-auto h-8 w-8 text-navy/50" />
          <p className="text-editorial mt-6 text-4xl leading-[1.1] text-navy md:text-6xl">
            "You do not need to be a better version of yourself.<br />
            <em className="italic bg-editorial bg-clip-text text-transparent">You need to be a kinder one.</em>"
          </p>
          <div className="mt-8 text-sm uppercase tracking-[0.3em] text-navy-soft">— Today's PeaceCode</div>
        </div>
      </div>
      <div className="mt-8 text-center text-xs text-muted-foreground">
        Made with care in India · PeaceCode © 2026
      </div>
    </section>
  );
}
