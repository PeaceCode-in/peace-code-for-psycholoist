import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Flame, Play, Pause, Heart, ArrowUpRight, ArrowRight,
  Bell, Search, Sun, Moon, Menu, X, Wind, Timer, BookOpen,
  Users, MessageCircle, Brain, HeartHandshake, Compass,
  Headphones, Star, TrendingUp, Zap, Settings, ChevronRight,
} from "lucide-react";
import logo from "@/assets/peacecode-logo.png";

export const Route = createFileRoute("/")({ component: Dashboard });

/* ---------------- helpers ---------------- */
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/* ---------------- Sidebar ---------------- */
const NAV = [
  { group: "Today", items: [
    { icon: Compass, label: "Overview", active: true },
    { icon: MessageCircle, label: "Peace Bot" },
    { icon: HeartHandshake, label: "Counseling" },
  ]},
  { group: "Practice", items: [
    { icon: Wind, label: "Breathe" },
    { icon: Timer, label: "Focus" },
    { icon: Brain, label: "Mind Gym" },
    { icon: BookOpen, label: "Journal" },
  ]},
  { group: "You", items: [
    { icon: TrendingUp, label: "Progress" },
    { icon: Users, label: "Circle" },
  ]},
];

function Sidebar({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <aside className="hidden lg:flex fixed left-4 top-4 bottom-4 z-40 w-[72px] flex-col items-center rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[var(--shadow-cloud)] py-5">
      <div className="w-11 h-11 rounded-2xl grad-lavender flex items-center justify-center shadow-sm">
        <img src={logo} alt="PeaceCode" className="w-7 h-7 object-contain" />
      </div>

      <nav className="flex-1 w-full mt-6 flex flex-col items-center gap-1 overflow-y-auto scrollbar-none">
        {NAV.map((g) => (
          <div key={g.group} className="w-full flex flex-col items-center gap-1 py-2">
            <div className="text-[9px] tracking-[0.18em] uppercase text-[color:var(--color-fog)] font-medium mb-1">{g.group[0]}</div>
            {g.items.map((it) => {
              const Icon = it.icon;
              return (
                <button
                  key={it.label}
                  title={it.label}
                  className={`group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 ${
                    it.active
                      ? "bg-[color:var(--color-navy)] text-white shadow-md"
                      : "text-[color:var(--color-slate)] hover:bg-[color:var(--color-mist)] hover:text-[color:var(--color-navy)]"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[color:var(--color-navy)] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
                    {it.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="w-full flex flex-col items-center gap-2 pt-3 border-t border-[color:var(--color-border)]">
        <button
          onClick={() => setDark(!dark)}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[color:var(--color-slate)] hover:bg-[color:var(--color-mist)] transition"
          title={dark ? "Light" : "Dark"}
        >
          {dark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
        </button>
        <button className="w-11 h-11 rounded-2xl flex items-center justify-center text-[color:var(--color-slate)] hover:bg-[color:var(--color-mist)] transition" title="Settings">
          <Settings size={18} strokeWidth={1.75} />
        </button>
        <div className="w-9 h-9 rounded-full grad-sky flex items-center justify-center text-[color:var(--color-navy)] text-xs font-semibold mt-1">A</div>
      </div>
    </aside>
  );
}

/* ---------------- Mobile Header + Drawer ---------------- */
function MobileHeader({ onMenu, dark, setDark }: { onMenu: () => void; dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/70 backdrop-blur-xl border-b border-white/60">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl grad-lavender flex items-center justify-center">
          <img src={logo} alt="" className="w-6 h-6 object-contain" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-[color:var(--color-navy)]">PeaceCode</div>
          <div className="text-[10px] text-[color:var(--color-steel)] flex items-center gap-1"><Flame size={10} /> 12-day streak</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-xl flex items-center justify-center text-[color:var(--color-slate)] hover:bg-[color:var(--color-mist)]">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[color:var(--color-slate)] hover:bg-[color:var(--color-mist)]">
          <Bell size={16} />
        </button>
        <button onClick={onMenu} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[color:var(--color-navy)] text-white">
          <Menu size={16} />
        </button>
      </div>
    </header>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-[color:var(--color-navy)]/40 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm bg-white p-6 shadow-2xl animate-rise overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="font-display font-semibold text-lg text-[color:var(--color-navy)]">Navigate</div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-[color:var(--color-mist)] flex items-center justify-center"><X size={16} /></button>
        </div>
        {NAV.map((g) => (
          <div key={g.group} className="mb-5">
            <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-fog)] mb-2">{g.group}</div>
            <div className="flex flex-col gap-1">
              {g.items.map((it) => {
                const Icon = it.icon;
                return (
                  <button key={it.label} className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm ${it.active ? "bg-[color:var(--color-navy)] text-white" : "text-[color:var(--color-slate)] hover:bg-[color:var(--color-mist)]"}`}>
                    <Icon size={18} strokeWidth={1.75} />
                    <span>{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- HERO tile: Mood check-in ---------------- */
const MOODS = [
  { emoji: "😌", label: "Calm", grad: "grad-mint" },
  { emoji: "🌤", label: "Okay", grad: "grad-sky" },
  { emoji: "💫", label: "Focused", grad: "grad-focus" },
  { emoji: "😔", label: "Low", grad: "grad-lavender" },
  { emoji: "🔥", label: "Stressed", grad: "grad-sunset" },
];

function MoodHero() {
  const [mood, setMood] = useState<number | null>(null);
  return (
    <div className="tile relative overflow-hidden card-soft p-6 md:p-8 lg:col-span-8 lg:row-span-2">
      {/* soft cloud gradient BG */}
      <div className="absolute inset-0 -z-10 opacity-90" style={{ background: "radial-gradient(600px 400px at 90% 0%, #E8E2FF 0%, transparent 55%), radial-gradient(500px 400px at 0% 100%, #FCE8F1 0%, transparent 55%), linear-gradient(180deg, #FFFFFF, #F7FAFF)" }} />
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full grad-lavender opacity-40 blur-2xl animate-float-slow" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-peace)] animate-pulse" />
          <span className="text-[11px] tracking-[0.24em] uppercase text-[color:var(--color-steel)] font-medium">Check in</span>
        </div>
        <div className="chip">
          <Flame size={12} className="text-[color:var(--color-peace)]" />
          <span>12 day streak</span>
        </div>
      </div>

      <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[color:var(--color-navy)] leading-[1.05]">
        Hey Aarav — <br className="hidden md:inline" />
        <span className="text-[color:var(--color-steel)]">how are you, really?</span>
      </h1>

      <div className="mt-8 flex flex-wrap gap-2 md:gap-3">
        {MOODS.map((m, i) => (
          <button
            key={m.label}
            onClick={() => setMood(i)}
            className={`group flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-150 ${
              mood === i
                ? "bg-[color:var(--color-navy)] text-white border-[color:var(--color-navy)] scale-105"
                : "bg-white/70 border-[color:var(--color-border)] text-[color:var(--color-slate)] hover:border-[color:var(--color-powder)] hover:-translate-y-0.5"
            }`}
          >
            <span className="text-xl">{m.emoji}</span>
            <span className="text-sm font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row md:items-center gap-3">
        <button className="group flex items-center justify-center gap-2 bg-[color:var(--color-navy)] hover:bg-[color:var(--color-peace)] text-white px-6 py-3.5 rounded-2xl text-sm font-medium transition-all duration-150 shadow-lg shadow-[color:var(--color-peace)]/20">
          Log today
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        <button className="flex items-center justify-center gap-2 bg-white border border-[color:var(--color-border)] hover:border-[color:var(--color-powder)] text-[color:var(--color-slate)] px-6 py-3.5 rounded-2xl text-sm font-medium transition-all duration-150">
          Talk to Peace Bot
          <MessageCircle size={16} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Peace Score tile ---------------- */
function PeaceScore() {
  const score = 78;
  const circumference = 2 * Math.PI * 44;
  const dash = (score / 100) * circumference;
  return (
    <div className="tile card-soft p-5 md:p-6 lg:col-span-4 lg:row-span-1 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "linear-gradient(135deg, #EAF3FF 0%, #E8E2FF 100%)" }} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-steel)] font-medium">Peace Score</div>
          <div className="text-xs text-[color:var(--color-slate)] mt-1">This week's average</div>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-[color:var(--color-peace)] bg-white/70 px-2 py-1 rounded-full">
          <TrendingUp size={12} />+6
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#DCE3EF" strokeWidth="5" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#pg)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${dash} ${circumference}`} />
            <defs>
              <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7FA8E6" />
                <stop offset="100%" stopColor="#D5C9F7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-3xl font-semibold text-[color:var(--color-navy)]">{score}</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-steel)]">/100</div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <StatLine label="Mood" val={82} c="#7FA8E6" />
          <StatLine label="Sleep" val={71} c="#D5C9F7" />
          <StatLine label="Focus" val={68} c="#F8CADA" />
        </div>
      </div>
    </div>
  );
}
function StatLine({ label, val, c }: { label: string; val: number; c: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[color:var(--color-slate)]">{label}</span>
        <span className="font-medium text-[color:var(--color-navy)] tabular-nums">{val}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${val}%`, background: c }} />
      </div>
    </div>
  );
}

/* ---------------- Continue Session (Featured) ---------------- */
function ContinueSession() {
  return (
    <div className="tile relative card-soft overflow-hidden lg:col-span-4 lg:row-span-1 p-0 min-h-[220px] group cursor-pointer">
      <div className="absolute inset-0 grad-sky" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(29, 42, 68, 0.55) 100%)" }} />
      <div className="absolute top-4 left-4 chip bg-white/85"><Play size={11} /> Continue</div>
      <div className="absolute top-4 right-4 chip bg-white/85">4:12 left</div>
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="text-[11px] tracking-[0.22em] uppercase opacity-80 mb-1">Guided · Meditation</div>
        <h3 className="font-display text-2xl font-semibold leading-tight">Cloud-mind breathing</h3>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs opacity-80">Session 3 of 7</div>
          <button className="w-11 h-11 rounded-full bg-white text-[color:var(--color-navy)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Play size={16} className="translate-x-0.5" />
          </button>
        </div>
      </div>
      {/* floating cloud shapes */}
      <div className="absolute top-8 right-10 w-24 h-14 rounded-full bg-white/60 blur-xl animate-drift" />
      <div className="absolute top-16 left-16 w-16 h-10 rounded-full bg-white/50 blur-lg animate-float-slow" />
    </div>
  );
}

/* ---------------- Weekly Streak ---------------- */
function WeekStreak() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const filled = [true, true, true, false, true, true, false];
  const today = 5;
  return (
    <div className="tile card-soft p-5 md:p-6 lg:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-steel)] font-medium">This week</div>
          <div className="mt-1 font-display text-xl font-semibold text-[color:var(--color-navy)]">5 of 7 days</div>
        </div>
        <div className="w-10 h-10 rounded-2xl grad-sunset flex items-center justify-center">
          <Flame size={16} className="text-[color:var(--color-navy)]" />
        </div>
      </div>
      <div className="flex justify-between gap-1.5">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={`w-full h-14 rounded-xl transition-all ${
              i === today
                ? "grad-lavender ring-2 ring-[color:var(--color-peace)] ring-offset-2 ring-offset-white"
                : filled[i] ? "bg-[color:var(--color-lavender)]" : "bg-[color:var(--color-mist)] border border-dashed border-[color:var(--color-border)]"
            }`} />
            <div className={`text-[10px] font-medium ${i === today ? "text-[color:var(--color-peace)]" : "text-[color:var(--color-fog)]"}`}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Quick Tools ---------------- */
const TOOLS = [
  { icon: Wind, label: "Breathe", sub: "4 min", grad: "grad-mint" },
  { icon: Timer, label: "Focus", sub: "25 min", grad: "grad-focus" },
  { icon: Headphones, label: "Sounds", sub: "8 tracks", grad: "grad-sky" },
  { icon: BookOpen, label: "Journal", sub: "Prompt ready", grad: "grad-lavender" },
];
function QuickTools() {
  return (
    <div className="tile card-soft p-5 md:p-6 lg:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-steel)] font-medium">Quick tools</div>
        <button className="text-xs text-[color:var(--color-peace)] font-medium flex items-center gap-1 hover:gap-2 transition-all">See all <ChevronRight size={12} /></button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.label} className={`group ${t.grad} rounded-2xl p-3.5 text-left hover:-translate-y-0.5 transition-transform duration-150`}>
              <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center mb-3">
                <Icon size={16} strokeWidth={1.75} className="text-[color:var(--color-navy)]" />
              </div>
              <div className="text-sm font-semibold text-[color:var(--color-navy)]">{t.label}</div>
              <div className="text-[11px] text-[color:var(--color-slate)] mt-0.5">{t.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Peace Bot preview ---------------- */
function PeaceBotCard() {
  const [msg, setMsg] = useState("");
  return (
    <div className="tile card-soft p-5 md:p-6 lg:col-span-5 relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full grad-focus opacity-40 blur-2xl" />
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl grad-lavender flex items-center justify-center">
              <Sparkles size={14} className="text-[color:var(--color-navy)]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4ADE80] border-2 border-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[color:var(--color-navy)]">Peace Bot</div>
            <div className="text-[10px] text-[color:var(--color-steel)]">Here for you</div>
          </div>
        </div>
        <button className="text-xs text-[color:var(--color-peace)] font-medium">Open chat</button>
      </div>

      <div className="space-y-2.5 mb-4 relative">
        <div className="bg-[color:var(--color-mist)] rounded-2xl rounded-tl-sm p-3 max-w-[85%] text-sm text-[color:var(--color-navy)]">
          Morning, Aarav 👋 A 3-minute grounding before class?
        </div>
        <div className="ml-auto grad-focus rounded-2xl rounded-tr-sm p-3 max-w-[75%] text-sm text-[color:var(--color-navy)]">
          Feeling a bit anxious tbh
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="chip">Vent for a minute</button>
          <button className="chip">Try box breathing</button>
          <button className="chip">I'm okay</button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-[color:var(--color-border)] rounded-2xl px-4 py-2.5 focus-within:border-[color:var(--color-powder)] transition-colors">
        <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Say anything..." className="flex-1 bg-transparent outline-none text-sm text-[color:var(--color-navy)] placeholder:text-[color:var(--color-fog)]" />
        <button className="w-8 h-8 rounded-xl bg-[color:var(--color-navy)] text-white flex items-center justify-center hover:bg-[color:var(--color-peace)] transition">
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Circle (community) ---------------- */
const POSTS = [
  { name: "anon · sem 3", text: "Passed a paper I thought I'd fail. Small win but I'll take it.", likes: 42, tag: "wins" },
  { name: "anon · sem 5", text: "Went home for the weekend. Mom made rasam. That's the post.", likes: 128, tag: "gratitude" },
  { name: "anon · sem 1", text: "Anyone else feel weirdly homesick on Sundays?", likes: 87, tag: "same" },
];
function CircleCard() {
  const [liked, setLiked] = useState<number | null>(null);
  return (
    <div className="tile card-soft p-5 md:p-6 lg:col-span-7">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-steel)] font-medium">Circle</div>
          <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" /> 24 online</span>
        </div>
        <button className="text-xs text-[color:var(--color-peace)] font-medium flex items-center gap-1 hover:gap-2 transition-all">Post anon <ChevronRight size={12} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {POSTS.map((p, i) => (
          <div key={i} className="group relative p-4 rounded-2xl bg-[color:var(--color-cloud)] border border-[color:var(--color-border)] hover:border-[color:var(--color-powder)] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-widest uppercase text-[color:var(--color-fog)]">#{p.tag}</span>
              <span className="text-[10px] text-[color:var(--color-fog)]">{p.name}</span>
            </div>
            <p className="text-sm text-[color:var(--color-navy)] leading-relaxed">{p.text}</p>
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => setLiked(i)} className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked === i ? "text-[color:var(--color-peace)]" : "text-[color:var(--color-steel)]"}`}>
                <Heart size={13} className={liked === i ? "fill-current" : ""} />
                {p.likes + (liked === i ? 1 : 0)}
              </button>
              <button className="text-xs text-[color:var(--color-fog)] hover:text-[color:var(--color-peace)]">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Breathe orb ---------------- */
function BreatheCard() {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  useEffect(() => {
    const seq: ("in" | "hold" | "out")[] = ["in", "hold", "out", "hold"];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % 4; setPhase(seq[i]); }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="tile card-soft p-6 lg:col-span-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
      <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(400px 300px at 50% 30%, #E8E2FF 0%, transparent 60%), #FFFFFF" }} />
      <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-steel)] font-medium mb-6">Box · 4·4·4·4</div>
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full grad-lavender animate-breathe animate-ring-pulse" />
        <div className="absolute inset-4 rounded-full bg-white/70 backdrop-blur-md" />
        <div className="relative font-display text-xl font-semibold text-[color:var(--color-navy)] capitalize">
          {phase === "hold" ? "hold" : phase === "in" ? "inhale" : "exhale"}
        </div>
      </div>
      <button className="mt-6 chip">
        <Play size={11} /> Start 3 min
      </button>
    </div>
  );
}

/* ---------------- Focus timer ---------------- */
function FocusCard() {
  const [run, setRun] = useState(false);
  return (
    <div className="tile card-soft p-5 md:p-6 lg:col-span-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 grad-focus opacity-60" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-steel)] font-medium">Focus session</div>
          <div className="text-xs text-[color:var(--color-slate)] mt-1">Pomodoro · study mode</div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center">
          <Zap size={16} className="text-[color:var(--color-navy)]" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-display text-6xl font-semibold text-[color:var(--color-navy)] tabular-nums">25</span>
        <span className="text-lg text-[color:var(--color-steel)]">:00</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        {[15, 25, 45].map((m) => (
          <button key={m} className={`chip ${m === 25 ? "!bg-[color:var(--color-navy)] !text-white !border-[color:var(--color-navy)]" : ""}`}>{m}m</button>
        ))}
      </div>
      <button onClick={() => setRun(!run)} className="w-full bg-[color:var(--color-navy)] hover:bg-[color:var(--color-peace)] text-white py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition">
        {run ? <Pause size={14} /> : <Play size={14} />}
        {run ? "Pause" : "Start focus"}
      </button>
    </div>
  );
}

/* ---------------- Achievements ---------------- */
const ACHIEVEMENTS = [
  { icon: "🌱", label: "Day 1" },
  { icon: "🌤", label: "Week 1" },
  { icon: "🌙", label: "Sleep 7d" },
  { icon: "🔥", label: "10 streak" },
  { icon: "💧", label: "Hydrated" },
  { icon: "⭐", label: "Focus 5h" },
];
function AchievementCard() {
  return (
    <div className="tile card-soft p-5 md:p-6 lg:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-steel)] font-medium">Milestones</div>
        <div className="chip"><Star size={11} /> Level 4</div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {ACHIEVEMENTS.map((a, i) => (
          <div key={i} className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5 ${
            i < 4 ? "grad-sunset" : "bg-[color:var(--color-mist)] opacity-60"
          }`}>
            <span className="text-2xl grayscale-0" style={{ filter: i < 4 ? "none" : "grayscale(1)" }}>{a.icon}</span>
            <span className="text-[9px] font-medium text-[color:var(--color-navy)]">{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Top strip (search / clock / notif) ---------------- */
function TopStrip() {
  const mounted = useMounted();
  const time = mounted ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  return (
    <div className="hidden lg:flex items-center justify-between mb-6">
      <div>
        <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-steel)] font-medium">Dashboard</div>
        <div className="text-xs text-[color:var(--color-slate)] mt-1 tabular-nums">
          {mounted ? new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : "—"}
          <span className="mx-2 text-[color:var(--color-fog)]">·</span>
          <span suppressHydrationWarning>{time}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-[color:var(--color-border)] rounded-2xl px-3.5 py-2 w-72">
          <Search size={14} className="text-[color:var(--color-fog)]" />
          <input placeholder="Search sessions, moods..." className="bg-transparent outline-none text-sm text-[color:var(--color-navy)] placeholder:text-[color:var(--color-fog)] flex-1" />
          <kbd className="text-[10px] text-[color:var(--color-fog)] font-mono">⌘K</kbd>
        </div>
        <button className="w-10 h-10 rounded-2xl bg-white border border-[color:var(--color-border)] flex items-center justify-center hover:border-[color:var(--color-powder)] relative">
          <Bell size={15} className="text-[color:var(--color-slate)]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[color:var(--color-peace)]" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard() {
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <div className="min-h-screen bg-canvas">
      {/* subtle grid vignette */}
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "radial-gradient(1200px 800px at 100% 0%, rgba(213, 201, 247, 0.25), transparent 55%), radial-gradient(1200px 800px at 0% 100%, rgba(175, 201, 245, 0.20), transparent 55%)" }} />

      <Sidebar dark={dark} setDark={setDark} />
      <MobileHeader onMenu={() => setMenu(true)} dark={dark} setDark={setDark} />
      <MobileDrawer open={menu} onClose={() => setMenu(false)} />

      <main className="lg:pl-[104px] px-4 md:px-6 lg:pr-6 py-5 lg:py-6 max-w-[1600px] mx-auto">
        <TopStrip />

        {/* BENTO GRID */}
        <section className="bento grid-cols-1 lg:grid-cols-12 lg:auto-rows-[minmax(180px,auto)]">
          <MoodHero />
          <PeaceScore />
          <ContinueSession />

          <WeekStreak />
          <QuickTools />
          <BreatheCard />

          <PeaceBotCard />
          <CircleCard />

          <FocusCard />
          <AchievementCard />

          {/* Nudge banner */}
          <div className="tile lg:col-span-4 card-soft p-5 md:p-6 relative overflow-hidden">
            <div className="absolute inset-0 grad-sunset opacity-80 -z-10" />
            <div className="text-[11px] tracking-[0.22em] uppercase text-[color:var(--color-navy)]/70 font-medium mb-2">Tonight</div>
            <div className="font-display text-lg font-semibold text-[color:var(--color-navy)] leading-tight">
              Wind-down at 10:30pm
            </div>
            <div className="text-xs text-[color:var(--color-slate)] mt-2">Sleep story queued: <span className="font-medium text-[color:var(--color-navy)]">"The quiet library"</span></div>
            <button className="mt-4 chip bg-white/85">
              <Bell size={11} /> Set reminder
            </button>
          </div>
        </section>

        <footer className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[color:var(--color-fog)] px-1 pb-4">
          <div>PeaceCode · your safe space</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-[color:var(--color-peace)]" href="#">Privacy</a>
            <a className="hover:text-[color:var(--color-peace)]" href="#">Emergency help</a>
            <a className="hover:text-[color:var(--color-peace)]" href="#">Feedback</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
