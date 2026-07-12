import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen, Moon, Sun, Settings, Bell, Send, Heart, Flame, Users, Feather,
  Wind, Search, ChevronRight, ArrowUpRight, Leaf, PenLine, Volume2,
  Bot, CalendarCheck, UserCheck, ClipboardList, Target, Activity, Brain, Menu, X,
  LifeBuoy, Sparkles,
} from "lucide-react";
import logo from "@/assets/peacecode-logo.png";

export const Route = createFileRoute("/")({ component: Dashboard });

// ─── data ──────────────────────────────────────────────────────────
const navGroups = [
  { label: "Core Care", items: [
    { icon: Bot, label: "Peace Bot", active: true },
    { icon: CalendarCheck, label: "Counseling" },
    { icon: UserCheck, label: "Experts" },
    { icon: ClipboardList, label: "Screening" },
  ]},
  { label: "Wellness Tools", items: [
    { icon: Wind, label: "Breathe" },
    { icon: Target, label: "Focus" },
    { icon: Heart, label: "Gratitude" },
    { icon: PenLine, label: "Journal" },
    { icon: Activity, label: "Mood Tracker" },
    { icon: Brain, label: "Mind Gym" },
  ]},
  { label: "Community", items: [
    { icon: Users, label: "Community" },
    { icon: BookOpen, label: "Resources" },
  ]},
] as const;

// mood week — used by garden illustration
type MoodKind = "bloom" | "fern" | "bud" | "coil" | "sprout";
const moodWeek: { d: string; kind: MoodKind; label: string }[] = [
  { d: "Th", kind: "coil",   label: "restless" },
  { d: "Fr", kind: "bud",    label: "quiet" },
  { d: "Sa", kind: "sprout", label: "opening" },
  { d: "Su", kind: "fern",   label: "steady" },
  { d: "Mo", kind: "bud",    label: "tender" },
  { d: "Tu", kind: "fern",   label: "grounded" },
  { d: "We", kind: "bloom",  label: "at ease" },
];

const focusExperience = {
  kicker: "for right now, gently",
  title: "Meditation",
  italic: "& movement",
  mins: 24,
  reason: "You slept well but your afternoon has been heavy on screens. A slow walk with breath will unknot the shoulders.",
};

const alternates = [
  { title: "Sleep stories",   mins: 32 },
  { title: "Deep focus",      mins: 45 },
  { title: "Anxiety release", mins: 12 },
  { title: "Evening thread",  mins: 8  },
];

const campus = [
  { name: "someone kind", text: "grateful my roommate made chai without asking today.", tone: "warm" },
  { name: "a quiet friend", text: "finished a whole week of morning stillness. it's working.", tone: "soft" },
  { name: "anon",           text: "called mom instead of scrolling. small, but mine.",         tone: "hush" },
  { name: "night owl",      text: "slept eight hours. haven't in a month. tiny miracle.",     tone: "cool" },
  { name: "in the library", text: "someone left a note on my table — 'you're doing okay'.",   tone: "warm" },
  { name: "hostel window",  text: "rain today. i just watched. no phone. it counted.",        tone: "cool" },
];

const quickActions = [
  { label: "Breathe",   sub: "four counts, four times",       icon: Wind,     tone: "sky"      },
  { label: "Focus",     sub: "a slow hour, no notifications", icon: Target,   tone: "lavender" },
  { label: "Journal",   sub: "one honest line, that's all",   icon: PenLine,  tone: "cream"    },
  { label: "Gratitude", sub: "name three, softly",            icon: Heart,    tone: "blush"    },
];

// ─── little atoms ──────────────────────────────────────────────────
function Mark({ className = "w-5 h-5", opacity = 1 }: { className?: string; opacity?: number }) {
  return <img src={logo} alt="" className={className} style={{ opacity }} draggable={false}/>;
}

// A hand-drawn plant. Kind picks the silhouette; opacity + scale animate.
function Plant({ kind, stroke, active = false }: { kind: MoodKind; stroke: string; active?: boolean }) {
  const common = { fill: "none" as const, stroke, strokeWidth: 1.15, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const wrap = `origin-bottom transition-transform duration-700 ease-out ${active ? "scale-105" : "scale-100"}`;
  return (
    <svg viewBox="0 0 80 140" className={`w-full h-full ${wrap}`}>
      {kind === "bloom" && (
        <g {...common}>
          <path d="M40 138 C 40 100, 40 70, 40 40"/>
          <path d="M40 90 C 22 88, 14 76, 14 60"/>
          <path d="M40 78 C 58 76, 66 64, 66 48"/>
          <circle cx="40" cy="30" r="10"/>
          <circle cx="30" cy="22" r="6"/>
          <circle cx="50" cy="22" r="6"/>
          <circle cx="40" cy="14" r="6"/>
        </g>
      )}
      {kind === "fern" && (
        <g {...common}>
          <path d="M40 138 C 40 100, 40 70, 40 34"/>
          <path d="M40 122 C 28 120, 22 112, 22 100"/>
          <path d="M40 108 C 54 106, 60 96, 60 84"/>
          <path d="M40 92  C 28 90, 22 82, 22 70"/>
          <path d="M40 76  C 54 74, 60 64, 60 52"/>
          <path d="M40 60  C 30 58, 26 50, 26 40"/>
          <circle cx="40" cy="32" r="2"/>
        </g>
      )}
      {kind === "sprout" && (
        <g {...common}>
          <path d="M40 138 C 40 118, 40 100, 40 78"/>
          <path d="M40 96 C 26 92, 20 82, 22 68"/>
          <path d="M40 88 C 56 84, 62 74, 60 60"/>
          <path d="M40 76 Q 32 70 34 62"/>
          <path d="M40 76 Q 48 70 46 62"/>
        </g>
      )}
      {kind === "bud" && (
        <g {...common}>
          <path d="M40 138 C 40 122, 40 104, 40 88"/>
          <path d="M40 100 Q 30 96 30 88"/>
          <ellipse cx="40" cy="82" rx="7" ry="10"/>
        </g>
      )}
      {kind === "coil" && (
        <g {...common}>
          <path d="M40 138 C 42 122, 38 108, 40 94"/>
          <path d="M40 94 C 30 92, 26 84, 30 76 C 34 68, 44 68, 46 76 C 48 84, 40 88, 36 84"/>
        </g>
      )}
    </svg>
  );
}

// The "living" hero bloom — organic SVG shape.
function HeroBloom({ tone, accent }: { tone: string; accent: string }) {
  return (
    <svg viewBox="0 0 400 500" className="w-full h-full">
      <defs>
        <radialGradient id="bloomA" cx="50%" cy="45%" r="55%">
          <stop offset="0%"  stopColor={tone} stopOpacity="0.9"/>
          <stop offset="60%" stopColor={tone} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={tone} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="bloomStem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={accent} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={accent} stopOpacity="0.75"/>
        </linearGradient>
      </defs>
      {/* halo */}
      <ellipse cx="200" cy="220" rx="180" ry="180" fill="url(#bloomA)"/>
      {/* stem */}
      <path d="M200 500 C 202 400, 198 320, 200 220" fill="none" stroke="url(#bloomStem)" strokeWidth="2" strokeLinecap="round"/>
      {/* leaves */}
      <path d="M200 380 C 150 372, 122 348, 118 310" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.55"/>
      <path d="M200 340 C 254 332, 284 306, 288 268" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.55"/>
      <path d="M200 300 C 156 292, 130 268, 128 232" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.45"/>
      {/* six-petal bloom */}
      <g transform="translate(200 200)">
        {[0, 60, 120, 180, 240, 300].map((r) => (
          <ellipse key={r} cx="0" cy="-38" rx="18" ry="42" fill={tone} opacity="0.55" transform={`rotate(${r})`}/>
        ))}
        <circle r="18" fill={accent} opacity="0.55"/>
        <circle r="10" fill={tone} opacity="0.9"/>
      </g>
      {/* falling seeds */}
      <g fill={accent} opacity="0.4">
        <circle cx="90"  cy="130" r="2"/>
        <circle cx="330" cy="90"  r="1.6"/>
        <circle cx="60"  cy="260" r="1.4"/>
        <circle cx="360" cy="320" r="1.8"/>
        <circle cx="120" cy="420" r="1.5"/>
      </g>
    </svg>
  );
}

// Karma Forest — a full-bleed SVG grove.
function KarmaForest({ ink, glow, dim }: { ink: string; glow: string; dim: string }) {
  // Deterministic tree positions (no Math.random — avoids SSR mismatch).
  const trees = Array.from({ length: 68 }, (_, i) => {
    const col = i % 17;
    const row = Math.floor(i / 17);
    const jitterX = ((i * 37) % 13) - 6;
    const jitterY = ((i * 53) % 9) - 4;
    const x = 40 + col * 68 + jitterX + row * 8;
    const y = 90 + row * 60 + jitterY;
    const scale = 0.75 + ((i * 11) % 40) / 100;
    const mine = i === 22 || i === 39 || i === 51; // Jai's three trees
    return { x, y, scale, mine };
  });
  return (
    <svg viewBox="0 0 1200 380" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="glowMine" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor={glow} stopOpacity="0.55"/>
          <stop offset="60%" stopColor={glow} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={glow} stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* horizon */}
      <line x1="0" y1="330" x2="1200" y2="330" stroke={ink} strokeOpacity="0.15" strokeWidth="1"/>
      {trees.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.scale})`}>
          {t.mine && <circle cx="0" cy="30" r="60" fill="url(#glowMine)"/>}
          <line x1="0" y1="0" x2="0" y2="60" stroke={t.mine ? glow : ink} strokeOpacity={t.mine ? 0.9 : 0.35} strokeWidth="1"/>
          <path d={`M -14 20 Q 0 -8 14 20`}   fill="none" stroke={t.mine ? glow : dim} strokeOpacity={t.mine ? 0.85 : 0.5} strokeWidth="1"/>
          <path d={`M -10 34 Q 0 10 10 34`}   fill="none" stroke={t.mine ? glow : dim} strokeOpacity={t.mine ? 0.7 : 0.35} strokeWidth="1"/>
        </g>
      ))}
    </svg>
  );
}

// ─── main ──────────────────────────────────────────────────────────
function Dashboard() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [likedPost, setLikedPost] = useState<Record<number, boolean>>({});
  const [savedReflection, setSavedReflection] = useState(false);

  // Peace AI conversation — session memory
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{ from: "me" | "peace"; text: string }[]>([]);
  const [peaceTyping, setPeaceTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Weekly reflection — AI-written
  const [reflection, setReflection] = useState<string | null>(null);
  const [reflectionErr, setReflectionErr] = useState(false);

  // Hero AI insight — one warm line
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog.length, peaceTyping]);

  const greeting = useMemo(() => {
    if (!now) return "hello";
    const h = now.getHours();
    if (h < 5)  return "still awake";
    if (h < 12) return "good morning";
    if (h < 17) return "good afternoon";
    if (h < 21) return "good evening";
    return "soft night";
  }, [now]);

  // Fetch hero insight & weekly reflection on mount
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        // insight (one line)
        const r1 = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [{ from: "me", text: "in one short poetic sentence (max 18 words), tell me what you notice about my day so far — reference my sleep (7h 24m), grounded mood, and day 14 streak. no greeting, no advice, just the noticing." }] }),
        });
        const d1 = await r1.json();
        if (!cancelled && d1.reply) setInsight(String(d1.reply).replace(/^["']|["']$/g, ""));

        // weekly reflection (paragraph)
        const r2 = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [{ from: "me", text: "write a short, private weekly reflection for me — 4 to 6 sentences, lowercase, warm and specific. reference: 6 of 7 mornings held, sleep steadied around 7h, one restless night, two slow walks, one honest journal entry, and how i showed up for a friend on tuesday. end with one soft line about the week ahead. do not use bullet points, do not add a title. just prose." }] }),
        });
        const d2 = await r2.json();
        if (!cancelled) {
          if (d2.reply) setReflection(String(d2.reply));
          else setReflectionErr(true);
        }
      } catch {
        if (!cancelled) setReflectionErr(true);
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  async function sendToPeace(text: string) {
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
      const data = await res.json() as { reply?: string };
      if (!res.ok || !data.reply) {
        const fallback = res.status === 429
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
  }

  // palette — soft blue / lavender system
  const bg      = dark ? "#0F1626" : "#F7FAFF";
  const surface = dark ? "#182238" : "#FFFFFF";
  const surface2= dark ? "#1F2A44" : "#EAF3FF";
  const border  = dark ? "#2A3654" : "#DCE3EF";
  const ink     = dark ? "#E8EEFB" : "#1D2A44";
  const muted   = dark ? "#8B9AB8" : "#7587A6";
  const accent  = "#4B6CB7";
  const soft    = "#AFC9F5";
  const lavender= "#D5C9F7";

  const toneFor = (t: string) => t === "sky" ? soft : t === "lavender" ? lavender : t === "blush" ? "#F1D5E3" : "#F4EBD8";

  const timeLabel = mounted && now
    ? now.toLocaleString("en-US", { weekday: "long", day: "numeric", month: "long" }).toLowerCase()
    : "";
  const clock = mounted && now
    ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    : "";

  return (
    <div className={`min-h-screen w-full font-sans transition-colors ${dark ? "dark" : ""}`} style={{ background: bg, color: ink }}>
      {/* aurora backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-45 blur-3xl"
             style={{ background: `radial-gradient(circle,${dark ? "#1E2A48" : lavender},transparent 70%)` }} />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
             style={{ background: `radial-gradient(circle,${dark ? "#182238" : soft},transparent 70%)` }} />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
             style={{ background: `radial-gradient(circle,${dark ? "#22304E" : "#EAF3FF"},transparent 70%)` }} />
      </div>

      {/* ─── sidebar ─── */}
      <aside className="hidden lg:flex fixed top-6 bottom-6 left-6 z-40 group flex-col py-6 rounded-[38px] backdrop-blur-2xl transition-[width] duration-300 ease-out hover:w-60 w-[80px] overflow-hidden"
             style={{ background: dark ? "rgba(18,22,38,0.75)" : "rgba(255,255,255,0.78)", border: `1px solid ${border}`, boxShadow: "0 30px 60px -30px rgba(29,42,68,0.22)" }}>
        <div className="flex items-center h-12 mb-8">
          <div className="w-[80px] shrink-0 flex justify-center"><Mark className="w-9 h-9"/></div>
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
                return (
                  <button key={item.label} className="relative flex items-center h-11 rounded-2xl transition"
                          style={active ? { background: dark ? "#223050" : "#EAF3FF", color: ink } : { color: muted }}>
                    <span className="w-[56px] shrink-0 flex justify-center">
                      <Icon className="w-[19px] h-[19px]" strokeWidth={1.4} />
                    </span>
                    <span className="text-[13px] tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 mt-4 mx-3 pt-3 flex flex-col gap-1" style={{ borderTop: `1px solid ${border}` }}>
          <button className="flex items-center h-10 rounded-2xl transition" style={{ color: muted }}>
            <span className="w-[56px] shrink-0 flex justify-center"><LifeBuoy className="w-[17px] h-[17px]" strokeWidth={1.4}/></span>
            <span className="text-[12px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">Support · iCall</span>
          </button>
          <button onClick={() => setDark(!dark)} className="flex items-center h-10 rounded-2xl transition" style={{ color: muted }}>
            <span className="w-[56px] shrink-0 flex justify-center">
              {dark ? <Sun className="w-[19px] h-[19px]" strokeWidth={1.4}/> : <Moon className="w-[19px] h-[19px]" strokeWidth={1.4}/>}
            </span>
            <span className="text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">{dark ? "day" : "night"} mode</span>
          </button>
          <button className="flex items-center h-10 rounded-2xl transition" style={{ color: muted }}>
            <span className="w-[56px] shrink-0 flex justify-center"><Settings className="w-[19px] h-[19px]" strokeWidth={1.4}/></span>
            <span className="text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 -ml-1">Settings</span>
          </button>
          <div className="mt-2 rounded-2xl flex items-center h-14" style={{ background: dark ? "#1F2A44" : "#EAF3FF" }}>
            <span className="w-[56px] shrink-0 flex justify-center">
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: soft }}>
                <Mark className="w-4 h-4"/>
              </span>
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 whitespace-nowrap min-w-0 -ml-1">
              <div className="font-serif text-[13px] leading-none">Jai</div>
              <div className="flex items-center gap-1 mt-1 text-[9px]" style={{ color: accent }}>
                <Flame className="w-2.5 h-2.5" strokeWidth={1.5}/> day 14 · bloom
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── mobile header ─── */}
      <header className={`lg:hidden sticky top-0 z-30 backdrop-blur-xl transition ${scrolled ? "border-b shadow-[0_10px_30px_-20px_rgba(29,42,68,0.25)]" : ""}`}
              style={{ background: dark ? "rgba(15,22,38,0.9)" : "rgba(247,250,255,0.92)", borderColor: border }}>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mark className="w-8 h-8 shrink-0"/>
            <div className="min-w-0">
              <div className="font-serif text-[15px] leading-none truncate">PeaceCode</div>
              <div className="text-[7.5px] tracking-[0.3em] uppercase mt-1 opacity-50 truncate">a soft place</div>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] justify-self-center" style={{ background: surface2, color: accent }}>
            <Flame className="w-3 h-3" strokeWidth={1.5}/> day 14 · bloom
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }}>
              {dark ? <Sun className="w-3.5 h-3.5 opacity-70"/> : <Moon className="w-3.5 h-3.5 opacity-70"/>}
            </button>
            <button onClick={() => setMenuOpen(true)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }}>
              <Menu className="w-4 h-4 opacity-70"/>
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col animate-fade-in" style={{ background: dark ? "rgba(15,22,38,0.96)" : "rgba(247,250,255,0.96)", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2"><Mark className="w-7 h-7"/><span className="font-serif text-[16px]">PeaceCode</span></div>
            <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }}><X className="w-4 h-4"/></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {navGroups.map((g) => (
              <div key={g.label} className="mb-6">
                <div className="text-[9px] tracking-[0.32em] uppercase mb-2" style={{ color: muted }}>{g.label}</div>
                <div className="flex flex-col">
                  {g.items.map((it) => {
                    const Icon = it.icon;
                    return (
                      <button key={it.label} className="flex items-center gap-3 py-3 text-[15px]" style={{ color: ink }}>
                        <Icon className="w-4 h-4" strokeWidth={1.5}/> {it.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── canvas ─── */}
      <main className="relative z-10 lg:pl-[120px] lg:pr-10 xl:pr-16 px-5 sm:px-8 py-10 lg:py-16 pb-24 max-w-[1500px] mx-auto space-y-28 lg:space-y-40">

        {/* 1 · HERO — Personal Brief */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center min-h-[80vh]">
          <div>
            <div className="flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase mb-8" style={{ color: accent }}>
              <span className="w-6 h-px" style={{ background: accent, opacity: 0.5 }}/>
              {timeLabel || "\u00a0"}
              {clock && <span className="opacity-60">· {clock}</span>}
            </div>
            <h1 className="font-serif tracking-tight leading-[0.98] text-[46px] sm:text-[64px] lg:text-[80px]" style={{ color: ink }}>
              {greeting},<br/>
              <em className="italic font-light" style={{ color: accent }}>Jai.</em>
            </h1>

            <div className="mt-10 max-w-[440px]">
              <div className="text-[10px] tracking-[0.35em] uppercase mb-3 flex items-center gap-2" style={{ color: muted }}>
                <Sparkles className="w-3 h-3" strokeWidth={1.5}/> peace, on your morning
              </div>
              <p className="font-serif text-[19px] sm:text-[21px] leading-[1.55]" style={{ color: ink, opacity: 0.85 }}>
                {insight ?? "you slept softly. the day already knows you're here."}
              </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <button className="group inline-flex items-center gap-3 rounded-full px-6 py-3.5 transition hover:opacity-90"
                      style={{ background: ink, color: bg }}>
                <span className="font-serif text-[15px]">begin the morning</span>
                <span className="w-6 h-6 rounded-full flex items-center justify-center transition group-hover:translate-x-0.5" style={{ background: bg, color: ink }}>
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.8}/>
                </span>
              </button>
              <button className="text-[13px] tracking-wide underline decoration-1 underline-offset-4" style={{ color: muted }}>
                not today, tomorrow instead
              </button>
            </div>
          </div>

          <div className="relative aspect-[4/5] max-h-[620px] mx-auto w-full">
            <div className="absolute inset-0 animate-breathe">
              <HeroBloom tone={lavender} accent={accent}/>
            </div>
          </div>
        </section>

        {/* 2 · TODAY'S FOCUS */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: accent }}>ii · today's focus</div>
              <h2 className="font-serif text-[36px] sm:text-[46px] tracking-tight" style={{ color: ink }}>the one thing, if any.</h2>
            </div>
            <div className="hidden sm:block text-[11px] tracking-wide" style={{ color: muted }}>chosen for how today feels</div>
          </div>

          <div className="relative rounded-[36px] overflow-hidden group cursor-pointer"
               style={{ minHeight: "min(70vh, 620px)", background: `linear-gradient(135deg, ${lavender} 0%, ${soft} 45%, ${accent} 100%)`, boxShadow: "0 40px 80px -40px rgba(29,42,68,0.35)" }}>
            {/* grain */}
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay"
                 style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1px)", backgroundSize: "3px 3px" }}/>
            {/* bloom decoration */}
            <div className="absolute -right-24 -bottom-24 w-[520px] h-[520px] opacity-30 transition-transform duration-1000 group-hover:scale-105">
              <HeroBloom tone="#FFFFFF" accent={ink}/>
            </div>
            <div className="relative h-full flex flex-col justify-between p-8 sm:p-12 lg:p-16">
              <div>
                <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "#F7FAFF" }}>{focusExperience.kicker}</div>
                <h3 className="font-serif mt-6 leading-[0.95] text-[52px] sm:text-[72px] lg:text-[92px]" style={{ color: "#F7FAFF" }}>
                  {focusExperience.title}<br/><em className="italic font-light">{focusExperience.italic}</em>
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
                <p className="max-w-md text-[15px] sm:text-[16px] leading-[1.6]" style={{ color: "#F7FAFF", opacity: 0.85 }}>
                  {focusExperience.reason}
                </p>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="text-[10px] tracking-[0.35em] uppercase" style={{ color: "#F7FAFF", opacity: 0.7 }}>duration</div>
                    <div className="font-serif text-[26px] mt-1" style={{ color: "#F7FAFF" }}>{focusExperience.mins} min</div>
                  </div>
                  <button className="w-16 h-16 rounded-full flex items-center justify-center transition group-hover:scale-105"
                          style={{ background: "#F7FAFF", color: ink }}>
                    <ArrowUpRight className="w-6 h-6" strokeWidth={1.6}/>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* alternates ribbon */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {alternates.map((a) => (
              <button key={a.title} className="text-left rounded-2xl px-5 py-4 transition hover:-translate-y-0.5"
                      style={{ background: surface, border: `1px solid ${border}` }}>
                <div className="text-[11px] tracking-[0.28em] uppercase" style={{ color: muted }}>{a.mins} min</div>
                <div className="font-serif text-[17px] mt-1" style={{ color: ink }}>{a.title}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 3 · PEACE AI — ongoing conversation */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: accent }}>iii · peace</div>
              <h2 className="font-serif text-[36px] sm:text-[46px] tracking-tight" style={{ color: ink }}>a place to be heard.</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px]" style={{ color: muted }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }}/> peace is listening
            </div>
          </div>

          <div className="rounded-[32px] overflow-hidden" style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 30px 60px -40px rgba(29,42,68,0.25)" }}>
            <div className="min-h-[380px] max-h-[520px] overflow-y-auto p-8 sm:p-10 space-y-6">
              {chatLog.length === 0 && !peaceTyping && (
                <div className="flex flex-col items-start gap-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center animate-breathe" style={{ background: `radial-gradient(circle at 30% 30%, ${soft}, ${accent})` }}>
                    <Mark className="w-6 h-6" opacity={0.9}/>
                  </div>
                  <p className="font-serif text-[22px] sm:text-[26px] leading-[1.4] max-w-lg" style={{ color: ink }}>
                    hey Jai. day fourteen — soft win. what's alive in you right now?
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["i feel heavy today", "help me sleep", "i can't focus", "just want to talk"].map((s) => (
                      <button key={s} onClick={() => sendToPeace(s)} className="text-[12px] px-4 py-2 rounded-full transition hover:opacity-80"
                              style={{ background: surface2, color: ink, border: `1px solid ${border}` }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}

              {chatLog.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  {m.from === "peace" ? (
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ background: `radial-gradient(circle at 30% 30%, ${soft}, ${accent})` }}>
                        <Mark className="w-3.5 h-3.5"/>
                      </div>
                      <div className="font-serif text-[17px] leading-[1.55]" style={{ color: ink }}>{m.text}</div>
                    </div>
                  ) : (
                    <div className="max-w-[75%] rounded-3xl rounded-tr-md px-5 py-3 text-[14px] leading-[1.5]" style={{ background: accent, color: "#F7FAFF" }}>{m.text}</div>
                  )}
                </div>
              ))}

              {peaceTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `radial-gradient(circle at 30% 30%, ${soft}, ${accent})` }}><Mark className="w-3.5 h-3.5"/></div>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }}/>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent, animationDelay: "0.15s" }}/>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent, animationDelay: "0.3s" }}/>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendToPeace(chatInput); }} className="flex items-center gap-3 px-6 py-4" style={{ borderTop: `1px solid ${border}`, background: dark ? "#0F1626" : "#F7FAFF" }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="say what's here…"
                     className="flex-1 bg-transparent outline-none text-[14px] py-2 placeholder:opacity-40" style={{ color: ink }}/>
              <button type="submit" disabled={!chatInput.trim() || peaceTyping} className="w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-40"
                      style={{ background: ink, color: bg }}>
                <Send className="w-4 h-4" strokeWidth={1.6}/>
              </button>
            </form>
          </div>
        </section>

        {/* 4 · MOOD GARDEN */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: accent }}>iv · mood garden</div>
              <h2 className="font-serif text-[36px] sm:text-[46px] tracking-tight" style={{ color: ink }}>seven days, growing.</h2>
            </div>
            <div className="hidden sm:block text-[11px] tracking-wide" style={{ color: muted }}>your week, not as numbers</div>
          </div>

          <div className="relative rounded-[32px] p-6 sm:p-10 pb-4" style={{ background: `linear-gradient(180deg, ${surface} 0%, ${surface2} 100%)`, border: `1px solid ${border}` }}>
            {/* garden */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end" style={{ minHeight: 220 }}>
              {moodWeek.map((m, i) => {
                const isToday = i === moodWeek.length - 1;
                return (
                  <div key={i} className="group flex flex-col items-center">
                    <div className="w-full h-[180px] sm:h-[200px] flex items-end">
                      <Plant kind={m.kind} stroke={isToday ? accent : ink} active={isToday}/>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* horizon */}
            <div className="h-px my-3" style={{ background: ink, opacity: 0.12 }}/>
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {moodWeek.map((m, i) => {
                const isToday = i === moodWeek.length - 1;
                return (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="text-[10px] tracking-[0.28em] uppercase" style={{ color: isToday ? accent : muted }}>{m.d}</div>
                    <div className="font-serif text-[12px] sm:text-[13px] mt-1" style={{ color: isToday ? ink : muted, opacity: isToday ? 1 : 0.7 }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5 · CAMPUS PULSE */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: accent }}>v · campus pulse</div>
              <h2 className="font-serif text-[36px] sm:text-[46px] tracking-tight" style={{ color: ink }}>small kindnesses, said out loud.</h2>
            </div>
            <button className="hidden sm:inline-flex items-center gap-1 text-[12px]" style={{ color: accent }}>share yours <ChevronRight className="w-3 h-3"/></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campus.map((p, i) => {
              const tone = p.tone === "warm" ? "#F1D5E3" : p.tone === "cool" ? soft : p.tone === "hush" ? lavender : "#EAF3FF";
              const liked = !!likedPost[i];
              return (
                <article key={i} className="rounded-[24px] overflow-hidden transition hover:-translate-y-1"
                         style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 20px 40px -30px rgba(29,42,68,0.2)" }}>
                  <div className="h-40 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${tone} 0%, ${surface2} 100%)` }}>
                    <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1px)", backgroundSize: "3px 3px" }}/>
                    <div className="absolute top-4 left-4 font-serif text-[52px] leading-none opacity-25" style={{ color: ink }}>&ldquo;</div>
                  </div>
                  <div className="p-6">
                    <p className="font-serif text-[17px] leading-[1.5]" style={{ color: ink }}>{p.text}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.28em] uppercase" style={{ color: muted }}>— {p.name}</span>
                      <button onClick={() => setLikedPost({ ...likedPost, [i]: !liked })} className="flex items-center gap-1.5 text-[12px] transition" style={{ color: liked ? accent : muted }}>
                        <Heart className={`w-3.5 h-3.5 transition ${liked ? "animate-heart-pop" : ""}`} fill={liked ? accent : "none"} strokeWidth={1.5}/>
                        held
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 6 · KARMA FOREST */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: accent }}>vi · karma forest</div>
              <h2 className="font-serif text-[36px] sm:text-[46px] tracking-tight" style={{ color: ink }}>a grove your class is growing.</h2>
            </div>
          </div>

          <div className="relative rounded-[32px] overflow-hidden" style={{ background: dark ? "#0B1220" : "#0F1626", minHeight: 400 }}>
            <div className="absolute inset-0"><KarmaForest ink="#F7FAFF" glow={soft} dim={lavender}/></div>
            <div className="relative p-8 sm:p-12 flex flex-col justify-between h-full" style={{ minHeight: 400 }}>
              <div className="max-w-lg">
                <p className="font-serif text-[24px] sm:text-[32px] leading-[1.25]" style={{ color: "#F7FAFF" }}>
                  every kind act plants a tree. this week your grove grew by
                </p>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-6 mt-10">
                <div>
                  <div className="font-serif text-[72px] sm:text-[96px] leading-[0.9]" style={{ color: "#F7FAFF" }}>1,284</div>
                  <div className="text-[11px] tracking-[0.35em] uppercase mt-2" style={{ color: soft }}>kind acts · this week</div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-[36px] sm:text-[48px]" style={{ color: soft }}>12</div>
                  <div className="text-[10px] tracking-[0.35em] uppercase mt-1" style={{ color: "#F7FAFF", opacity: 0.6 }}>are yours, Jai</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 · QUICK ACTIONS */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: accent }}>vii · doors</div>
              <h2 className="font-serif text-[36px] sm:text-[46px] tracking-tight" style={{ color: ink }}>a small room for each feeling.</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {quickActions.map((a) => {
              const Icon = a.icon;
              const tone = toneFor(a.tone);
              return (
                <button key={a.label} className="group relative overflow-hidden rounded-[28px] p-8 sm:p-10 text-left transition hover:-translate-y-1"
                        style={{ background: `linear-gradient(140deg, ${tone} 0%, ${surface} 90%)`, border: `1px solid ${border}`, minHeight: 220 }}>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-30 transition-transform duration-700 group-hover:scale-125" style={{ background: `radial-gradient(circle, ${tone}, transparent 70%)` }}/>
                  <div className="relative flex flex-col justify-between h-full">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: surface, border: `1px solid ${border}` }}>
                      <Icon className="w-5 h-5" strokeWidth={1.4} style={{ color: ink }}/>
                    </div>
                    <div className="mt-14">
                      <div className="font-serif text-[36px] sm:text-[42px] leading-none" style={{ color: ink }}>{a.label}</div>
                      <div className="text-[13px] mt-3" style={{ color: muted }}>{a.sub}</div>
                    </div>
                  </div>
                  <ArrowUpRight className="absolute top-8 right-8 w-5 h-5 opacity-40 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: ink }}/>
                </button>
              );
            })}
          </div>
        </section>

        {/* 8 · WEEKLY REFLECTION */}
        <section>
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: accent }}>viii · reflection</div>
              <h2 className="font-serif text-[36px] sm:text-[46px] tracking-tight" style={{ color: ink }}>your week, in a soft hand.</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px]" style={{ color: muted }}>
              <Sparkles className="w-3 h-3" strokeWidth={1.5}/> written by peace
            </div>
          </div>

          <div className="relative rounded-[32px] p-10 sm:p-16 max-w-3xl mx-auto" style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="absolute -top-3 left-10 text-[10px] tracking-[0.35em] uppercase px-3 py-1 rounded-full" style={{ background: surface2, color: accent, border: `1px solid ${border}` }}>
              week 28 · thursday to wednesday
            </div>
            <div className="font-serif text-[64px] leading-none opacity-15" style={{ color: ink }}>&ldquo;</div>
            {reflection ? (
              <p className="font-serif text-[19px] sm:text-[22px] leading-[1.65] mt-2 whitespace-pre-line" style={{ color: ink }}>{reflection}</p>
            ) : reflectionErr ? (
              <p className="font-serif text-[19px] leading-[1.65] mt-2" style={{ color: muted }}>peace is resting. try again in a moment — your week is still there.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {[100, 92, 86, 96, 78].map((w, i) => (
                  <div key={i} className="h-3 rounded-full animate-pulse" style={{ background: surface2, width: `${w}%`, animationDelay: `${i * 0.12}s` }}/>
                ))}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              <div className="font-serif text-[14px] italic" style={{ color: muted }}>— peace, on your behalf</div>
              <button onClick={() => setSavedReflection(!savedReflection)} className="inline-flex items-center gap-2 text-[12px] tracking-wide px-4 py-2 rounded-full transition" style={{ background: savedReflection ? accent : surface2, color: savedReflection ? "#F7FAFF" : ink, border: `1px solid ${border}` }}>
                <Feather className="w-3.5 h-3.5" strokeWidth={1.5}/> {savedReflection ? "saved to journal" : "save to journal"}
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
