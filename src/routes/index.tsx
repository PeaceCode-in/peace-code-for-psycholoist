import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Home, Compass, BookOpen, Moon, Sun, Settings, Bell, Play, Pause, Send,
  Heart, Flame, Trophy, Users, Feather, Wind, BookHeart, Search, Plus,
  ChevronRight, ArrowUpRight, Waves, Leaf, Coffee, PenLine, Volume2, VolumeX, Quote,
} from "lucide-react";
import logo from "@/assets/peacecode-logo.png";

export const Route = createFileRoute("/")({ component: Dashboard });

// ─── data ──────────────────────────────────────────────────────────
const days = [
  { n: 7, d: "Mo" }, { n: 8, d: "Tu" }, { n: 9, d: "We" },
  { n: 10, d: "Th" }, { n: 11, d: "Fr" }, { n: 12, d: "Sa" }, { n: 13, d: "Su" },
];

const nav = [
  { icon: Home, label: "Today", active: true },
  { icon: Compass, label: "Explore" },
  { icon: BookOpen, label: "Sessions" },
  { icon: Moon, label: "Sleep" },
  { icon: Users, label: "Circle" },
  { icon: BookHeart, label: "Journal" },
  { icon: Trophy, label: "Milestones" },
];

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

function Dashboard() {
  const [dark, setDark] = useState(false);
  const [day, setDay] = useState(12);
  const [mood, setMood] = useState(3);
  const [breathing, setBreathing] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [likes, setLikes] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");
  const [sound, setSound] = useState(false);
  const [quote, setQuote] = useState(0);
  const [stress, setStress] = useState(28);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    const q = setInterval(() => setQuote((q) => (q + 1) % quotes.length), 8000);
    return () => clearInterval(q);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // ONE unified sepia palette — no green, blue, or peach clashes
  const bg      = dark ? "#141210" : "#f4ecdd";
  const surface = dark ? "#1e1b17" : "#faf3e3";
  const surface2= dark ? "#26221d" : "#ebe0c8";
  const border  = dark ? "#2b2723" : "#e2d6ba";
  const ink     = dark ? "#ece4d2" : "#26221c";
  const muted   = dark ? "#8a8175" : "#8a7f6d";
  const accent  = "#a67c52";  // clay-bronze
  const deep    = "#6b4a30";  // deep clay
  const soft    = "#c9a679";  // wheat

  return (
    <div className={`min-h-screen w-full font-sans transition-colors ${dark ? "dark" : ""}`} style={{ background: bg, color: ink }}>
      {/* soft aurora backdrop — one palette only */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-45 blur-3xl"
             style={{ background: dark ? "radial-gradient(circle,#3a2c1e,transparent 70%)" : "radial-gradient(circle,#e8cfa5,transparent 70%)" }} />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
             style={{ background: dark ? "radial-gradient(circle,#2e2118,transparent 70%)" : "radial-gradient(circle,#dcc59a,transparent 70%)" }} />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
             style={{ background: dark ? "radial-gradient(circle,#3a2823,transparent 70%)" : "radial-gradient(circle,#e5d3b0,transparent 70%)" }} />
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

        <nav className="flex flex-col gap-1.5 px-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="relative flex items-center h-11 rounded-2xl transition"
                      style={item.active ? { background: dark ? "#2b2620" : "#ebe0c8", color: ink } : { color: muted }}>
                <span className="w-[56px] shrink-0 flex justify-center">
                  <Icon className="w-[19px] h-[19px]" strokeWidth={1.4} />
                </span>
                <span className="text-[13px] tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1.5 px-3">
          <button onClick={() => setDark(!dark)} className="flex items-center h-11 rounded-2xl transition" style={{ color: muted }}>
            <span className="w-[56px] shrink-0 flex justify-center">
              {dark ? <Sun className="w-[19px] h-[19px]" strokeWidth={1.4}/> : <Moon className="w-[19px] h-[19px]" strokeWidth={1.4}/>}
            </span>
            <span className="text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">{dark ? "day" : "night"} mode</span>
          </button>
          <button className="flex items-center h-11 rounded-2xl" style={{ color: muted }}>
            <span className="w-[56px] shrink-0 flex justify-center">
              <Settings className="w-[19px] h-[19px]" strokeWidth={1.4}/>
            </span>
            <span className="text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">Settings</span>
          </button>
          <div className="mt-3 mx-1 rounded-2xl flex items-center h-14" style={{ background: dark ? "#26221d" : "#ebe0c8" }}>
            <span className="w-[52px] shrink-0 flex justify-center">
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
      <main ref={mainRef} className="relative z-10 lg:pl-[120px] lg:pr-10 xl:pr-14 px-5 sm:px-8 py-8 lg:py-12 pb-32 lg:pb-16 max-w-[1600px] mx-auto">

        {/* HERO — quiet editorial band */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
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

            <div className="relative">
              {/* decorative sprig — sits behind title, right side */}
              <Sprig stroke={accent} className="hidden sm:block absolute -right-2 lg:right-8 -top-6 w-[90px] lg:w-[130px] opacity-25 pointer-events-none"/>
              <Curl stroke={accent} className="hidden lg:block absolute -left-10 top-24 w-[220px] opacity-20 pointer-events-none"/>

              <h1 className="font-serif font-medium text-[44px] xs:text-[52px] sm:text-[76px] lg:text-[96px] xl:text-[112px] leading-[1.02] lg:leading-[0.98] tracking-tight relative" style={{ letterSpacing: "-0.04em" }}>
                <span className="italic font-normal block" style={{ color: accent }}>Softly,</span>
                <span className="block">you begin</span>
                <span className="block">again<span style={{ color: accent }}>.</span></span>
              </h1>
            </div>

            <p className="text-[13px] sm:text-[14px] mt-8 lg:mt-10 opacity-60 max-w-md leading-relaxed">
              A slow look at how your mind and moments are moving today. No pressure — just presence.
            </p>

            {/* editorial day rail */}
            <div className="mt-12 lg:mt-14 relative">
              <div className="absolute left-0 right-0 top-1/2 h-px opacity-40" style={{ background: border }} />
              <div className="relative flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none pb-1">
                {days.map((dd) => {
                  const active = day === dd.n;
                  return (
                    <button key={dd.n} onClick={() => setDay(dd.n)}
                            className="shrink-0 group/day flex flex-col items-center justify-center relative w-[54px] sm:w-[62px] transition-all">
                      <div className="text-[8.5px] tracking-[0.28em] uppercase mb-2 transition-colors"
                           style={{ color: active ? accent : muted, opacity: active ? 1 : 0.55 }}>
                        {dd.d}
                      </div>
                      <div className={`flex items-center justify-center rounded-full font-serif transition-all duration-300 ${active ? "w-[54px] h-[54px] sm:w-[62px] sm:h-[62px] text-[22px]" : "w-11 h-11 text-[17px] hover:scale-105"}`}
                           style={active
                              ? { background: ink, color: bg, boxShadow: "0 12px 28px -12px rgba(38,34,28,0.55)" }
                              : { background: "transparent", color: ink, border: `1px solid ${border}` }}>
                        {dd.n}
                      </div>
                      <div className="mt-2 h-1 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full transition-all" style={{ background: active ? accent : "transparent" }}/>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* right: featured stillness — cinematic single anchor */}
          <div className="lg:col-span-4">
            <div className="relative rounded-[36px] overflow-hidden aspect-[4/5] p-7 flex flex-col justify-between cursor-pointer group"
                 style={{ background: `linear-gradient(160deg,${soft} 0%,${accent} 50%,${deep} 100%)` }}>
              <Curl stroke="#f5eee0" className="absolute -left-6 top-8 w-[220px] opacity-40 group-hover:translate-x-2 transition duration-700" />
              <Mark className="absolute -right-12 -bottom-12 w-72 h-72 group-hover:scale-110 transition duration-[1200ms]" opacity={0.16}/>
              <div className="relative">
                <div className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: "#f5eee0" }}>a walk with breath</div>
                <div className="font-serif text-[38px] lg:text-[46px] leading-[0.95]" style={{ color: "#2a1f14" }}>
                  Meditation<br/><em className="italic font-light">&amp; movement</em>
                </div>
              </div>
              <div className="relative flex items-end justify-between">
                <div style={{ color: "#2a1f14" }}>
                  <div className="font-serif italic text-xl">24 min</div>
                  <div className="opacity-60 tracking-[0.25em] uppercase text-[9px] mt-1">gentle · guided</div>
                </div>
                <button className="w-14 h-14 rounded-full flex items-center justify-center transition group-hover:scale-105" style={{ background: "#26221c" }}>
                  <Play className="w-4 h-4 ml-0.5" style={{ color: "#faf3e3" }} strokeWidth={2}/>
                </button>
              </div>
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
                       className="w-full accent-[#a67c52]"/>
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

        {/* BENTO ROW: breathing orb · timer · quote — unified glass */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mb-16">
          {/* breathing orb */}
          <div className="lg:col-span-4 rounded-[32px] p-6 relative overflow-hidden"
               style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50">box breathing</div>
              <button onClick={() => setBreathing(!breathing)}
                      className="text-[10px] tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full transition"
                      style={{ background: ink, color: bg }}>
                {breathing ? "pause" : "begin"}
              </button>
            </div>
            <div className="flex items-center justify-center py-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, ${soft}55, ${accent}22 60%, transparent 80%)`, animation: breathing ? "breathe-orb 8s ease-in-out infinite" : "none" }}/>
                <div className="absolute inset-4 rounded-full backdrop-blur-md" style={{ background: `radial-gradient(circle at 30% 30%, ${soft}, ${accent})`, boxShadow: `inset 0 0 40px rgba(255,255,255,0.35), inset 0 -20px 40px ${deep}55`, animation: breathing ? "breathe-orb 8s ease-in-out infinite" : "none" }}/>
                <Mark className="relative w-12 h-12" opacity={0.9}/>
              </div>
            </div>
            <div className="font-serif italic text-center text-[13px] opacity-60">
              {breathing ? "in… hold… out… hold…" : "four seconds each side"}
            </div>
            <style>{`@keyframes breathe-orb{0%,100%{transform:scale(0.86);opacity:0.85}50%{transform:scale(1.06);opacity:1}}`}</style>
          </div>

          {/* pomodoro — dark cinematic (same warm ink) */}
          <div className="lg:col-span-4 rounded-[32px] p-6 relative overflow-hidden" style={{ background: "#26221c", color: "#f4ecdd" }}>
            <Curl stroke="#f4ecdd" className="absolute -right-8 -bottom-8 w-52 opacity-15" />
            <div className="relative flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] tracking-[0.3em] uppercase opacity-50">a slow hour</div>
                <div className="text-[10px] italic opacity-60">pomodoro · deep focus</div>
              </div>
              <div className="font-serif text-[76px] leading-none tracking-tight text-center my-6" style={{ letterSpacing: "-0.03em" }}>
                {mm}<span className="opacity-30">:</span>{ss}
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => setRunning(!running)}
                        className="flex-1 rounded-full py-3 text-[11px] tracking-[0.25em] uppercase flex items-center justify-center gap-2"
                        style={{ background: "#f4ecdd", color: "#26221c" }}>
                  {running ? <Pause className="w-3 h-3"/> : <Play className="w-3 h-3"/>}
                  {running ? "pause" : "begin"}
                </button>
                <button onClick={() => { setRunning(false); setSeconds(25 * 60); }}
                        className="px-5 rounded-full text-[11px] tracking-[0.25em] uppercase opacity-70 hover:opacity-100"
                        style={{ border: "1px solid rgba(244,236,221,0.15)" }}>reset</button>
                <button onClick={() => setSound(!sound)} className="w-11 rounded-full flex items-center justify-center opacity-70 hover:opacity-100"
                        style={{ border: "1px solid rgba(244,236,221,0.15)" }}>
                  {sound ? <Volume2 className="w-3.5 h-3.5"/> : <VolumeX className="w-3.5 h-3.5"/>}
                </button>
              </div>
            </div>
          </div>

          {/* quote */}
          <div className="lg:col-span-4 rounded-[32px] p-7 relative overflow-hidden flex flex-col justify-between"
               style={{ background: surface, border: `1px solid ${border}` }}>
            <Quote className="w-8 h-8 opacity-25" strokeWidth={1}/>
            <div>
              <p className="font-serif text-[19px] leading-[1.35] italic transition-opacity duration-500" style={{ color: ink }}>
                "{quotes[quote].t}"
              </p>
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mt-4">— {quotes[quote].a}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {quotes.map((_, i) => (
                <button key={i} onClick={() => setQuote(i)} className="h-[3px] rounded-full transition-all"
                        style={{ width: quote === i ? 24 : 8, background: quote === i ? accent : border }}/>
              ))}
            </div>
          </div>
        </section>

        {/* FOCUS TOOLKIT — monochrome, minimal */}
        <div className="flex items-baseline justify-between mb-5 mt-2">
          <div>
            <div className="text-[10px] tracking-[0.35em] uppercase opacity-50 mb-2" style={{ color: accent }}>quiet toolkit</div>
            <h3 className="font-serif text-[26px] tracking-tight">Six ways in.</h3>
          </div>
          <span className="text-[10px] tracking-[0.25em] uppercase opacity-50 hidden sm:block">tap · no pressure</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-16">
          {focusTools.map((t) => {
            const I = t.icon;
            return (
              <button key={t.label}
                      className="group relative overflow-hidden rounded-[24px] aspect-square p-5 flex flex-col justify-between text-left transition hover:-translate-y-1 duration-200"
                      style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between">
                  <I className="w-5 h-5 opacity-70" strokeWidth={1.3}/>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition"/>
                </div>
                <div>
                  <div className="font-serif text-[19px] leading-none tracking-tight">{t.label}</div>
                  <div className="text-[9px] tracking-[0.2em] uppercase opacity-50 mt-2">{t.hint}</div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"
                     style={{ background: `radial-gradient(circle at 80% 100%, ${soft}30, transparent 60%)` }}/>
              </button>
            );
          })}
        </div>

        {/* JOURNEY + JOURNAL */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          <div className="lg:col-span-8 rounded-[36px] p-7 sm:p-10 relative overflow-hidden"
               style={{ background: `linear-gradient(135deg, ${surface2} 0%, ${surface} 100%)`, border: `1px solid ${border}` }}>
            <Sprig stroke={accent} className="absolute right-10 top-1/2 -translate-y-1/2 w-20 opacity-30 hidden md:block" />
            <div className="flex items-start justify-between mb-10 relative">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-2">the slow journey</div>
                <h3 className="font-serif text-[30px] leading-[1.05] max-w-md">
                  Fourteen days in — <em className="italic" style={{ color: accent }}>halfway to bloom.</em>
                </h3>
              </div>
            </div>
            <div className="relative flex items-center justify-between overflow-x-auto scrollbar-none">
              <div className="absolute left-4 right-4 top-4 h-px" style={{ background: dark ? "#3a3630" : "#c9b99a" }}/>
              <div className="absolute left-4 top-4 h-px transition-all duration-1000" style={{ width: "40%", background: accent }}/>
              {journey.map((m) => (
                <div key={m.day} className="relative flex flex-col items-center gap-3 z-10 shrink-0 px-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-[12px] transition"
                       style={m.current ? { background: ink, color: bg, transform: "scale(1.25)" }
                                        : m.done ? { background: accent, color: "#faf3e3" }
                                                 : { background: surface, color: muted, border: `1px solid ${dark ? "#3a3630" : "#c9b99a"}` }}>
                    {m.day}
                  </div>
                  <span className="text-[9px] tracking-[0.2em] uppercase opacity-60">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-[36px] p-7 relative overflow-hidden flex flex-col"
               style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50">one line, tonight</div>
              <PenLine className="w-4 h-4 opacity-40"/>
            </div>
            <h3 className="font-serif text-[22px] leading-tight mb-4">
              What's <em className="italic" style={{ color: accent }}>staying with you</em>?
            </h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="a small honest thing…"
                      className="flex-1 min-h-[100px] w-full resize-none bg-transparent outline-none font-serif italic text-[15px] placeholder:opacity-30 leading-relaxed"/>
            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: border }}>
              <span className="text-[10px] opacity-40">{note.length} · saved to you only</span>
              <button className="text-[10px] tracking-[0.25em] uppercase px-4 py-2 rounded-full" style={{ background: ink, color: bg }}>
                keep
              </button>
            </div>
          </div>
        </section>

        {/* ACTIVITIES + CHAT */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          <div className="lg:col-span-7">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <div className="text-[10px] tracking-[0.35em] uppercase opacity-50 mb-2" style={{ color: accent }}>small things, today</div>
                <h3 className="font-serif text-[26px] tracking-tight">Four gentle motions.</h3>
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase opacity-50">1h · 07m</span>
            </div>
            <div className="space-y-2">
              {activities.map((a, i) => (
                <div key={a.title} className="group flex items-center gap-4 py-4 px-5 rounded-2xl transition cursor-pointer hover:translate-x-1"
                     style={{ background: surface, border: `1px solid ${border}` }}>
                  <div className="font-serif italic text-[13px] opacity-40 w-6">0{i + 1}</div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: surface2 }}>
                    <Mark className="w-5 h-5" opacity={0.75}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-[17px] leading-tight truncate">{a.title}</div>
                    <div className="text-[11px] italic opacity-50 mt-0.5">{a.subtitle}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-serif text-[18px] leading-none">{a.minutes}<span className="text-[10px] opacity-50 ml-1">min</span></div>
                    <div className="text-[10px] tracking-widest opacity-40 mt-1">{a.time}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-70 transition"/>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-[28px] p-6 flex flex-col"
               style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ background: surface2 }}>
                  <Mark className="w-5 h-5"/>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: accent, borderColor: surface }}/>
                </div>
                <div>
                  <div className="font-serif text-[16px] leading-tight">Peace</div>
                  <div className="text-[10px] italic opacity-50">a gentle listener · here now</div>
                </div>
              </div>
              <button className="text-[10px] tracking-[0.25em] uppercase opacity-50">new</button>
            </div>

            <div className="flex-1 space-y-2.5 mb-4 min-h-[140px]">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-md text-[12px] px-3.5 py-2.5" style={{ background: ink, color: bg }}>
                  I've felt tight lately. Sleep is uneven.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md text-[12.5px] px-3.5 py-2.5 font-serif italic" style={{ background: surface2 }}>
                  I hear you. When did the tightness first arrive?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-full px-3 py-2 flex gap-1" style={{ background: surface2 }}>
                  <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: muted }}/>
                  <span className="w-1 h-1 rounded-full animate-pulse [animation-delay:0.15s]" style={{ background: muted }}/>
                  <span className="w-1 h-1 rounded-full animate-pulse [animation-delay:0.3s]" style={{ background: muted }}/>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5" style={{ background: surface2 }}>
              <input placeholder="say something soft…" className="flex-1 bg-transparent outline-none text-[12px] placeholder:opacity-40 font-serif italic"/>
              <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: ink }}>
                <Send className="w-3 h-3" style={{ color: bg }}/>
              </button>
            </div>
          </div>
        </section>

        {/* COMMUNITY */}
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="text-[10px] tracking-[0.35em] uppercase opacity-50 mb-2" style={{ color: accent }}>a quiet circle</div>
            <h3 className="font-serif text-[26px] tracking-tight">Anonymous gratitude.</h3>
          </div>
          <button className="text-[10px] tracking-[0.25em] uppercase opacity-60 hover:opacity-100 flex items-center gap-1">
            <Plus className="w-3 h-3"/> share
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-16">
          {posts.map((p, i) => (
            <div key={i} className="group rounded-[24px] p-5 transition cursor-pointer relative overflow-hidden hover:-translate-y-1 duration-200"
                 style={{ background: surface, border: `1px solid ${border}` }}>
              <Curl stroke={accent} className="absolute -right-6 -top-6 w-24 opacity-20" />
              <div className="text-[10px] tracking-[0.25em] uppercase opacity-50 mb-3 relative">{p.name}</div>
              <p className="font-serif italic text-[15px] leading-snug mb-5 opacity-90 relative">"{p.text}"</p>
              <div className="flex items-center justify-between relative">
                <button onClick={() => setLikes({ ...likes, [i]: (likes[i] ?? 0) + 1 })}
                        className="flex items-center gap-1.5 text-[11px] opacity-70 hover:opacity-100 transition" style={{ color: accent }}>
                  <Heart className={`w-3.5 h-3.5 transition ${likes[i] ? "fill-current" : ""}`} strokeWidth={1.5}/>
                  {p.likes + (likes[i] ?? 0)}
                </button>
                <span className="text-[9px] opacity-40 tracking-widest uppercase">6h ago</span>
              </div>
            </div>
          ))}
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
              {Array.from({ length: 8 }).map((_, i) => {
                const unlocked = i < 4;
                return (
                  <div key={i}
                       className="aspect-square rounded-2xl flex items-center justify-center transition hover:scale-110 cursor-pointer relative overflow-hidden"
                       style={{ background: surface2, border: `1px solid ${border}` }}>
                    <Mark className="w-6 h-6" opacity={unlocked ? 0.85 : 0.18}/>
                    {unlocked && <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 30% 30%,${soft},transparent 70%)` }}/>}
                  </div>
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

      {/* mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-30 rounded-full backdrop-blur-xl px-2 py-2 flex items-center justify-around"
           style={{ background: dark ? "rgba(30,27,23,0.92)" : "rgba(255,251,240,0.94)", border: `1px solid ${border}`, boxShadow: "0 12px 40px -12px rgba(42,39,36,0.22)" }}>
        {nav.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} aria-label={item.label}
                    className="relative flex flex-col items-center justify-center w-12 h-11 rounded-full transition"
                    style={item.active ? { background: dark ? "#2b2620" : "#ebe0c8", color: ink } : { color: muted }}>
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.5}/>
              {item.active && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full" style={{ background: accent }}/>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
