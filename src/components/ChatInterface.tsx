"use client"
import React, { useEffect, useRef, useState } from "react";
import { Alegreya, Alegreya_Sans } from "next/font/google";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getOrCreateGuestId } from "@/utils/identity";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";  
import { redirectToSpotifyLogin, getSpotifyToken, clearSpotifyToken } from "@/utils/spotifyAuth";

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const alegreyaSans = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type Track = {
  id: string;
  title: string;
  thumbnail?: string | null;
  url: string;
};

type Message = {
  role: "user" | "ai";
  text: string;
};

function AnimatedWave({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end space-x-[3px] h-8">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: "3px",
            borderRadius: "2px",
            background: "#d4944a",
            animationName: isPlaying ? "wave" : "none",
            animationDuration: `${0.8 + (i % 3) * 0.15}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationDelay: `${(i - 1) * 0.1}s`,
            height: isPlaying ? undefined : "5px",
            opacity: isPlaying ? 1 : 0.4,
          }}
          className={isPlaying ? "wave-bar" : ""}
        />
      ))}
      <style>{`
        @keyframes wave {
          0%   { height: 4px; }
          50%  { height: 28px; }
          100% { height: 6px; }
        }
        .wave-bar { height: 8px; }
      `}</style>
    </div>
  );
}

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const [spotifyLink, setSpotifyLink] = useState("");
  const [selected, setSelected] = useState<Track | null>(null);
  const [history, setHistory] = useState<Track[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // const [isPlaying, setIsPlaying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const guestId = useRef<string>("");
  const hasLoadedFromUrl = useRef(false);
  const router = useRouter();
  
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { isReady, isPlaying, error, playTrack, togglePlay } = useSpotifyPlayer(accessToken);

  function parseSpotifyLink(link: string) {
    const urlRegex = /open\.spotify\.com\/track\/([A-Za-z0-9_-]+)/i;
    const uriRegex = /spotify:track:([A-Za-z0-9_-]+)/i;
    let m = link.match(urlRegex);
    if (m && m[1]) return m[1];
    m = link.match(uriRegex);
    if (m && m[1]) return m[1];
    return null;
  }

  async function fetchOEmbed(spotifyUrl: string) {
    try {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        title: data.title as string | undefined,
        thumbnail: (data.thumbnail_url as string) || null,
      };
    } catch {
      return null;
    }
  }

  async function handleAddTrack() {
    await loadTrack(spotifyLink.trim());
  }

  async function loadTrack(link: string) {
    const id = parseSpotifyLink(link);
    if (!id) return alert("Paste a valid Spotify track link (open.spotify.com/track/...)");
    
    setTrackLoading(true);
    const url = `https://open.spotify.com/track/${id}`;
    const o = await fetchOEmbed(url);
    const title = o?.title || `Spotify track ${id}`;
    const thumbnail = o?.thumbnail || null;

    const t: Track = { id, title, thumbnail, url };
    setSelected(t);
    // setIsPlaying(false);
    setHistory((h) => [t, ...h.filter((x) => x.id !== id)].slice(0, 10));
    setTrackLoading(false);
    setSidebarOpen(false);

    router.push(`/chat?spotify=${encodeURIComponent(link)}`);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function handlePlayPause() {
    if (!accessToken) {
      await redirectToSpotifyLogin();
      return;
    }
    if (!selected) return;

    if (!isPlaying) {
      await playTrack(selected.id);
    } else {
      await togglePlay();
    }
  }

  function selectFromHistory(t: Track) {
    setSelected(t);
    // setIsPlaying(false);
    setSidebarOpen(false);
    router.push(`/chat?spotify=${encodeURIComponent(t.url)}`); 
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function sendQuestion() {
    if (!question.trim() || !ws) return;
    const q = question.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    const songUrl = selected?.url || "";
    ws.send(JSON.stringify({ message: q, song_url: songUrl, guest_id: guestId.current }));
  }

  useEffect(() => {
    const wsUrl = process.env.CHATBOT_WEBSOCKET_URL
    console.log("Chatbot Websocket URL:", wsUrl)
    const websocket = new WebSocket(`${wsUrl}/ws/chat`);
    websocket.onopen = () => {
      console.log("WebSocket connected");
    };
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.response) {
        setMessages((m) => [...m, { role: "ai", text: data.response }]);
        setLoading(false);
      } else if (data.error) {
        setMessages((m) => [...m, { role: "ai", text: `Error: ${data.error}` }]);
        setLoading(false);
      }
    };
    websocket.onclose = () => {
      console.log("WebSocket disconnected");
    };
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  useEffect(() => {
    const s = searchParams?.get("spotify");
    if (s && !hasLoadedFromUrl.current) {
      loadTrack(s);
      hasLoadedFromUrl.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selected) return;
    const saved = localStorage.getItem(`messages:${selected.id}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ role: "ai", text: `Loaded "${selected.title}" — ask me anything about the track, its lyrics, mood, or structure.` }]);
    }
  }, [selected?.id]);

  useEffect(() => {
    if (!selected || messages.length === 0) return;
    localStorage.setItem(`messages:${selected.id}`, JSON.stringify(messages));
  }, [messages, selected?.id]);

  useEffect(() => {
    guestId.current = getOrCreateGuestId();
    console.log("Guest ID:", guestId.current);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("trackHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (history.length === 0) return;
    localStorage.setItem("trackHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    getSpotifyToken().then(token => setAccessToken(token))
  }, [])

  // Handle player errors
  useEffect(() => {
    if (error === "auth_error") {
      clearSpotifyToken();
      setAccessToken(null)
    }
    if (error === "premium_required") {
      alert("Spotify Premium is required to play music in the browser.");
    }
  }, [error])

  const timeStr = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={alegreya.className + " w-full min-h-screen"} style={{ background: "#f5ede0" }}>
      <div className="flex h-screen overflow-hidden relative">

        {/* ── Mobile overlay backdrop ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed md:relative z-30 md:z-auto
            h-full md:h-auto
            w-72 flex flex-col
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
          style={{
            background: "linear-gradient(180deg, #3b1f0e 0%, #4a2a14 60%, #3b1f0e 100%)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-between py-5 px-5">
            <a href="/" className="flex items-center flex-shrink-0 cursor-pointer">
              <Image
                src="/logo.svg"
                alt="Lyr.AI logo"
                width={56}
                height={56}
                className="rounded-md"
                style={{ objectFit: "contain" }}
              />
              <div className={alegreyaSans.className + " text-3xl font-extrabold text-[#FFF1D6] ml-3"}>
                Lyr.AI
              </div>
            </a>
            {/* Close button (mobile only) */}
            <button
              className="md:hidden text-[#FFF1D6] p-1"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Add track input */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,220,160,0.10)" }}>
            <label className="text-[15px] text-[#c49050] block mb-2">Add New Track</label>
            <input
              value={spotifyLink}
              className={alegreyaSans.className}
              onChange={(e) => setSpotifyLink(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddTrack(); }}
              placeholder="open.spotify.com/track/..."
              style={{
                width: "100%",
                background: "rgba(20,8,0,0.45)",
                border: "1px solid #7a4a22",
                borderRadius: "7px",
                padding: "10px 13px",
                fontSize: "14px",
                color: "#f0d9b0",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddTrack}
              disabled={!spotifyLink.trim() || trackLoading}
              className={alegreyaSans.className + " cursor-pointer font-medium"}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "11px",
                borderRadius: "7px",
                fontSize: "16px",
                background: trackLoading ? "#6b3d1e" : "linear-gradient(135deg, #d4884a 0%, #a85e28 100%)",
                color: "#fff8f0",
                border: "none",
                cursor: spotifyLink.trim() && !trackLoading ? "pointer" : "not-allowed",
                opacity: !spotifyLink.trim() ? 0.45 : 1,
                transition: "all 0.2s",
                boxShadow: spotifyLink.trim() && !trackLoading ? "0 2px 12px rgba(180,100,40,0.35)" : "none",
              }}
            >
              {trackLoading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-5 py-3" style={{ scrollbarWidth: "thin", scrollbarColor: "#6b3d1e transparent" }}>
            <div className="text-[#c49050] text-[15px] block mb-2">History</div>
            {history.length === 0 && (
              <div style={{ color: "#7a5030", fontSize: "14px", fontStyle: "italic" }}>No songs yet.</div>
            )}
            {history.map((t) => (
              <button
                key={t.id}
                onClick={() => selectFromHistory(t)}
                className="w-full flex items-center text-left mb-2 cursor-pointer"
                style={{
                  padding: "10px",
                  borderRadius: "9px",
                  background: selected?.id === t.id ? "rgba(255,200,120,0.10)" : "transparent",
                  border: selected?.id === t.id ? "1px solid rgba(255,200,120,0.18)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {t.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.thumbnail} alt={t.title} className="rounded-md object-cover flex-shrink-0" style={{ width: 44, height: 44, border: "1px solid #7a4a22" }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 7, background: "rgba(20,8,0,0.4)", border: "1px solid #7a4a22", display: "flex", alignItems: "center", justifyContent: "center", color: "#d4884a", fontSize: 18, flexShrink: 0 }}>♪</div>
                )}
                <div className="ml-3 overflow-hidden">
                  <div style={{ color: "#f0d9b0", fontSize: "15px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0" style={{ background: "#f5ede0" }}>

          {/* ── Track Header ── */}
          <div
            style={{
              background: "linear-gradient(135deg, #4a2a14 0%, #5e3520 50%, #4a2a14 100%)",
              padding: "14px 20px",
              flexShrink: 0,
              boxShadow: "0 4px 20px rgba(30,10,0,0.15)",
            }}
          >
            <div className="flex items-center gap-3">

              {/* Hamburger (mobile only) */}
              <button
                className="md:hidden flex-shrink-0 text-[#FFF1D6] p-1"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>

              {selected ? (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  {/* Album art + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    {selected.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selected.thumbnail}
                        alt={selected.title}
                        style={{ width: 62, height: 62, borderRadius: 9, objectFit: "cover", border: "2px solid #d4884a", boxShadow: "0 4px 20px rgba(0,0,0,0.45)", flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: 62, height: 62, borderRadius: 9, background: "#3b1f0e", border: "2px solid #d4884a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#d4884a", flexShrink: 0 }}>♪</div>
                    )}
                    <div className="min-w-0">
                      <div className={alegreyaSans.className} style={{ color: "#c49050", fontSize: "12px", letterSpacing: "0.05em" }}>Now Analysing</div>
                      <div className={alegreya.className} style={{ color: "#f5e8cc", fontSize: "20px", fontWeight: 700, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selected.title}
                      </div>
                      <a href={selected.url} target="_blank" rel="noopener noreferrer" className="text-[#9a6840] hover:text-[#f0d9b0] transition-colors" style={{ fontSize: "14px" }}>
                        View on Spotify ↗
                      </a>
                    </div>
                  </div>

                  {/* Wave + single Play button — shown on all screen sizes */}
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <button
                      onClick={handlePlayPause} 
                      className="cursor-pointer"
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: isPlaying
                          ? "linear-gradient(135deg, #8a4e1a, #6b3a10)"
                          : "linear-gradient(135deg, #d4884a, #a85e28)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 18px rgba(180,100,40,0.45)",
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      {!accessToken ? (
                        // Spotify icon — signals login is needed
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.65c-.2.2-.51.2-.71 0-1.79-1.79-4.3-2.1-7.12-1.15-.28.1-.57-.05-.67-.33s.05-.57.33-.67c3.12-1.07 5.93-.7 8.03 1.44.19.19.19.51-.01.71h.15zm1.23-2.74c-.24.24-.63.24-.88 0-2.04-2.04-5.14-2.64-7.55-1.44-.33.16-.73.02-.89-.31-.16-.33-.02-.73.31-.89 2.76-1.38 6.27-.71 8.6 1.57.25.24.25.63.01.87l.4.2zm.11-2.84c-.28.28-.73.28-1.01 0-2.37-2.37-6.21-2.89-8.99-1.58-.38.18-.83.02-1.01-.36-.18-.38-.02-.83.36-1.01 3.18-1.49 7.52-.89 10.24 1.84.28.27.28.73.01 1.01l.4.1z"/>
                        </svg>
                      ) : isPlaying ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <rect x="5" y="4" width="4" height="16" rx="1.5" fill="white"/>
                          <rect x="15" y="4" width="4" height="16" rx="1.5" fill="white"/>
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                          <path d="M6 4.5v15l13-7.5L6 4.5z" fill="white"/>
                        </svg>
                      )}
                    </button>
                    <div className="hidden sm:block">
                      <AnimatedWave isPlaying={isPlaying} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1">
                  <div style={{ width: 62, height: 62, borderRadius: 9, background: "#3b1f0e", border: "2px dashed #6b3d1e", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b3d1e", fontSize: 24, flexShrink: 0 }}>♪</div>
                  <div>
                    <div className={alegreyaSans.className} style={{ color: "#9a6840", fontSize: "11px", letterSpacing: "0.25em" }}>NO TRACK LOADED</div>
                    <div className={alegreya.className} style={{ color: "#b08050", fontSize: "17px", marginTop: 2 }}>
                      <span className="md:hidden">Tap ☰ to paste a Spotify link</span>
                      <span className="hidden md:inline">Paste a Spotify link in the sidebar to begin</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Chat ── */}
          <div
            className={alegreyaSans.className + " flex-1 font-medium overflow-y-auto px-4 md:px-8 py-6"}
            style={{ scrollbarWidth: "thin", scrollbarColor: "#c4a070 transparent" }}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {m.role === "ai" ? (
                    <>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #d4884a, #a85e28)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff8f0", fontSize: 17, flexShrink: 0, marginRight: 14, marginTop: 2, boxShadow: "0 2px 8px rgba(180,100,40,0.3)" }}>♪</div>
                      <div style={{ maxWidth: "80%" }}>
                        <div style={{ background: "#fffaf3", border: "1px solid #e8d0a0", borderRadius: "2px 14px 14px 14px", padding: "14px 18px", color: "#3a1e08", fontSize: "17px", lineHeight: 1.8, boxShadow: "0 2px 10px rgba(60,30,10,0.07)", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                          {m.text}
                        </div>
                        <div style={{ color: "#b09060", fontSize: "13px", marginTop: 4, paddingLeft: 4 }}>{timeStr()}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #4a2a14, #3b1f0e)", border: "1px solid #7a4a22", display: "flex", alignItems: "center", justifyContent: "center", color: "#d4884a", fontSize: 14, flexShrink: 0, marginLeft: 14, marginTop: 2, fontWeight: 700 }}>U</div>
                      <div style={{ maxWidth: "80%" }}>
                        <div style={{ background: "linear-gradient(135deg, #5e3520, #4a2a14)", border: "1px solid #8a5030", borderRadius: "14px 2px 14px 14px", padding: "14px 18px", color: "#f5e8cc", fontSize: "17px", lineHeight: 1.8, boxShadow: "0 2px 10px rgba(60,30,10,0.18)", wordBreak: "break-word", whiteSpace: "pre-wrap", textAlign: "left" }}>
                          {m.text}
                        </div>
                        <div style={{ color: "#b09060", fontSize: "13px", marginTop: 4, textAlign: "right", paddingRight: 4 }}>{timeStr()}</div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-3">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #d4884a, #a85e28)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff8f0", fontSize: 17 }}>♪</div>
                  <div style={{ background: "#fffaf3", border: "1px solid #e8d0a0", borderRadius: "2px 14px 14px 14px", padding: "14px 22px", display: "flex", alignItems: "center", gap: 7 }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#d4884a", display: "inline-block", animation: "dotbounce 1s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                    ))}
                    <style>{`@keyframes dotbounce { 0%,80%,100%{transform:scale(0.6);opacity:0.35}40%{transform:scale(1);opacity:1} }`}</style>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* ── Input bar ── */}
          <div style={{ padding: "14px 20px 18px", borderTop: "1px solid #dcc898", background: "#f5ede0", flexShrink: 0 }}>
            <div
              className={alegreyaSans.className + " max-w-3xl mx-auto flex items-center font-medium"}
              style={{ background: "#fffaf3", border: "1.5px solid #c8a060", borderRadius: "40px", padding: "7px 7px 7px 20px", boxShadow: "0 2px 16px rgba(60,30,10,0.09)" }}
            >
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={selected ? "Ask about this track — lyrics, mood, structure…" : "Load a track from the sidebar to get started"}
                disabled={loading}
                style={{ flex: 1, background: "transparent", outline: "none", border: "none", fontSize: "17px", color: "#3a1e08", caretColor: "#d4884a", minWidth: 0 }}
                onKeyDown={(e) => { if (e.key === "Enter") sendQuestion(); }}
              />
              <button
                onClick={sendQuestion}
                disabled={!question.trim() || loading}
                className="cursor-pointer flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: !question.trim() ? "#dcc898" : "linear-gradient(135deg, #d4884a, #a85e28)",
                  border: "none",
                  cursor: !question.trim() || loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: !question.trim() ? "none" : "0 2px 12px rgba(180,100,40,0.38)",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="white"/>
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}