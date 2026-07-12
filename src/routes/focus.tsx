import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Play, Pause, RotateCcw, SkipForward, Plus, Check, X,
  CloudRain, Coffee, Waves, Wind, VolumeX, Volume2, Timer, Target,
  TrendingUp, Flame, Sparkles, Zap, Trash2,
} from "lucide-react";
import logo from "@/assets/peacecode-logo.png";

export const Route = createFileRoute("/focus")({ component: FocusPage });

// ── palette ───────────────────────────────────────────────────────
const bg="#F7FAFF", surface="#FFFFFF", surface2="#EAF3FF", border="#DCE3EF";
const ink="#1D2A44", muted="#7587A6", primary="#4B6CB7";
const lavender="#D5C9F7", sky="#AFC9F5", moss="#CDEBD9", peach="#F8CADA";

// ── real history data (7 days of focus minutes) ───────────────────
const weekHistory = [
  { day: "Mon", mins: 62, sessions: 3 },
  { day: "Tue", mins: 48, sessions: 2 },
  { day: "Wed", mins: 95, sessions: 4 },
  { day: "Thu", mins: 30, sessions: 1 },
  { day: "Fri", mins: 78, sessions: 3 },
  { day: "Sat", mins: 110, sessions: 5 },
  { day: "Sun", mins: 54, sessions: 2 },
];

const modes = [
  { key: "focus",  label: "deep focus", mins: 25, color: primary },
  { key: "short",  label: "short break", mins: 5,  color: moss },
  { key: "long",   label: "long break",  mins: 15, color: lavender },
  { key: "flow",   label: "flow state",  mins: 50, color: peach },
] as const;

type ModeKey = typeof modes[number]["key"];

const soundscapes = [
  { key: "silence", label: "silence",  icon: VolumeX },
  { key: "rain",    label: "rain",     icon: CloudRain },
  { key: "cafe",    label: "café",     icon: Coffee },
  { key: "waves",   label: "waves",    icon: Waves },
  { key: "wind",    label: "wind",     icon: Wind },
];

// ── page ──────────────────────────────────────────────────────────
function FocusPage() {
  // timer
  const [mode, setMode] = useState<ModeKey>("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedToday, setCompletedToday] = useState(2);
  const [totalMinsToday, setTotalMinsToday] = useState(72);
  const currentMode = modes.find(m => m.key === mode)!;

  useEffect(() => { setRemaining(currentMode.mins * 60); setRunning(false); }, [mode]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          if (mode === "focus" || mode === "flow") {
            setCompletedToday(c => c + 1);
            setTotalMinsToday(t => t + currentMode.mins);
          }
          return currentMode.mins * 60;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, currentMode.mins]);

  const totalSecs = currentMode.mins * 60;
  const progress = 1 - remaining / totalSecs;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  // tasks
  const [tasks, setTasks] = useState([
    { id: 1, text: "finish DBMS assignment section 3", done: false, poms: 2 },
    { id: 2, text: "reread linear algebra ch. 4", done: true, poms: 1 },
    { id: 3, text: "outline internship application", done: false, poms: 1 },
  ]);
  const [newTask, setNewTask] = useState("");
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), text: newTask.trim(), done: false, poms: 1 }, ...tasks]);
    setNewTask("");
  };

  // sound
  const [sound, setSound] = useState("silence");
  const [volume, setVolume] = useState(60);

  // breath (side widget - box breathing)
  const [breathPhase, setBreathPhase] = useState<"in"|"hold1"|"out"|"hold2">("in");
  const [breathOn, setBreathOn] = useState(false);
  useEffect(() => {
    if (!breathOn) return;
    const seq: ("in"|"hold1"|"out"|"hold2")[] = ["in","hold1","out","hold2"];
    let i = 0;
    const t = setInterval(() => { i = (i+1) % 4; setBreathPhase(seq[i]); }, 4000);
    return () => clearInterval(t);
  }, [breathOn]);

  return (
    <div className="min-h-screen w-full font-sans relative" style={{ background: bg, color: ink }}>
      {/* aurora */}
      <div className="fixed inset-0 -z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-60"
             style={{ background: `radial-gradient(circle, ${lavender}, transparent 70%)` }}/>
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-70"
             style={{ background: `radial-gradient(circle, ${sky}, transparent 70%)` }}/>
      </div>

      {/* header */}
      <header className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 pt-8 flex items-center justify-between">
        <Link to="/" className="group flex items-center gap-3 text-[12.5px]" style={{ color: muted }}>
          <span className="w-9 h-9 rounded-full flex items-center justify-center transition group-hover:-translate-x-0.5"
                style={{ background: surface, border: `1px solid ${border}` }}>
            <ArrowLeft className="w-4 h-4" strokeWidth={1.6}/>
          </span>
          <span className="tracking-[0.28em] uppercase">back to today</span>
        </Link>
        <div className="hidden md:flex items-center gap-3">
          <img src={logo} alt="" className="w-7 h-7 opacity-80"/>
          <div className="text-right">
            <div className="font-serif text-[15px] leading-none">the focus room</div>
            <div className="text-[8.5px] tracking-[0.32em] uppercase opacity-50 mt-1">deep · quiet · alive</div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-24">
        {/* hero */}
        <section className="mb-12">
          <div className="text-[9px] tracking-[0.4em] uppercase mb-4" style={{ color: muted }}>
            focus room · sunday · {totalMinsToday}m so far
          </div>
          <h1 className="font-serif font-medium tracking-tight leading-[0.98] text-[clamp(2.4rem,5.5vw,4.2rem)] max-w-[820px]">
            one thing, <span style={{ color: primary, fontStyle: "italic" }}>softly done.</span>
          </h1>
          <p className="mt-5 max-w-[520px] text-[14px] leading-relaxed" style={{ color: muted }}>
            pick a rhythm. name what you're working on. we'll keep the clock, the sound, and the room quiet enough to hear yourself think.
          </p>
        </section>

        {/* MAIN GRID: timer + right column */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mb-8">
          {/* ── Timer card ── */}
          <div className="relative overflow-hidden rounded-[32px] p-8 lg:p-12"
               style={{ background: `linear-gradient(160deg, ${surface} 0%, ${surface2} 100%)`, border: `1px solid ${border}` }}>
            <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full blur-3xl opacity-60 pointer-events-none"
                 style={{ background: `radial-gradient(circle, ${currentMode.color}, transparent 70%)` }}/>

            {/* mode pills */}
            <div className="relative flex flex-wrap gap-2 mb-10">
              {modes.map(m => {
                const active = mode === m.key;
                return (
                  <button key={m.key} onClick={() => setMode(m.key)}
                          className="h-9 px-4 rounded-full text-[12px] tracking-wide transition"
                          style={{
                            background: active ? ink : surface,
                            color: active ? "#F7FAFF" : ink,
                            border: `1px solid ${active ? ink : border}`,
                          }}>
                    {m.label} · {m.mins}m
                  </button>
                );
              })}
            </div>

            {/* dial */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px]">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                  <defs>
                    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={currentMode.color}/>
                      <stop offset="100%" stopColor={primary}/>
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="88" fill="none" stroke={border} strokeWidth="1.5"/>
                  <circle cx="100" cy="100" r="88" fill="none"
                          stroke="url(#ring)" strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 88}
                          strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
                          style={{ transition: "stroke-dashoffset 1s linear" }}/>
                  {/* tick marks */}
                  {Array.from({length: 60}).map((_, i) => (
                    <line key={i} x1="100" y1="8" x2="100" y2={i % 5 === 0 ? 14 : 11}
                          stroke={ink} strokeWidth={i % 5 === 0 ? 0.8 : 0.4}
                          opacity={i % 5 === 0 ? 0.35 : 0.15}
                          transform={`rotate(${i*6} 100 100)`}/>
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[9.5px] tracking-[0.4em] uppercase" style={{ color: muted }}>{currentMode.label}</div>
                  <div className="font-serif text-[76px] sm:text-[92px] leading-none tabular-nums mt-2" style={{ color: ink }}>
                    {mm}<span style={{ color: muted }}>:</span>{ss}
                  </div>
                  <div className="text-[11px] mt-3 tracking-[0.28em] uppercase" style={{ color: muted }}>
                    {running ? "in flow" : remaining === totalSecs ? "ready when you are" : "paused"}
                  </div>
                </div>
              </div>

              {/* controls */}
              <div className="mt-10 flex items-center gap-3">
                <button onClick={() => setRemaining(currentMode.mins * 60)}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition hover:-translate-y-0.5"
                        style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  <RotateCcw className="w-4 h-4" strokeWidth={1.6}/>
                </button>
                <button onClick={() => setRunning(r => !r)}
                        className="h-14 px-8 rounded-full flex items-center gap-3 text-[13.5px] tracking-wide transition hover:-translate-y-0.5"
                        style={{ background: ink, color: "#F7FAFF", boxShadow: "0 16px 32px -14px rgba(29,42,68,0.55)" }}>
                  {running ? <Pause className="w-4 h-4" strokeWidth={1.8}/> : <Play className="w-4 h-4" strokeWidth={1.8}/>}
                  {running ? "pause" : remaining === totalSecs ? "begin" : "resume"}
                </button>
                <button onClick={() => { setRunning(false); setRemaining(0); }}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition hover:-translate-y-0.5"
                        style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
                  <SkipForward className="w-4 h-4" strokeWidth={1.6}/>
                </button>
              </div>
            </div>

            {/* today stats row */}
            <div className="relative mt-10 grid grid-cols-3 gap-4">
              {[
                { label: "sessions today", value: completedToday, icon: Target },
                { label: "minutes focused", value: totalMinsToday, icon: Timer },
                { label: "current streak", value: "14d", icon: Flame },
              ].map((s) => (
                <div key={s.label} className="rounded-[18px] p-4"
                     style={{ background: surface, border: `1px solid ${border}` }}>
                  <div className="flex items-center gap-1.5 text-[9.5px] tracking-[0.28em] uppercase" style={{ color: muted }}>
                    <s.icon className="w-3 h-3" strokeWidth={1.6}/> {s.label}
                  </div>
                  <div className="font-serif text-[30px] leading-none mt-2" style={{ color: ink }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column: sound + breath ── */}
          <div className="flex flex-col gap-6">
            {/* Soundscape */}
            <div className="rounded-[28px] p-6" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[9.5px] tracking-[0.3em] uppercase" style={{ color: muted }}>soundscape</div>
                  <div className="font-serif text-[20px] mt-1">the room's air</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0,1,2,3,4].map(i => (
                    <span key={i} className="w-[3px] rounded-full"
                          style={{
                            height: sound !== "silence" && i < Math.floor(volume/20) ? "18px" : "6px",
                            background: sound !== "silence" && i < Math.floor(volume/20) ? primary : border,
                            transition: "height 200ms ease",
                            animation: sound !== "silence" && i < Math.floor(volume/20) ? `sndbar 1.${i}s ease-in-out infinite` : undefined,
                          }}/>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-5">
                {soundscapes.map(s => {
                  const active = sound === s.key;
                  const Icon = s.icon;
                  return (
                    <button key={s.key} onClick={() => setSound(s.key)}
                            className="flex flex-col items-center gap-1.5 py-3 rounded-[14px] transition hover:-translate-y-0.5"
                            style={{
                              background: active ? surface2 : "transparent",
                              border: `1px solid ${active ? primary : border}`,
                              color: active ? ink : muted,
                            }}>
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.5}/>
                      <span className="text-[10px] tracking-wide">{s.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-3.5 h-3.5" strokeWidth={1.6} style={{ color: muted }}/>
                <input type="range" min={0} max={100} value={volume}
                       onChange={(e) => setVolume(Number(e.target.value))}
                       className="flex-1 accent-[--p]" style={{ ["--p" as any]: primary }}/>
                <span className="text-[11px] tabular-nums w-8 text-right" style={{ color: muted }}>{volume}</span>
              </div>
              <style>{`@keyframes sndbar { 0%,100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }`}</style>
            </div>

            {/* Breath box */}
            <div className="relative overflow-hidden rounded-[28px] p-6" style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="text-[9.5px] tracking-[0.3em] uppercase mb-4" style={{ color: muted }}>quick reset · 4·4·4·4</div>
              <div className="flex items-center gap-5">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-2xl transition-all duration-[3800ms] ease-in-out"
                       style={{
                         background: `linear-gradient(135deg, ${lavender}, ${sky})`,
                         transform: breathOn ? (breathPhase === "in" ? "scale(1)" : breathPhase === "out" ? "scale(0.55)" : "scale(0.78)") : "scale(0.78)",
                       }}/>
                  <div className="absolute inset-0 flex items-center justify-center font-serif text-[13px]" style={{ color: ink }}>
                    {breathOn ? (breathPhase === "in" ? "in" : breathPhase === "out" ? "out" : "hold") : "rest"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-serif text-[18px] leading-tight">a small reset between rounds.</div>
                  <p className="text-[11.5px] mt-1.5" style={{ color: muted }}>box breath. four counts each side.</p>
                  <button onClick={() => setBreathOn(!breathOn)}
                          className="mt-3 h-9 px-4 rounded-full text-[11.5px] tracking-wide"
                          style={{ background: breathOn ? ink : surface2, color: breathOn ? "#F7FAFF" : ink, border: `1px solid ${breathOn ? ink : border}` }}>
                    {breathOn ? "stop" : "begin breath"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Second row: tasks + chart */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          {/* tasks */}
          <div className="rounded-[28px] p-7" style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[9.5px] tracking-[0.3em] uppercase" style={{ color: muted }}>this session</div>
                <div className="font-serif text-[22px] mt-1">what are we holding?</div>
              </div>
              <div className="text-[11px]" style={{ color: muted }}>
                {tasks.filter(t => t.done).length}/{tasks.length}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addTask(); }}
                  className="flex items-center gap-2 mb-5">
              <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
                     placeholder="one small thing…"
                     className="flex-1 h-11 px-4 rounded-full outline-none text-[13px]"
                     style={{ background: surface2, color: ink }}/>
              <button type="submit"
                      className="w-11 h-11 rounded-full flex items-center justify-center transition hover:-translate-y-0.5"
                      style={{ background: ink, color: "#F7FAFF" }}>
                <Plus className="w-4 h-4" strokeWidth={1.8}/>
              </button>
            </form>

            <div className="flex flex-col gap-2">
              {tasks.map(t => (
                <div key={t.id}
                     className="group flex items-center gap-3 p-3 rounded-[16px] transition"
                     style={{ background: t.done ? surface2 : "transparent", border: `1px solid ${t.done ? "transparent" : border}` }}>
                  <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition shrink-0"
                          style={{ background: t.done ? primary : "transparent", border: `1.5px solid ${t.done ? primary : muted}`, color: "#F7FAFF" }}>
                    {t.done && <Check className="w-3.5 h-3.5" strokeWidth={2.4}/>}
                  </button>
                  <span className="flex-1 text-[13.5px]"
                        style={{ color: t.done ? muted : ink, textDecoration: t.done ? "line-through" : "none" }}>
                    {t.text}
                  </span>
                  <span className="text-[10px] tracking-[0.22em] uppercase" style={{ color: muted }}>
                    {t.poms}× pom
                  </span>
                  <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))}
                          className="opacity-0 group-hover:opacity-100 transition p-1" style={{ color: muted }}>
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.6}/>
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-[12.5px] text-center py-6" style={{ color: muted }}>
                  a quiet page. add one small thing to begin.
                </div>
              )}
            </div>
          </div>

          {/* chart */}
          <FocusChart data={weekHistory} />
        </section>

        {/* insights row */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, label: "weekly avg", value: `${Math.round(weekHistory.reduce((a,b)=>a+b.mins,0)/7)}m`, sub: "up 12% from last week", tone: moss },
            { icon: Sparkles,   label: "best hour",  value: "10–11am", sub: "you focus deepest here", tone: lavender },
            { icon: Zap,        label: "distraction score", value: "low", sub: "2 skips in last 5 sessions", tone: sky },
          ].map((c) => (
            <div key={c.label} className="relative overflow-hidden rounded-[22px] p-5"
                 style={{ background: surface, border: `1px solid ${border}` }}>
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-70"
                   style={{ background: `radial-gradient(circle, ${c.tone}, transparent 70%)` }}/>
              <div className="relative flex items-center gap-2 text-[9.5px] tracking-[0.28em] uppercase" style={{ color: muted }}>
                <c.icon className="w-3 h-3" strokeWidth={1.6}/> {c.label}
              </div>
              <div className="relative font-serif text-[28px] mt-2 leading-none" style={{ color: ink }}>{c.value}</div>
              <div className="relative text-[11.5px] mt-2" style={{ color: muted }}>{c.sub}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

// ── chart component ──────────────────────────────────────────────
function FocusChart({ data }: { data: typeof weekHistory }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 520, H = 220, PAD = 28;
  const max = Math.max(...data.map(d => d.mins), 60);
  const pts = data.map((d, i) => ({
    x: PAD + (i * (W - PAD*2)) / (data.length - 1),
    y: H - PAD - ((d.mins / max) * (H - PAD*2)),
    ...d,
  }));

  // smooth path (cubic)
  const path = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i-1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    return `C ${cx1} ${prev.y}, ${cx2} ${p.y}, ${p.x} ${p.y}`;
  }).join(" ");
  const area = `${path} L ${pts[pts.length-1].x} ${H-PAD} L ${pts[0].x} ${H-PAD} Z`;

  const total = data.reduce((a,b) => a+b.mins, 0);
  const bestDay = data.reduce((a,b) => b.mins > a.mins ? b : a);

  return (
    <div className="rounded-[28px] p-7 relative overflow-hidden" style={{ background: surface, border: `1px solid ${border}` }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-[9.5px] tracking-[0.3em] uppercase" style={{ color: muted }}>last seven days</div>
          <div className="font-serif text-[22px] mt-1">the shape of your week</div>
        </div>
        <div className="text-right">
          <div className="font-serif text-[26px] leading-none" style={{ color: ink }}>{total}<span className="text-[13px]" style={{ color: muted }}>m</span></div>
          <div className="text-[10px] tracking-[0.24em] uppercase mt-1" style={{ color: muted }}>held</div>
        </div>
      </div>
      <p className="text-[12px] mb-4" style={{ color: muted }}>
        deepest on <span style={{ color: ink }}>{bestDay.day}</span> · {bestDay.mins}m across {bestDay.sessions} sessions
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={primary} stopOpacity="0.28"/>
            <stop offset="100%" stopColor={primary} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* grid */}
        {[0,1,2,3].map(i => {
          const y = PAD + (i * (H - PAD*2))/3;
          return <line key={i} x1={PAD} x2={W-PAD} y1={y} y2={y} stroke={border} strokeDasharray="2 4"/>;
        })}
        <path d={area} fill="url(#areaG)"/>
        <path d={path} fill="none" stroke={primary} strokeWidth="2.2" strokeLinecap="round"/>
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} style={{ cursor: "pointer" }}>
            <rect x={p.x - 20} y={0} width={40} height={H} fill="transparent"/>
            <circle cx={p.x} cy={p.y} r={hover === i ? 6 : 4}
                    fill={surface} stroke={primary} strokeWidth="2"
                    style={{ transition: "r 200ms" }}/>
            <text x={p.x} y={H-8} textAnchor="middle" fontSize="10" fill={hover === i ? ink : muted}
                  style={{ fontFamily: "DM Sans", letterSpacing: "0.14em" }}>
              {p.day.toUpperCase()}
            </text>
            {hover === i && (
              <g>
                <rect x={p.x - 32} y={p.y - 40} width="64" height="28" rx="8" fill={ink}/>
                <text x={p.x} y={p.y - 22} textAnchor="middle" fontSize="11" fill="#F7FAFF" fontFamily="DM Sans">
                  {p.mins}m · {p.sessions}×
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
