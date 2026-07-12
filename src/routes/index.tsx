import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen, Moon, Sun, Settings, Bell, Play, Pause, Send,
  Heart, Flame, Users, Feather, Wind, Search, Plus,
  ChevronRight, ArrowUpRight, Waves, Leaf, Coffee, PenLine, Volume2, VolumeX, Quote,
  Bot, CalendarCheck, UserCheck, ClipboardList, Target, Activity, Brain, Menu, X,
  MessageCircle,
} from "lucide-react";
import logo from "@/assets/peacecode-logo.png";

export const Route = createFileRoute("/")({ component: Dashboard });

// ─── data ──────────────────────────────────────────────────────────
const days = [
  { n: 7, d: "Mo" }, { n: 8, d: "Tu" }, { n: 9, d: "We" },
  { n: 10, d: "Th" }, { n: 11, d: "Fr" }, { n: 12, d: "Sa" }, { n: 13, d: "Su" },
];

const navGroups = [
  {
    label: "Core Care",
    items: [
      { icon: Bot, label: "Peace Bot" },
      { icon: CalendarCheck, label: "Counseling" },
      { icon: UserCheck, label: "Experts" },
      { icon: ClipboardList, label: "Screening", to: "/screening" },
    ],
  },
  {
    label: "Wellness Tools",
    items: [
      { icon: Wind, label: "Breathe", to: "/breathe" },
      { icon: Target, label: "Focus", to: "/focus" },
      { icon: Heart, label: "Gratitude", to: "/gratitude" },
      { icon: PenLine, label: "Journal", to: "/journal" },
      { icon: Activity, label: "Mood Tracker" },
      { icon: Brain, label: "Mind Gym" },
    ],
  },
  {
    label: "Community & Resources",
    items: [
      { icon: Users, label: "Community", to: "/community" },
      { icon: BookOpen, label: "Resources" },
    ],
  },
] as const;


const moods = ["cloudy", "gentle", "grounded", "tender", "restless", "flowing"];

const focusTools = [
  { label: "Breathe", icon: Wind, hint: "box · 4·4·4·4" },
  { label: "Rainfall", icon: Waves, hint: "36 min loop" },
  { label: "Pomodoro", icon: Coffee, hint: "25 · 5 · 25" },
  { label: "Journal", icon: Feather, hint: "one line a day" },
  { label: "Body scan", icon: Leaf, hint: "9 min guided" },
  { label: "Silence", icon: Quote, hint: "just be" },
];

const journey = [
  { day: 1, label: "Seed", done: true },
  { day: 7, label: "Sprout", done: true },
  { day: 14, label: "Bloom", done: true, current: true },
  { day: 21, label: "Grow" },
  { day: 30, label: "Flourish" },
  { day: 45, label: "Root" },
  { day: 60, label: "Still" },
];

const posts = [
  { name: "someone kind", text: "grateful my roommate made chai without asking today.", likes: 24 },
  { name: "a quiet friend", text: "finished a whole week of morning stillness. it's working.", likes: 41 },
  { name: "anon", text: "called mom instead of scrolling. small, but mine.", likes: 58 },
  { name: "night owl", text: "slept eight hours. haven't in a month. tiny miracle.", likes: 33 },
];

const activities = [
  { title: "Morning breath", subtitle: "a soft beginning", minutes: 12, time: "07:31" },
  { title: "Slow walk", subtitle: "notice five things", minutes: 22, time: "09:14" },
  { title: "Study, gently", subtitle: "one pomodoro", minutes: 25, time: "11:05" },
  { title: "Evening thread", subtitle: "wrote a note to yourself", minutes: 8, time: "20:42" },
];

const quotes = [
  { t: "You do not have to be good. You only have to let the soft animal of your body love what it loves.", a: "Mary Oliver" },
  { t: "Between stimulus and response there is a space. In that space is our power.", a: "Viktor Frankl" },
  { t: "Almost everything will work again if you unplug it, including you.", a: "Anne Lamott" },
];

const experiences = [
  { kicker: "a walk with breath", title: "Meditation", italic: "& movement",  mins: 24, tag: "gentle · guided",   hue: ["#AFC9F5", "#4B6CB7", "#1D2A44"], mood: "grounding" },
  { kicker: "a soft descent",     title: "Sleep",      italic: "stories",     mins: 32, tag: "night · whispered",  hue: ["#D5C9F7", "#6B7FB0", "#1D2A44"], mood: "drift" },
  { kicker: "the still hour",     title: "Deep",       italic: "focus",       mins: 45, tag: "flow · instrumental",hue: ["#C9DFFF", "#4B6CB7", "#1D2A44"], mood: "sharp" },
  { kicker: "for the tight chest",title: "Anxiety",    italic: "release",     mins: 12, tag: "grounding · body",   hue: ["#D5C9F7", "#7587A6", "#1D2A44"], mood: "hold" },
  { kicker: "on waking",          title: "Morning",    italic: "intention",   mins: 8,  tag: "brief · warm",       hue: ["#EAF3FF", "#AFC9F5", "#4B6CB7"], mood: "begin" },
];

function Mark({ className = "w-5 h-5", opacity = 1 }: { className?: string; opacity?: number }) {
  return <img src={logo} alt="" className={className} style={{ opacity }} />;
}

// ─── line-art illustrations (single stroke, no colors) ─────────────
function Curl({ stroke, className = "" }: { stroke: string; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round">
      <path d="M20 140 C 40 100, 70 90, 100 100 S 160 130, 180 90" />
      <path d="M30 150 C 50 120, 80 110, 110 120 S 170 140, 185 110" opacity="0.55" />
      <path d="M40 160 C 60 140, 90 130, 120 140 S 175 155, 188 130" opacity="0.3" />
    </svg>
  );
}
function Sprig({ stroke, className = "" }: { stroke: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round">
      <path d="M60 190 C 58 140, 62 90, 60 30" />
      <path d="M60 150 C 40 145, 30 130, 28 115" />
      <path d="M60 120 C 82 115, 92 100, 94 85" />
      <path d="M60 90  C 42 85, 32 70, 30 55" />
      <path d="M60 60  C 78 55, 88 42, 90 28" />
      <circle cx="60" cy="24" r="4" />
    </svg>
  );
}

// ─── glass donut chart ─────────────────────────────────────────────
function Donut({ segments, size = 200, ink }: { segments: { v: number; c: string; l: string }[]; size?: number; ink: string }) {
  const R = 78, C = 2 * Math.PI * R;
  let offset = 0;
  const total = segments.reduce((a, s) => a + s.v, 0);
  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <radialGradient id="glassRing" cx="30%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r={R} fill="none" stroke={ink} strokeOpacity="0.08" strokeWidth="14" />
      {segments.map((s, i) => {
        const len = (s.v / total) * C;
        const dash = `${len} ${C - len}`;
        const el = (
          <circle key={i} cx="100" cy="100" r={R} fill="none" stroke={s.c} strokeWidth="14"
            strokeDasharray={dash} strokeDashoffset={-offset} strokeLinecap="round"
            transform="rotate(-90 100 100)" />
        );
        offset += len + 3;
        return el;
      })}
      <circle cx="100" cy="100" r={R + 8} fill="url(#glassRing)" opacity="0.6" />
    </svg>
  );
}

// tracks the cursor as CSS vars so ambient glows can follow the pointer
const trackCursor = (e: React.MouseEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
  e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
};

function Dashboard() {
  const [dark, setDark] = useState(false);
  const [day, setDay] = useState(12);
  const [mood, setMood] = useState(3);
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0); // 0 in · 1 hold · 2 out · 3 hold
  const [breathCycles, setBreathCycles] = useState(0);
  const [seconds, setSeconds] = useState(25 * 60);
  const [pomoLength, setPomoLength] = useState(25);
  const [pomoSessions, setPomoSessions] = useState(1);
  const [running, setRunning] = useState(false);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");
  const [sound, setSound] = useState(false);
  const [quote, setQuote] = useState(0);
  const [quoteProgress, setQuoteProgress] = useState(0);
  const [savedQuotes, setSavedQuotes] = useState<Record<number, boolean>>({});
  const [stress, setStress] = useState(28);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expIdx, setExpIdx] = useState(0);
  const [expAuto, setExpAuto] = useState(true);
  const [expSaved, setExpSaved] = useState<Record<number, boolean>>({});
  const [expProgress, setExpProgress] = useState(0);
  const [activeRitual, setActiveRitual] = useState(1);
  const [ritualProgress, setRitualProgress] = useState(42);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{ from: "me" | "peace"; text: string }[]>([
    { from: "peace", text: "hey Jai. day 14 — soft win. sleep held at 7h 24m. what's alive in you right now?" },
  ]);
  const [peaceTyping, setPeaceTyping] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const sendToPeace = async (text: string) => {
    const t = text.trim();
    if (!t || peaceTyping) return;
    const next = [...chatLog, { from: "me" as const, text: t }];
    setChatLog(next);
    setChatInput("");
    setPeaceTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        const fallback =
          res.status === 429
            ? "the line is quiet for a moment — try again in a breath."
            : res.status === 402
            ? "peace needs a small credit refill. tell your workspace admin."
            : "i couldn't hear you clearly just then. try once more?";
        setChatLog((l) => [...l, { from: "peace", text: fallback }]);
      } else {
        setChatLog((l) => [...l, { from: "peace", text: data.reply! }]);
      }
    } catch {
      setChatLog((l) => [...l, { from: "peace", text: "the signal wavered. stay — try that again." }]);
    } finally {
      setPeaceTyping(false);
    }
  };


  // slow progress creep on the active ritual, like a lived-in moment
  useEffect(() => {
    const t = setInterval(() => setRitualProgress((p) => (p >= 96 ? 42 : p + 1)), 1400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!breathing) return;
    const t = setInterval(() => {
      setBreathPhase((p) => {
        const next = (p + 1) % 4;
        if (next === 0) setBreathCycles((c) => c + 1);
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [breathing]);

  useEffect(() => {
    setQuoteProgress(0);
    const start = Date.now();
    const dur = 9000;
    const raf = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setQuoteProgress(p);
      if (p >= 1) setQuote((q) => (q + 1) % quotes.length);
    }, 60);
    return () => clearInterval(raf);
  }, [quote]);

  useEffect(() => {
    setExpProgress(0);
    if (!expAuto) return;
    const start = Date.now();
    const dur = 6500;
    const raf = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setExpProgress(p);
      if (p >= 1) setExpIdx((i) => (i + 1) % experiences.length);
    }, 60);
    return () => clearInterval(raf);
  }, [expIdx, expAuto]);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // ONE unified sepia palette — no green, blue, or peach clashes
  const bg      = dark ? "#0F1626" : "#F7FAFF";
  const surface = dark ? "#182238" : "#FFFFFF";
  const surface2= dark ? "#1F2A44" : "#EAF3FF";
  const border  = dark ? "#2A3654" : "#DCE3EF";
  const ink     = dark ? "#E8EEFB" : "#1D2A44";
  const muted   = dark ? "#8B9AB8" : "#7587A6";
  const accent  = "#4B6CB7";  // clay-bronze
  const deep    = "#2E4A8A";  // deep clay
  const soft    = "#AFC9F5";  // wheat

  return (
    <div className={`min-h-screen w-full font-sans transition-colors ${dark ? "dark" : ""}`} style={{ background: bg, color: ink }}>
      {/* soft aurora backdrop — one palette only */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 lg:-top-40 lg:-left-40 lg:w-[520px] lg:h-[520px] rounded-full opacity-45 blur-3xl"
             style={{ background: dark ? "radial-gradient(circle,#1E2A48,transparent 70%)" : "radial-gradient(circle,#D5C9F7,transparent 70%)" }} />
        <div className="absolute top-1/3 -right-24 w-80 h-80 lg:-right-40 lg:w-[600px] lg:h-[600px] rounded-full opacity-30 blur-3xl"
             style={{ background: dark ? "radial-gradient(circle,#182238,transparent 70%)" : "radial-gradient(circle,#AFC9F5,transparent 70%)" }} />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 lg:-bottom-40 lg:left-1/3 lg:w-[500px] lg:h-[500px] rounded-full opacity-25 blur-3xl"
             style={{ background: dark ? "radial-gradient(circle,#22304E,transparent 70%)" : "radial-gradient(circle,#EAF3FF,transparent 70%)" }} />
      </div>

      {/* ─── glass sidebar (fixed shape, expands cleanly) ─── */}
      <aside className="hidden lg:flex fixed top-6 bottom-6 left-6 z-40 group flex-col py-6 rounded-[38px] backdrop-blur-2xl transition-[width] duration-300 ease-out hover:w-60 w-[80px] overflow-hidden"
             style={{ background: dark ? "rgba(30,27,23,0.75)" : "rgba(255,251,240,0.78)", border: `1px solid ${border}`, boxShadow: "0 30px 60px -30px rgba(38,34,28,0.22)" }}>
        {/* brand row */}
        <div className="flex items-center h-12 mb-8">
          <div className="w-[80px] shrink-0 flex justify-center">
            <Mark className="w-9 h-9"/>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap -ml-1">
            <div className="font-serif text-[17px] leading-none">PeaceCode</div>
            <div className="text-[8px] tracking-[0.3em] uppercase opacity-50 mt-1.5">a soft place</div>
          </div>
        </div>

        <nav className="flex-1 min-h-0 flex flex-col gap-4 px-3 overflow-x-hidden overflow-y-hidden group-hover:overflow-y-auto scrollbar-none group-hover:scrollbar-soft">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <div className="h-4 flex items-center pl-4 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                <span className="text-[8.5px] tracking-[0.32em] uppercase whitespace-nowrap" style={{ color: muted }}>{group.label}</span>
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = "active" in item && item.active;
                const to = "to" in item ? (item as { to?: string }).to : undefined;
                const cls = "relative flex items-center h-11 rounded-2xl transition";
                const style = active ? { background: dark ? "#223050" : "#EAF3FF", color: ink } : { color: muted };
                const inner = (
                  <>
                    <span className="w-[56px] shrink-0 flex justify-center">
                      <Icon className="w-[19px] h-[19px]" strokeWidth={1.4} />
                    </span>
                    <span className="text-[13px] tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">{item.label}</span>
                  </>
                );
                return to ? (
                  <Link key={item.label} to={to} className={cls} style={style}>{inner}</Link>
                ) : (
                  <button key={item.label} className={cls} style={style}>{inner}</button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* pinned footer box — always visible, no scroll */}
        <div className="shrink-0 mt-4 mx-3 pt-3 flex flex-col gap-1"
             style={{ borderTop: `1px solid ${border}` }}>
          <button onClick={() => setDark(!dark)} className="flex items-center h-10 rounded-2xl transition hover:bg-[color:var(--hov)]"
                  style={{ color: muted, ["--hov" as any]: dark ? "#223050" : "#EAF3FF" }}>
            <span className="w-[56px] shrink-0 flex justify-center">
              {dark ? <Sun className="w-[19px] h-[19px]" strokeWidth={1.4}/> : <Moon className="w-[19px] h-[19px]" strokeWidth={1.4}/>}
            </span>
            <span className="text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">{dark ? "day" : "night"} mode</span>
          </button>
          <button className="flex items-center h-10 rounded-2xl transition hover:bg-[color:var(--hov)]"
                  style={{ color: muted, ["--hov" as any]: dark ? "#223050" : "#EAF3FF" }}>
            <span className="w-[56px] shrink-0 flex justify-center">
              <Settings className="w-[19px] h-[19px]" strokeWidth={1.4}/>
            </span>
            <span className="text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">Settings</span>
          </button>
          <div className="mt-2 rounded-2xl flex items-center h-14" style={{ background: dark ? "#1F2A44" : "#EAF3FF" }}>
            <span className="w-[56px] shrink-0 flex justify-center">
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: soft }}>
                <Mark className="w-4 h-4"/>
              </span>
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap min-w-0 -ml-1">
              <div className="font-serif text-[13px] leading-none">Keya</div>
              <div className="flex items-center gap-1 mt-1 text-[9px]" style={{ color: accent }}>
                <Flame className="w-2.5 h-2.5" strokeWidth={1.5}/> 12 day streak
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── mobile top bar ─── */}
      <header className={`lg:hidden sticky top-0 z-30 backdrop-blur-xl transition ${scrolled ? "border-b shadow-[0_10px_30px_-20px_rgba(38,34,28,0.25)]" : ""}`}
              style={{ background: dark ? "rgba(20,18,16,0.9)" : "rgba(244,236,221,0.92)", borderColor: border }}>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-5 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mark className="w-8 h-8 shrink-0"/>
            <div className="min-w-0">
              <div className="font-serif text-[15px] leading-none truncate">PeaceCode</div>
              <div className="text-[7.5px] tracking-[0.3em] uppercase mt-1 opacity-50 truncate">a soft place</div>
            </div>
          </div>
          <div className="hidden xs:flex items-center gap-2 rounded-full px-3 py-1.5 mx-1 min-w-0" style={{ background: surface, border: `1px solid ${border}` }}>
            <Search className="w-3 h-3 opacity-40 shrink-0"/>
            <input placeholder="search…" className="bg-transparent outline-none text-[11px] w-full placeholder:opacity-40"/>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px]" style={{ background: surface2, color: accent }}>
              <Flame className="w-3 h-3" strokeWidth={1.5}/> 12
            </div>
            <button className="relative w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }}>
              <Bell className="w-3.5 h-3.5 opacity-70" strokeWidth={1.5}/>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: accent }}/>
            </button>
            <button onClick={() => setDark(!dark)} aria-label="toggle mode" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }}>
              {dark ? <Sun className="w-3.5 h-3.5 opacity-70"/> : <Moon className="w-3.5 h-3.5 opacity-70"/>}
            </button>
          </div>
        </div>
        <div className="px-4 sm:px-5 pb-2.5 flex items-center justify-between text-[9px] tracking-[0.3em] uppercase opacity-60" style={{ color: accent }}>
          <span className="truncate">Wed · 11 July · 06:41</span>
          <span className="opacity-70 shrink-0 ml-3">day 14 · bloom</span>
        </div>
      </header>

      {/* ─── editorial canvas ─── */}
      <main ref={mainRef} className="relative z-10 lg:pl-[120px] lg:pr-10 xl:pr-14 px-4 sm:px-8 py-5 lg:py-12 pb-32 lg:pb-16 max-w-[1600px] mx-auto">

        {/* HERO — quiet editorial band */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10 lg:mb-16 items-start">
          <div className="lg:col-span-8 flex flex-col">
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div className="text-[10px] tracking-[0.35em] uppercase opacity-60" style={{ color: accent }}>
                Wednesday · Eleven July · 06:41
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: surface, border: `1px solid ${border}` }}>
                  <Search className="w-3.5 h-3.5 opacity-40"/>
                  <input placeholder="search stillness…" className="bg-transparent outline-none text-[12px] w-40 placeholder:opacity-40"/>
                </div>
                <button className="relative w-10 h-10 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }}>
                  <Bell className="w-4 h-4 opacity-60" strokeWidth={1.5}/>
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full" style={{ background: accent }}/>
                </button>
              </div>
            </div>

            {/* ─── Today's Composure — the luxury morning brief ─── */}
            <TodayBrief accent={accent} ink={ink} bg={bg} border={border} surface={surface} surface2={surface2} muted={muted}/>

          </div>


          {/* right: STILLNESS DECK — layered rotating carousel of experiences */}
          <div className="lg:col-span-4">
            <div className="relative" style={{ perspective: "1400px" }}
                 onMouseEnter={() => setExpAuto(false)}
                 onMouseLeave={() => setExpAuto(true)}>
              {/* the stack — 3 visible layers, deepest first */}
              <div className="relative aspect-[4/5]">
                {experiences.map((exp, i) => {
                  const total = experiences.length;
                  // distance forward in the stack: 0 = top, 1 = next, 2 = after
                  const offset = (i - expIdx + total) % total;
                  const isTop = offset === 0;
                  const visible = offset < 3;
                  const scale = 1 - offset * 0.05;
                  const translateY = offset * 14;
                  const translateX = offset * 6;
                  const rotate = offset * -1.2;
                  return (
                    <div key={i}
                         onClick={() => { if (!isTop) setExpIdx(i); }}
                         className={`absolute inset-0 rounded-[36px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isTop ? "cursor-default" : "cursor-pointer"}`}
                         style={{
                           background: `linear-gradient(160deg, ${exp.hue[0]} 0%, ${exp.hue[1]} 55%, ${exp.hue[2]} 100%)`,
                           transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
                           opacity: visible ? (isTop ? 1 : 0.55 - offset * 0.15) : 0,
                           zIndex: total - offset,
                           boxShadow: isTop
                             ? "0 30px 80px -30px rgba(38,34,28,0.5), 0 8px 20px -8px rgba(38,34,28,0.3)"
                             : "0 20px 40px -20px rgba(38,34,28,0.3)",
                           pointerEvents: visible ? "auto" : "none",
                         }}>
                      {/* decorative curls + mark */}
                      <Curl stroke="#F7FAFF" className={`absolute -left-6 top-8 w-[220px] transition-all duration-1000 ${isTop ? "opacity-40" : "opacity-25"}`} />
                      <Mark className={`absolute -right-12 -bottom-12 w-72 h-72 transition-transform duration-[1500ms] ${isTop ? "" : "scale-90"}`} opacity={0.16}/>

                      {/* grain */}
                      <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
                           style={{ backgroundImage: `radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1px)`, backgroundSize: "3px 3px" }} />

                      {/* content — only render on top for a11y/perf; others are just visual peek */}
                      <div className="relative h-full p-7 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#F7FAFF" }}>{exp.kicker}</div>
                            {isTop && (
                              <div className="flex items-center gap-1 text-[9px] tracking-[0.25em] uppercase" style={{ color: "#F7FAFF", opacity: 0.75 }}>
                                <span>{expIdx + 1}</span><span className="opacity-50">/</span><span className="opacity-60">{total}</span>
                              </div>
                            )}
                          </div>
                          <div className="font-serif text-[38px] lg:text-[46px] leading-[0.95] mt-4" style={{ color: "#1D2A44" }}>
                            {exp.title}<br/><em className="italic font-light">{exp.italic}</em>
                          </div>
                        </div>

                        <div className="flex items-end justify-between">
                          <div style={{ color: "#1D2A44" }}>
                            <div className="font-serif italic text-xl">{exp.mins} min</div>
                            <div className="opacity-60 tracking-[0.25em] uppercase text-[9px] mt-1">{exp.tag}</div>
                          </div>
                          {isTop && (
                            <div className="flex items-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setExpSaved({ ...expSaved, [i]: !expSaved[i] }); }}
                                      aria-label="save"
                                      className="w-11 h-11 rounded-full flex items-center justify-center transition hover:scale-105 active:scale-95"
                                      style={{ background: expSaved[i] ? "#1D2A44" : "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}>
                                <Heart className={`w-3.5 h-3.5 ${expSaved[i] ? "animate-heart-pop" : ""}`}
                                       fill={expSaved[i] ? "#F7FAFF" : "none"}
                                       style={{ color: expSaved[i] ? "#F7FAFF" : "#1D2A44" }} strokeWidth={1.6}/>
                              </button>
                              <button className="group w-14 h-14 rounded-full flex items-center justify-center transition hover:scale-105 relative overflow-hidden" style={{ background: "#1D2A44" }}>
                                {/* ring progress on the play button */}
                                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                                  <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(245,238,224,0.15)" strokeWidth="1.5"/>
                                  <circle cx="28" cy="28" r="26" fill="none" stroke="#F7FAFF" strokeWidth="1.5" strokeLinecap="round"
                                          strokeDasharray={2 * Math.PI * 26}
                                          strokeDashoffset={2 * Math.PI * 26 * (1 - (expAuto ? expProgress : 0))} />
                                </svg>
                                <Play className="w-4 h-4 ml-0.5 relative" style={{ color: "#FFFFFF" }} strokeWidth={2}/>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ambient controls beneath the deck */}
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {experiences.map((_, i) => (
                    <button key={i} onClick={() => setExpIdx(i)} aria-label={`experience ${i + 1}`}
                            className="h-[6px] rounded-full transition-all"
                            style={{
                              width: i === expIdx ? 28 : 6,
                              background: i === expIdx ? accent : border,
                              opacity: i === expIdx ? 1 : 0.7,
                            }}/>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setExpIdx((expIdx - 1 + experiences.length) % experiences.length)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition" aria-label="previous">
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" strokeWidth={1.5}/>
                  </button>
                  <button onClick={() => setExpAuto(!expAuto)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition" aria-label="toggle auto-play">
                    {expAuto ? <Pause className="w-3 h-3" strokeWidth={1.5}/> : <Play className="w-3 h-3 ml-0.5" strokeWidth={1.5}/>}
                  </button>
                  <button onClick={() => setExpIdx((expIdx + 1) % experiences.length)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition" aria-label="next">
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── THE WEEK · full-width editorial day rail ─── */}
        <section className="mb-16 relative">
          <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
            <div>
              <div className="text-[10px] tracking-[0.35em] uppercase opacity-55 mb-2" style={{ color: accent }}>this week · july</div>
              <h3 className="font-serif text-[22px] sm:text-[24px] tracking-tight leading-tight">
                Seven mornings, <em className="italic opacity-70">softly counted.</em>
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[9.5px] tracking-[0.3em] uppercase opacity-55" style={{ color: muted }}>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }}/> today</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full opacity-40" style={{ background: ink }}/> held</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{ background: "transparent", border: `1px solid ${border}` }}/> soon</span>
            </div>
          </div>

          <div className="relative rounded-[28px] px-4 sm:px-10 py-8 overflow-hidden"
               style={{ background: surface, border: `1px solid ${border}` }}>
            {/* decorative curls at both ends */}
            <Curl stroke={muted} className="absolute -left-8 -top-6 w-[180px] opacity-25 pointer-events-none"/>
            <Curl stroke={muted} className="absolute -right-8 -bottom-6 w-[180px] opacity-25 pointer-events-none rotate-180"/>

            {/* thin editorial line running through the middle */}
            <div aria-hidden className="absolute left-8 right-8 top-1/2 -translate-y-1 h-px" style={{ background: border }}/>

            <div className="relative flex items-center justify-between gap-2">
              {days.map((dd, i) => {
                const active = day === dd.n;
                const past = dd.n < day;
                const sessions = [3, 2, 4, 3, 2, 3, 1][i] ?? 0;
                return (
                  <button key={dd.n} onClick={() => setDay(dd.n)}
                          className="group/day relative flex flex-col items-center justify-center transition-all flex-1 min-w-0">
                    <div className="text-[9px] tracking-[0.32em] uppercase mb-3 transition-all"
                         style={{ color: active ? accent : muted, opacity: active ? 1 : 0.5,
                                  letterSpacing: active ? "0.4em" : "0.32em" }}>
                      {dd.d}
                    </div>
                    <div className="relative flex items-center justify-center">
                      {/* soft halo behind active */}
                      {active && (
                        <span className="absolute w-[86px] h-[86px] rounded-full animate-pulse-soft"
                              style={{ background: `radial-gradient(circle, ${accent}33, transparent 65%)` }}/>
                      )}
                      <div className={`flex items-center justify-center rounded-full font-serif transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] relative ${active ? "w-[68px] h-[68px] text-[26px]" : "w-[46px] h-[46px] text-[17px] group-hover/day:scale-110"}`}
                           style={active
                             ? { background: bg, color: ink, boxShadow: "0 18px 40px -18px rgba(38,34,28,0.55), 0 0 0 1px rgba(38,34,28,0.08)" }
                             : past
                               ? { background: "transparent", color: ink, border: `1px solid ${border}`, opacity: 0.55 }
                               : { background: "transparent", color: ink, border: `1px solid ${border}` }}>
                        {dd.n}
                        {past && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-[70%] h-px rotate-[-20deg] opacity-30" style={{ background: ink }}/>
                          </span>
                        )}
                      </div>
                    </div>
                    {/* session pips */}
                    <div className="mt-3 flex items-center gap-1 h-2">
                      {active
                        ? <span className="text-[8.5px] tracking-[0.3em] uppercase animate-pulse" style={{ color: accent }}>today</span>
                        : Array.from({ length: sessions }).map((_, k) => (
                            <span key={k} className="w-1 h-1 rounded-full"
                                  style={{ background: past ? accent : muted, opacity: past ? 0.75 : 0.35 }}/>
                          ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* footer whisper */}
            <div className="mt-6 pt-5 border-t flex items-center justify-between text-[9.5px] tracking-[0.28em] uppercase"
                 style={{ borderColor: border, color: muted }}>
              <span>week 28 · 18 rituals held</span>
              <span className="italic tracking-normal opacity-70 normal-case">a soft rhythm is forming.</span>
            </div>
          </div>
        </section>



        {/* SECTION LABEL */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="text-[10px] tracking-[0.35em] uppercase opacity-50 mb-2" style={{ color: accent }}>a quiet reading</div>
            <h2 className="font-serif text-[30px] tracking-tight">How today is settling.</h2>
          </div>
          <span className="text-[10px] tracking-[0.25em] uppercase opacity-40 hidden sm:block">three soft signals</span>
        </div>

        {/* MOOD / PEACE / STRESS — one flowing canvas, glass donut anchor */}
        <section className="rounded-[40px] p-7 sm:p-12 mb-16 relative overflow-hidden"
                 style={{ background: `linear-gradient(140deg, ${surface} 0%, ${surface2} 100%)`, border: `1px solid ${border}` }}>
          <Sprig stroke={accent} className="absolute right-8 top-8 w-24 opacity-30 hidden lg:block" />
          <Curl stroke={accent} className="absolute -left-10 bottom-0 w-[300px] opacity-20" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 relative items-center">
            {/* mood — soft chips, one tone */}
            <div className="lg:col-span-4">
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-3">how are you, really</div>
              <h3 className="font-serif text-[32px] leading-[1.05] mb-7">
                Today feels <em className="italic" style={{ color: accent }}>{moods[mood]}</em>
              </h3>
              <div className="flex flex-wrap gap-2">
                {moods.map((m, i) => (
                  <button key={m} onClick={() => setMood(i)}
                          className="px-4 py-2.5 rounded-full text-[11px] tracking-[0.15em] uppercase transition"
                          style={mood === i
                            ? { background: ink, color: bg, borderColor: ink }
                            : { background: "transparent", color: muted, border: `1px solid ${border}` }}>
                    {m}
                  </button>
                ))}
              </div>
              <p className="text-[13px] mt-7 opacity-60 italic max-w-xs">a soft, quiet kind of happy. no need to hold it — just notice.</p>
            </div>

            {/* peace donut — glass */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-4">peace score · today</div>
              <div className="relative">
                <Donut ink={ink} size={240} segments={[
                  { v: 70, c: accent, l: "at ease" },
                  { v: 15, c: deep,   l: "tense" },
                  { v: 15, c: soft,   l: "wistful" },
                ]}/>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-serif text-[64px] leading-none tracking-tight">90</span>
                  <span className="text-[9px] tracking-[0.3em] uppercase opacity-50 mt-1">out of hundred</span>
                </div>
              </div>
              <div className="flex items-center gap-5 mt-5 text-[10px] tracking-[0.15em] uppercase">
                {[{ c: accent, l: "ease", v: 70 }, { c: deep, l: "tense", v: 15 }, { c: soft, l: "wistful", v: 15 }].map(m => (
                  <div key={m.l} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.c }}/>
                    <span className="opacity-60">{m.l}</span>
                    <span className="font-serif italic opacity-50">{m.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* stress dial */}
            <div className="lg:col-span-4">
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-3">stress dial · slide to log</div>
              <div className="mb-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-serif text-[52px] leading-none">{stress}<span className="text-[13px] opacity-40 ml-1">/100</span></span>
                  <span className="text-[10px] italic opacity-60">{stress < 30 ? "settled" : stress < 60 ? "some weight" : "carrying a lot"}</span>
                </div>
                <input type="range" min={0} max={100} value={stress} onChange={(e) => setStress(+e.target.value)}
                       className="w-full accent-[#4B6CB7]"/>
                <div className="flex justify-between text-[9px] tracking-[0.2em] uppercase opacity-40 mt-1">
                  <span>calm</span><span>heavy</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[{ v: "87", u: "min", l: "stillness" }, { v: "23", u: "", l: "sessions" }, { v: "34", u: "min", l: "avg dwell" }].map((s) => (
                  <div key={s.l}>
                    <div className="text-[9px] tracking-[0.2em] uppercase opacity-50 mb-1">{s.l}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-[26px] leading-none">{s.v}</span>
                      <span className="text-[10px] opacity-50">{s.u}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SANCTUM — a stillness triptych. one continuous surface, three instruments. */}
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <div className="text-[10px] tracking-[0.35em] uppercase opacity-50 mb-2" style={{ color: accent }}>the sanctum</div>
              <h3 className="font-serif text-[26px] tracking-tight">Three ways to be here.</h3>
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase opacity-50 hidden sm:block">breath · focus · verse</span>
          </div>

          <div className="relative rounded-[36px] overflow-hidden"
               style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 30px 80px -40px rgba(38,34,28,0.25)" }}>
            {/* organic ambient wash */}
            <div className="absolute inset-0 pointer-events-none opacity-70"
                 style={{ background: `radial-gradient(600px 300px at 15% 20%, ${accent}18, transparent 60%), radial-gradient(500px 260px at 88% 90%, ${deep}14, transparent 65%)` }} />
            <Curl stroke={accent} className="absolute -left-16 top-1/2 -translate-y-1/2 w-96 opacity-[0.08] pointer-events-none" />

            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.05fr_1.25fr_1fr]">
              {/* ─── I · BOX BREATHING — the literal box ───────────────── */}
              <div className="relative p-7 md:p-8 lg:border-r" style={{ borderColor: border }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[9px] tracking-[0.4em] uppercase opacity-40 mb-1">I · breath</div>
                    <div className="font-serif text-[17px] tracking-tight">Box Breathing</div>
                  </div>
                  <button onClick={() => { setBreathing(!breathing); if (!breathing) { setBreathPhase(0); setBreathCycles(0); } }}
                          className="group flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase px-3.5 py-2 rounded-full transition-all hover:gap-3"
                          style={{ background: breathing ? "transparent" : ink, color: breathing ? ink : bg, border: `1px solid ${breathing ? border : "transparent"}` }}>
                    <span className="relative flex h-1.5 w-1.5">
                      {breathing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: accent }} />}
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: breathing ? accent : bg }} />
                    </span>
                    {breathing ? "pause" : "begin"}
                  </button>
                </div>

                {/* the box itself */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-56 h-56">
                    {/* corner labels */}
                    {[
                      { top: "-14px", left: "-14px", label: "inhale", i: 0 },
                      { top: "-14px", right: "-14px", label: "hold", i: 1 },
                      { bottom: "-14px", right: "-14px", label: "exhale", i: 2 },
                      { bottom: "-14px", left: "-14px", label: "hold", i: 3 },
                    ].map((c, k) => (
                      <div key={k} className="absolute text-[8px] tracking-[0.3em] uppercase transition-all duration-500"
                           style={{ top: c.top, left: c.left, right: c.right, bottom: c.bottom, color: breathing && breathPhase === c.i ? accent : muted, opacity: breathing && breathPhase === c.i ? 1 : 0.35, fontWeight: breathing && breathPhase === c.i ? 600 : 400 }}>
                        {c.label}
                      </div>
                    ))}

                    {/* the square, drawn with SVG so we can animate a dashed stroke around it */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                      <defs>
                        <linearGradient id="boxG" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={accent} stopOpacity="0.9"/>
                          <stop offset="100%" stopColor={deep} stopOpacity="0.6"/>
                        </linearGradient>
                      </defs>
                      <rect x="8" y="8" width="84" height="84" rx="6" fill="none" stroke={border} strokeWidth="0.8"/>
                      {/* animated progress edge: 4 sides, one at a time */}
                      <rect x="8" y="8" width="84" height="84" rx="6" fill="none"
                            stroke="url(#boxG)" strokeWidth="1.6" strokeLinecap="round"
                            strokeDasharray="84 252"
                            style={{
                              strokeDashoffset: breathing ? -84 * breathPhase : 0,
                              transition: breathing ? "stroke-dashoffset 4s linear" : "none",
                            }}/>
                    </svg>

                    {/* traveling dot */}
                    <div className="absolute w-3 h-3 rounded-full transition-all duration-[3800ms] ease-linear"
                         style={{
                           background: accent,
                           boxShadow: `0 0 20px ${accent}, 0 0 40px ${accent}88`,
                           top:  breathPhase === 0 ? "4%" : breathPhase === 1 ? "4%" : breathPhase === 2 ? "96%" : "96%",
                           left: breathPhase === 0 ? "4%" : breathPhase === 1 ? "96%" : breathPhase === 2 ? "96%" : "4%",
                           transform: "translate(-50%,-50%)",
                           opacity: breathing ? 1 : 0.4,
                         }}/>

                    {/* center: phase word + mark */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="font-serif italic text-[26px] tracking-tight transition-all duration-500"
                           style={{ color: ink, opacity: breathing ? 1 : 0.35 }}>
                        {breathing ? ["inhale", "hold", "exhale", "hold"][breathPhase] : "rest"}
                      </div>
                      <div className="mt-2 text-[9px] tracking-[0.35em] uppercase" style={{ color: muted }}>
                        4 · 4 · 4 · 4
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 text-[10px] tracking-[0.25em] uppercase" style={{ color: muted }}>
                  <span>cycle · {String(breathCycles).padStart(2, "0")}</span>
                  <span className="italic normal-case font-serif tracking-normal text-[12px]" style={{ color: breathing ? ink : muted }}>
                    {breathing ? "with the shape, not against it" : "four seconds each side"}
                  </span>
                </div>
              </div>

              {/* ─── II · POMODORO — cinematic ink slab with SVG dial ─── */}
              <div className="relative p-7 md:p-8 lg:border-r flex flex-col" style={{ background: "#1D2A44", color: "#F7FAFF", borderColor: border }}>
                <div className="absolute inset-0 pointer-events-none opacity-40"
                     style={{ background: "radial-gradient(400px 220px at 70% 20%, rgba(244,236,221,0.06), transparent 60%)" }} />
                <Curl stroke="#F7FAFF" className="absolute -right-10 -bottom-10 w-64 opacity-[0.08] pointer-events-none" />

                <div className="relative flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[9px] tracking-[0.4em] uppercase opacity-40 mb-1">II · focus</div>
                    <div className="font-serif text-[17px] tracking-tight">A Slow Hour</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[15, 25, 45].map((m) => (
                      <button key={m} onClick={() => { setPomoLength(m); setSeconds(m * 60); setRunning(false); }}
                              className="text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full transition-all"
                              style={{
                                background: pomoLength === m ? "#F7FAFF" : "transparent",
                                color: pomoLength === m ? "#1D2A44" : "rgba(244,236,221,0.55)",
                                border: `1px solid ${pomoLength === m ? "transparent" : "rgba(244,236,221,0.12)"}`,
                              }}>
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* dial */}
                <div className="relative flex-1 flex items-center justify-center py-2">
                  <div className="relative w-[220px] h-[220px]">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(244,236,221,0.08)" strokeWidth="1.2"/>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#F7FAFF" strokeWidth="1.4" strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 45}
                              strokeDashoffset={2 * Math.PI * 45 * (1 - (seconds / (pomoLength * 60)))}
                              style={{ transition: "stroke-dashoffset 1s linear" }} />
                      {/* tick marks */}
                      {Array.from({ length: 60 }).map((_, i) => (
                        <line key={i} x1="50" y1="4" x2="50" y2={i % 5 === 0 ? 7 : 5.5}
                              stroke="rgba(244,236,221,0.18)" strokeWidth={i % 5 === 0 ? 0.5 : 0.25}
                              transform={`rotate(${i * 6} 50 50)`} />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="font-serif text-[68px] leading-none tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                        {mm}<span className="opacity-30">:</span>{ss}
                      </div>
                      <div className="mt-3 flex items-center gap-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                                style={{ background: i < pomoSessions ? "#F7FAFF" : "rgba(244,236,221,0.18)" }} />
                        ))}
                      </div>
                      <div className="mt-1.5 text-[9px] tracking-[0.3em] uppercase opacity-50">
                        session {pomoSessions}/4
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center gap-2 mt-4">
                  <button onClick={() => setRunning(!running)}
                          className="flex-1 rounded-full py-3 text-[11px] tracking-[0.25em] uppercase flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                          style={{ background: "#F7FAFF", color: "#1D2A44" }}>
                    {running ? <Pause className="w-3 h-3"/> : <Play className="w-3 h-3"/>}
                    {running ? "pause" : seconds < pomoLength * 60 ? "resume" : "begin"}
                  </button>
                  <button onClick={() => { setRunning(false); setSeconds(pomoLength * 60); }}
                          className="px-5 py-3 rounded-full text-[11px] tracking-[0.25em] uppercase opacity-70 hover:opacity-100 transition"
                          style={{ border: "1px solid rgba(244,236,221,0.15)" }}>reset</button>
                  <button onClick={() => setSound(!sound)} aria-label="ambient sound"
                          className="w-11 h-11 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition"
                          style={{ border: "1px solid rgba(244,236,221,0.15)" }}>
                    {sound ? <Volume2 className="w-3.5 h-3.5"/> : <VolumeX className="w-3.5 h-3.5"/>}
                  </button>
                </div>
              </div>

              {/* ─── III · VERSE — the quiet page ─────────────────────── */}
              <div className="relative p-7 md:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[9px] tracking-[0.4em] uppercase opacity-40 mb-1">III · verse</div>
                    <div className="font-serif text-[17px] tracking-tight">A Held Line</div>
                  </div>
                  <button onClick={() => setSavedQuotes({ ...savedQuotes, [quote]: !savedQuotes[quote] })}
                          aria-label="save to journal"
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                          style={{ background: savedQuotes[quote] ? ink : "transparent", color: savedQuotes[quote] ? bg : ink, border: `1px solid ${border}` }}>
                    <Heart className={`w-3.5 h-3.5 ${savedQuotes[quote] ? "animate-heart-pop" : ""}`}
                           fill={savedQuotes[quote] ? "currentColor" : "none"} strokeWidth={1.5}/>
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-center relative">
                  <div className="absolute -top-2 -left-1 font-serif text-[80px] leading-none opacity-[0.08] select-none pointer-events-none" style={{ color: ink }}>“</div>
                  <p key={quote} className="relative font-serif text-[20px] md:text-[21px] leading-[1.4] italic animate-rise" style={{ color: ink }}>
                    {quotes[quote].t}
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                    <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: muted }}>{quotes[quote].a}</div>
                  </div>
                </div>

                {/* auto-advance progress + nav */}
                <div className="mt-6 space-y-3">
                  <div className="h-[2px] w-full rounded-full overflow-hidden" style={{ background: border }}>
                    <div className="h-full rounded-full transition-none"
                         style={{ width: `${quoteProgress * 100}%`, background: `linear-gradient(90deg, ${accent}, ${deep})` }}/>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {quotes.map((_, i) => (
                        <button key={i} onClick={() => setQuote(i)} aria-label={`verse ${i + 1}`}
                                className="h-[6px] rounded-full transition-all hover:opacity-100"
                                style={{ width: quote === i ? 22 : 6, background: quote === i ? accent : border, opacity: quote === i ? 1 : 0.6 }}/>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setQuote((quote - 1 + quotes.length) % quotes.length)}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition" aria-label="previous">
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" strokeWidth={1.5}/>
                      </button>
                      <button onClick={() => setQuote((quote + 1) % quotes.length)}
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition" aria-label="next">
                        <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── QUIET TOOLKIT · editorial mosaic ─── */}
        <section className="mb-16 mt-2">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-50 mb-3" style={{ color: accent }}>
                <span className="inline-block w-6 h-px align-middle mr-2" style={{ background: accent, opacity: 0.5 }}/>
                quiet toolkit · vol. 01
              </div>
              <h3 className="font-serif text-[30px] sm:text-[38px] tracking-tight leading-[0.95]">
                Six ways in.<br/>
                <em className="italic opacity-60 text-[24px] sm:text-[28px]">Pick a door — none of them lock.</em>
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[9.5px] tracking-[0.32em] uppercase opacity-50">
              <span>tap</span>
              <span className="w-8 h-px" style={{ background: ink, opacity: 0.3 }}/>
              <span>no pressure</span>
            </div>
          </div>

          {/* Mosaic: one featured tall tile + 5 varied tiles */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 md:auto-rows-[130px]">
            {focusTools.map((t, i) => {
              const I = t.icon;
              const featured = i === 0;
              // asymmetric spans on md+
              const spanMap = [
                "md:col-span-2 md:row-span-2",    // 0 — featured tall
                "md:col-span-2 md:row-span-1",    // 1 — wide
                "md:col-span-2 md:row-span-1",    // 2 — wide
                "md:col-span-2 md:row-span-1",    // 3 — square-ish
                "md:col-span-2 md:row-span-1",    // 4
                "md:col-span-2 md:row-span-1",    // 5
              ];
              return (
                <button
                  key={t.label}
                  onMouseMove={trackCursor}
                  className={`group card-lift cursor-glow relative overflow-hidden text-left transition-all ${spanMap[i]}`}
                  style={{
                    background: featured
                      ? `linear-gradient(155deg, ${surface2} 0%, ${surface} 55%, ${bg} 100%)`
                      : surface,
                    border: `1px solid ${border}`,
                    borderRadius: featured ? 32 : 22,
                    minHeight: featured ? 268 : 128,
                  }}
                >
                  <span className="shine" aria-hidden />

                  {/* ghost numeral watermark */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute font-serif select-none transition-all duration-700 group-hover:opacity-100 group-hover:-translate-y-1"
                    style={{
                      right: featured ? -14 : -10,
                      bottom: featured ? -30 : -22,
                      fontSize: featured ? 220 : 118,
                      lineHeight: 1,
                      color: ink,
                      opacity: featured ? 0.055 : 0.045,
                      letterSpacing: "-0.06em",
                      fontStyle: "italic",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* editorial corner brackets */}
                  <span aria-hidden className="absolute top-3 left-3 w-3 h-3 border-l border-t opacity-30 transition-opacity duration-500 group-hover:opacity-70" style={{ borderColor: ink }}/>
                  <span aria-hidden className="absolute top-3 right-3 w-3 h-3 border-r border-t opacity-30 transition-opacity duration-500 group-hover:opacity-70" style={{ borderColor: ink }}/>

                  {/* content */}
                  <div className={`relative h-full flex ${featured ? "flex-col justify-between p-6" : "flex-col justify-between p-5"}`}>
                    <div className="flex items-start justify-between">
                      <span
                        className={`rounded-full flex items-center justify-center transition-all duration-500 group-hover:-translate-y-0.5 ${featured ? "w-12 h-12" : "w-9 h-9"}`}
                        style={{ background: featured ? bg : surface2, border: `1px solid ${border}` }}
                      >
                        <I className={featured ? "w-5 h-5" : "w-[17px] h-[17px]"} strokeWidth={1.3}/>
                      </span>
                      {featured && (
                        <span className="text-[9px] tracking-[0.32em] uppercase px-2.5 py-1 rounded-full opacity-80" style={{ background: ink, color: bg }}>
                          begin here
                        </span>
                      )}
                      {!featured && (
                        <span className="text-[9px] tracking-[0.3em] uppercase opacity-40 font-serif italic">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <div className={`font-serif tracking-tight leading-none ink-underline ${featured ? "text-[34px]" : "text-[19px]"}`}>
                        {t.label}
                      </div>
                      <div
                        className={`tracking-[0.22em] uppercase mt-2 ${featured ? "text-[10px]" : "text-[9px]"}`}
                        style={{ color: muted }}
                      >
                        {t.hint}
                      </div>
                      {featured && (
                        <p className="mt-4 text-[13px] leading-relaxed max-w-[240px] reveal" style={{ color: muted }}>
                          A four-count square. Inhale, hold, exhale, hold. Come back to yourself in one minute flat.
                        </p>
                      )}
                      <div
                        className="mt-3 h-px w-6 origin-left transition-all duration-500 group-hover:w-[85%]"
                        style={{ background: accent, opacity: 0.55 }}
                      />
                    </div>

                    {featured && (
                      <div className="flex items-center gap-2 mt-4 reveal">
                        <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: ink, color: bg }}>
                          <Play className="w-3.5 h-3.5 ml-0.5" strokeWidth={2} fill="currentColor"/>
                        </span>
                        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: ink }}>start · 1 min</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── SLOW JOURNEY · winding vine ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          <div className="lg:col-span-8 rounded-[36px] p-7 sm:p-10 relative overflow-hidden"
               style={{ background: `linear-gradient(160deg, ${surface2} 0%, ${surface} 60%, ${bg} 100%)`, border: `1px solid ${border}` }}>
            {/* soft aurora */}
            <div aria-hidden className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full pointer-events-none"
                 style={{ background: `radial-gradient(circle, ${accent}22, transparent 70%)` }}/>

            <div className="flex items-start justify-between mb-6 relative flex-wrap gap-4">
              <div>
                <div className="text-[10px] tracking-[0.35em] uppercase opacity-55 mb-3" style={{ color: accent }}>
                  <span className="inline-block w-5 h-px align-middle mr-2" style={{ background: accent, opacity: 0.5 }}/>
                  the slow journey
                </div>
                <h3 className="font-serif text-[30px] sm:text-[34px] leading-[1.02] max-w-lg tracking-tight">
                  Fourteen days in — <em className="italic" style={{ color: accent }}>halfway to bloom.</em>
                </h3>
                <p className="text-[13px] mt-3 max-w-md leading-relaxed" style={{ color: muted }}>
                  Not a streak. A softening. Each node is a place you paused with yourself.
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-[40px] leading-none" style={{ color: ink }}>14<span className="opacity-40 text-[20px]">/60</span></div>
                <div className="text-[9px] tracking-[0.3em] uppercase opacity-45 mt-1.5">days held</div>
              </div>
            </div>

            {/* winding path SVG */}
            <div className="relative mt-2">
              <svg viewBox="0 0 800 180" className="w-full h-[180px] sm:h-[210px]" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="vineGrad" x1="0" x2="1">
                    <stop offset="0" stopColor={accent} stopOpacity="0.9"/>
                    <stop offset="0.5" stopColor={accent} stopOpacity="0.7"/>
                    <stop offset="1" stopColor={muted} stopOpacity="0.25"/>
                  </linearGradient>
                  <linearGradient id="vineGhost" x1="0" x2="1">
                    <stop offset="0" stopColor={muted} stopOpacity="0.25"/>
                    <stop offset="1" stopColor={muted} stopOpacity="0.25"/>
                  </linearGradient>
                </defs>
                {/* ghost track — the whole 60-day arc */}
                <path
                  d="M 30 130 C 130 40, 220 180, 320 90 S 500 30, 600 110 S 760 140, 780 60"
                  fill="none"
                  stroke="url(#vineGhost)"
                  strokeWidth="1.5"
                  strokeDasharray="3 5"
                />
                {/* traveled path — up to current */}
                <path
                  d="M 30 130 C 130 40, 220 180, 320 90"
                  fill="none"
                  stroke="url(#vineGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* node positions along the curve (approx) */}
                {[
                  { x: 30,  y: 130, m: journey[0] },
                  { x: 175, y: 92,  m: journey[1] },
                  { x: 320, y: 90,  m: journey[2] },
                  { x: 450, y: 60,  m: journey[3] },
                  { x: 570, y: 100, m: journey[4] },
                  { x: 680, y: 128, m: journey[5] },
                  { x: 780, y: 60,  m: journey[6] },
                ].map((n, i) => (
                  <g key={i}>
                    {n.m.current && (
                      <>
                        <circle cx={n.x} cy={n.y} r="18" fill={accent} opacity="0.18">
                          <animate attributeName="r" values="14;22;14" dur="3.2s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" values="0.28;0.08;0.28" dur="3.2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx={n.x} cy={n.y} r="12" fill={ink}/>
                        <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fill={bg} fontFamily="serif" fontWeight="500">{n.m.day}</text>
                      </>
                    )}
                    {!n.m.current && n.m.done && (
                      <>
                        <circle cx={n.x} cy={n.y} r="7" fill={accent}/>
                        <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize="8" fill={bg} fontFamily="serif">{n.m.day}</text>
                      </>
                    )}
                    {!n.m.done && (
                      <>
                        <circle cx={n.x} cy={n.y} r="6" fill={surface} stroke={muted} strokeOpacity="0.5" strokeWidth="1.2"/>
                        <text x={n.x} y={n.y + 2.5} textAnchor="middle" fontSize="7.5" fill={muted} opacity="0.7" fontFamily="serif">{n.m.day}</text>
                      </>
                    )}
                    <text x={n.x} y={n.y + 26} textAnchor="middle" fontSize="8" fill={ink}
                          opacity={n.m.current ? 0.9 : n.m.done ? 0.55 : 0.35}
                          style={{ letterSpacing: "0.22em", textTransform: "uppercase" }}>
                      {n.m.label}
                    </text>
                    {n.m.current && (
                      <text x={n.x} y={n.y - 22} textAnchor="middle" fontSize="7.5" fill={accent}
                            style={{ letterSpacing: "0.28em", textTransform: "uppercase" }}>
                        you are here
                      </text>
                    )}
                  </g>
                ))}
                {/* tiny leaves along traveled path */}
                <g opacity="0.6">
                  <ellipse cx="90"  cy="82"  rx="3.5" ry="1.5" fill={accent} transform="rotate(-30 90 82)"/>
                  <ellipse cx="240" cy="140" rx="3.5" ry="1.5" fill={accent} transform="rotate(25 240 140)"/>
                </g>
              </svg>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t text-[10px] tracking-[0.28em] uppercase" style={{ borderColor: border, color: muted }}>
              <span>seed → still · 60 days</span>
              <span className="opacity-70">next node · <span style={{ color: ink }}>day 21 · grow</span></span>
            </div>
          </div>

          {/* ONE LINE, TONIGHT — folded letter */}
          <div className="lg:col-span-4 relative">
            <div className="rounded-[36px] p-7 relative overflow-hidden flex flex-col h-full"
                 style={{
                   background: `linear-gradient(175deg, ${bg} 0%, ${surface} 100%)`,
                   border: `1px solid ${border}`,
                 }}>
              {/* folded corner */}
              <div
                aria-hidden
                className="absolute top-0 right-0 w-14 h-14"
                style={{
                  background: `linear-gradient(225deg, ${surface2} 0%, ${surface2} 50%, transparent 50%)`,
                  borderTopRightRadius: 36,
                  borderLeft: `1px solid ${border}`,
                  borderBottom: `1px solid ${border}`,
                }}
              />
              {/* stamp */}
              <div aria-hidden className="absolute top-4 left-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }}/>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent, opacity: 0.6 }}/>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent, opacity: 0.3 }}/>
              </div>

              <div className="flex items-center justify-between mb-3 mt-6">
                <div className="text-[10px] tracking-[0.32em] uppercase opacity-55" style={{ color: accent }}>one line, tonight</div>
                <PenLine className="w-4 h-4 opacity-40"/>
              </div>
              <h3 className="font-serif text-[24px] leading-[1.15] mb-4 tracking-tight">
                What's <em className="italic" style={{ color: accent }}>staying<br/>with you</em>?
              </h3>

              {/* ruled paper lines behind textarea */}
              <div className="relative flex-1 min-h-[110px]">
                <div aria-hidden className="absolute inset-0 pointer-events-none"
                     style={{
                       backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 27px, ${border} 27px, ${border} 28px)`,
                       opacity: 0.5,
                     }}/>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="a small honest thing…"
                  className="relative w-full h-full min-h-[110px] resize-none bg-transparent outline-none font-serif italic text-[15px] leading-[28px] placeholder:opacity-30"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t mt-2" style={{ borderColor: border }}>
                <span className="text-[10px] opacity-45 tracking-[0.15em] uppercase">{note.length} · yours only</span>
                <button className="group/keep flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase pl-4 pr-1.5 py-1.5 rounded-full transition-all hover:pr-4"
                        style={{ background: ink, color: bg }}>
                  <span>seal</span>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover/keep:rotate-45" style={{ background: bg, color: ink }}>
                    <Plus className="w-3 h-3" strokeWidth={2.2}/>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* ─── THE HOURS · a ritual ribbon + Peace, listening ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          {/* LEFT · THE HOURS */}
          <div className="lg:col-span-7 relative rounded-[32px] p-7 sm:p-9 overflow-hidden"
               style={{ background: surface, border: `1px solid ${border}` }}>
            {/* editorial background — ghost numeral + curl */}
            <div aria-hidden className="pointer-events-none absolute -right-8 -top-14 font-serif select-none"
                 style={{ fontSize: 260, lineHeight: 1, color: ink, opacity: 0.03, letterSpacing: "-0.05em" }}>
              {String(activeRitual + 1).padStart(2, "0")}
            </div>
            <Curl stroke={muted} className="absolute -left-10 -bottom-12 w-[280px] opacity-25 pointer-events-none"/>

            <div className="flex items-start justify-between mb-6 relative">
              <div>
                <div className="text-[10px] tracking-[0.35em] uppercase opacity-55 mb-2" style={{ color: accent }}>the hours · today</div>
                <h3 className="font-serif text-[28px] sm:text-[32px] tracking-tight leading-[1.05]">
                  Four gentle motions,<br/>
                  <em className="italic opacity-70">held by the day.</em>
                </h3>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-[22px] leading-none">1<span className="text-[13px] opacity-55">h</span> 07<span className="text-[13px] opacity-55">m</span></div>
                <div className="text-[9.5px] tracking-[0.3em] uppercase opacity-45 mt-1.5">time offered</div>
              </div>
            </div>

            {/* SUN-ARC TIMELINE — an SVG day passing through 06 → 22 */}
            <div className="relative mb-8">
              <svg viewBox="0 0 600 90" className="w-full h-[70px]" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="arcGrad" x1="0" x2="1">
                    <stop offset="0" stopColor={muted} stopOpacity="0.15"/>
                    <stop offset="0.5" stopColor={accent} stopOpacity="0.55"/>
                    <stop offset="1" stopColor={muted} stopOpacity="0.15"/>
                  </linearGradient>
                </defs>
                {/* the arc — a day, curving */}
                <path d="M 20 80 Q 300 -20 580 80" fill="none" stroke="url(#arcGrad)" strokeWidth="1.2" strokeLinecap="round"/>
                {/* faint hour ticks */}
                {[0.05, 0.25, 0.5, 0.75, 0.95].map((t, i) => {
                  const x = 20 + t * 560;
                  const y = 80 - Math.sin(t * Math.PI) * 100;
                  return <circle key={i} cx={x} cy={y} r="1.2" fill={muted} opacity="0.35"/>;
                })}
                {/* each ritual pinned on the arc at its own hour */}
                {activities.map((a, i) => {
                  const hour = parseInt(a.time.split(":")[0], 10);
                  const t = Math.max(0.02, Math.min(0.98, (hour - 5) / 17));
                  const x = 20 + t * 560;
                  const y = 80 - Math.sin(t * Math.PI) * 100;
                  const isActive = i === activeRitual;
                  return (
                    <g key={i} onClick={() => setActiveRitual(i)} style={{ cursor: "pointer" }}>
                      {isActive && (
                        <>
                          <circle cx={x} cy={y} r="14" fill={accent} opacity="0.18">
                            <animate attributeName="r" values="10;18;10" dur="3s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.28;0.08;0.28" dur="3s" repeatCount="indefinite"/>
                          </circle>
                          <circle cx={x} cy={y} r="7" fill={ink}/>
                          <circle cx={x} cy={y} r="2.5" fill={bg}/>
                        </>
                      )}
                      {!isActive && (
                        <circle cx={x} cy={y} r="4.5" fill={surface} stroke={muted} strokeWidth="1"/>
                      )}
                      <text x={x} y={y + 20} textAnchor="middle" fontSize="8" fill={ink}
                            opacity={isActive ? 0.85 : 0.45}
                            style={{ letterSpacing: "0.15em" }}>
                        {a.time}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="flex justify-between text-[9px] tracking-[0.3em] uppercase opacity-35 -mt-1">
                <span>dawn</span><span>midday</span><span>dusk</span>
              </div>
            </div>

            {/* RITUAL LIST — the four motions, each a moment */}
            <div className="space-y-2 relative">
              {activities.map((a, i) => {
                const isActive = i === activeRitual;
                const done = i < activeRitual;
                return (
                  <button key={a.title}
                          onClick={() => setActiveRitual(i)}
                          onMouseMove={trackCursor}
                          className={`group cursor-glow w-full text-left flex items-center gap-4 py-3.5 pl-4 pr-5 rounded-2xl relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "scale-[1.01]" : "hover:translate-x-1"}`}
                          style={{
                            background: isActive ? ink : "transparent",
                            color: isActive ? bg : ink,
                            border: `1px solid ${isActive ? "transparent" : border}`,
                            boxShadow: isActive ? "0 22px 44px -22px rgba(38,34,28,0.45)" : "none",
                          }}>
                    {/* ghost numeral */}
                    <div className="font-serif italic text-[13px] w-7 shrink-0"
                         style={{ opacity: isActive ? 0.55 : 0.35 }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    {/* ring: shows progress on active, checkmark-dot on done, subtle on future */}
                    <div className="relative w-11 h-11 shrink-0">
                      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
                        <circle cx="22" cy="22" r="19" fill="none"
                                stroke={isActive ? bg : border} strokeOpacity={isActive ? 0.2 : 1} strokeWidth="1.2"/>
                        <circle cx="22" cy="22" r="19" fill="none"
                                stroke={isActive ? bg : (done ? accent : muted)}
                                strokeWidth={isActive ? 1.6 : 1.2}
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 19}
                                strokeDashoffset={2 * Math.PI * 19 * (1 - (isActive ? ritualProgress / 100 : done ? 1 : 0.08))}
                                style={{ transition: "stroke-dashoffset 1.2s ease" }}/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isActive
                          ? <Pause className="w-3.5 h-3.5" style={{ color: bg }} strokeWidth={2}/>
                          : done
                            ? <Mark className="w-4 h-4" opacity={0.85}/>
                            : <Play className="w-3.5 h-3.5 ml-0.5 opacity-70" strokeWidth={2}/>}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <div className="font-serif text-[17px] leading-tight truncate">{a.title}</div>
                        {isActive && (
                          <span className="flex items-end gap-[2px] h-3 ml-0.5" aria-label="now playing">
                            {[0, 1, 2, 3].map((k) => (
                              <span key={k}
                                    className="w-[2px] rounded-full animate-pulse"
                                    style={{
                                      background: accent,
                                      height: `${6 + (k % 2) * 5}px`,
                                      animationDelay: `${k * 0.15}s`,
                                      animationDuration: "1.1s",
                                    }}/>
                            ))}
                          </span>
                        )}
                        {done && !isActive && (
                          <span className="text-[8.5px] tracking-[0.3em] uppercase opacity-45">held</span>
                        )}
                      </div>
                      <div className="text-[11.5px] italic mt-0.5"
                           style={{ color: isActive ? bg : muted, opacity: isActive ? 0.7 : 0.85 }}>
                        {a.subtitle}
                      </div>
                    </div>

                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="font-serif text-[19px] leading-none tabular-nums">
                        {a.minutes}<span className="text-[10px] opacity-55 ml-1">min</span>
                      </div>
                      <div className="text-[9.5px] tracking-[0.25em] mt-1 opacity-50 tabular-nums">{a.time}</div>
                    </div>

                    {/* soft "begin" pill that slides in on hover for inactive rows */}
                    {!isActive && (
                      <span className="hidden sm:flex items-center gap-1.5 text-[9.5px] tracking-[0.3em] uppercase px-3 py-2 rounded-full transition-all duration-500 opacity-0 -mr-6 group-hover:opacity-100 group-hover:mr-0"
                            style={{ background: ink, color: bg }}>
                        begin <ArrowUpRight className="w-2.5 h-2.5"/>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* footer whisper */}
            <div className="mt-6 pt-5 border-t flex items-center justify-between text-[10px] tracking-[0.28em] uppercase"
                 style={{ borderColor: border, color: muted }}>
              <span>you're on ritual {activeRitual + 1} of 4</span>
              <span className="italic tracking-normal opacity-70 normal-case">nothing here is a task. only an offering.</span>
            </div>
          </div>

          {/* RIGHT · PEACE, LISTENING */}
          <div className="lg:col-span-5 relative rounded-[32px] p-6 sm:p-7 flex flex-col overflow-hidden"
               style={{ background: `linear-gradient(180deg, ${surface} 0%, ${surface2} 100%)`, border: `1px solid ${border}` }}>
            {/* ambient wash following the top */}
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl"
                 style={{ background: accent, opacity: 0.16 }}/>
            <Curl stroke={accent} className="absolute -right-6 bottom-6 w-40 opacity-20 pointer-events-none"/>

            {/* HEADER · living avatar */}
            <div className="flex items-center justify-between mb-5 relative">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 shrink-0">
                  {/* breathing concentric rings */}
                  <span className="absolute inset-0 rounded-full animate-breathe"
                        style={{ background: `radial-gradient(circle at 30% 30%, ${accent}55, transparent 65%)` }}/>
                  <span className="absolute inset-1.5 rounded-full"
                        style={{ background: surface, border: `1px solid ${border}` }}/>
                  <span className="absolute inset-0 rounded-full animate-pulse-soft"
                        style={{ boxShadow: `0 0 0 1px ${accent}55 inset` }}/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mark className="w-6 h-6" opacity={0.9}/>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                        style={{ background: bg }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4B6CB7" }}/>
                  </span>
                </div>
                <div>
                  <div className="font-serif text-[18px] leading-none flex items-center gap-2">
                    Peace
                    <span className="text-[8.5px] tracking-[0.3em] uppercase opacity-55 px-1.5 py-0.5 rounded-full"
                          style={{ border: `1px solid ${border}`, color: muted }}>listening</span>
                  </div>
                  <div className="text-[10.5px] italic opacity-60 mt-1">always here · never louder than you</div>
                </div>
              </div>
              <button className="text-[9.5px] tracking-[0.28em] uppercase opacity-55 hover:opacity-100 transition"
                      style={{ color: muted }}>new thread</button>
            </div>

            {/* CONVERSATION */}
            <div className="flex-1 space-y-3 mb-4 min-h-[180px] pr-1 overflow-y-auto scrollbar-none">
              {/* soft day divider */}
              <div className="flex items-center gap-3 opacity-45">
                <span className="h-px flex-1" style={{ background: border }}/>
                <span className="text-[8.5px] tracking-[0.35em] uppercase" style={{ color: muted }}>today · 21:04</span>
                <span className="h-px flex-1" style={{ background: border }}/>
              </div>

              {chatLog.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"} animate-rise`}>
                  {m.from === "peace" && (
                    <span className="font-serif italic text-[26px] leading-none mr-2 select-none opacity-35"
                          style={{ color: accent }}>“</span>
                  )}
                  <div className={`max-w-[80%] text-[12.5px] leading-relaxed px-3.5 py-2.5 ${m.from === "me" ? "rounded-2xl rounded-tr-md" : "rounded-2xl rounded-tl-md font-serif italic"}`}
                       style={m.from === "me"
                         ? { background: ink, color: bg }
                         : { background: bg, border: `1px solid ${border}`, color: ink }}>
                    {m.text}
                  </div>
                </div>
              ))}

              {/* peace is thinking — waveform, not dots */}
              {peaceTyping && (
                <div className="flex justify-start animate-rise">
                  <div className="rounded-full px-4 py-2.5 flex items-end gap-[3px]"
                       style={{ background: bg, border: `1px solid ${border}` }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((k) => (
                      <span key={k}
                            className="w-[2px] rounded-full animate-pulse"
                            style={{
                              background: accent,
                              height: `${4 + ((k * 3) % 9)}px`,
                              animationDelay: `${k * 0.08}s`,
                              animationDuration: "1.1s",
                            }}/>
                    ))}
                    <span className="ml-2 text-[9px] tracking-[0.3em] uppercase italic opacity-55 font-sans not-italic"
                          style={{ color: muted }}>gathering words</span>
                  </div>
                </div>
              )}
            </div>

            {/* SUGGESTION CHIPS — one-tap openings */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {["today feels heavy", "help me sleep", "one honest thing", "I'm scattered"].map((s) => (
                <button key={s}
                        onClick={() => sendToPeace(s)}
                        className="text-[10.5px] italic font-serif px-3 py-1.5 rounded-full transition hover:-translate-y-0.5"
                        style={{ background: bg, border: `1px solid ${border}`, color: ink }}>
                  {s}
                </button>
              ))}
            </div>

            {/* COMPOSER */}
            <form onSubmit={(e) => { e.preventDefault(); sendToPeace(chatInput); }}
                  className="flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 transition-all"
                  style={{ background: bg, border: `1px solid ${border}`, boxShadow: chatInput ? `0 0 0 3px ${accent}22` : "none" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ background: accent }}/>
              <input value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     placeholder="say something soft…"
                     className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:opacity-40 font-serif italic py-1"/>
              <button type="button"
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-opacity ${chatInput ? "opacity-30" : "opacity-100"}`}
                      style={{ border: `1px solid ${border}` }}
                      aria-label="voice">
                <Volume2 className="w-3.5 h-3.5" style={{ color: ink }}/>
              </button>
              <button type="submit"
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${chatInput ? "scale-100" : "scale-90 opacity-70"}`}
                      style={{ background: ink }}
                      aria-label="send">
                <Send className="w-3.5 h-3.5" style={{ color: bg }}/>
              </button>
            </form>

            <div className="mt-3 flex items-center justify-between text-[9px] tracking-[0.28em] uppercase opacity-45"
                 style={{ color: muted }}>
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full" style={{ background: accent }}/> end-to-end soft</span>
              <span className="italic tracking-normal normal-case opacity-90">a small private garden</span>
            </div>
          </div>
        </section>



        {/* COMMUNITY */}
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="text-[10px] tracking-[0.35em] uppercase opacity-50 mb-2" style={{ color: accent }}>a quiet circle</div>
            <h3 className="font-serif text-[26px] tracking-tight">Anonymous gratitude.</h3>
            <p className="text-[12px] italic opacity-55 mt-1.5 max-w-md">little offerings from students, held gently. no names, no likes count as approval — just witness.</p>
          </div>
          <button className="group flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase px-4 py-2.5 rounded-full transition"
                  style={{ background: ink, color: bg }}>
            <Plus className="w-3 h-3 transition-transform group-hover:rotate-90 duration-500"/> offer one
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {posts.map((p, i) => {
            const liked = (likes[i] ?? 0) > 0;
            // subtle rotation of tonal accents within the ONE palette — no color clashes
            const tints = [
              { bg: surface,  ribbon: soft   },
              { bg: surface2, ribbon: accent },
              { bg: surface,  ribbon: deep   },
              { bg: surface2, ribbon: soft   },
            ];
            const t = tints[i % tints.length];
            return (
              <article key={i}
                       onMouseMove={trackCursor}
                       className="group card-lift cursor-glow relative rounded-[28px] p-6 pb-5 cursor-pointer flex flex-col min-h-[220px]"
                       style={{ background: t.bg, border: `1px solid ${border}` }}>
                <span className="shine" aria-hidden />
                {/* delicate top ribbon that widens on hover */}
                <span aria-hidden className="absolute left-6 right-6 top-0 h-[2px] rounded-b-full transition-all duration-500 group-hover:left-3 group-hover:right-3"
                      style={{ background: t.ribbon, opacity: 0.55 }} />

                {/* oversized editorial quote glyph */}
                <div className="absolute -top-2 right-4 font-serif italic leading-none select-none pointer-events-none transition-all duration-500 group-hover:-translate-y-1 group-hover:opacity-40"
                     style={{ fontSize: 96, color: t.ribbon, opacity: 0.18 }}>
                  &ldquo;
                </div>

                {/* header row */}
                <header className="relative flex items-center gap-2.5 mb-4">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: t.ribbon, opacity: 0.9 }}>
                    <Feather className="w-3 h-3" style={{ color: "#FFFFFF" }} strokeWidth={1.6}/>
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10.5px] tracking-[0.22em] uppercase truncate" style={{ color: ink, opacity: 0.75 }}>{p.name}</div>
                    <div className="text-[8.5px] tracking-[0.28em] uppercase opacity-45 mt-0.5">left an offering</div>
                  </div>
                </header>

                {/* body — the whisper */}
                <p className="relative font-serif italic text-[15.5px] leading-[1.45] mb-5" style={{ color: ink }}>
                  {p.text}
                </p>

                {/* hairline that draws in on hover */}
                <div className="mt-auto relative">
                  <div className="h-px w-full mb-3 origin-left transition-transform duration-700 group-hover:scale-x-100 scale-x-[0.25]"
                       style={{ background: t.ribbon, opacity: 0.5 }} />

                  {/* footer — heart, time, and hover-reveal reply/hold */}
                  <div className="flex items-center justify-between relative">
                    <button onClick={(e) => { e.stopPropagation(); setLikes({ ...likes, [i]: (likes[i] ?? 0) + 1 }); }}
                            className="flex items-center gap-2 text-[11px] transition group/heart">
                      <span key={likes[i] ?? 0} className="inline-flex" style={{ animation: liked ? "heart-pop 0.55s cubic-bezier(0.22,1,0.36,1)" : "none" }}>
                        <Heart className={`w-[15px] h-[15px] transition ${liked ? "fill-current" : ""}`}
                               style={{ color: liked ? t.ribbon : muted }} strokeWidth={1.5}/>
                      </span>
                      <span className="font-serif" style={{ color: liked ? ink : muted }}>{p.likes + (likes[i] ?? 0)}</span>
                      <span className="text-[9px] tracking-[0.25em] uppercase opacity-40 hidden sm:inline">held</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button className="reveal flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full"
                              style={{ background: "transparent", border: `1px solid ${border}`, color: ink }}>
                        <MessageCircle className="w-3 h-3" strokeWidth={1.5}/> echo
                      </button>
                      <span className="text-[9px] tracking-[0.22em] uppercase opacity-40 group-hover:opacity-0 transition duration-300">6h ago</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ACHIEVEMENTS + SUPPORT (unified tone, no peach) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-7 rounded-[28px] p-7" style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <div className="text-[10px] tracking-[0.35em] uppercase opacity-50 mb-2" style={{ color: accent }}>small milestones</div>
                <h3 className="font-serif text-[22px] tracking-tight">Seven of twenty, quietly earned.</h3>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {["first breath","seven mornings","one honest note","a walk alone","two weeks steady","empty inbox","early sleep","stillness · 10h"].map((name, i) => {
                const unlocked = i < 4;
                return (
                  <button key={i} title={name}
                       onMouseMove={trackCursor}
                       className="group cursor-glow aspect-square rounded-2xl flex items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-500 hover:-translate-y-1 focus:outline-none"
                       style={{ background: surface2, border: `1px solid ${border}` }}>
                    <Mark className="w-6 h-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" opacity={unlocked ? 0.9 : 0.16}/>
                    {unlocked && <div className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-70" style={{ background: `radial-gradient(circle at 30% 30%,${soft},transparent 70%)` }}/>}
                    {!unlocked && <span className="absolute bottom-1.5 text-[7.5px] tracking-[0.25em] uppercase opacity-40">locked</span>}
                    {/* tooltip */}
                    <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300 text-[8.5px] tracking-[0.25em] uppercase px-2 py-1 rounded-full z-10"
                          style={{ background: ink, color: bg }}>
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[28px] p-7 relative overflow-hidden flex flex-col justify-between gap-4"
               style={{ background: surface2, border: `1px solid ${border}` }}>
            <Curl stroke={accent} className="absolute -right-8 -bottom-8 w-40 opacity-25" />
            <div className="relative flex items-start gap-4">
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: accent }}>
                <Mark className="w-6 h-6"/>
              </div>
              <div className="min-w-0">
                <div className="font-serif text-[18px] leading-tight">Not okay right now?</div>
                <p className="text-[12px] opacity-60 mt-1 italic leading-snug">a trained listener is one soft tap away — always, and in confidence.</p>
              </div>
            </div>
            <div className="relative flex flex-wrap gap-2">
              <button className="text-[11px] tracking-[0.2em] uppercase px-5 py-2.5 rounded-full transition"
                      style={{ background: ink, color: bg }}>talk now</button>
              <button className="text-[11px] tracking-[0.2em] uppercase px-5 py-2.5 rounded-full transition"
                      style={{ border: `1px solid ${border}` }}>text a friend</button>
            </div>
          </div>
        </section>

        <p className="text-center font-serif italic text-[13px] opacity-40 mt-14">
          peace begins with a single breath. — PeaceCode
        </p>
      </main>

      {/* mobile bottom bar — brand mark + hamburger */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-30 rounded-full backdrop-blur-xl px-3 py-2 flex items-center justify-between"
           style={{ background: dark ? "rgba(30,27,23,0.92)" : "rgba(255,251,240,0.94)", border: `1px solid ${border}`, boxShadow: "0 14px 44px -14px rgba(42,39,36,0.28)" }}>
        <button aria-label="PeaceCode" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: dark ? "#223050" : "#EAF3FF" }}>
          <Mark className="w-5 h-5"/>
        </button>
        <div className="flex items-center gap-1 text-[10px] tracking-[0.3em] uppercase" style={{ color: muted }}>
          <span>day 14</span><span className="opacity-40">·</span><span style={{ color: accent }}>bloom</span>
        </div>
        <button aria-label="Open menu" onClick={() => setMenuOpen(true)}
                className="w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95"
                style={{ background: dark ? "#223050" : "#EAF3FF", color: ink }}>
          <Menu className="w-[18px] h-[18px]" strokeWidth={1.6}/>
        </button>
      </nav>

      {/* mobile nav drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 backdrop-blur-md" style={{ background: dark ? "rgba(10,8,6,0.55)" : "rgba(38,34,28,0.28)" }}/>
          <aside onClick={(e) => e.stopPropagation()}
                 className="relative w-[86%] max-w-[340px] m-3 rounded-[32px] flex flex-col overflow-hidden animate-rise"
                 style={{ background: dark ? "rgba(30,27,23,0.98)" : "rgba(255,251,240,0.98)", border: `1px solid ${border}`, boxShadow: "0 40px 80px -30px rgba(20,18,16,0.5)" }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-2.5">
                <Mark className="w-8 h-8"/>
                <div>
                  <div className="font-serif text-[16px] leading-none">PeaceCode</div>
                  <div className="text-[8px] tracking-[0.3em] uppercase opacity-50 mt-1.5">a soft place</div>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface2, color: ink }}>
                <X className="w-4 h-4" strokeWidth={1.6}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-4">
              {navGroups.map((group) => (
                <div key={group.label} className="mt-4">
                  <div className="text-[9px] tracking-[0.32em] uppercase px-3 mb-2" style={{ color: muted }}>{group.label}</div>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = "active" in item && item.active;
                      const to = "to" in item ? (item as { to?: string }).to : undefined;
                      const cls = "flex items-center gap-3 h-12 px-3 rounded-2xl transition";
                      const style = active ? { background: dark ? "#223050" : "#EAF3FF", color: ink } : { color: ink };
                      const inner = (
                        <>
                          <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                style={{ background: active ? (dark ? "#182238" : "#FFFFFF") : (dark ? "#1F2A44" : "#EAF3FF") }}>
                            <Icon className="w-[17px] h-[17px]" strokeWidth={1.5}/>
                          </span>
                          <span className="text-[14px]">{item.label}</span>
                        </>
                      );
                      return to ? (
                        <Link key={item.label} to={to} onClick={() => setMenuOpen(false)} className={cls} style={style}>{inner}</Link>
                      ) : (
                        <button key={item.label} onClick={() => setMenuOpen(false)} className={cls} style={style}>{inner}</button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-6 flex items-center gap-2 px-1">
                <button onClick={() => setDark(!dark)} className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-[12px]"
                        style={{ background: surface2, color: ink }}>
                  {dark ? <Sun className="w-4 h-4" strokeWidth={1.5}/> : <Moon className="w-4 h-4" strokeWidth={1.5}/>}
                  {dark ? "day mode" : "night mode"}
                </button>
                <button className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-[12px]"
                        style={{ background: surface2, color: ink }}>
                  <Settings className="w-4 h-4" strokeWidth={1.5}/> Settings
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

// ─── Today's Composure: luxury morning brief ────────────────────────
type BriefProps = {
  accent: string; ink: string; bg: string; border: string;
  surface: string; surface2: string; muted: string;
};

function TodayBrief({ accent, ink, bg, border, surface, surface2, muted }: BriefProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [hoverStat, setHoverStat] = useState<number | null>(null);
  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const hour = (time ?? new Date(2024, 0, 1, 9, 0)).getHours();
  const salutation =
    hour < 5 ? "still up" :
    hour < 12 ? "good morning" :
    hour < 17 ? "good afternoon" :
    hour < 21 ? "good evening" : "quiet night";

  // score arc — 78 / 100
  const score = 78;
  const R = 52, C = 2 * Math.PI * R;

  const stats = [
    { k: "mood",   v: "grounded",  hint: "steadier than yesterday",       spark: [3,4,3,5,4,6,7] },
    { k: "sleep",  v: "7h 24m",    hint: "within your soft window",       spark: [5,3,6,4,5,7,7] },
    { k: "focus",  v: "2 slow hrs",hint: "one pomodoro already this a.m.",spark: [2,3,3,4,5,4,5] },
    { k: "streak", v: "day 14",    hint: "you're in bloom",               spark: [1,2,2,3,4,5,6] },
  ];

  return (
    <div className="relative rounded-[28px] sm:rounded-[38px] overflow-hidden group card-lift"
         style={{
           background: `linear-gradient(150deg, ${surface} 0%, ${bg} 55%, ${surface2} 100%)`,
           border: `1px solid ${border}`,
           boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 30px 80px -40px rgba(38,34,28,0.28)",
         }}>
      {/* soft grain / ambient ink */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.55]"
           style={{
             background: `radial-gradient(60% 80% at 85% 0%, ${accent}18, transparent 60%),
                          radial-gradient(50% 70% at 0% 100%, ${accent}12, transparent 60%)`
           }}/>
      <Curl stroke={accent} className="absolute -left-6 -bottom-6 w-[180px] sm:w-[240px] opacity-15 pointer-events-none"/>

      <div className="relative p-5 sm:p-8 lg:p-10">
        {/* top line: greeting + live clock */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 gap-3">
          <div className="flex min-w-0 items-center gap-2 text-[9px] sm:text-[10px] tracking-[0.26em] sm:tracking-[0.32em] uppercase truncate" style={{ color: accent, opacity: 0.75 }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: accent }}/>
            <span className="truncate">today's composure</span>
          </div>
          <div className="text-[9px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.28em] uppercase opacity-55 tabular-nums shrink-0">
            {time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "\u00a0"}
          </div>
        </div>

        {/* editorial sentence — dynamic, contextual, personal */}
        {(() => {
          // hour-aware, data-aware insight — the ONE line worth reading
          const insight =
            hour < 5
              ? { lead: "still up", body: "the night has held you long enough. one slow exhale before the pillow." }
              : hour < 12
              ? { lead: "sleep held at 7h 24m", body: "your body arrived rested. a small 10-minute focus would fit here beautifully." }
              : hour < 17
              ? { lead: "mood is steadier than yesterday", body: "you're softly ahead. keep the afternoon light — one pomodoro, then water." }
              : hour < 21
              ? { lead: "you've offered 2 slow hours today", body: "that's plenty. gratitude, three lines, no pressure — the day is closing kindly." }
              : { lead: "the day is winding down", body: "dim the screen. a breath box, then sleep story. tomorrow is not urgent." };
          const cta =
            hour < 12
              ? { label: "start a 10-min focus", target: "focus" }
              : hour < 17
              ? { label: "resume · meditation & movement", target: "meditation" }
              : hour < 21
              ? { label: "open gratitude · 3 lines", target: "gratitude" }
              : { label: "begin sleep story · 12 min", target: "sleep" };
          return (
            <>
              <p className="font-serif text-[19px] sm:text-[26px] lg:text-[30px] leading-[1.22] sm:leading-[1.25] tracking-tight max-w-[640px]"
                 style={{ color: ink, letterSpacing: "-0.02em" }}>
                <span className="italic" style={{ color: accent }}>{salutation}, Jai</span> —{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">{insight.lead}</span>
                  <span className="absolute left-0 right-0 bottom-[3px] h-[6px] rounded-full -z-0"
                        style={{ background: `${accent}25` }}/>
                </span>
                . {insight.body}
              </p>

              {/* the composure ring + stat rail */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
                {/* glass composure ring */}
                <div className="relative w-[118px] h-[118px] sm:w-[140px] sm:h-[140px] shrink-0 mx-auto md:mx-0">
                  <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                    <defs>
                      <linearGradient id="brief-arc" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.9"/>
                        <stop offset="100%" stopColor={ink} stopOpacity="0.85"/>
                      </linearGradient>
                    </defs>
                    <circle cx="70" cy="70" r={R} fill="none" stroke={border} strokeWidth="1.5"/>
                    <circle cx="70" cy="70" r={R} fill="none" stroke="url(#brief-arc)" strokeWidth="4"
                            strokeLinecap="round" strokeDasharray={C}
                            strokeDashoffset={C - (score/100) * C}
                            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}/>
                    <circle cx="70" cy="70" r={R - 10} fill="none" stroke={accent} strokeWidth="0.5" opacity="0.25"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[9px] tracking-[0.32em] uppercase opacity-55" style={{ color: accent }}>peace</div>
                    <div className="font-serif text-[32px] sm:text-[38px] leading-none mt-1 tabular-nums" style={{ color: ink }}>{score}</div>
                    <div className="text-[9px] mt-1 opacity-55">+6 vs. yesterday</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
                  {stats.map((s, i) => {
                    const active = hoverStat === i;
                    const max = Math.max(...s.spark);
                    return (
                      <button key={s.k}
                              onMouseEnter={() => setHoverStat(i)}
                              onMouseLeave={() => setHoverStat(null)}
                              className="text-left rounded-2xl p-2.5 sm:p-4 transition-all duration-300 group/stat"
                              style={{
                                background: active ? bg : "transparent",
                                border: `1px solid ${active ? border : "transparent"}`,
                                transform: active ? "translateY(-2px)" : "none",
                              }}>
                        <div className="text-[8px] sm:text-[8.5px] tracking-[0.26em] sm:tracking-[0.3em] uppercase opacity-55 mb-2" style={{ color: accent }}>{s.k}</div>
                        <div className="font-serif text-[16px] sm:text-[18px] leading-none" style={{ color: ink }}>{s.v}</div>
                        <svg viewBox="0 0 70 22" className="w-full h-[18px] sm:h-[22px] mt-2 sm:mt-3 overflow-visible">
                          <polyline
                            points={s.spark.map((v, idx) => `${(idx / (s.spark.length - 1)) * 70},${22 - (v / max) * 18}`).join(" ")}
                            fill="none" stroke={active ? accent : ink} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"
                            style={{ opacity: active ? 1 : 0.5, transition: "opacity 300ms ease" }}/>
                          <circle cx="70" cy={22 - (s.spark[s.spark.length-1] / max) * 18} r="2" fill={accent}/>
                        </svg>
                        <div className="text-[10px] mt-2 opacity-0 group-hover/stat:opacity-70 transition-opacity leading-snug"
                             style={{ color: muted }}>
                          {s.hint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* one gentle, time-aware nudge — the ONLY CTA */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                       style={{ background: surface2, border: `1px solid ${border}` }}>
                    <Feather className="w-4 h-4" strokeWidth={1.5} style={{ color: accent }}/>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] tracking-[0.3em] uppercase opacity-55 mb-0.5" style={{ color: accent }}>peace suggests</div>
                    <div className="text-[13px] leading-snug" style={{ color: ink }}>
                      {hour < 12
                        ? <>your morning is open — <span className="italic font-serif" style={{ color: accent }}>should we start a 10-minute focus?</span></>
                        : hour < 17
                        ? <>you paused at minute four — <span className="italic font-serif" style={{ color: accent }}>meditation & movement is waiting.</span></>
                        : hour < 21
                        ? <>the day was full — <span className="italic font-serif" style={{ color: accent }}>three lines of gratitude before it closes?</span></>
                        : <>the screens have been long — <span className="italic font-serif" style={{ color: accent }}>a 12-min sleep story would settle you.</span></>}
                    </div>
                  </div>
                </div>
                <button className="group/cta relative overflow-hidden rounded-full px-5 h-11 flex items-center gap-2.5 text-[12px] tracking-wide shrink-0 transition-all duration-300 hover:pr-6"
                        style={{ background: ink, color: bg }}
                        data-target={cta.target}>
                  <span className="relative z-10">{cta.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 relative z-10 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" strokeWidth={1.75}/>
                  <span className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity"
                        style={{ background: `linear-gradient(90deg, ${ink} 0%, ${accent} 120%)` }}/>
                </button>
              </div>
            </>
          );
        })()}

      </div>
    </div>
  );
}

