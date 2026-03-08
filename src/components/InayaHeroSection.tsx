import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";

const VIDEO_URL = "/inaya-bg.mp4";
const CHAT_URL = "https://h104-64.rackhostvps.com/chat";

const VIDEO_W = 1280, VIDEO_H = 720;

const basePos: Record<string, { x: number; y: number }> = {
  u1: { x: 10.66, y: 50.40 },
  u2: { x: 17.82, y: 52.65 },
  u3: { x: 19.05, y: 39.42 },
  u4: { x: 71.73, y: 39.15 },
  u5: { x: 83.13, y: 51.32 },
  u6: { x: 91.22, y: 49.87 },
};

const MOVE: Record<string, { dx: number; dy: number }> = {
  u1: { dx: -44, dy: 2 },
  u2: { dx: -32, dy: -4 },
  u3: { dx: -22, dy: 2 },
  u4: { dx: 46, dy: 2 },
  u5: { dx: 30, dy: -6 },
  u6: { dx: 22, dy: 2 },
};

const orbData = [
  { id: "u1", cls: "l1", emoji: "🎟️", filter: "kuponok", gold: false },
  { id: "u2", cls: "l2", emoji: "🔥", filter: "akciok", gold: false },
  { id: "u3", cls: "l3", emoji: "⭐", filter: "kedvencek", gold: true },
  { id: "u4", cls: "l4", filter: "boltok", gold: false, svg: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(0,220,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1-5h16l1 5" /><path d="M3 9a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0 2 2 2 2 0 0 0 2-2" />
      <path d="M5 20v-9" /><path d="M19 20v-9" /><rect x="8" y="14" width="8" height="6" rx="1" />
    </svg>
  )},
  { id: "u5", cls: "l5", filter: "termekek", gold: false, svg: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(0,220,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )},
  { id: "u6", cls: "l6", filter: "jogi", gold: false, svg: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(0,220,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )},
];

const filterPrompts: Record<string, string> = {
  kuponok: "Milyen kuponok és kedvezmény kódok érhetők el most?",
  akciok: "Mutasd a mai legjobb akciókat és ajánlatokat!",
  kedvencek: "Mutasd a legnépszerűbb és legjobban értékelt termékeket!",
  boltok: "Mutasd az elérhető boltokat és üzleteket!",
  termekek: "Mutasd a legjobb termékeket!",
  jogi: "Mutasd az adatvédelmi és cookie szabályzatot!",
};

interface ChatMsg {
  role: "user" | "ai";
  text: string;
}

const InayaHeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { left: string; top: string }>>({});
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [activated, setActivated] = useState(false);

  // Animate orbs on load
  useEffect(() => {
    const timer = setTimeout(() => setActivated(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Track orbs to video position
  const trackTick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const t = video.currentTime || 0;
    const dur = video.duration || 4.0;
    const progress = t <= dur / 2 ? t / (dur / 2) : 1 - (t - dur / 2) / (dur / 2);
    const scale = Math.max(window.innerWidth / VIDEO_W, window.innerHeight / VIDEO_H);
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const newPos: Record<string, { left: string; top: string }> = {};
    for (const id of Object.keys(basePos)) {
      const m = MOVE[id];
      const ox = (m.dx * scale / vw) * 100 * progress;
      const oy = (m.dy * scale / vh) * 100 * progress;
      newPos[id] = {
        left: (basePos[id].x + ox) + "%",
        top: (basePos[id].y + oy) + "%",
      };
    }
    setPositions(newPos);
    requestAnimationFrame(trackTick);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(trackTick);
    return () => cancelAnimationFrame(raf);
  }, [trackTick]);

  // Scroll chat
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const filterBy = (type: string) => {
    setInput(filterPrompts[type] || "");
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setTyping(true);
    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: "demo" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.response || data.message || "Hiba történt." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Kapcsolódási hiba. Próbáld újra!" }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&family=Orbitron:wght@400;600;700&display=swap');
        .hero-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center top; z-index:1; }
        .holo-unit { position:absolute; z-index:5; display:flex; flex-direction:column; align-items:center; opacity:0; pointer-events:none; transform:translate(-50%,-50%); transition:opacity 0.6s; }
        .holo-unit.float { opacity:1; pointer-events:all; }
        .holo-orb { width:54px; height:54px; border-radius:50%; background:radial-gradient(circle,rgba(0,220,255,0.28) 0%,transparent 70%); border:1.5px solid rgba(0,220,255,0.7); box-shadow:0 0 16px rgba(0,200,255,0.65),0 0 35px rgba(0,150,255,0.3); display:flex; align-items:center; justify-content:center; font-size:22px; cursor:pointer; position:relative; flex-shrink:0; animation:orbPulse 2.2s ease-in-out infinite; }
        .holo-orb.gold { border-color:rgba(255,220,50,0.75); background:radial-gradient(circle,rgba(255,200,0,0.22) 0%,transparent 70%); box-shadow:0 0 16px rgba(255,200,0,0.6),0 0 35px rgba(200,150,0,0.3); animation:orbPulseGold 2.2s ease-in-out infinite; }
        @keyframes orbPulse { 0%,100%{box-shadow:0 0 16px rgba(0,200,255,0.65),0 0 35px rgba(0,150,255,0.3)} 50%{box-shadow:0 0 28px rgba(0,220,255,1),0 0 55px rgba(0,180,255,0.6)} }
        @keyframes orbPulseGold { 0%,100%{box-shadow:0 0 16px rgba(255,200,0,0.6),0 0 35px rgba(200,150,0,0.3)} 50%{box-shadow:0 0 28px rgba(255,220,0,1),0 0 55px rgba(200,160,0,0.6)} }
        .holo-orb:hover { transform:scale(1.18); }
        .holo-orb::before { content:''; position:absolute; inset:-7px; border-radius:50%; border:1.5px solid transparent; border-top-color:rgba(0,220,255,0.95); border-right-color:rgba(0,220,255,0.35); animation:spinCW 1.8s linear infinite; }
        .holo-orb::after { content:''; position:absolute; inset:-14px; border-radius:50%; border:1px solid transparent; border-bottom-color:rgba(0,200,255,0.55); border-left-color:rgba(0,200,255,0.2); animation:spinCCW 2.8s linear infinite; }
        .holo-orb.gold::before { border-top-color:rgba(255,220,50,0.95); border-right-color:rgba(255,200,0,0.35); }
        .holo-orb.gold::after { border-bottom-color:rgba(255,200,0,0.55); border-left-color:rgba(255,180,0,0.2); }
        @keyframes spinCW { to{transform:rotate(360deg)} }
        @keyframes spinCCW { to{transform:rotate(-360deg)} }
        .holo-beam { width:3px; height:20vh; background:linear-gradient(to bottom,rgba(0,210,255,0.9),rgba(0,150,255,0.15),transparent); box-shadow:0 0 10px rgba(0,200,255,0.7); border-radius:0 0 3px 3px; flex-shrink:0; animation:beamPulse 2.2s ease-in-out infinite; }
        .holo-beam.gold { background:linear-gradient(to bottom,rgba(255,210,0,0.9),rgba(150,100,0,0.15),transparent); box-shadow:0 0 10px rgba(255,200,0,0.7); animation:beamPulseGold 2.2s ease-in-out infinite; }
        @keyframes beamPulse { 0%,100%{opacity:0.7} 50%{opacity:1;box-shadow:0 0 18px rgba(0,220,255,1)} }
        @keyframes beamPulseGold { 0%,100%{opacity:0.7} 50%{opacity:1;box-shadow:0 0 18px rgba(255,220,0,1)} }
        .bp { position:absolute; left:50%; margin-left:-2px; width:4px; height:4px; border-radius:50%; background:#00d4ff; box-shadow:0 0 5px #00d4ff; animation:bpDrop 1.8s ease-in-out infinite; opacity:0; }
        .bp.gold { background:#ffd000; box-shadow:0 0 5px #ffd000; }
        .bp:nth-child(1){top:8%;animation-delay:0s} .bp:nth-child(2){top:32%;animation-delay:0.45s} .bp:nth-child(3){top:58%;animation-delay:0.9s} .bp:nth-child(4){top:80%;animation-delay:1.35s}
        @keyframes bpDrop { 0%{opacity:0;transform:translateY(-5px) scale(0.4)} 35%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(10px) scale(0.2)} }
        .table-effect { position:absolute; left:7.78%; top:75.23%; width:87.26%; height:13.86%; z-index:6; pointer-events:none; border-radius:50%; background:radial-gradient(ellipse at 50% 50%,rgba(255,255,0,1) 0%,rgba(255,210,0,0.9) 25%,rgba(255,150,0,0.7) 50%,rgba(255,80,0,0.4) 75%,transparent 100%); box-shadow:0 0 40px 15px rgba(255,220,0,0.9),0 0 80px 30px rgba(255,160,0,0.6); animation:firePulse 0.8s ease-in-out infinite; }
        @keyframes firePulse { 0%,100%{opacity:0.85;filter:brightness(1.3)} 50%{opacity:1;filter:brightness(1.9)} }
        .hero-fade { position:absolute; bottom:0; left:0; right:0; height:30%; background:linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.15) 40%,transparent 70%); z-index:3; pointer-events:none; }
        .hero-chat { position:absolute; bottom:22px; left:50%; transform:translateX(-50%); width:580px; max-width:92vw; z-index:10; font-family:'Rajdhani',sans-serif; }
        .hero-msg { margin-bottom:8px; animation:fadeIn .3s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .hero-msg.user { text-align:right; }
        .hero-msg.user span { display:inline-block; background:rgba(0,0,0,.75); border:1px solid rgba(212,160,23,.4); color:#f0d060; padding:8px 14px; border-radius:16px 16px 4px 16px; font-size:14px; max-width:80%; backdrop-filter:blur(12px); }
        .hero-msg.ai span { display:inline-block; background:rgba(0,0,0,.75); border:1px solid rgba(0,180,255,.25); color:#ddd; padding:8px 14px; border-radius:16px 16px 16px 4px; font-size:14px; max-width:85%; backdrop-filter:blur(12px); }
        .hero-msg.ai .ai-name { font-family:'Orbitron',sans-serif; font-size:9px; color:#d4a017; letter-spacing:2px; margin-bottom:3px; opacity:.7; }
        .hero-input { flex:1; background:rgba(0,0,0,.75); border:1px solid rgba(212,160,23,.35); border-radius:28px; padding:13px 20px; color:#fff; font-family:'Rajdhani',sans-serif; font-size:15px; outline:none; backdrop-filter:blur(14px); transition:border-color .3s,box-shadow .3s; }
        .hero-input:focus { border-color:#d4a017; box-shadow:0 0 20px rgba(212,160,23,.2); }
        .hero-input::placeholder { color:rgba(255,255,255,.25); }
        .hero-send { width:44px; height:44px; border-radius:50%; background:radial-gradient(circle,#d4a017,#b8860b); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(212,160,23,.45); transition:transform .2s,box-shadow .2s; flex-shrink:0; }
        .hero-send:hover { transform:scale(1.1); box-shadow:0 0 30px rgba(212,160,23,.65); }
        .dot-pulse span { display:inline-block; width:5px; height:5px; border-radius:50%; background:#d4a017; margin:0 2px; animation:dotPulse 1.2s ease-in-out infinite; }
        .dot-pulse span:nth-child(2){animation-delay:.2s} .dot-pulse span:nth-child(3){animation-delay:.4s}
        @keyframes dotPulse { 0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1} }
      `}</style>

      <video ref={videoRef} className="hero-video" autoPlay loop muted playsInline>
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      <div className="table-effect" />
      <div className="hero-fade" />

      {/* Hologram Orbs */}
      {orbData.map((orb) => (
        <div
          key={orb.id}
          className={`holo-unit ${activated ? "float" : ""}`}
          style={{
            left: positions[orb.id]?.left || basePos[orb.id].x + "%",
            top: positions[orb.id]?.top || basePos[orb.id].y + "%",
          }}
        >
          <div
            className={`holo-orb ${orb.gold ? "gold" : ""}`}
            onClick={() => filterBy(orb.filter)}
          >
            {orb.svg || orb.emoji}
          </div>
          <div className={`holo-beam ${orb.gold ? "gold" : ""}`} style={{ position: "relative" }}>
            <div className={`bp ${orb.gold ? "gold" : ""}`} />
            <div className={`bp ${orb.gold ? "gold" : ""}`} />
            <div className={`bp ${orb.gold ? "gold" : ""}`} />
            <div className={`bp ${orb.gold ? "gold" : ""}`} />
          </div>
        </div>
      ))}

      {/* Chat */}
      <div className="hero-chat">
        <div
          ref={messagesRef}
          style={{ maxHeight: "35vh", overflowY: "auto", marginBottom: 10, scrollbarWidth: "none" }}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`hero-msg ${msg.role === "user" ? "user" : "ai"}`}>
              {msg.role === "ai" && <div className="ai-name">INAYA</div>}
              <span>{msg.text}</span>
            </div>
          ))}
          {typing && (
            <div className="hero-msg ai">
              <div className="ai-name">INAYA</div>
              <span>
                <div className="dot-pulse"><span /><span /><span /></div>
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="hero-input"
            type="text"
            placeholder="Kérdezz valamit..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="hero-send" onClick={sendMessage}>
            <Send size={18} color="#000" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default InayaHeroSection;
