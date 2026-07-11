import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home,
  Compass,
  BookOpen,
  Users,
  Focus,
  HeartPulse,
  Settings,
  Bell,
  Search,
  Wind,
  Sun,
  Cloud,
  Moon,
  Sparkles,
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
  Leaf,
  Quote,
  Send,
  Smile,
  Flower2,
  Trees,
  Coffee,
  BookHeart,
  Headphones,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

/* ------------------------------------------------------------------ */
/* SIDEBAR — hover-expand glass tube                                    */
/* ------------------------------------------------------------------ */

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Compass, label: "Explore" },
  { icon: BookOpen, label: "Journal" },
  { icon: Brain, label: "Peace AI" },
  { icon: Users, label: "Community" },
  { icon: Focus, label: "Focus" },
  { icon: HeartPulse, label: "Wellness" },
  { icon: Trees, label: "Karma" },
];

function Sidebar() {
  const [hover, setHover] = useState(false);
  return (
    <aside
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`fixed left-5 top-1/2 z-40 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        hover ? "w-56" : "w-16"
      }`}
    >
      <div className="glass-strong flex flex-col gap-1 rounded-[36px] p-3 shadow-[0_20px_60px_-20px_oklch(0.24_0.06_265/0.25)]">
        <div className="mb-2 flex items-center gap-3 px-2 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-editorial text-cream shadow-glow-blue">
            <Sparkles className="h-5 w-5" />
          </div>
          <div
            className={`overflow-hidden whitespace-nowrap transition-opacity duration-300 ${
              hover ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="font-serif text-lg leading-none text-navy">PeaceCode</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">wellness</div>
          </div>
        </div>
        {navItems.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${
                it.active
                  ? "bg-navy text-cream shadow-[0_10px_30px_-10px_oklch(0.24_0.06_265/0.4)]"
                  : "text-navy/70 hover:bg-white/60 hover:text-navy"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-opacity duration-300 ${
                  hover ? "opacity-100" : "opacity-0"
                }`}
              >
                {it.label}
              </span>
            </button>
          );
        })}
        <div className="mt-2 border-t border-white/50 pt-2">
          <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-navy/60 hover:bg-white/60">
            <Settings className="h-5 w-5 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap text-sm transition-opacity duration-300 ${
                hover ? "opacity-100" : "opacity-0"
              }`}
            >
              Settings
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* HEADER                                                               */
/* ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="sticky top-0 z-30 -mx-2 mb-8 px-2 pt-6">
      <div className="glass flex items-center gap-4 rounded-full px-3 py-2 pl-6">
        <div className="hidden sm:block">
          <div className="font-serif text-lg leading-none text-navy">Saturday, July 11</div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">a gentle morning</div>
        </div>
        <div className="ml-auto flex flex-1 items-center gap-2 rounded-full bg-white/70 px-4 py-2 sm:max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search sessions, journals, thoughts…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">⌘K</kbd>
        </div>
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70 text-navy hover:bg-white">
          <Bell className="h-4 w-4" />
        </button>
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-editorial text-sm font-semibold text-cream">
          K
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable — image placeholder                                         */
/* ------------------------------------------------------------------ */

function Placeholder({
  className = "",
  gradient = "from-blue-soft/60 via-lavender/60 to-peach/60",
  label,
  children,
}: {
  className?: string;
  gradient?: string;
  label?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${gradient} ${className}`}
    >
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 h-52 w-52 rounded-full bg-white/30 blur-3xl" />
      {label && (
        <div className="absolute left-4 top-4 rounded-full bg-white/60 px-3 py-1 text-[10px] uppercase tracking-widest text-navy/70 backdrop-blur">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SECTIONS                                                             */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="animate-rise relative overflow-hidden rounded-[40px] bg-hero bg-aurora p-8 shadow-float sm:p-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs text-navy/70 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-moss" />
            Good morning, Keya
          </div>
          <h1 className="text-editorial text-5xl text-navy sm:text-6xl lg:text-7xl">
            Today feels like a<br />
            <span className="italic text-navy-soft">soft beginning.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-navy/70">
            Your energy is gentle, your focus is returning. A slow breath and a small
            intention will carry you further than any to-do list.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="group flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-cream shadow-[0_10px_30px_-8px_oklch(0.24_0.06_265/0.5)] transition hover:scale-[1.02]">
              Continue your journey
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </button>
            <button className="flex items-center gap-2 rounded-full bg-white/70 px-6 py-3 text-sm font-medium text-navy backdrop-blur hover:bg-white">
              <MessageCircle className="h-4 w-4" />
              Talk to Peace AI
            </button>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-xs text-navy/60">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-ember" /> Warm & steady
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-soft" /> Low stress · calm winds
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-moss" /> Day 12 of your streak
            </div>
          </div>
        </div>
        <Placeholder
          className="aspect-square w-full"
          gradient="from-peach/70 via-lavender/60 to-blue-soft/70"
          label="Daily illustration"
        >
          <div className="absolute inset-0 grid place-items-center">
            <div className="animate-breathe h-48 w-48 rounded-full bg-gradient-orb shadow-glow-blue sm:h-64 sm:w-64" />
          </div>
        </Placeholder>
      </div>
    </section>
  );
}

function EnergyOrb() {
  const [hover, setHover] = useState(false);
  return (
    <section
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="card-float relative overflow-hidden p-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Today's energy</div>
          <div className="font-serif text-3xl text-navy">Soft & focused</div>
        </div>
        <Sparkles className="h-5 w-5 text-navy/40" />
      </div>
      <div className="relative my-8 grid place-items-center">
        <div className="animate-breathe h-56 w-56 rounded-full bg-gradient-orb blur-[1px]" />
        <div className="absolute h-56 w-56 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
      </div>
      <div className={`grid grid-cols-3 gap-4 transition-all duration-500 ${hover ? "opacity-100" : "opacity-70"}`}>
        {[
          { label: "Mood", value: "Calm", tone: "text-blue-soft" },
          { label: "Stress", value: "Low", tone: "text-moss" },
          { label: "Focus", value: "Rising", tone: "text-ember" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white/60 p-3 text-center backdrop-blur">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div className={`mt-1 font-serif text-lg ${s.tone}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div
        className={`mt-4 overflow-hidden rounded-2xl bg-navy/5 px-4 text-sm text-navy/70 transition-all ${
          hover ? "max-h-40 py-3 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
      >
        <span className="font-medium text-navy">Peace AI · </span>
        You slept 7h 20m and moved a little. A short breath session mid-day could keep this
        gentle momentum going.
      </div>
    </section>
  );
}

function FeaturedExperience() {
  return (
    <section className="card-float group relative overflow-hidden">
      <div className="grid md:grid-cols-2">
        <Placeholder
          className="aspect-[4/3] md:aspect-auto md:h-full"
          gradient="from-ember/70 via-peach/70 to-lavender/60"
          label="Featured today"
        >
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/80 shadow-float backdrop-blur transition-transform group-hover:scale-110">
              <Play className="h-7 w-7 translate-x-0.5 text-navy" fill="currentColor" />
            </div>
          </div>
        </Placeholder>
        <div className="flex flex-col justify-between p-8">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Featured experience</div>
            <h3 className="mt-2 font-serif text-4xl text-navy">A slow campus walk</h3>
            <p className="mt-3 text-navy/70">
              Twelve minutes of guided walking meditation to loosen the exam-week grip on
              your shoulders. Headphones optional.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-4 text-xs text-navy/60">
              <span>12 min</span>
              <span>·</span>
              <span>Outdoor</span>
              <span>·</span>
              <span>Beginner</span>
            </div>
            <button className="flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm text-cream hover:scale-[1.02]">
              Begin <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AIConversation() {
  return (
    <section className="card-float flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-navy/5 p-5">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-editorial">
          <Sparkles className="h-4 w-4 text-cream" />
        </div>
        <div>
          <div className="text-sm font-medium text-navy">Peace AI</div>
          <div className="flex items-center gap-1.5 text-[11px] text-moss">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-moss" />
            here with you
          </div>
        </div>
        <button className="ml-auto text-xs text-navy/50 hover:text-navy">Resume →</button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="max-w-[85%] rounded-3xl rounded-tl-md bg-fog/60 px-4 py-3 text-sm text-navy">
          Morning, Keya. I noticed your sleep dipped a bit last night — want to talk about
          it or ease into the day first?
        </div>
        <div className="ml-auto max-w-[85%] rounded-3xl rounded-tr-md bg-blue-soft/40 px-4 py-3 text-sm text-navy">
          Ease into the day. Something short.
        </div>
        <div className="max-w-[85%] rounded-3xl rounded-tl-md bg-fog/60 px-4 py-3 text-sm text-navy">
          Perfect. Three minutes of box breathing coming up. I'll be right here when you're
          done. 🌿
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-navy/5 bg-white/60 p-3">
        <Smile className="ml-2 h-4 w-4 text-navy/40" />
        <input
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-navy/40"
          placeholder="Type how you're feeling…"
        />
        <button className="grid h-9 w-9 place-items-center rounded-full bg-navy text-cream">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function JourneyMilestones() {
  const stages = [
    { title: "Assessment", tone: "from-blue-soft/60 to-lavender/60", done: true },
    { title: "Understanding", tone: "from-lavender/60 to-peach/60", done: true },
    { title: "Habits", tone: "from-peach/60 to-ember/50", done: true, current: true },
    { title: "Academic balance", tone: "from-ember/50 to-moss/50" },
    { title: "Confidence", tone: "from-moss/50 to-blue-soft/60" },
    { title: "Helping others", tone: "from-blue-soft/60 to-navy/40" },
  ];
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Your journey</div>
          <h2 className="font-serif text-3xl text-navy">Six chapters of you</h2>
        </div>
        <button className="text-sm text-navy/60 hover:text-navy">View map →</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stages.map((s, i) => (
          <div
            key={s.title}
            className={`group relative shrink-0 overflow-hidden rounded-[28px] p-5 transition-all hover:-translate-y-1 ${
              s.current ? "w-72" : "w-56"
            }`}
          >
            <Placeholder className="absolute inset-0" gradient={s.tone} />
            <div className="relative flex h-52 flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-navy/70 backdrop-blur">
                  Chapter {i + 1}
                </div>
                {s.done && <div className="text-[10px] text-moss">✓ complete</div>}
              </div>
              <div>
                <div className="font-serif text-2xl text-navy">{s.title}</div>
                {s.current && (
                  <div className="mt-2 text-xs text-navy/70">You are here — 68%</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FocusSpace() {
  return (
    <section className="card-float group relative overflow-hidden">
      <Placeholder
        className="absolute inset-0"
        gradient="from-navy/80 via-navy-soft/70 to-lavender/50"
      />
      <div className="relative grid gap-8 p-10 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div className="text-cream">
          <div className="text-[11px] uppercase tracking-widest text-cream/70">Daily focus space</div>
          <h2 className="mt-2 font-serif text-5xl leading-tight">
            Deep work,<br />quietly.
          </h2>
          <p className="mt-4 max-w-md text-cream/80">
            One task. Twenty-five minutes. A soft ambient soundscape that fades when you
            do. No notifications, no scoreboards.
          </p>
          <button className="mt-6 flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-navy transition group-hover:scale-[1.02]">
            <Timer className="h-4 w-4" /> Start 25 min session
          </button>
        </div>
        <div className="glass flex items-center gap-5 rounded-3xl p-6">
          <div className="relative grid h-24 w-24 place-items-center rounded-full bg-cream/20">
            <div className="animate-breathe h-16 w-16 rounded-full bg-cream/80" />
          </div>
          <div className="text-cream">
            <div className="text-xs uppercase tracking-widest text-cream/70">Suggested</div>
            <div className="font-serif text-2xl">Rainy library</div>
            <div className="mt-1 text-xs text-cream/70">soft rain · pages turning</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmotionalWeather() {
  const weather = [
    { time: "Morning", label: "Sunny", icon: Sun, tone: "from-peach/70 to-ember/40", note: "Bright, curious energy" },
    { time: "Afternoon", label: "Cloudy", icon: Cloud, tone: "from-fog to-blue-soft/60", note: "A little scattered" },
    { time: "Night", label: "Starlit", icon: Moon, tone: "from-navy/70 to-lavender/50", note: "Quiet, reflective" },
  ];
  return (
    <section>
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Emotional weather</div>
        <h2 className="font-serif text-3xl text-navy">Your day, in feelings</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {weather.map((w) => {
          const Icon = w.icon;
          return (
            <div
              key={w.time}
              className="group relative overflow-hidden rounded-[28px] p-6 transition-all hover:-translate-y-1"
            >
              <Placeholder className="absolute inset-0" gradient={w.tone} />
              <div className="relative flex h-52 flex-col justify-between">
                <Icon className="h-8 w-8 text-navy/80" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-navy/60">{w.time}</div>
                  <div className="font-serif text-3xl text-navy">{w.label}</div>
                  <div className="mt-2 max-h-0 overflow-hidden text-sm text-navy/70 transition-all duration-500 group-hover:max-h-20">
                    {w.note}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Community() {
  const posts = [
    { name: "Anon · IIT-B", text: "Passed my viva. Cried in the hostel corridor. Grateful.", tone: "from-peach/60 to-lavender/50" },
    { name: "Anon · DU", text: "Made chai for my roommate today. She's been sad.", tone: "from-blue-soft/50 to-moss/40" },
    { name: "Anon · NIT-T", text: "Slept 8 hours. First time in a month. Small wins.", tone: "from-lavender/50 to-fog" },
  ];
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Community</div>
          <h2 className="font-serif text-3xl text-navy">Small moments today</h2>
        </div>
        <button className="text-sm text-navy/60 hover:text-navy">Share yours →</button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((p) => (
          <div key={p.name} className="card-float overflow-hidden p-5">
            <Placeholder className="h-32 w-full" gradient={p.tone} />
            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{p.name}</div>
              <p className="mt-2 font-serif text-lg leading-snug text-navy">"{p.text}"</p>
            </div>
            <div className="mt-4 flex gap-3 text-xs text-navy/50">
              <button className="hover:text-navy">🌿 hold</button>
              <button className="hover:text-navy">💬 reply</button>
              <button className="hover:text-navy">✨ thank</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KarmaGarden() {
  return (
    <section className="card-float group relative overflow-hidden">
      <Placeholder
        className="absolute inset-0"
        gradient="from-moss/50 via-blue-soft/40 to-lavender/50"
      />
      {/* Soft floating shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute left-[15%] top-[30%] h-20 w-20 rounded-full bg-white/40 blur-2xl" />
        <div className="animate-float-slow absolute right-[20%] top-[50%] h-32 w-32 rounded-full bg-peach/40 blur-3xl [animation-delay:2s]" />
        <div className="animate-float-slow absolute left-[45%] bottom-[15%] h-16 w-16 rounded-full bg-lavender/50 blur-2xl [animation-delay:4s]" />
      </div>
      <div className="relative grid gap-6 p-10 md:grid-cols-[1fr_1.3fr] md:items-center">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-navy/60">Karma garden</div>
          <h2 className="mt-2 font-serif text-5xl text-navy">
            A garden grown by <em className="text-navy-soft">kindness.</em>
          </h2>
          <p className="mt-4 max-w-md text-navy/70">
            Every act of care — a message, a listening ear, a shared note — plants
            something here. This week the garden gained 42 blooms.
          </p>
          <button className="mt-6 flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm text-cream hover:scale-[1.02]">
            <Flower2 className="h-4 w-4" /> Plant a seed
          </button>
        </div>
        <div className="relative grid h-64 grid-cols-6 gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/40 backdrop-blur transition-all hover:bg-white/70"
              style={{
                gridRow: `span ${1 + (i % 3)}`,
                background:
                  i % 4 === 0
                    ? "linear-gradient(180deg, oklch(0.9 0.055 55 / 0.6), oklch(0.85 0.06 300 / 0.5))"
                    : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FocusTools() {
  const tools = [
    { icon: Wind, label: "Breathing", tone: "from-blue-soft/50 to-fog" },
    { icon: BookHeart, label: "Journal", tone: "from-peach/60 to-lavender/40" },
    { icon: Brain, label: "Peace AI", tone: "from-lavender/60 to-blue-soft/40" },
    { icon: Phone, label: "Counsellor", tone: "from-moss/40 to-fog" },
    { icon: Timer, label: "Focus timer", tone: "from-ember/40 to-peach/50" },
    { icon: Moon, label: "Sleep", tone: "from-navy/50 to-lavender/40" },
    { icon: Waves, label: "Meditation", tone: "from-blue-soft/60 to-moss/40" },
    { icon: Music, label: "Sounds", tone: "from-lavender/50 to-peach/40" },
  ];
  return (
    <section>
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Focus tools</div>
        <h2 className="font-serif text-3xl text-navy">Everything, one tap away</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              className="group relative aspect-square overflow-hidden rounded-[28px] p-5 text-left transition-all hover:-translate-y-1 hover:shadow-float"
            >
              <Placeholder className="absolute inset-0" gradient={t.tone} />
              <div className="relative flex h-full flex-col justify-between">
                <Icon className="h-6 w-6 text-navy/80" />
                <div>
                  <div className="font-serif text-xl text-navy">{t.label}</div>
                  <div className="max-h-0 overflow-hidden text-xs text-navy/60 transition-all duration-500 group-hover:max-h-10">
                    open →
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function WeeklyReflection() {
  return (
    <section className="card-float group relative overflow-hidden">
      <Placeholder
        className="absolute inset-0"
        gradient="from-cream-warm via-peach/40 to-lavender/40"
      />
      <div className="relative grid gap-8 p-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <Feather className="h-6 w-6 text-navy/60" />
          <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            Weekly reflection
          </div>
          <div className="mt-1 font-serif text-3xl text-navy">Week 27</div>
        </div>
        <div>
          <p className="font-serif text-2xl leading-snug text-navy sm:text-3xl">
            "This week you were <em className="text-navy-soft">kinder to yourself</em>.
            You paused before three difficult moments. You slept a little deeper. You
            let someone in."
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["softer mornings", "steadier focus", "one honest conversation"].map((t) => (
              <span key={t} className="rounded-full bg-white/70 px-3 py-1 text-xs text-navy/70 backdrop-blur">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Emergency() {
  const items = [
    { icon: ShieldAlert, label: "SOS" },
    { icon: HeartPulse, label: "Grounding" },
    { icon: Phone, label: "Counsellor" },
    { icon: Wind, label: "Breathe" },
  ];
  return (
    <section className="rounded-[28px] border border-destructive/15 bg-gradient-to-br from-white to-peach/20 p-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-destructive/80">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            Always here
          </div>
          <div className="mt-1 font-serif text-2xl text-navy">
            If today feels heavy, we're right beside you.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.label}
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-navy shadow-soft transition hover:scale-[1.02]"
              >
                <Icon className="h-4 w-4 text-destructive" /> {it.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClosingQuote() {
  return (
    <section className="relative overflow-hidden rounded-[40px] bg-editorial p-12 text-center sm:p-20">
      <div className="absolute inset-0 bg-aurora opacity-40" />
      <Quote className="relative mx-auto h-8 w-8 text-cream/60" />
      <p className="relative mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight text-cream sm:text-6xl">
        "You do not have to be <em>okay</em> to be worthy of a soft, beautiful day."
      </p>
      <div className="relative mt-8 text-xs uppercase tracking-[0.3em] text-cream/60">
        PeaceCode · your gentle companion
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PAGE                                                                 */
/* ------------------------------------------------------------------ */

function Dashboard() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-aurora opacity-60" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40">
        <div className="animate-float-slow absolute left-[10%] top-[15%] h-72 w-72 rounded-full bg-peach/30 blur-3xl" />
        <div className="animate-float-slow absolute right-[15%] top-[40%] h-96 w-96 rounded-full bg-lavender/40 blur-3xl [animation-delay:3s]" />
        <div className="animate-float-slow absolute left-[40%] bottom-[10%] h-80 w-80 rounded-full bg-blue-soft/30 blur-3xl [animation-delay:6s]" />
      </div>

      <Sidebar />

      <main className="ml-24 mr-6 max-w-[1400px] pb-24 pl-4 pr-2 pt-2 lg:mx-auto lg:pl-32 lg:pr-10">
        <Header />

        <div className="flex flex-col gap-14">
          <HeroSection />

          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <EnergyOrb />
            <AIConversation />
          </div>

          <FeaturedExperience />

          <JourneyMilestones />

          <FocusSpace />

          <EmotionalWeather />

          <Community />

          <KarmaGarden />

          <FocusTools />

          <WeeklyReflection />

          <Emergency />

          <ClosingQuote />

          <footer className="pt-6 text-center text-xs text-muted-foreground">
            <Coffee className="mx-auto mb-2 h-4 w-4" />
            Made with quiet care · take a breath before you close this tab
            <Headphones className="mx-auto mt-2 h-4 w-4 opacity-0" />
          </footer>
        </div>
      </main>
    </div>
  );
}
