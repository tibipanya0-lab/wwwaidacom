import { useEffect, useState, useCallback } from "react";
import SEOHead from "@/components/SEOHead";
import { API_BASE } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface CreatorInfo {
  id: number;
  name: string;
  email: string;
  ref_code: string;
}

interface DailyClick {
  date: string;
  clicks: number;
}

interface SaleItem {
  date: string;
  advertiser: string;
  sale_amount_usd: number;
  commission_usd: number;
}

interface DashboardData {
  creator: { name: string; email: string; ref_code: string; ref_url: string };
  clicks: { total: number; recent: number; period_days: number; daily: DailyClick[] };
  sales: { items: SaleItem[]; total_commission_usd: number; total_sales_usd: number; count: number; error?: string };
}

const Partnerek = () => {
  const { toast } = useToast();
  const [view, setView] = useState<"landing" | "register" | "login" | "dashboard">("landing");
  const [token, setToken] = useState<string | null>(null);
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check saved session
  useEffect(() => {
    const savedToken = localStorage.getItem("inaya_creator_token");
    const savedCreator = localStorage.getItem("inaya_creator_info");
    if (savedToken && savedCreator) {
      setToken(savedToken);
      setCreator(JSON.parse(savedCreator));
      setView("dashboard");
    }
  }, []);

  const saveSession = (t: string, c: CreatorInfo) => {
    localStorage.setItem("inaya_creator_token", t);
    localStorage.setItem("inaya_creator_info", JSON.stringify(c));
    setToken(t);
    setCreator(c);
  };

  const logout = () => {
    localStorage.removeItem("inaya_creator_token");
    localStorage.removeItem("inaya_creator_info");
    setToken(null);
    setCreator(null);
    setDashboard(null);
    setView("landing");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/creators/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: "Hiba", description: data.detail || "Sikertelen regisztráció", variant: "destructive" });
        return;
      }
      saveSession(data.token, data.creator);
      toast({ title: "Sikeres regisztráció!", description: `Ref kódod: ${data.creator.ref_code}` });
      setView("dashboard");
    } catch {
      toast({ title: "Hiba", description: "Hálózati hiba", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/creators/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast({ title: "Hiba", description: data.detail || "Hibás email vagy jelszó", variant: "destructive" });
        return;
      }
      saveSession(data.token, data.creator);
      toast({ title: "Sikeres bejelentkezés!" });
      setView("dashboard");
    } catch {
      toast({ title: "Hiba", description: "Hálózati hiba", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/creators/dashboard?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.status === 401) {
        logout();
        return;
      }
      const data = await resp.json();
      setDashboard(data);
    } catch {
      toast({ title: "Hiba", description: "Dashboard betöltése sikertelen", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (view === "dashboard" && token) fetchDashboard();
  }, [view, token, fetchDashboard]);

  const copyRefLink = () => {
    if (!creator) return;
    navigator.clipboard.writeText(`https://inaya.hu?ref=${creator.ref_code}`);
    toast({ title: "Link vágólapra másolva!" });
  };

  // ── Styles ──
  const cardStyle = "bg-black/40 border border-[rgba(212,160,23,0.25)] rounded-2xl p-6 backdrop-blur-sm";
  const inputStyle = "w-full px-4 py-3 bg-black/50 border border-[rgba(212,160,23,0.3)] rounded-xl text-white placeholder-white/40 focus:border-[#d4a017] focus:outline-none transition-colors";
  const btnPrimary = "w-full py-3 bg-gradient-to-r from-[#d4a017] to-[#f0d060] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50";
  const btnSecondary = "w-full py-3 border border-[rgba(212,160,23,0.4)] text-[#f0d060] rounded-xl hover:bg-[rgba(212,160,23,0.1)] transition-colors";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <SEOHead
        title="Creator Partnerek – inaya.hu"
        description="Csatlakozz az inaya.hu creator partner programjához! Oszd meg a linkedet és keresd jutalékodat."
        canonical="/partnerek"
      />

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#f0d060" }}>
              inaya.hu
            </span>
          </a>
          <h1 className="text-xl font-bold text-white/90 mb-2" style={{ fontFamily: "Orbitron, sans-serif" }}>
            Creator Partner Program
          </h1>
          <p className="text-white/50 text-sm">
            Oszd meg a linkedet, mi pedig fizetünk minden eladás után.
          </p>
        </div>

        {/* ── LANDING ── */}
        {view === "landing" && (
          <div className="space-y-4">
            <div className={cardStyle}>
              <h2 className="text-lg font-bold text-[#f0d060] mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>
                Hogyan működik?
              </h2>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex gap-3">
                  <span className="text-[#f0d060] font-bold text-lg">1.</span>
                  <p>Regisztrálj és kapj egy egyedi linket (pl. inaya.hu?ref=neved)</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#f0d060] font-bold text-lg">2.</span>
                  <p>Oszd meg a közönségeddel – TikTok, Instagram, YouTube, blog</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#f0d060] font-bold text-lg">3.</span>
                  <p>Kövesd a kattintásokat és eladásokat a dashboardodon</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#f0d060] font-bold text-lg">4.</span>
                  <p>Jutalékot kapsz minden egyes vásárlás után</p>
                </div>
              </div>
            </div>

            <button onClick={() => setView("register")} className={btnPrimary}>
              Regisztráció
            </button>
            <button onClick={() => setView("login")} className={btnSecondary}>
              Már van fiókom – Bejelentkezés
            </button>
          </div>
        )}

        {/* ── REGISTER ── */}
        {view === "register" && (
          <form onSubmit={handleRegister} className={`${cardStyle} space-y-4`}>
            <h2 className="text-lg font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>
              Regisztráció
            </h2>
            <input
              type="text"
              placeholder="Neved (ebből lesz a ref kód)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyle}
              required
            />
            <input
              type="email"
              placeholder="Email címed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
              required
            />
            <input
              type="password"
              placeholder="Jelszó (min. 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle}
              minLength={6}
              required
            />
            <button type="submit" className={btnPrimary} disabled={loading}>
              {loading ? "Regisztráció..." : "Regisztráció"}
            </button>
            <button type="button" onClick={() => setView("landing")} className="w-full text-center text-sm text-white/40 hover:text-white/60">
              Vissza
            </button>
          </form>
        )}

        {/* ── LOGIN ── */}
        {view === "login" && (
          <form onSubmit={handleLogin} className={`${cardStyle} space-y-4`}>
            <h2 className="text-lg font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>
              Bejelentkezés
            </h2>
            <input
              type="email"
              placeholder="Email címed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyle}
              required
            />
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyle}
              required
            />
            <button type="submit" className={btnPrimary} disabled={loading}>
              {loading ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>
            <button type="button" onClick={() => setView("landing")} className="w-full text-center text-sm text-white/40 hover:text-white/60">
              Vissza
            </button>
          </form>
        )}

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && (
          <div className="space-y-4">
            {/* Ref link kártya */}
            <div className={cardStyle}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  A te linked
                </h2>
                <button onClick={logout} className="text-xs text-white/30 hover:text-white/60">
                  Kijelentkezés
                </button>
              </div>
              <div
                onClick={copyRefLink}
                className="flex items-center gap-2 px-4 py-3 bg-black/50 border border-dashed border-[rgba(212,160,23,0.5)] rounded-xl cursor-pointer hover:border-[#d4a017] transition-colors"
              >
                <span className="flex-1 text-sm text-white/80 truncate">
                  https://inaya.hu?ref={creator?.ref_code}
                </span>
                <span className="text-[#f0d060] text-xs whitespace-nowrap">Másolás</span>
              </div>
              <p className="text-xs text-white/30 mt-2">
                Oszd meg ezt a linket a közönségeddel!
              </p>
            </div>

            {loading && !dashboard ? (
              <div className="text-center py-8 text-white/40">Betöltés...</div>
            ) : dashboard ? (
              <>
                {/* Stat kártyák */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={cardStyle + " text-center"}>
                    <div className="text-2xl font-bold text-[#f0d060]">{dashboard.clicks.total}</div>
                    <div className="text-xs text-white/50 mt-1">Összes kattintás</div>
                  </div>
                  <div className={cardStyle + " text-center"}>
                    <div className="text-2xl font-bold text-[#f0d060]">{dashboard.clicks.recent}</div>
                    <div className="text-xs text-white/50 mt-1">Utolsó 30 nap</div>
                  </div>
                  <div className={cardStyle + " text-center"}>
                    <div className="text-2xl font-bold text-green-400">{dashboard.sales.count || 0}</div>
                    <div className="text-xs text-white/50 mt-1">Eladások</div>
                  </div>
                  <div className={cardStyle + " text-center"}>
                    <div className="text-2xl font-bold text-green-400">${dashboard.sales.total_commission_usd || 0}</div>
                    <div className="text-xs text-white/50 mt-1">Jutalék (USD)</div>
                  </div>
                </div>

                {/* Napi kattintások */}
                {dashboard.clicks.daily.length > 0 && (
                  <div className={cardStyle}>
                    <h3 className="text-sm font-bold text-[#f0d060] mb-3" style={{ fontFamily: "Orbitron, sans-serif" }}>
                      Napi kattintások
                    </h3>
                    <div className="space-y-1">
                      {dashboard.clicks.daily.slice(-14).map((d) => (
                        <div key={d.date} className="flex items-center gap-2">
                          <span className="text-xs text-white/40 w-20">{d.date}</span>
                          <div className="flex-1 h-4 bg-black/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#d4a017] to-[#f0d060] rounded-full"
                              style={{
                                width: `${Math.min(100, (d.clicks / Math.max(...dashboard.clicks.daily.map((x) => x.clicks))) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-white/60 w-8 text-right">{d.clicks}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Eladások lista */}
                {dashboard.sales.items && dashboard.sales.items.length > 0 && (
                  <div className={cardStyle}>
                    <h3 className="text-sm font-bold text-[#f0d060] mb-3" style={{ fontFamily: "Orbitron, sans-serif" }}>
                      Eladások
                    </h3>
                    <div className="space-y-2">
                      {dashboard.sales.items.map((sale, i) => (
                        <div key={i} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                          <div>
                            <div className="text-white/70">{sale.advertiser}</div>
                            <div className="text-xs text-white/30">{sale.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400">${sale.commission_usd.toFixed(2)}</div>
                            <div className="text-xs text-white/30">${sale.sale_amount_usd.toFixed(2)} eladás</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dashboard.sales.error && (
                  <div className="text-xs text-white/30 text-center">
                    CJ API: {dashboard.sales.error}
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Partnerek;
