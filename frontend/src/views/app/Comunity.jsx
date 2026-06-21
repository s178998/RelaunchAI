// pages/app/Community.jsx
"use client";
import { useState, useEffect, useRef } from "react";

// ---- Mock data -------------------------------------------------------------

const CHANNEL_GROUPS = [
  {
    label: "Channels",
    channels: [
      { id: "general", name: "general", topic: "Welcome! Say hi 👋 and introduce yourself." },
      { id: "interview-prep", name: "interview-prep", topic: "Mock interviews, system design, and behavioral practice." },
      { id: "job-leads", name: "job-leads", topic: "Share and find open roles from the community.", unread: 3 },
      { id: "resume-review", name: "resume-review", topic: "Drop your resume for feedback from peers and recruiters." },
      { id: "offers-and-wins", name: "offers-and-wins", topic: "Celebrate the wins 🎉 big and small." },
      { id: "layoff-support", name: "layoff-support", topic: "A safe space to talk through transitions. You're not alone." },
    ],
  },
];

const DIRECT_MESSAGES = [
  { id: "dm-sarah", name: "Sarah Chen", initials: "SC", color: "from-blue-500 to-blue-600", status: "online", topic: "Direct message" },
  { id: "dm-michael", name: "Michael Rodriguez", initials: "MR", color: "from-purple-500 to-purple-600", status: "online", topic: "Direct message" },
  { id: "dm-priya", name: "Priya Nair", initials: "PN", color: "from-pink-500 to-rose-600", status: "away", topic: "Direct message" },
  { id: "dm-james", name: "James Okafor", initials: "JO", color: "from-amber-500 to-orange-600", status: "offline", topic: "Direct message" },
];

const MEMBERS = [
  { name: "Sarah Chen", initials: "SC", color: "from-blue-500 to-blue-600", role: "Ex-Google PM", status: "online" },
  { name: "Michael Rodriguez", initials: "MR", color: "from-purple-500 to-purple-600", role: "Senior SWE", status: "online" },
  { name: "Emily Watson", initials: "EW", color: "from-green-500 to-green-600", role: "Tech Recruiter", status: "online" },
  { name: "Priya Nair", initials: "PN", color: "from-pink-500 to-rose-600", role: "Data Scientist", status: "away" },
  { name: "David Kim", initials: "DK", color: "from-cyan-500 to-blue-600", role: "Eng Manager", status: "online" },
  { name: "James Okafor", initials: "JO", color: "from-amber-500 to-orange-600", role: "Product Designer", status: "offline" },
  { name: "Lena Fischer", initials: "LF", color: "from-violet-500 to-purple-600", role: "Ex-Stripe SWE", status: "offline" },
];

const SEED_MESSAGES = {
  general: [
    { id: 1, author: "Sarah Chen", initials: "SC", color: "from-blue-500 to-blue-600", time: "9:02 AM", text: "Morning everyone ☀️ Just landed a final round at Stripe — happy to share how I prepped if anyone's interested!", reactions: [{ emoji: "🎉", count: 8 }, { emoji: "🔥", count: 4 }] },
    { id: 2, author: "Michael Rodriguez", initials: "MR", color: "from-purple-500 to-purple-600", time: "9:05 AM", text: "Huge congrats Sarah! Would love a writeup in #interview-prep 🙏" },
    { id: 3, author: "Emily Watson", initials: "EW", color: "from-green-500 to-green-600", time: "9:11 AM", text: "If anyone's open to new roles, I have 4 reqs opening up next week. Drop your resume in #resume-review and tag me.", reactions: [{ emoji: "👀", count: 12 }] },
    { id: 4, author: "David Kim", initials: "DK", color: "from-cyan-500 to-blue-600", time: "9:24 AM", text: "New here after a layoff at my last company. This group already feels way more supportive than LinkedIn lol" },
    { id: 5, author: "Priya Nair", initials: "PN", color: "from-pink-500 to-rose-600", time: "9:26 AM", text: "Welcome David! 👋 Check out #layoff-support whenever you need it. We've all been there." },
  ],
  "interview-prep": [
    { id: 1, author: "Michael Rodriguez", initials: "MR", color: "from-purple-500 to-purple-600", time: "8:40 AM", text: "Running a mock system-design session tonight at 7pm PT. Designing a URL shortener. 3 spots left.", reactions: [{ emoji: "✋", count: 5 }] },
    { id: 2, author: "Lena Fischer", initials: "LF", color: "from-violet-500 to-purple-600", time: "8:52 AM", text: "Grab me for behavioral practice — I interviewed at 6 companies last month, happy to play interviewer." },
    { id: 3, author: "Sarah Chen", initials: "SC", color: "from-blue-500 to-blue-600", time: "9:15 AM", text: "Pro tip that got me through Stripe: structure every behavioral answer as SITUATION → ACTION → RESULT and quantify the result. Sounds obvious but it changed everything for me.", reactions: [{ emoji: "💯", count: 14 }, { emoji: "📝", count: 6 }] },
  ],
  "job-leads": [
    { id: 1, author: "Emily Watson", initials: "EW", color: "from-green-500 to-green-600", time: "Yesterday", text: "🟢 Senior Frontend Engineer @ a Series B fintech (remote, US). $180–210k. DM me your portfolio." },
    { id: 2, author: "James Okafor", initials: "JO", color: "from-amber-500 to-orange-600", time: "Yesterday", text: "Product Designer role on my team is open again — we're looking for someone strong in design systems. Referral happy to chat.", reactions: [{ emoji: "🙌", count: 7 }] },
    { id: 3, author: "David Kim", initials: "DK", color: "from-cyan-500 to-blue-600", time: "8:30 AM", text: "Two backend reqs (Go / Postgres) on my team. Comp is competitive, fully remote. Reply here and I'll send the link." },
  ],
  "resume-review": [
    { id: 1, author: "Priya Nair", initials: "PN", color: "from-pink-500 to-rose-600", time: "10:15 AM", text: "Posted my updated resume — trying to pivot from analytics to ML engineering. Brutal honesty welcome 🙏" },
    { id: 2, author: "Emily Watson", initials: "EW", color: "from-green-500 to-green-600", time: "10:40 AM", text: "@Priya strong overall! Lead each bullet with impact, not responsibility. \"Built X\" → \"Cut churn 12% by building X.\" Recruiters scan for numbers.", reactions: [{ emoji: "🙏", count: 3 }] },
  ],
  "offers-and-wins": [
    { id: 1, author: "Lena Fischer", initials: "LF", color: "from-violet-500 to-purple-600", time: "Mon", text: "Signed the offer this morning. 4 months after the layoff. To anyone in the thick of it: keep going. 🥹", reactions: [{ emoji: "🎉", count: 31 }, { emoji: "❤️", count: 18 }, { emoji: "🥹", count: 9 }] },
    { id: 2, author: "Michael Rodriguez", initials: "MR", color: "from-purple-500 to-purple-600", time: "Mon", text: "LET'S GO LENA 🚀🚀🚀" },
  ],
  "layoff-support": [
    { id: 1, author: "David Kim", initials: "DK", color: "from-cyan-500 to-blue-600", time: "7:50 AM", text: "Some days the motivation just isn't there. How is everyone keeping a routine during the search?" },
    { id: 2, author: "Sarah Chen", initials: "SC", color: "from-blue-500 to-blue-600", time: "8:05 AM", text: "Treat it like a job: same wake-up, get dressed, one focused block in the morning. And take real weekends — burnout helps no one." },
    { id: 3, author: "Priya Nair", initials: "PN", color: "from-pink-500 to-rose-600", time: "8:12 AM", text: "This. Also celebrate tiny wins — a callback, a good convo, a finished cover letter. They add up. 💛", reactions: [{ emoji: "💛", count: 11 }] },
  ],
  "dm-sarah": [
    { id: 1, author: "Sarah Chen", initials: "SC", color: "from-blue-500 to-blue-600", time: "9:30 AM", text: "Hey! Saw you're prepping for PM loops — want to do a mock this week?" },
  ],
  "dm-michael": [
    { id: 1, author: "Michael Rodriguez", initials: "MR", color: "from-purple-500 to-purple-600", time: "Yesterday", text: "Sent you that system design doc 👍 let me know what you think" },
  ],
  "dm-priya": [
    { id: 1, author: "Priya Nair", initials: "PN", color: "from-pink-500 to-rose-600", time: "Tue", text: "Thanks for the resume notes earlier, super helpful 🙏" },
  ],
  "dm-james": [
    { id: 1, author: "James Okafor", initials: "JO", color: "from-amber-500 to-orange-600", time: "Mon", text: "Let me know if you want that design role referral!" },
  ],
};

const STATUS_DOT = {
  online: "bg-green-500",
  away: "bg-amber-400",
  offline: "bg-gray-400",
};

// ---- Component -------------------------------------------------------------

export default function Community() {
  const [activeId, setActiveId] = useState("general");
  const [messagesByChannel, setMessagesByChannel] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const [me, setMe] = useState({ name: "You", initials: "YO" });
  const endRef = useRef(null);

  // Personalize the composer with the logged-in user if we have one
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const u = JSON.parse(saved);
        const first = u.firstname || "";
        const last = u.lastname || "";
        const initials =
          ((first[0] || "") + (last[0] || "")).toUpperCase() ||
          (first.slice(0, 2) || "YO").toUpperCase();
        setMe({
          name: [first, last].filter(Boolean).join(" ") || "You",
          initials: initials || "YO",
        });
      }
    } catch {
      /* keep default */
    }
  }, []);

  const allChannels = CHANNEL_GROUPS.flatMap((g) => g.channels);
  const activeChannel =
    allChannels.find((c) => c.id === activeId) ||
    DIRECT_MESSAGES.find((d) => d.id === activeId);
  const isDM = activeId.startsWith("dm-");
  const messages = messagesByChannel[activeId] || [];
  const onlineCount = MEMBERS.filter((m) => m.status === "online").length;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  const sendMessage = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const newMsg = {
      id: Date.now(),
      author: me.name,
      initials: me.initials,
      color: "from-blue-600 to-purple-600",
      time: now,
      text,
      reactions: [],
      me: true,
    };
    setMessagesByChannel((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));
    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[560px] bg-white">

      {/* ===== Channel sidebar (dark) ===== */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-[#15171e] text-gray-300">
        {/* Workspace header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">RelaunchAI Community</p>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {onlineCount} online
            </p>
          </div>
          <button className="w-7 h-7 rounded-md bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          {CHANNEL_GROUPS.map((group) => (
            <div key={group.label} className="px-2 mb-4">
              <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {group.label}
              </p>
              {group.channels.map((ch) => {
                const active = ch.id === activeId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveId(ch.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition ${
                      active
                        ? "bg-blue-600 text-white font-medium"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    <span className={active ? "text-white" : "text-gray-500"}>#</span>
                    <span className="flex-1 text-left truncate">{ch.name}</span>
                    {ch.unread && !active && (
                      <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {ch.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Direct messages */}
          <div className="px-2">
            <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Direct Messages
            </p>
            {DIRECT_MESSAGES.map((dm) => {
              const active = dm.id === activeId;
              return (
                <button
                  key={dm.id}
                  onClick={() => setActiveId(dm.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition ${
                    active
                      ? "bg-blue-600 text-white font-medium"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <span className="relative flex-shrink-0">
                    <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${dm.color} flex items-center justify-center text-white text-[9px] font-bold`}>
                      {dm.initials}
                    </span>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#15171e] ${STATUS_DOT[dm.status]}`}></span>
                  </span>
                  <span className="flex-1 text-left truncate">{dm.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current user footer */}
        <div className="h-14 flex items-center gap-2 px-3 border-t border-white/5">
          <span className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {me.initials}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{me.name}</p>
            <p className="text-xs text-green-400">Active</p>
          </div>
        </div>
      </aside>

      {/* ===== Main chat column ===== */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Channel header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {isDM ? (
              <span className="font-semibold text-gray-900 truncate">{activeChannel?.name}</span>
            ) : (
              <>
                <span className="text-gray-400 text-lg">#</span>
                <span className="font-semibold text-gray-900 truncate">{activeChannel?.name}</span>
              </>
            )}
            <span className="hidden lg:inline text-gray-300">|</span>
            <span className="hidden lg:inline text-sm text-gray-500 truncate max-w-md">
              {activeChannel?.topic}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-1.3" />
            </svg>
            {MEMBERS.length}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Channel intro */}
          <div className="mb-6 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl mb-3">
              {isDM ? "💬" : "#"}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isDM ? activeChannel?.name : `Welcome to #${activeChannel?.name}`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{activeChannel?.topic}</p>
          </div>

          <div className="space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 group">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${msg.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {msg.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-gray-900">{msg.author}</span>
                    {msg.me && (
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">you</span>
                    )}
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-0.5 whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                  {msg.reactions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.reactions.map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5 hover:border-blue-300 cursor-default"
                        >
                          <span>{r.emoji}</span>
                          <span className="text-gray-600 font-medium">{r.count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="px-5 pb-5 pt-2 flex-shrink-0">
          <form
            onSubmit={sendMessage}
            className="flex items-end gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition"
          >
            <button type="button" className="text-gray-400 hover:text-gray-600 transition p-1.5" aria-label="Add attachment">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${isDM ? activeChannel?.name : "#" + activeChannel?.name}`}
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none py-1.5 bg-transparent"
            />
            <button type="button" className="text-gray-400 hover:text-gray-600 transition p-1.5" aria-label="Add emoji">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="px-3.5 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          <p className="text-[11px] text-gray-400 mt-1.5 px-1">
            Showcase preview — messages stay on this page and aren’t sent anywhere.
          </p>
        </div>
      </div>

      {/* ===== Members panel ===== */}
      <aside className="hidden xl:flex w-60 flex-shrink-0 flex-col border-l border-gray-200 bg-gray-50">
        <div className="h-14 flex items-center px-4 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-900">Members — {MEMBERS.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {["online", "away", "offline"].map((bucket) => {
            const group = MEMBERS.filter((m) => m.status === bucket);
            if (group.length === 0) return null;
            return (
              <div key={bucket} className="mb-3">
                <p className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {bucket === "online" ? "Online" : bucket === "away" ? "Away" : "Offline"} — {group.length}
                </p>
                {group.map((m) => (
                  <div
                    key={m.name}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white transition cursor-default ${
                      m.status === "offline" ? "opacity-60" : ""
                    }`}
                  >
                    <span className="relative flex-shrink-0">
                      <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {m.initials}
                      </span>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-50 ${STATUS_DOT[m.status]}`}></span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 truncate">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
