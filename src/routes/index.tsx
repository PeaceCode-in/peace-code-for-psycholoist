import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home,
  Compass,
  BookOpen,
  Moon,
  Settings,
  HelpCircle,
  Bell,
  Play,
  Pause,
  Edit3,
  Clock,
  Send,
  Sparkles,
  Heart,
  Flame,
  Trophy,
  Users,
  Feather,
  Wind,
  BookHeart,
  Search,
  Plus,
  ChevronRight,
  Music,
  ArrowUpRight,
} from "lucide-react";
import logo from "@/assets/peacecode-logo.png";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const days = [
  { n: 7, d: "Mon" },
  { n: 8, d: "Tue" },
  { n: 9, d: "Wed" },
  { n: 10, d: "Thu" },
  { n: 11, d: "Fri" },
  { n: 12, d: "Sat" },
  { n: 13, d: "Sun" },
];

const navMain = [
  { icon: Home, label: "Today", active: true },
  { icon: Compass, label: "Explore" },
  { icon: BookOpen, label: "Sessions" },
  { icon: Moon, label: "Sleep" },
  { icon: Users, label: "Circle" },
  { icon: BookHeart, label: "Journal" },
  { icon: Trophy, label: "Milestones" },
];

const activities = [
  { title: "Morning breath", subtitle: "a soft beginning", minutes: 12, time: "07:31" },
  { title: "Slow walk", subtitle: "notice five things", minutes: 22, time: "09:14" },
  { title: "Study, gently", subtitle: "one pomodoro", minutes: 25, time: "11:05" },
];

const focusTools = [
  { label: "Breathe", icon: Wind, hint: "4·4·4·4" },
  { label: "Sound", icon: Music, hint: "forest rain" },
  { label: "Timer", icon: Clock, hint: "25 min" },
  { label: "Write", icon: Feather, hint: "one line" },
];

const journey = [
  { day: 1, label: "Seed", done: true },
  { day: 7, label: "Sprout", done: true },
  { day: 14, label: "Bloom", done: true, current: true },
  { day: 21, label: "Grow" },
  { day: 30, label: "Flourish" },
];

const posts = [
  { name: "someone kind", text: "grateful my roommate made chai without asking today.", likes: 24 },
  { name: "a quiet friend", text: "finished a whole week of morning stillness. it's working.", likes: 41 },
  { name: "anon", text: "called mom instead of scrolling. small, but mine.", likes: 58 },
];

function Mark({ className = "w-5 h-5", opacity = 1 }: { className?: string; opacity?: number }) {
  return <img src={logo} alt="PeaceCode" className={className} style={{ opacity }} />;
}

function Dashboard() {
  const [dark, setDark] = useState(false);
  const [day, setDay] = useState(9);
  const [breathing, setBreathing] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [likes, setLikes] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      className={`min-h-screen w-full font-sans transition-colors ${dark ? "dark" : ""}`}
      style={{
        background: dark ? "#1a1815" : "#f5f0e8",
        color: dark ? "#e8e2d5" : "#2a2724",
      }}
    >
      <div className="grid grid-cols-[220px_1fr_340px] h-screen">
        {/* ============ SIDEBAR ============ */}
        <aside
          className="flex flex-col px-5 py-7 border-r"
          style={{ borderColor: dark ? "#2a2724" : "#e8dfd0", background: dark ? "#1a1815" : "#f0e9dc" }}
        >
          <div className="flex items-center gap-2.5 mb-12">
            <Mark className="w-8 h-8" />
            <div>
              <div className="font-serif text-[18px] leading-none tracking-tight">PeaceCode</div>
              <div className="text-[9px] tracking-[0.25em] uppercase mt-1 opacity-50">a soft place</div>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5">
            {navMain.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="group flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] transition-all"
                  style={
                    item.active
                      ? { background: dark ? "#2a2724" : "#e8dfd0", color: dark ? "#e8e2d5" : "#2a2724" }
                      : { color: dark ? "#8a8378" : "#7a7267" }
                  }
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-normal tracking-wide">{item.label}</span>
                  {item.active && <span className="ml-auto w-1 h-1 rounded-full" style={{ background: "#a89380" }} />}
                </button>
              );
            })}
          </nav>

          {/* profile */}
          <div
            className="mt-8 rounded-3xl p-5"
            style={{ background: dark ? "#221f1c" : "#faf6ee", border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "#d9c4a8" }}
              >
                <Mark className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] opacity-50">good morning,</div>
                <div className="font-serif text-[15px] leading-tight">Keya</div>
              </div>
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px]"
                style={{ background: dark ? "#2a2724" : "#efe6d5", color: "#a67c52" }}
              >
                <Flame className="w-2.5 h-2.5" strokeWidth={1.5} /> 12
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="font-serif text-3xl leading-none">04</span>
              <span className="text-[10px] tracking-wider uppercase opacity-50">your level</span>
            </div>
            <div className="relative h-[3px] rounded-full" style={{ background: dark ? "#2a2724" : "#ebe2d1" }}>
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "72%", background: "#a89380" }} />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-0.5 pt-6 text-[12px]" style={{ color: dark ? "#8a8378" : "#8a8378" }}>
            <button className="flex items-center gap-3 px-3.5 py-2 rounded-full hover:opacity-100 opacity-70">
              <Settings className="w-4 h-4" strokeWidth={1.5} /> Settings
            </button>
            <button className="flex items-center gap-3 px-3.5 py-2 rounded-full opacity-70">
              <HelpCircle className="w-4 h-4" strokeWidth={1.5} /> Help
            </button>
            <button
              onClick={() => setDark(!dark)}
              className="flex items-center justify-between px-3.5 py-2 rounded-full opacity-70"
            >
              <span className="flex items-center gap-3">
                <Moon className="w-4 h-4" strokeWidth={1.5} /> Night mode
              </span>
              <span
                className="w-8 h-4 rounded-full relative transition"
                style={{ background: dark ? "#a89380" : "#e0d5c0" }}
              >
                <span
                  className="absolute top-0.5 w-3 h-3 rounded-full transition"
                  style={{ background: "#faf6ee", left: dark ? "18px" : "2px" }}
                />
              </span>
            </button>
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main className="px-12 py-10 overflow-y-auto">
          <header className="flex items-start justify-between mb-10">
            <div>
              <div
                className="text-[10px] tracking-[0.3em] uppercase mb-3 opacity-60"
                style={{ color: "#a89380" }}
              >
                Wednesday · Eleven July
              </div>
              <h1 className="font-serif text-[52px] leading-[1.05] tracking-tight max-w-xl" style={{ letterSpacing: "-0.02em" }}>
                <em className="italic font-light" style={{ color: "#a67c52" }}>Softly,</em>
                <br />
                you begin again.
              </h1>
              <p className="text-[13px] mt-4 opacity-60 max-w-md leading-relaxed">
                A slow look at how your mind and moments are moving today. No pressure — just presence.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2 rounded-full px-4 py-2"
                style={{ background: dark ? "#221f1c" : "#faf6ee", border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}` }}
              >
                <Search className="w-3.5 h-3.5 opacity-40" />
                <input
                  placeholder="search stillness…"
                  className="bg-transparent outline-none text-[12px] w-32 placeholder:opacity-40"
                />
              </div>
              <button
                className="relative w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: dark ? "#221f1c" : "#faf6ee", border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}` }}
              >
                <Bell className="w-4 h-4 opacity-60" strokeWidth={1.5} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full" style={{ background: "#c17b6f" }} />
              </button>
            </div>
          </header>

          {/* Days */}
          <div className="flex items-center gap-2 mb-10">
            {days.map((dd) => {
              const active = day === dd.n;
              return (
                <button
                  key={dd.n}
                  onClick={() => setDay(dd.n)}
                  className="flex flex-col items-center justify-center w-12 h-16 rounded-full transition-all text-[10px]"
                  style={
                    active
                      ? { background: "#2a2724", color: "#faf6ee" }
                      : { background: "transparent", color: dark ? "#8a8378" : "#8a8378" }
                  }
                >
                  <span className="font-serif text-[18px] leading-none mb-1">{dd.n}</span>
                  <span className="tracking-widest uppercase opacity-70">{dd.d.slice(0, 2)}</span>
                </button>
              );
            })}
            <div className="flex-1 h-px ml-4" style={{ background: dark ? "#2a2724" : "#ebe2d1" }} />
          </div>

          {/* Mood + hero */}
          <section
            className="rounded-[32px] p-8 mb-6 relative overflow-hidden"
            style={{ background: dark ? "#221f1c" : "#faf6ee", border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}` }}
          >
            <Mark className="absolute -right-8 -bottom-8 w-56 h-56" opacity={dark ? 0.05 : 0.06} />
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-[10px] tracking-[0.28em] uppercase opacity-50 mb-2">how are you, really</div>
                <h3 className="font-serif text-[28px] leading-tight">Today feels <em className="italic" style={{ color: "#a67c52" }}>tender</em></h3>
              </div>
              <button className="text-[11px] tracking-wider uppercase opacity-60 hover:opacity-100 flex items-center gap-1">
                log mood <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-10 mb-6">
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-serif text-[72px] leading-none tracking-tight">90</span>
                  <span className="font-serif italic text-2xl opacity-50">%</span>
                </div>
                <p className="text-[13px] opacity-60">a soft, quiet kind of happy.</p>
              </div>
              <div className="flex flex-col gap-2.5 text-[11px]">
                {[
                  { c: "#8ba282", l: "at ease", v: 70 },
                  { c: "#c17b6f", l: "tense", v: 15 },
                  { c: "#a89380", l: "wistful", v: 15 },
                ].map((m) => (
                  <div key={m.l} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.c }} />
                    <span className="opacity-60">{m.l}</span>
                    <span className="font-serif italic opacity-40">{m.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-0.5 h-1 rounded-full overflow-hidden" style={{ background: dark ? "#2a2724" : "#ebe2d1" }}>
              <div style={{ width: "70%", background: "#8ba282" }} />
              <div style={{ width: "15%", background: "#c17b6f" }} />
              <div style={{ width: "15%", background: "#a89380" }} />
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6 mt-6 border-t" style={{ borderColor: dark ? "#2a2724" : "#ebe2d1" }}>
              {[
                { v: "87", u: "min", l: "in stillness" },
                { v: "23", u: "", l: "sessions" },
                { v: "34", u: "min", l: "average dwell" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-[10px] tracking-[0.25em] uppercase opacity-50 mb-2">{s.l}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif text-3xl leading-none">{s.v}</span>
                    <span className="text-[11px] opacity-50">{s.u}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Focus Tools */}
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-serif text-[22px] tracking-tight">A quiet toolkit</h3>
            <span className="text-[10px] tracking-[0.25em] uppercase opacity-50">tap to begin</span>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {focusTools.map((t) => {
              const I = t.icon;
              return (
                <button
                  key={t.label}
                  className="group relative overflow-hidden rounded-[24px] aspect-square p-5 flex flex-col justify-between text-left transition"
                  style={{
                    background: dark ? "#221f1c" : "#faf6ee",
                    border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <I className="w-5 h-5 opacity-70" strokeWidth={1.3} />
                    <Mark className="w-4 h-4" opacity={0.25} />
                  </div>
                  <div>
                    <div className="font-serif text-[22px] leading-none tracking-tight">{t.label}</div>
                    <div className="text-[10px] tracking-[0.2em] uppercase opacity-50 mt-2">{t.hint}</div>
                  </div>
                  <div
                    className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition"
                    style={{ background: "#e8dfd0" }}
                  />
                </button>
              );
            })}
          </div>

          {/* Journey */}
          <section
            className="rounded-[32px] p-8 mb-8 relative overflow-hidden"
            style={{ background: dark ? "#221f1c" : "#ede4d1", border: `1px solid ${dark ? "#2a2724" : "#ddd0b8"}` }}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-[10px] tracking-[0.28em] uppercase opacity-50 mb-2">the slow journey</div>
                <h3 className="font-serif text-[26px] leading-tight max-w-sm">
                  Fourteen days in — <em className="italic" style={{ color: "#a67c52" }}>halfway to bloom.</em>
                </h3>
              </div>
              <Mark className="w-10 h-10" opacity={0.4} />
            </div>
            <div className="relative flex items-center justify-between">
              <div className="absolute left-4 right-4 top-4 h-px" style={{ background: dark ? "#2a2724" : "#d0c2a5" }} />
              <div className="absolute left-4 top-4 h-px" style={{ width: "48%", background: "#a67c52" }} />
              {journey.map((m) => (
                <div key={m.day} className="relative flex flex-col items-center gap-3 z-10">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-[12px] transition"
                    style={
                      m.current
                        ? { background: "#2a2724", color: "#faf6ee", transform: "scale(1.2)" }
                        : m.done
                          ? { background: "#a67c52", color: "#faf6ee" }
                          : {
                              background: dark ? "#1a1815" : "#faf6ee",
                              color: dark ? "#8a8378" : "#a89380",
                              border: `1px solid ${dark ? "#2a2724" : "#d0c2a5"}`,
                            }
                    }
                  >
                    {m.day}
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase opacity-60">{m.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Activities */}
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-serif text-[22px] tracking-tight">Small things, today</h3>
            <span className="text-[10px] tracking-[0.25em] uppercase opacity-50">1h · 23m</span>
          </div>
          <div className="space-y-2 mb-10">
            {activities.map((a, i) => (
              <div
                key={a.title}
                className="group flex items-center gap-5 py-4 px-5 rounded-2xl transition cursor-pointer"
                style={{
                  background: dark ? "#221f1c" : "#faf6ee",
                  border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}`,
                }}
              >
                <div className="font-serif italic text-[13px] opacity-40 w-6">0{i + 1}</div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: dark ? "#2a2724" : "#ede4d1" }}
                >
                  <Mark className="w-5 h-5" opacity={0.7} />
                </div>
                <div className="flex-1">
                  <div className="font-serif text-[17px] leading-tight">{a.title}</div>
                  <div className="text-[11px] italic opacity-50 mt-0.5">{a.subtitle}</div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-[18px] leading-none">{a.minutes}<span className="text-[10px] opacity-50 ml-1">min</span></div>
                  <div className="text-[10px] tracking-widest opacity-40 mt-1">{a.time}</div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-70 group-hover:translate-x-1 transition" />
              </div>
            ))}
          </div>

          {/* Gratitude */}
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-serif text-[22px] tracking-tight">A quiet circle</h3>
            <button className="text-[11px] tracking-wider uppercase opacity-60 hover:opacity-100 flex items-center gap-1">
              <Plus className="w-3 h-3" /> share
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {posts.map((p, i) => (
              <div
                key={i}
                className="group rounded-3xl p-5 transition cursor-pointer relative overflow-hidden"
                style={{
                  background: dark ? "#221f1c" : "#faf6ee",
                  border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}`,
                }}
              >
                <Mark className="absolute -right-3 -top-3 w-14 h-14" opacity={0.08} />
                <div className="text-[10px] tracking-[0.25em] uppercase opacity-50 mb-3">{p.name}</div>
                <p className="font-serif italic text-[15px] leading-snug mb-5 opacity-90">"{p.text}"</p>
                <button
                  onClick={() => setLikes({ ...likes, [i]: (likes[i] ?? 0) + 1 })}
                  className="flex items-center gap-1.5 text-[11px] opacity-60 hover:opacity-100"
                  style={{ color: "#c17b6f" }}
                >
                  <Heart className="w-3 h-3" strokeWidth={1.5} />
                  {p.likes + (likes[i] ?? 0)}
                </button>
              </div>
            ))}
          </div>

          {/* Emergency */}
          <div
            className="rounded-3xl p-6 flex items-center gap-5"
            style={{ background: dark ? "#2a201d" : "#efdfd5", border: `1px solid ${dark ? "#3a2a25" : "#e0c9bc"}` }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#c17b6f" }}>
              <Mark className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-serif text-[17px] leading-tight">Not okay right now?</div>
              <div className="text-[12px] opacity-60 mt-0.5 italic">a trained listener is one soft tap away — always, and in confidence.</div>
            </div>
            <button
              className="text-[11px] tracking-[0.2em] uppercase px-5 py-2.5 rounded-full transition"
              style={{ background: "#2a2724", color: "#faf6ee" }}
            >
              talk now
            </button>
          </div>

          <p className="text-center font-serif italic text-[13px] opacity-40 mt-10 mb-4">
            peace begins with a single breath. — PeaceCode
          </p>
        </main>

        {/* ============ RIGHT PANEL ============ */}
        <aside
          className="px-7 py-8 border-l overflow-y-auto"
          style={{ borderColor: dark ? "#2a2724" : "#e8dfd0", background: dark ? "#1a1815" : "#f0e9dc" }}
        >
          {/* Featured */}
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.28em] uppercase opacity-50 mb-3">a featured stillness</div>
            <div
              className="relative rounded-[28px] overflow-hidden aspect-[4/5] p-6 flex flex-col justify-between cursor-pointer group"
              style={{ background: "linear-gradient(160deg, #d9c4a8 0%, #c9a98a 50%, #a67c52 100%)" }}
            >
              <Mark className="absolute -right-6 -bottom-6 w-56 h-56 group-hover:scale-110 transition duration-700" opacity={0.15} />
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "#f5eee0" }}>
                  a walk with breath
                </div>
                <div className="font-serif text-[32px] leading-[1.05]" style={{ color: "#2a1f14" }}>
                  Meditation<br />
                  <em className="italic font-light">&amp; movement</em>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-[11px]" style={{ color: "#2a1f14" }}>
                  <div className="font-serif italic text-lg">24 min</div>
                  <div className="opacity-60 tracking-widest uppercase text-[9px]">gentle · guided</div>
                </div>
                <button
                  className="w-12 h-12 rounded-full flex items-center justify-center transition hover:scale-105"
                  style={{ background: "#2a2724" }}
                >
                  <Play className="w-4 h-4 ml-0.5" style={{ color: "#faf6ee" }} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* Breathing */}
          <div
            className="rounded-[24px] p-6 mb-6"
            style={{ background: dark ? "#221f1c" : "#faf6ee", border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] tracking-[0.28em] uppercase opacity-50">box breathing</div>
              <button
                onClick={() => setBreathing(!breathing)}
                className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full transition"
                style={{ background: breathing ? "#c17b6f" : "#2a2724", color: "#faf6ee" }}
              >
                {breathing ? "pause" : "begin"}
              </button>
            </div>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #d9c4a8, #a89380)",
                    animation: breathing ? "breathe-orb 8s ease-in-out infinite" : "none",
                  }}
                />
                <Mark className="relative w-10 h-10" opacity={0.85} />
              </div>
            </div>
            <div className="font-serif italic text-center text-[13px] opacity-60">
              {breathing ? "in… hold… out… hold…" : "four seconds each side"}
            </div>
            <style>{`@keyframes breathe-orb { 0%,100% { transform: scale(0.82); opacity: 0.85 } 50% { transform: scale(1.1); opacity: 1 } }`}</style>
          </div>

          {/* Timer */}
          <div
            className="rounded-[24px] p-6 mb-6 relative overflow-hidden"
            style={{ background: "#2a2724", color: "#faf6ee" }}
          >
            <Mark className="absolute -right-4 -bottom-4 w-32 h-32" opacity={0.08} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] tracking-[0.28em] uppercase opacity-50">a slow hour</div>
                <div className="text-[10px] italic opacity-60">pomodoro</div>
              </div>
              <div className="font-serif text-[64px] leading-none tracking-tight text-center mb-5">
                {mm}<span className="opacity-40">:</span>{ss}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRunning(!running)}
                  className="flex-1 rounded-full py-2.5 text-[11px] tracking-[0.25em] uppercase flex items-center justify-center gap-2 transition"
                  style={{ background: "#faf6ee", color: "#2a2724" }}
                >
                  {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {running ? "pause" : "begin"}
                </button>
                <button
                  onClick={() => {
                    setRunning(false);
                    setSeconds(25 * 60);
                  }}
                  className="px-5 rounded-full text-[11px] tracking-[0.25em] uppercase opacity-60 hover:opacity-100"
                  style={{ border: "1px solid rgba(250,246,238,0.15)" }}
                >
                  reset
                </button>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div
            className="rounded-[24px] p-5 mb-6"
            style={{ background: dark ? "#221f1c" : "#faf6ee", border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#ede4d1" }}>
                  <Mark className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-serif text-[15px] leading-tight">Peace</div>
                  <div className="text-[10px] italic opacity-50">a gentle listener · here</div>
                </div>
              </div>
              <button className="w-7 h-7 rounded-full flex items-center justify-center opacity-50" style={{ background: dark ? "#2a2724" : "#ede4d1" }}>
                <Edit3 className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex justify-end">
                <div
                  className="max-w-[85%] rounded-2xl rounded-tr-md text-[12px] px-3.5 py-2.5"
                  style={{ background: "#2a2724", color: "#faf6ee" }}
                >
                  I've felt tight lately. Sleep is uneven.
                </div>
              </div>
              <div className="flex justify-start">
                <div
                  className="max-w-[85%] rounded-2xl rounded-tl-md text-[12px] px-3.5 py-2.5 font-serif italic"
                  style={{ background: dark ? "#2a2724" : "#ede4d1" }}
                >
                  I hear you. When did the tightness first arrive?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-full px-3 py-2 flex gap-1" style={{ background: dark ? "#2a2724" : "#ede4d1" }}>
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: "#a89380" }} />
                  <span className="w-1 h-1 rounded-full animate-pulse [animation-delay:0.15s]" style={{ background: "#a89380" }} />
                  <span className="w-1 h-1 rounded-full animate-pulse [animation-delay:0.3s]" style={{ background: "#a89380" }} />
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5"
              style={{ background: dark ? "#1a1815" : "#f0e9dc" }}
            >
              <input
                placeholder="say something soft…"
                className="flex-1 bg-transparent outline-none text-[12px] placeholder:opacity-40 font-serif italic"
              />
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "#2a2724" }}
              >
                <Send className="w-3 h-3" style={{ color: "#faf6ee" }} />
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div
            className="rounded-[24px] p-5"
            style={{ background: dark ? "#221f1c" : "#faf6ee", border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] tracking-[0.28em] uppercase opacity-50">small milestones</div>
              <span className="font-serif italic text-[13px] opacity-60">seven of twenty</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => {
                const unlocked = i < 4;
                return (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl flex items-center justify-center transition hover:scale-105"
                    style={{
                      background: unlocked ? "#ede4d1" : dark ? "#1a1815" : "#f0e9dc",
                      border: `1px solid ${dark ? "#2a2724" : "#ebe2d1"}`,
                    }}
                  >
                    <Mark className="w-6 h-6" opacity={unlocked ? 0.85 : 0.2} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase opacity-40 justify-center">
            <Sparkles className="w-3 h-3" /> now playing · forest rain
          </div>
        </aside>
      </div>
    </div>
  );
}
