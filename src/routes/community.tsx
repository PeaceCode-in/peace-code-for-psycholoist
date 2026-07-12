import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Users, Radio, Mic, MicOff, Send, Heart, MessageCircle,
  ArrowUp, ArrowDown, Search, Plus, Flame, Sparkles, Hash, Volume2,
  Circle, ChevronRight, Bookmark, MoreHorizontal, Waves, Feather,
} from "lucide-react";
import logo from "@/assets/peacecode-logo.png";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/community")({ component: CommunityPage });

// ─── palette ──────────────────────────────────────────────────────
const bg      = "#F7FAFF";
const surface = "#FFFFFF";
const surface2= "#EAF3FF";
const border  = "#DCE3EF";
const ink     = "#1D2A44";
const muted   = "#7587A6";
const lavender = "#D5C9F7";
const sky      = "#AFC9F5";
const blueSoft = "#7FA8E6";
const primary  = "#4B6CB7";

// ─── seed data ────────────────────────────────────────────────────
const circles = [
  { name: "Exam calm", members: 214, live: 18, tag: "study", accent: sky },
  { name: "Homesick", members: 87, live: 6, tag: "care", accent: lavender },
  { name: "Late-night thoughts", members: 342, live: 41, tag: "safe", accent: "#F8CADA" },
  { name: "First-gen students", members: 128, live: 9, tag: "kin", accent: "#CDEBD9" },
  { name: "Panic → pause", members: 501, live: 63, tag: "breath", accent: sky },
  { name: "Quiet wins", members: 276, live: 14, tag: "joy", accent: lavender },
];

const rooms = [
  { id: "r1", name: "Sunday reset", host: "moon · counselor", listeners: 42, tag: "guided", started: "12 min", topic: "letting the week soften before it starts" },
  { id: "r2", name: "3AM company", host: "kavya · peer", listeners: 19, tag: "open mic", started: "28 min", topic: "if you can't sleep, we're here. no fixing." },
  { id: "r3", name: "Breath together", host: "peace bot", listeners: 88, tag: "breath", started: "just now", topic: "box breathing · 6 rounds · anyone welcome" },
  { id: "r4", name: "Before the exam", host: "aditi · peer", listeners: 31, tag: "study", started: "1 hr", topic: "we're studying quietly. no talking, just presence." },
];

const initialThreads = [
  { id: "t1", author: "someone kind", circle: "Homesick", title: "the smell of monsoon here reminds me of my mother's kitchen. that's enough for today.", body: "no lesson. no takeaway. just — writing it down so it exists somewhere.", votes: 218, comments: 34, tag: "soft", time: "2h" },
  { id: "t2", author: "night owl", circle: "Late-night thoughts", title: "does anyone else feel like they're performing rest?", body: "I took a break yesterday and spent it worrying about whether I was resting correctly.", votes: 412, comments: 87, tag: "real", time: "5h" },
  { id: "t3", author: "quiet friend", circle: "Exam calm", title: "a small script that worked for me the night before finals", body: "1. close the notes. 2. shower. 3. write tomorrow-morning-me one kind sentence. 4. sleep. it's not more studying that helped, it was trusting what I'd already done.", votes: 189, comments: 22, tag: "share", time: "8h" },
  { id: "t4", author: "anon", circle: "First-gen students", title: "my parents don't understand what a thesis is, and that's okay", body: "for a long time I thought I needed them to get it. today I realized their pride doesn't depend on understanding. it just is.", votes: 356, comments: 51, tag: "kin", time: "1d" },
];

const initialMessages = [
  { who: "peace bot", text: "welcome in. take your first breath here — no need to say anything.", mine: false, t: "just now", tone: "guide" },
  { who: "kavya", text: "hi everyone. glad you're here.", mine: false, t: "12s" },
  { who: "moon", text: "let's start with a small anchor — where in the room are you sitting?", mine: false, t: "8s", tone: "guide" },
  { who: "anon (leaf)", text: "at my desk. slightly slouched.", mine: false, t: "4s" },
];

// ─── component ────────────────────────────────────────────────────
type View = { kind: "home" } | { kind: "room"; roomId: string } | { kind: "thread"; threadId: string };

export default function CommunityPage() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [tab, setTab] = useState<"circles" | "rooms" | "threads">("circles");
  const [sort, setSort] = useState<"soft" | "new" | "warm">("soft");
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState(initialThreads);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeCircle, setComposeCircle] = useState(circles[0].name);

  const currentRoom = view.kind === "room" ? rooms.find(r => r.id === view.roomId) : null;
  const currentThread = view.kind === "thread" ? threads.find(t => t.id === view.threadId) : null;

  function submitCompose() {
    if (!composeTitle.trim()) return;
    const nt = {
      id: "t" + Date.now(), author: "you (anon)", circle: composeCircle,
      title: composeTitle.trim(), body: composeBody.trim(), votes: 1, comments: 0, tag: "soft", time: "now",
    };
    setThreads([nt, ...threads]);
    setComposeOpen(false); setComposeTitle(""); setComposeBody("");
    setTab("threads");
  }

  return (
    <AppShell>
      <div className="w-full font-sans" style={{ color: ink }}>


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
          <img src={logo} alt="" className="w-7 h-7 opacity-80" />
          <div className="text-right">
            <div className="font-serif text-[15px] leading-none">the circle</div>
            <div className="text-[8.5px] tracking-[0.32em] uppercase opacity-50 mt-1">peacecode community</div>
          </div>
        </div>
      </header>

      {/* branching views */}
      {view.kind === "room" && currentRoom ? (
        <LiveRoom room={currentRoom} onLeave={() => setView({ kind: "home" })} />
      ) : view.kind === "thread" && currentThread ? (
        <ThreadDetail
          thread={currentThread}
          saved={saved.has(currentThread.id)}
          onSave={() => {
            const s = new Set(saved);
            s.has(currentThread.id) ? s.delete(currentThread.id) : s.add(currentThread.id);
            setSaved(s);
          }}
          onBack={() => setView({ kind: "home" })}
          onVote={(delta: number) => setThreads(threads.map(t => t.id === currentThread.id ? { ...t, votes: t.votes + delta } : t))}
        />
      ) : (
        <HomeView
          tab={tab} setTab={setTab}
          sort={sort} setSort={setSort}
          query={query} setQuery={setQuery}
          threads={threads}
          openRoom={(id: string) => setView({ kind: "room", roomId: id })}
          openThread={(id: string) => setView({ kind: "thread", threadId: id })}
          onVote={(id: string, d: number) => setThreads(threads.map(t => t.id === id ? { ...t, votes: t.votes + d } : t))}
          saved={saved}
          toggleSave={(id: string) => {
            const s = new Set(saved); s.has(id) ? s.delete(id) : s.add(id); setSaved(s);
          }}
          openCompose={() => setComposeOpen(true)}
        />
      )}

      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(29,42,68,0.35)" }} onClick={() => setComposeOpen(false)}>
          <div className="w-full max-w-lg rounded-[24px] p-6" style={{ background: surface, border: `1px solid ${border}` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="font-serif text-[20px]">offer a thread</div>
              <button onClick={() => setComposeOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: surface2, color: ink }}>×</button>
            </div>
            <select value={composeCircle} onChange={(e) => setComposeCircle(e.target.value)}
                    className="w-full h-11 px-4 rounded-full text-[13px] mb-3 outline-none"
                    style={{ background: surface2, color: ink, border: `1px solid ${border}` }}>
              {circles.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <input value={composeTitle} onChange={(e) => setComposeTitle(e.target.value)}
                   placeholder="a soft title…"
                   className="w-full h-11 px-4 rounded-full text-[13px] mb-3 outline-none"
                   style={{ background: surface2, color: ink }}/>
            <textarea value={composeBody} onChange={(e) => setComposeBody(e.target.value)}
                      rows={4} placeholder="a sentence is enough."
                      className="w-full px-4 py-3 rounded-2xl text-[13px] resize-none outline-none"
                      style={{ background: surface2, color: ink }}/>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setComposeOpen(false)} className="h-10 px-4 rounded-full text-[12px]" style={{ background: surface2, color: ink }}>cancel</button>
              <button onClick={submitCompose} className="h-10 px-5 rounded-full text-[12px]" style={{ background: ink, color: "#F7FAFF" }}>post anonymously</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AppShell>
  );
}


// ─── home view ────────────────────────────────────────────────────
function HomeView({
  tab, setTab, sort, setSort, query, setQuery, threads, openRoom, openThread, onVote, saved, toggleSave,
}: any) {
  const filtered = useMemo(() => {
    let list = [...threads];
    if (query) list = list.filter((t: any) => (t.title + t.body + t.circle).toLowerCase().includes(query.toLowerCase()));
    if (sort === "warm") list.sort((a: any, b: any) => b.votes - a.votes);
    if (sort === "new") list.sort((a: any, b: any) => a.time.localeCompare(b.time));
    return list;
  }, [threads, query, sort]);

  return (
    <main className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 pt-10 pb-24">
      {/* Editorial hero */}
      <section className="relative mb-14">
        <div className="text-[9px] tracking-[0.4em] uppercase mb-4" style={{ color: muted }}>
          the circle · sunday · 42 quietly here
        </div>
        <h1 className="font-serif font-medium tracking-tight leading-[0.98] text-[clamp(2.6rem,6vw,4.6rem)] max-w-[900px]">
          nobody heals alone. <span style={{ color: primary, fontStyle: "italic" }}>even in silence, we're here.</span>
        </h1>
        <p className="mt-6 max-w-[560px] text-[14px] leading-relaxed" style={{ color: muted }}>
          circles are small rooms for the same feeling. live rooms are voices held together. threads are quiet letters, left open for someone else to find.
        </p>

        {/* live pulse bar */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-full h-11 pl-4 pr-5" style={{ background: surface, border: `1px solid ${border}` }}>
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#EF6B6B", opacity: 0.6 }}/>
              <span className="relative rounded-full w-2 h-2" style={{ background: "#EF6B6B" }}/>
            </span>
            <span className="text-[11.5px] tracking-[0.22em] uppercase" style={{ color: muted }}>live · 4 rooms · 180 listening</span>
          </div>
          <div className="flex-1 min-w-[220px] flex items-center gap-2 h-11 rounded-full px-4"
               style={{ background: surface, border: `1px solid ${border}` }}>
            <Search className="w-4 h-4" strokeWidth={1.5} style={{ color: muted }}/>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search a feeling, a circle, a thread…"
              className="flex-1 bg-transparent outline-none text-[13px] placeholder:opacity-60"
              style={{ color: ink }}
            />
          </div>
          <button onClick={() => setComposeOpen(true)}
                  className="h-11 px-5 rounded-full flex items-center gap-2 text-[12.5px] tracking-wide transition hover:translate-y-[-1px]"
                  style={{ background: ink, color: "#F7FAFF", boxShadow: "0 12px 24px -12px rgba(29,42,68,0.5)" }}>
            <Plus className="w-4 h-4" strokeWidth={1.8}/> offer a thread
          </button>
        </div>
      </section>

      {/* tabs */}
      <div className="flex items-center gap-1 mb-10 border-b" style={{ borderColor: border }}>
        {[
          { k: "circles", label: "circles", icon: Users, count: circles.length },
          { k: "rooms",   label: "live rooms", icon: Radio, count: rooms.length },
          { k: "threads", label: "threads", icon: Feather, count: threads.length },
        ].map((t: any) => {
          const active = tab === t.k;
          const Icon = t.icon;
          return (
            <button key={t.k} onClick={() => setTab(t.k)}
                    className="relative flex items-center gap-2 px-5 py-4 text-[13px] transition"
                    style={{ color: active ? ink : muted }}>
              <Icon className="w-4 h-4" strokeWidth={1.5}/>
              <span className="tracking-wide">{t.label}</span>
              <span className="text-[10px] opacity-60">{t.count}</span>
              {active && (
                <span className="absolute left-3 right-3 -bottom-px h-[2px] rounded-full" style={{ background: primary }}/>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab contents */}
      {tab === "circles" && <CirclesGrid />}
      {tab === "rooms"   && <LiveRoomsGrid openRoom={openRoom}/>}
      {tab === "threads" && (
        <ThreadsList
          threads={filtered}
          sort={sort} setSort={setSort}
          openThread={openThread}
          onVote={onVote}
          saved={saved}
          toggleSave={toggleSave}
        />
      )}
    </main>
  );
}

// ─── circles grid ─────────────────────────────────────────────────
function CirclesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {circles.map((c, i) => (
        <div key={c.name}
             className="group relative overflow-hidden rounded-[28px] p-6 transition duration-300 hover:-translate-y-1 cursor-pointer"
             style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 1px 2px rgba(29,42,68,0.03)" }}>
          {/* orb */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100"
               style={{ background: `radial-gradient(circle, ${c.accent}, transparent 70%)` }}/>
          {/* number ghost */}
          <div className="absolute right-5 bottom-3 font-serif italic text-[80px] leading-none opacity-[0.06]" style={{ color: ink }}>
            0{i + 1}
          </div>

          <div className="relative flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: muted }}>
            <Hash className="w-3 h-3" strokeWidth={1.6}/> {c.tag}
          </div>
          <h3 className="relative font-serif text-[26px] leading-tight tracking-tight max-w-[220px]">{c.name}</h3>

          {/* avatars stack */}
          <div className="relative mt-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0,1,2,3].map(k => (
                <span key={k} className="w-7 h-7 rounded-full border-2" style={{
                  background: k === 0 ? c.accent : k === 1 ? sky : k === 2 ? lavender : surface2,
                  borderColor: surface,
                }}/>
              ))}
            </div>
            <div className="text-[11.5px]" style={{ color: muted }}>
              {c.members} kin · <span style={{ color: ink }}>{c.live} here now</span>
            </div>
          </div>

          <div className="relative mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#66C39A", opacity: 0.7 }}/>
                <span className="relative rounded-full w-1.5 h-1.5" style={{ background: "#66C39A" }}/>
              </span>
              <span className="text-[10.5px] tracking-[0.24em] uppercase" style={{ color: muted }}>softly active</span>
            </div>
            <span className="flex items-center gap-1 text-[12px] transition group-hover:translate-x-1" style={{ color: ink }}>
              enter <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.6}/>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── live rooms grid ──────────────────────────────────────────────
function LiveRoomsGrid({ openRoom }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {rooms.map((r) => (
        <button key={r.id} onClick={() => openRoom(r.id)}
                className="group relative text-left overflow-hidden rounded-[28px] p-7 transition duration-300 hover:-translate-y-1"
                style={{ background: surface, border: `1px solid ${border}`, boxShadow: "0 1px 2px rgba(29,42,68,0.03)" }}>
          {/* waveform */}
          <div className="absolute right-5 top-5 flex items-end gap-[3px] h-9">
            {[0.4,0.7,0.55,0.9,0.6,0.85,0.5,0.75,0.4].map((h, i) => (
              <span key={i} className="w-[3px] rounded-full"
                    style={{
                      height: `${h*100}%`,
                      background: primary,
                      opacity: 0.7,
                      animation: `wf 1.4s ease-in-out ${i*0.12}s infinite`,
                    }}/>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-5">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#EF6B6B", opacity: 0.6 }}/>
              <span className="relative rounded-full w-2 h-2" style={{ background: "#EF6B6B" }}/>
            </span>
            <span className="text-[10px] tracking-[0.32em] uppercase" style={{ color: muted }}>live · {r.tag}</span>
          </div>

          <h3 className="font-serif text-[28px] leading-[1.05] tracking-tight max-w-[380px]">{r.name}</h3>
          <p className="mt-3 text-[13.5px] leading-relaxed max-w-[420px]" style={{ color: muted }}>{r.topic}</p>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[sky, lavender, "#CDEBD9"].map((c, i) => (
                  <span key={i} className="w-8 h-8 rounded-full border-2" style={{ background: c, borderColor: surface }}/>
                ))}
              </div>
              <div className="text-[11.5px]" style={{ color: muted }}>
                <div style={{ color: ink }}>{r.host}</div>
                <div>{r.listeners} listening · started {r.started}</div>
              </div>
            </div>
            <span className="rounded-full h-10 px-4 flex items-center gap-2 text-[12px] tracking-wide transition group-hover:translate-x-0.5"
                  style={{ background: ink, color: "#F7FAFF" }}>
              <Volume2 className="w-3.5 h-3.5" strokeWidth={1.6}/> tune in
            </span>
          </div>
        </button>
      ))}
      <style>{`@keyframes wf { 0%,100% { transform: scaleY(0.5); } 50% { transform: scaleY(1); } }`}</style>
    </div>
  );
}

// ─── threads list ─────────────────────────────────────────────────
function ThreadsList({ threads, sort, setSort, openThread, onVote, saved, toggleSave }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      {/* main list */}
      <div>
        <div className="flex items-center gap-1 mb-5">
          {[
            { k: "soft", label: "softly ordered", icon: Sparkles },
            { k: "warm", label: "warmest",        icon: Flame },
            { k: "new",  label: "newest first",   icon: Circle },
          ].map((s: any) => {
            const active = sort === s.k;
            const Icon = s.icon;
            return (
              <button key={s.k} onClick={() => setSort(s.k)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[11.5px] tracking-wide transition"
                      style={{
                        background: active ? surface2 : "transparent",
                        color: active ? ink : muted,
                        border: `1px solid ${active ? border : "transparent"}`,
                      }}>
                <Icon className="w-3 h-3" strokeWidth={1.6}/> {s.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {threads.map((t: any) => (
            <article key={t.id}
                     className="group relative flex gap-5 p-6 rounded-[24px] transition hover:-translate-y-0.5 cursor-pointer"
                     onClick={() => openThread(t.id)}
                     style={{ background: surface, border: `1px solid ${border}` }}>
              {/* vote rail */}
              <div className="flex flex-col items-center gap-1 pt-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onVote(t.id, +1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-[--h]"
                        style={{ ["--h" as any]: surface2, color: muted }}>
                  <ArrowUp className="w-4 h-4" strokeWidth={1.8}/>
                </button>
                <span className="font-serif text-[15px]" style={{ color: ink }}>{t.votes}</span>
                <button onClick={() => onVote(t.id, -1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-[--h]"
                        style={{ ["--h" as any]: surface2, color: muted }}>
                  <ArrowDown className="w-4 h-4" strokeWidth={1.8}/>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10.5px] tracking-[0.24em] uppercase" style={{ color: muted }}>
                  <span className="rounded-full px-2 py-0.5" style={{ background: surface2, color: ink }}>{t.circle}</span>
                  <span>·</span>
                  <span>{t.author}</span>
                  <span>·</span>
                  <span>{t.time}</span>
                </div>
                <h3 className="mt-3 font-serif text-[22px] leading-[1.2] tracking-tight">{t.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed line-clamp-2" style={{ color: muted }}>{t.body}</p>

                <div className="mt-4 flex items-center gap-5 text-[12px]" style={{ color: muted }}>
                  <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" strokeWidth={1.6}/> {t.comments} held it</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleSave(t.id); }}
                          className="flex items-center gap-1.5 transition hover:text-[--i]"
                          style={{ ["--i" as any]: ink, color: saved.has(t.id) ? primary : muted }}>
                    <Bookmark className="w-3.5 h-3.5" strokeWidth={1.6} fill={saved.has(t.id) ? primary : "transparent"}/>
                    {saved.has(t.id) ? "kept" : "keep"}
                  </button>
                  <span className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" style={{ color: ink }}>
                    open <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.6}/>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* right rail: community pulse */}
      <aside className="hidden lg:flex flex-col gap-5">
        <div className="rounded-[24px] p-6" style={{ background: surface, border: `1px solid ${border}` }}>
          <div className="text-[9.5px] tracking-[0.32em] uppercase mb-4" style={{ color: muted }}>softly rising</div>
          <div className="flex flex-col gap-3">
            {["#exam-calm", "#3am-company", "#homesick", "#quiet-wins", "#first-gen"].map((t, i) => (
              <div key={t} className="flex items-center justify-between text-[13px]">
                <span className="font-serif" style={{ color: ink }}>{t}</span>
                <span className="text-[10.5px]" style={{ color: muted }}>{[184,142,98,76,54][i]} today</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] p-6"
             style={{ background: `linear-gradient(160deg, ${lavender}, ${sky})`, border: `1px solid ${border}` }}>
          <div className="text-[9.5px] tracking-[0.32em] uppercase mb-3" style={{ color: ink }}>a small pact</div>
          <p className="font-serif text-[18px] leading-snug" style={{ color: ink }}>
            here, we don't fix each other. we just <em>stay</em>. no advice unless asked. no pressure to be brave.
          </p>
          <img src={logo} alt="" className="absolute -bottom-6 -right-6 w-24 h-24 opacity-30"/>
        </div>

        <div className="rounded-[24px] p-6" style={{ background: surface, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Waves className="w-4 h-4" strokeWidth={1.5} style={{ color: primary }}/>
            <span className="text-[10.5px] tracking-[0.3em] uppercase" style={{ color: muted }}>gentle rules</span>
          </div>
          <ul className="text-[12.5px] leading-relaxed space-y-2" style={{ color: muted }}>
            <li>· names optional. presence enough.</li>
            <li>· hold, don't hurry.</li>
            <li>· report anything that scares you — a real human reads it.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

// ─── live room (chat) ─────────────────────────────────────────────
function LiveRoom({ room, onLeave }: any) {
  const [msgs, setMsgs] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [muted_, setMuted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  // ambient bot chime
  useEffect(() => {
    const t = setTimeout(() => {
      setMsgs((m) => [...m, { who: "peace bot", text: "if it helps, place a hand on your chest. we've got a few minutes.", mine: false, t: "now", tone: "guide" }]);
    }, 7000);
    return () => clearTimeout(t);
  }, []);

  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { who: "you (anon)", text: input.trim(), mine: true, t: "now" }]);
    setInput("");
  };

  return (
    <main className="relative z-10 max-w-[1180px] mx-auto px-6 lg:px-10 pt-8 pb-24">
      <button onClick={onLeave} className="flex items-center gap-2 text-[12px] mb-6" style={{ color: muted }}>
        <ArrowLeft className="w-4 h-4" strokeWidth={1.6}/> back to circles
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* stage */}
        <section className="relative overflow-hidden rounded-[32px] p-8 lg:p-10"
                 style={{ background: `linear-gradient(160deg, ${surface} 0%, ${surface2} 100%)`, border: `1px solid ${border}` }}>
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full blur-3xl opacity-70"
               style={{ background: `radial-gradient(circle, ${lavender}, transparent 70%)` }}/>
          <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full blur-3xl opacity-70"
               style={{ background: `radial-gradient(circle, ${sky}, transparent 70%)` }}/>

          <div className="relative flex items-center gap-2 text-[10px] tracking-[0.32em] uppercase mb-6" style={{ color: muted }}>
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "#EF6B6B", opacity: 0.6 }}/>
              <span className="relative rounded-full w-2 h-2" style={{ background: "#EF6B6B" }}/>
            </span>
            live · {room.tag} · started {room.started}
          </div>
          <h1 className="relative font-serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] tracking-tight max-w-[620px]">
            {room.name}
          </h1>
          <p className="relative mt-4 text-[14px] max-w-[560px]" style={{ color: muted }}>{room.topic}</p>

          {/* speakers ring */}
          <div className="relative mt-10 flex flex-wrap items-end gap-6">
            {[
              { name: room.host, role: "host", color: primary, speaking: true },
              { name: "kavya", role: "co-host", color: lavender, speaking: false },
              { name: "leaf",   role: "guest",  color: sky, speaking: true },
              { name: "june",   role: "guest",  color: "#CDEBD9", speaking: false },
              { name: "moth",   role: "guest",  color: "#F8CADA", speaking: false },
            ].map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-2">
                <div className="relative">
                  {s.speaking && (
                    <span className="absolute inset-0 rounded-full animate-ping" style={{ background: s.color, opacity: 0.35 }}/>
                  )}
                  <span className="relative w-16 h-16 rounded-full flex items-center justify-center font-serif text-[18px]"
                        style={{ background: s.color, color: ink, border: `2px solid ${surface}`, boxShadow: "0 10px 24px -12px rgba(29,42,68,0.35)" }}>
                    {s.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <div className="text-[12.5px]" style={{ color: ink }}>{s.name}</div>
                  <div className="text-[9.5px] tracking-[0.22em] uppercase" style={{ color: muted }}>{s.role}</div>
                </div>
              </div>
            ))}
            <div className="ml-auto text-right">
              <div className="font-serif text-[36px] leading-none" style={{ color: ink }}>{room.listeners}</div>
              <div className="text-[10px] tracking-[0.28em] uppercase mt-1" style={{ color: muted }}>listening</div>
            </div>
          </div>

          {/* controls */}
          <div className="relative mt-10 flex items-center gap-3">
            <button onClick={() => setMuted(!muted_)}
                    className="h-12 px-5 rounded-full flex items-center gap-2 text-[12.5px] transition hover:-translate-y-0.5"
                    style={{ background: muted_ ? surface : ink, color: muted_ ? ink : "#F7FAFF", border: `1px solid ${border}` }}>
              {muted_ ? <MicOff className="w-4 h-4" strokeWidth={1.6}/> : <Mic className="w-4 h-4" strokeWidth={1.6}/>}
              {muted_ ? "raise a hand" : "you're live"}
            </button>
            <button onClick={() => {
                      if (navigator.share) navigator.share({ title: room.name, text: room.topic }).catch(()=>{});
                      else { navigator.clipboard.writeText(`${room.name} — ${room.topic}`); alert("room link copied"); }
                    }}
                    className="h-12 w-12 rounded-full flex items-center justify-center transition hover:-translate-y-0.5"
                    style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
              <Heart className="w-4 h-4" strokeWidth={1.6}/>
            </button>
            <button onClick={() => alert("room options: report · settings · leave quietly")}
                    className="h-12 w-12 rounded-full flex items-center justify-center transition hover:-translate-y-0.5"
                    style={{ background: surface, border: `1px solid ${border}`, color: ink }}>
              <MoreHorizontal className="w-4 h-4" strokeWidth={1.6}/>
            </button>
            <button onClick={onLeave}
                    className="ml-auto h-12 px-5 rounded-full text-[12.5px] transition hover:-translate-y-0.5"
                    style={{ background: "#F8CADA", color: ink }}>
              softly leave
            </button>
          </div>
        </section>

        {/* chat */}
        <aside className="rounded-[28px] flex flex-col overflow-hidden" style={{ background: surface, border: `1px solid ${border}`, minHeight: 560 }}>
          <div className="px-5 pt-5 pb-3 border-b" style={{ borderColor: border }}>
            <div className="text-[9.5px] tracking-[0.3em] uppercase" style={{ color: muted }}>side room · anonymous</div>
            <div className="font-serif text-[15px] mt-1">whispers</div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 scrollbar-soft" style={{ maxHeight: 480 }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
                <div className="text-[10px] tracking-[0.22em] uppercase mb-1" style={{ color: muted }}>{m.who} · {m.t}</div>
                <div className="max-w-[85%] px-4 py-2.5 rounded-[18px] text-[13px] leading-relaxed"
                     style={{
                       background: m.mine ? ink : (m as any).tone === "guide" ? `linear-gradient(135deg, ${lavender}, ${sky})` : surface2,
                       color: m.mine ? "#F7FAFF" : ink,
                     }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }}
                className="p-3 border-t flex items-center gap-2" style={{ borderColor: border }}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
                   placeholder="say something soft…"
                   className="flex-1 h-11 px-4 rounded-full outline-none text-[13px]"
                   style={{ background: surface2, color: ink }}/>
            <button type="submit" className="h-11 w-11 rounded-full flex items-center justify-center transition hover:-translate-y-0.5"
                    style={{ background: ink, color: "#F7FAFF" }}>
              <Send className="w-4 h-4" strokeWidth={1.6}/>
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}

// ─── thread detail ────────────────────────────────────────────────
function ThreadDetail({ thread, onBack, onVote, saved, onSave }: any) {
  const [comments, setComments] = useState([
    { who: "someone kind", text: "reading this at 2am. thank you for writing it down.", t: "23m", votes: 18 },
    { who: "quiet friend", text: "i felt this in my chest. we're not performing, we're just tired.", t: "1h", votes: 42 },
    { who: "anon", text: "sending a quiet nod across the internet.", t: "3h", votes: 9 },
  ]);
  const [reply, setReply] = useState("");

  const submit = () => {
    if (!reply.trim()) return;
    setComments([{ who: "you (anon)", text: reply.trim(), t: "now", votes: 0 }, ...comments]);
    setReply("");
  };

  return (
    <main className="relative z-10 max-w-[820px] mx-auto px-6 lg:px-10 pt-8 pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-[12px] mb-8" style={{ color: muted }}>
        <ArrowLeft className="w-4 h-4" strokeWidth={1.6}/> back to threads
      </button>

      <article className="relative rounded-[32px] p-8 lg:p-12 overflow-hidden"
               style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full blur-3xl opacity-40"
             style={{ background: `radial-gradient(circle, ${lavender}, transparent 70%)` }}/>

        <div className="relative flex items-center gap-2 text-[10.5px] tracking-[0.28em] uppercase mb-6" style={{ color: muted }}>
          <span className="rounded-full px-2.5 py-1" style={{ background: surface2, color: ink }}>{thread.circle}</span>
          <span>·</span> <span>{thread.author}</span> <span>·</span> <span>{thread.time}</span>
        </div>
        <h1 className="relative font-serif text-[clamp(1.8rem,4vw,3rem)] leading-[1.05] tracking-tight max-w-[680px]">
          {thread.title}
        </h1>
        <p className="relative mt-6 text-[15px] leading-[1.75] max-w-[620px]" style={{ color: ink }}>
          {thread.body}
        </p>

        <div className="relative mt-10 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full h-11 px-2" style={{ background: surface2 }}>
            <button onClick={() => onVote(+1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: ink }}>
              <ArrowUp className="w-4 h-4" strokeWidth={1.8}/>
            </button>
            <span className="font-serif text-[15px] min-w-[32px] text-center" style={{ color: ink }}>{thread.votes}</span>
            <button onClick={() => onVote(-1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color: ink }}>
              <ArrowDown className="w-4 h-4" strokeWidth={1.8}/>
            </button>
          </div>
          <button className="h-11 px-4 rounded-full flex items-center gap-2 text-[12.5px]" style={{ background: surface2, color: ink }}>
            <MessageCircle className="w-4 h-4" strokeWidth={1.6}/> {comments.length} held it
          </button>
          <button onClick={onSave} className="h-11 px-4 rounded-full flex items-center gap-2 text-[12.5px]"
                  style={{ background: saved ? ink : surface2, color: saved ? "#F7FAFF" : ink }}>
            <Bookmark className="w-4 h-4" strokeWidth={1.6} fill={saved ? "#F7FAFF" : "transparent"}/> {saved ? "kept" : "keep"}
          </button>
        </div>
      </article>

      {/* composer */}
      <div className="mt-10 rounded-[24px] p-6" style={{ background: surface, border: `1px solid ${border}` }}>
        <div className="text-[10px] tracking-[0.32em] uppercase mb-3" style={{ color: muted }}>hold this thread</div>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={3}
          placeholder="a sentence is enough. we're not looking for advice, just company."
          className="w-full bg-transparent outline-none text-[14px] leading-relaxed resize-none"
          style={{ color: ink }}
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[10.5px]" style={{ color: muted }}>posting as <em>anonymous · leaf</em></span>
          <button onClick={submit}
                  className="h-10 px-5 rounded-full flex items-center gap-2 text-[12.5px] transition hover:-translate-y-0.5"
                  style={{ background: ink, color: "#F7FAFF" }}>
            <Send className="w-3.5 h-3.5" strokeWidth={1.7}/> offer
          </button>
        </div>
      </div>

      {/* comments */}
      <div className="mt-10 flex flex-col gap-4">
        {comments.map((c, i) => (
          <div key={i} className="rounded-[20px] p-5" style={{ background: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 text-[10.5px] tracking-[0.24em] uppercase" style={{ color: muted }}>
              <span style={{ color: ink }}>{c.who}</span> · {c.t}
            </div>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: ink }}>{c.text}</p>
            <div className="mt-3 flex items-center gap-4 text-[11.5px]" style={{ color: muted }}>
              <button className="flex items-center gap-1"><ArrowUp className="w-3.5 h-3.5" strokeWidth={1.6}/> {c.votes}</button>
              <button className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" strokeWidth={1.6}/> hold</button>
              <button>reply</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
