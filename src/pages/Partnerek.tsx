import { useEffect, useState, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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
  your_commission_usd?: number;
  status?: string;
}

interface DashboardData {
  creator: { name: string; email: string; ref_code: string; ref_url: string; commission_pct: number };
  clicks: { total: number; recent: number; period_days: number; daily: DailyClick[] };
  sales: { items: SaleItem[]; total_commission_usd: number; total_sales_usd: number; count: number; error?: string };
  pending?: { total_commission_usd: number; total_sales_usd: number; count: number };
  level?: {
    name: string; icon: string; commission_pct: number; qualifying_sales: number;
    next_name: string | null; next_icon: string | null; next_commission: number | null;
    next_min_sales: number | null; remaining: number; progress: number;
  };
}

interface TopProduct {
  id?: number;
  name: string;
  image_url?: string;
  min_price?: number;
  original_price?: number;
  currency?: string;
  best_store?: string;
  rating?: number;
  orders?: number;
  _discount_pct?: number;
}

interface PopularSearch {
  term: string;
  count: number;
}

interface TopProductsData {
  most_ordered: TopProduct[];
  best_rated: TopProduct[];
  biggest_discount: TopProduct[];
  popular_searches: PopularSearch[];
}

type DashPage = "overview" | "stats" | "commissions" | "account" | "info";

const Partnerek = () => {
  const { toast } = useToast();
  const [view, setView] = useState<"landing" | "register" | "login" | "forgot" | "dashboard">("landing");
  const [token, setToken] = useState<string | null>(null);
  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<DashPage>("overview");
  const [chartMode, setChartMode] = useState<"clicks" | "sales">("clicks");
  const [chartRange, setChartRange] = useState<"days" | "weeks" | "months">("days");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Account form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

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
    setTopProducts(null);
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
      if (data.pending_approval) {
        toast({ title: "Regisztráció sikeres!", description: "A fiókod jóváhagyásra vár. Emailben értesítünk!" });
        setView("landing");
        return;
      }
      saveSession(data.token, data.creator);
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/v1/creators/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      setForgotSent(true);
    } catch {
      toast({ title: "Hiba", description: "Hálózati hiba", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const chartDays = chartRange === "months" ? 365 : chartRange === "weeks" ? 90 : 30;

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/creators/dashboard?days=${chartDays}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.status === 401) { logout(); return; }
      setDashboard(await resp.json());
    } catch {
      toast({ title: "Hiba", description: "Dashboard betöltése sikertelen", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, chartDays]);

  const fetchTopProducts = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/v1/creators/top-products`);
      setTopProducts(await resp.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (view === "dashboard" && token) {
      fetchDashboard();
      fetchTopProducts();
    }
  }, [view, token, fetchDashboard, fetchTopProducts]);

  const copyRefLink = () => {
    if (!creator) return;
    navigator.clipboard.writeText(`https://inaya.hu?ref=${creator.ref_code}`);
    toast({ title: "Link vágólapra másolva!" });
  };

  const fmtPrice = (val: number | undefined, cur?: string) => {
    if (!val) return "";
    return Math.round(val).toLocaleString("hu") + " " + (cur || "Ft");
  };

  const aggregateData = (daily: DailyClick[]) => {
    if (chartRange === "days") return daily.slice(-30);
    const map = new Map<string, number>();
    for (const d of daily) {
      let key: string;
      if (chartRange === "weeks") {
        const dt = new Date(d.date);
        const day = dt.getDay();
        const monday = new Date(dt);
        monday.setDate(dt.getDate() - (day === 0 ? 6 : day - 1));
        key = monday.toISOString().slice(0, 10);
      } else {
        key = d.date.slice(0, 7);
      }
      map.set(key, (map.get(key) || 0) + d.clicks);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, clicks]) => ({ date, clicks }));
  };

  // ── Styles ──
  const cardStyle = "bg-black/40 border border-[rgba(212,160,23,0.25)] rounded-2xl p-6 backdrop-blur-sm";
  const inputStyle = "w-full px-4 py-3 bg-black/50 border border-[rgba(212,160,23,0.3)] rounded-xl text-white placeholder-white/40 focus:border-[#d4a017] focus:outline-none transition-colors";
  const btnPrimary = "w-full py-3 bg-gradient-to-r from-[#d4a017] to-[#f0d060] text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50";
  const btnSecondary = "w-full py-3 border border-[rgba(212,160,23,0.4)] text-[#f0d060] rounded-xl hover:bg-[rgba(212,160,23,0.1)] transition-colors";

  const navItems: { key: DashPage; label: string }[] = [
    { key: "overview", label: "Áttekintés" },
    { key: "stats", label: "Statisztikák" },
    { key: "commissions", label: "Jutalékok" },
    { key: "account", label: "Fiókom" },
    { key: "info", label: "Információ" },
  ];

  const ProductMiniCard = ({ p }: { p: TopProduct }) => (
    <a href={p.id ? `/termek/${p.id}` : "#"} target="_blank" rel="noopener"
      className="flex gap-3 p-3 rounded-xl bg-black/30 border border-white/5 hover:border-[rgba(212,160,23,0.3)] transition-colors">
      {p.image_url && <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-contain bg-white/5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white/80 font-medium line-clamp-2 leading-tight">{p.name}</div>
        <div className="flex items-center gap-2 mt-1">
          {p.min_price ? <span className="text-xs font-bold text-[#f0d060]">{fmtPrice(p.min_price, p.currency)}</span> : null}
          {p.orders ? <span className="text-[10px] text-white/30">{p.orders > 999 ? (p.orders / 1000).toFixed(1) + "k" : p.orders} rendelés</span> : null}
          {p.rating ? <span className="text-[10px] text-amber-400">★ {(p.rating > 5 ? p.rating / 20 : p.rating).toFixed(1)}</span> : null}
          {p._discount_pct ? <span className="text-[10px] text-red-400 font-bold">-{p._discount_pct}%</span> : null}
        </div>
        {p.best_store && <div className="text-[10px] text-white/25 mt-0.5">{p.best_store}</div>}
      </div>
    </a>
  );

  // ── Chart component ──
  const ChartSection = () => (
    <div className={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>
          {chartMode === "clicks" ? "Kattintások" : "Eladások"}
        </h3>
        <div className="flex gap-1 bg-black/30 rounded-lg p-0.5">
          {(["clicks", "sales"] as const).map((m) => (
            <button key={m} onClick={() => setChartMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                chartMode === m
                  ? m === "clicks" ? "bg-[rgba(212,160,23,0.25)] text-[#f0d060]" : "bg-[rgba(34,197,94,0.25)] text-green-400"
                  : "text-white/40 hover:text-white/60"
              }`}>
              {m === "clicks" ? "Kattintások" : "Eladások"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {(["days", "weeks", "months"] as const).map((r) => (
          <button key={r} onClick={() => setChartRange(r)}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${chartRange === r ? "bg-white/10 text-white/80" : "text-white/30 hover:text-white/50"}`}>
            {r === "days" ? "Napok" : r === "weeks" ? "Hetek" : "Hónapok"}
          </button>
        ))}
      </div>
      <div className="h-48">
        {chartMode === "clicks" && dashboard?.clicks.daily && dashboard.clicks.daily.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aggregateData(dashboard.clicks.daily)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs><linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d4a017" stopOpacity={0.3} /><stop offset="95%" stopColor="#d4a017" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={(v) => chartRange === "months" ? v.slice(2, 7) : v.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(212,160,23,0.3)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#f0d060" }} itemStyle={{ color: "#fff" }} formatter={(v: number) => [v, "Kattintás"]} labelFormatter={(l) => l} />
              <Area type="monotone" dataKey="clicks" stroke="#d4a017" strokeWidth={2} fill="url(#clickGrad)" dot={false} activeDot={{ r: 4, fill: "#f0d060" }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : chartMode === "sales" && dashboard?.sales.items && dashboard.sales.items.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboard.sales.items.map((s) => ({ date: s.date?.slice(0, 10) || "", amount: s.your_commission_usd ?? s.commission_usd }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={(v) => chartRange === "months" ? v.slice(2, 7) : v.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#22c55e" }} itemStyle={{ color: "#fff" }} formatter={(v: number) => [`$${Number(v).toFixed(2)}`, "Jutalék"]} labelFormatter={(l) => l} />
              <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} fill="url(#salesGrad)" dot={false} activeDot={{ r: 4, fill: "#22c55e" }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-white/20 text-sm">Még nincs elég adat</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <SEOHead title="Creator Partnerek – inaya.hu" description="Csatlakozz az inaya.hu creator partner programjához!" canonical="/partnerek" />


      {/* Top navbar */}
      <div className="sticky top-0 z-50 border-b border-[rgba(212,160,23,0.15)] bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="text-lg font-bold" style={{ fontFamily: "Orbitron, sans-serif", color: "#f0d060" }}>inaya.hu</a>

          {view === "dashboard" && creator ? (
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <button key={item.key} onClick={() => setPage(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    page === item.key ? "bg-[rgba(212,160,23,0.2)] text-[#f0d060]" : "text-white/40 hover:text-white/60"
                  }`}>
                  {item.label}
                </button>
              ))}
              <div className="w-px h-6 bg-white/10 mx-2" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4a017] to-[#f0d060] flex items-center justify-center text-black text-xs font-bold">
                  {creator.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-white/70 hidden sm:inline">{creator.name}</span>
              </div>
              <button onClick={logout} className="text-xs text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5 ml-1">Kilépés</button>
            </div>
          ) : (
            <span className="text-xs text-white/30" style={{ fontFamily: "Orbitron, sans-serif" }}>Partner</span>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* ── Auth views ── */}
        {view !== "dashboard" && (
          <div className="max-w-md mx-auto">
            {view !== "dashboard" && view !== "landing" ? null : (
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold text-white/90 mb-2" style={{ fontFamily: "Orbitron, sans-serif" }}>Creator Partner Program</h1>
                <p className="text-white/50 text-sm">Oszd meg a linkedet, mi pedig fizetünk minden eladás után.</p>
              </div>
            )}

            {view === "landing" && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-bold text-white/90 mb-3" style={{ fontFamily: "Orbitron, sans-serif" }}>Creator Partner Program</h1>
                  <p className="text-white/50 text-sm max-w-sm mx-auto">Oszd meg a linkedet, és keress jutalékot minden eladás után. Minél többet hozol, annál többet kapsz.</p>
                </div>

                {/* Előnyök */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className="text-2xl mb-2">🔗</div>
                    <div className="text-xs text-white/70 font-medium">Egyedi link</div>
                    <div className="text-[10px] text-white/30 mt-1">Kapsz egy személyes affiliate linket</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className="text-2xl mb-2">📈</div>
                    <div className="text-xs text-white/70 font-medium">Akár 100% jutalék</div>
                    <div className="text-[10px] text-white/30 mt-1">Szintrendszerrel növekvő jutalék</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className="text-2xl mb-2">💰</div>
                    <div className="text-xs text-white/70 font-medium">Gyors kifizetés</div>
                    <div className="text-[10px] text-white/30 mt-1">Mihamarabb feldolgozzuk</div>
                  </div>
                </div>

                {/* Szintek mini áttekintés */}
                <div className="p-4 rounded-xl bg-black/30 border border-[rgba(212,160,23,0.15)]">
                  <div className="text-xs text-white/40 text-center mb-3">Partner szintek</div>
                  <div className="flex items-center justify-between text-center">
                    {[
                      { icon: "🥉", name: "Bronz", pct: "30%" },
                      { icon: "🥈", name: "Ezüst", pct: "45%" },
                      { icon: "🥇", name: "Arany", pct: "60%" },
                      { icon: "💎", name: "Platina", pct: "80%" },
                      { icon: "👑", name: "Gyémánt", pct: "100%" },
                    ].map((l, i) => (
                      <div key={i}>
                        <div className="text-lg">{l.icon}</div>
                        <div className="text-[10px] text-white/50">{l.name}</div>
                        <div className="text-xs text-[#f0d060] font-bold">{l.pct}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button onClick={() => setView("register")} className={btnPrimary}>Regisztráció</button>
                  <button onClick={() => setView("login")} className={btnSecondary}>Már van fiókom – Bejelentkezés</button>
                </div>
              </div>
            )}

            {view === "register" && (
              <form onSubmit={handleRegister} className={`${cardStyle} space-y-4`}>
                <h2 className="text-lg font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>Regisztráció</h2>
                <input type="text" placeholder="Neved (ebből lesz a ref kód)" value={name} onChange={(e) => setName(e.target.value)} className={inputStyle} required />
                <input type="email" placeholder="Email címed" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required />
                <input type="password" placeholder="Jelszó (min. 6 karakter)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} minLength={6} required />
                <button type="submit" className={btnPrimary} disabled={loading}>{loading ? "Regisztráció..." : "Regisztráció"}</button>
                <button type="button" onClick={() => setView("landing")} className="w-full text-center text-sm text-white/40 hover:text-white/60">Vissza</button>
              </form>
            )}

            {view === "login" && (
              <form onSubmit={handleLogin} className={`${cardStyle} space-y-4`}>
                <h2 className="text-lg font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>Bejelentkezés</h2>
                <input type="email" placeholder="Email címed" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required />
                <input type="password" placeholder="Jelszó" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} required />
                <button type="submit" className={btnPrimary} disabled={loading}>{loading ? "Bejelentkezés..." : "Bejelentkezés"}</button>
                <button type="button" onClick={() => { setForgotEmail(email); setForgotSent(false); setView("forgot"); }} className="w-full text-center text-sm text-[#d4a017]/60 hover:text-[#d4a017] transition-colors">Elfelejtetted a jelszavad?</button>
                <button type="button" onClick={() => setView("landing")} className="w-full text-center text-sm text-white/40 hover:text-white/60">Vissza</button>
              </form>
            )}

            {view === "forgot" && (
              <div className={`${cardStyle} space-y-4`}>
                <h2 className="text-lg font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>Elfelejtett jelszó</h2>
                {forgotSent ? (
                  <div className="space-y-4">
                    <p className="text-white/70 text-sm text-center">Ha létezik ilyen fiók, elküldtük az új jelszót emailben.</p>
                    <button onClick={() => setView("login")} className={btnPrimary}>Vissza a bejelentkezéshez</button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-white/50 text-sm">Add meg az email címedet, és küldünk egy új jelszót.</p>
                    <input type="email" placeholder="Email címed" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputStyle} required />
                    <button type="submit" className={btnPrimary} disabled={loading}>{loading ? "Küldés..." : "Új jelszó kérése"}</button>
                    <button type="button" onClick={() => setView("login")} className="w-full text-center text-sm text-white/40 hover:text-white/60">Vissza</button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {view === "dashboard" && (
          <>
            {/* ══ ÁTTEKINTÉS ══ */}
            {page === "overview" && (
              <div className="space-y-4">
                {/* Ref link */}
                <div className={cardStyle}>
                  <h2 className="text-sm font-bold text-[#f0d060] mb-3" style={{ fontFamily: "Orbitron, sans-serif" }}>A te linked</h2>
                  <div onClick={copyRefLink} className="flex items-center gap-2 px-4 py-3 bg-black/50 border border-dashed border-[rgba(212,160,23,0.5)] rounded-xl cursor-pointer hover:border-[#d4a017] transition-colors">
                    <span className="flex-1 text-sm text-white/80 truncate">https://inaya.hu?ref={creator?.ref_code}</span>
                    <span className="text-[#f0d060] text-xs whitespace-nowrap">Másolás</span>
                  </div>
                  <p className="text-xs text-white/30 mt-2">Oszd meg ezt a linket a közönségeddel!</p>
                </div>

                {/* Szint kártya */}
                {dashboard?.level && (
                  <div className={cardStyle}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{dashboard.level.icon}</span>
                        <div>
                          <div className="text-lg font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>{dashboard.level.name}</div>
                          <div className="text-xs text-white/40">Jutalék: {dashboard.level.commission_pct}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/60">{dashboard.level.qualifying_sales} eladás</div>
                        {dashboard.level.next_name && (
                          <div className="text-xs text-white/30">Következő: {dashboard.level.next_icon} {dashboard.level.next_name} ({dashboard.level.next_commission}%)</div>
                        )}
                      </div>
                    </div>
                    {dashboard.level.next_name && (
                      <div>
                        <div className="flex justify-between text-[10px] text-white/30 mb-1">
                          <span>Még {dashboard.level.remaining} eladás a {dashboard.level.next_name} szintig</span>
                          <span>{dashboard.level.progress}%</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#d4a017] to-[#f0d060] rounded-full transition-all duration-500" style={{ width: `${dashboard.level.progress}%` }} />
                        </div>
                      </div>
                    )}
                    {!dashboard.level.next_name && (
                      <div className="text-xs text-[#f0d060]/60 text-center">Maximális szint elérve!</div>
                    )}
                  </div>
                )}

                {/* Stat kártyák + grafikon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-[#f0d060]">{dashboard?.clicks.total ?? 0}</div><div className="text-xs text-white/50 mt-1">Összes kattintás</div></div>
                    <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-[#f0d060]">{dashboard?.clicks.recent ?? 0}</div><div className="text-xs text-white/50 mt-1">Utolsó 30 nap</div></div>
                    <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-amber-500">{dashboard?.pending?.count ?? 0}</div><div className="text-xs text-white/50 mt-1">Függőben</div></div>
                    <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-green-400">{dashboard?.sales.count ?? 0}</div><div className="text-xs text-white/50 mt-1">Eladások</div></div>
                    <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-green-400">${dashboard?.sales.total_commission_usd ?? 0}</div><div className="text-xs text-white/50 mt-1">Jutalékod ({dashboard?.creator.commission_pct ?? 0}%)</div></div>
                    <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-amber-500">${dashboard?.pending?.total_commission_usd ?? 0}</div><div className="text-xs text-white/50 mt-1">Függő jutalék</div></div>
                  </div>
                  <ChartSection />
                </div>
              </div>
            )}

            {/* ══ STATISZTIKÁK ══ */}
            {page === "stats" && (
              <div className="space-y-4">
                <ChartSection />

                {/* Népszerű keresések */}
                {topProducts?.popular_searches && topProducts.popular_searches.length > 0 && (
                  <div className={cardStyle}>
                    <h3 className="text-sm font-bold text-[#f0d060] mb-3" style={{ fontFamily: "Orbitron, sans-serif" }}>Népszerű keresések</h3>
                    <p className="text-xs text-white/40 mb-3">Ezeket keresik legtöbben – érdemes ezekre fókuszálni!</p>
                    <div className="flex flex-wrap gap-2">
                      {topProducts.popular_searches.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(212,160,23,0.1)] border border-[rgba(212,160,23,0.2)] text-xs text-white/70">
                          {s.term} <span className="text-[10px] text-white/30">{s.count}x</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ JUTALÉKOK ══ */}
            {page === "commissions" && (
              <div className="space-y-4">
                {/* Összesítő kártyák */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-green-400">{dashboard?.sales.count ?? 0}</div><div className="text-xs text-white/50 mt-1">Jóváhagyott</div></div>
                  <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-green-400">${dashboard?.sales.total_commission_usd ?? 0}</div><div className="text-xs text-white/50 mt-1">Jutalékod</div></div>
                  <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-amber-500">{dashboard?.pending?.count ?? 0}</div><div className="text-xs text-white/50 mt-1">Függőben</div></div>
                  <div className={cardStyle + " text-center"}><div className="text-2xl font-bold text-amber-500">${dashboard?.pending?.total_commission_usd ?? 0}</div><div className="text-xs text-white/50 mt-1">Függő jutalék</div></div>
                </div>

                {/* Szint + jutalék */}
                {dashboard?.level && (
                  <div className={cardStyle}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{dashboard.level.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-[#f0d060]" style={{ fontFamily: "Orbitron, sans-serif" }}>{dashboard.level.name} szint</h3>
                          <p className="text-xs text-white/40 mt-1">{dashboard.level.qualifying_sales} eladás{dashboard.level.next_name ? ` — még ${dashboard.level.remaining} a ${dashboard.level.next_name} szintig` : " — maximális szint!"}</p>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-[#f0d060]">{dashboard.level.commission_pct}%</div>
                    </div>
                    {dashboard.level.next_name && (
                      <div className="mt-3">
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#d4a017] to-[#f0d060] rounded-full transition-all" style={{ width: `${dashboard.level.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Eladások lista */}
                <div className={cardStyle}>
                  <h3 className="text-sm font-bold text-[#f0d060] mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>Tranzakciók</h3>
                  {dashboard?.sales.items && dashboard.sales.items.length > 0 ? (
                    <div className="space-y-2">
                      {dashboard.sales.items.map((sale, i) => (
                        <div key={i} className="flex items-center justify-between text-sm border-b border-white/5 pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${sale.status === "pending" ? "bg-amber-500" : "bg-green-400"}`} />
                            <div>
                              <div className="text-white/70">{sale.advertiser}</div>
                              <div className="text-xs text-white/30">{sale.date?.slice(0, 10)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={sale.status === "pending" ? "text-amber-500" : "text-green-400"}>
                              ${(sale.your_commission_usd ?? sale.commission_usd).toFixed(2)}
                            </div>
                            <div className="text-xs text-white/30">
                              ${sale.sale_amount_usd.toFixed(2)} eladás
                              {sale.status === "pending" && <span className="ml-1 text-amber-500/60">függőben</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white/30 text-sm py-8">Még nincs tranzakciód</div>
                  )}
                </div>
              </div>
            )}

            {/* ══ FIÓKOM ══ */}
            {page === "account" && (
              <div className="max-w-lg space-y-4">
                {/* Fiók adatok */}
                <div className={cardStyle}>
                  <h3 className="text-sm font-bold text-[#f0d060] mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>Fiókadatok</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-white/40 mb-1">Név</div>
                      <div className="text-sm text-white/80">{dashboard?.creator.name || creator?.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">Email</div>
                      <div className="text-sm text-white/80">{dashboard?.creator.email || creator?.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">Ref kód</div>
                      <div className="text-sm text-[#f0d060] font-mono">{dashboard?.creator.ref_code || creator?.ref_code}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">Szint</div>
                      <div className="text-sm text-[#f0d060] font-bold">{dashboard?.level?.icon} {dashboard?.level?.name} – {dashboard?.creator.commission_pct ?? 0}%</div>
                    </div>
                  </div>
                </div>

                {/* Jelszó módosítás */}
                <div className={cardStyle}>
                  <h3 className="text-sm font-bold text-[#f0d060] mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>Jelszó módosítás</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (newPassword.length < 6) { toast({ title: "Hiba", description: "Minimum 6 karakter", variant: "destructive" }); return; }
                    if (newPassword !== newPasswordConfirm) { toast({ title: "Hiba", description: "A jelszavak nem egyeznek", variant: "destructive" }); return; }
                    try {
                      const resp = await fetch(`${API_BASE}/api/v1/creators/change-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
                      });
                      const data = await resp.json();
                      if (!resp.ok) { toast({ title: "Hiba", description: data.detail || "Sikertelen módosítás", variant: "destructive" }); return; }
                      toast({ title: "Jelszó sikeresen módosítva!" });
                      setOldPassword(""); setNewPassword(""); setNewPasswordConfirm("");
                    } catch { toast({ title: "Hiba", description: "Hálózati hiba", variant: "destructive" }); }
                  }} className="space-y-3">
                    <input type="password" placeholder="Jelenlegi jelszó" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={inputStyle} required />
                    <input type="password" placeholder="Új jelszó (min. 6 karakter)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputStyle} minLength={6} required />
                    <input type="password" placeholder="Új jelszó mégegyszer" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} className={inputStyle} required />
                    <button type="submit" className={btnPrimary}>Jelszó módosítása</button>
                  </form>
                </div>

                {/* Ref link */}
                <div className={cardStyle}>
                  <h3 className="text-sm font-bold text-[#f0d060] mb-3" style={{ fontFamily: "Orbitron, sans-serif" }}>Affiliate link</h3>
                  <div onClick={copyRefLink} className="flex items-center gap-2 px-4 py-3 bg-black/50 border border-dashed border-[rgba(212,160,23,0.5)] rounded-xl cursor-pointer hover:border-[#d4a017] transition-colors">
                    <span className="flex-1 text-sm text-white/80 truncate font-mono">https://inaya.hu?ref={creator?.ref_code}</span>
                    <span className="text-[#f0d060] text-xs whitespace-nowrap">Másolás</span>
                  </div>
                </div>
              </div>
            )}

            {/* ══ INFORMÁCIÓ ══ */}
            {page === "info" && (
              <div className="max-w-2xl space-y-4">
                {/* Partner szintek */}
                <div className={cardStyle}>
                  <h3 className="text-lg font-bold text-[#f0d060] mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>Partner szintek</h3>
                  <p className="text-xs text-white/50 mb-4">Minél több vásárlót hozol, annál magasabb jutalékot kapsz. Az eladásaid nem nullázódnak – megőrzöd amit elértél.</p>
                  <div className="space-y-3">
                    {[
                      { icon: "🥉", name: "Bronz", sales: "0+", pct: "30%", color: "text-amber-600" },
                      { icon: "🥈", name: "Ezüst", sales: "30+", pct: "45%", color: "text-gray-300" },
                      { icon: "🥇", name: "Arany", sales: "70+", pct: "60%", color: "text-yellow-400" },
                      { icon: "💎", name: "Platina", sales: "110+", pct: "80%", color: "text-cyan-300" },
                      { icon: "👑", name: "Gyémánt", sales: "180+", pct: "100%", color: "text-[#f0d060]" },
                    ].map((l, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                        dashboard?.level?.name === l.name ? "border-[rgba(212,160,23,0.5)] bg-[rgba(212,160,23,0.08)]" : "border-white/5 bg-black/20"
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{l.icon}</span>
                          <div>
                            <div className={`text-sm font-bold ${l.color}`}>{l.name}</div>
                            <div className="text-xs text-white/30">{l.sales} eladás</div>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${l.color}`}>{l.pct}</div>
                        {dashboard?.level?.name === l.name && (
                          <div className="text-[10px] text-[#f0d060] bg-[rgba(212,160,23,0.2)] px-2 py-0.5 rounded-full">Jelenlegi</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hogyan működik */}
                <div className={cardStyle}>
                  <h3 className="text-lg font-bold text-[#f0d060] mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>Hogyan működik?</h3>
                  <div className="space-y-4 text-sm text-white/60">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[rgba(212,160,23,0.2)] flex items-center justify-center text-[#f0d060] text-xs font-bold flex-shrink-0">1</div>
                      <div><div className="text-white/80 font-medium mb-1">Oszd meg a linkedet</div>Regisztráció után kapsz egy egyedi affiliate linket. Oszd meg a közösségeddel bárhol – social media, blog, videó.</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[rgba(212,160,23,0.2)] flex items-center justify-center text-[#f0d060] text-xs font-bold flex-shrink-0">2</div>
                      <div><div className="text-white/80 font-medium mb-1">Vásárlók érkeznek</div>Amikor valaki a te linkedre kattint és vásárol valamelyik partnerboltban, az eladás hozzád kerül rögzítésre.</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[rgba(212,160,23,0.2)] flex items-center justify-center text-[#f0d060] text-xs font-bold flex-shrink-0">3</div>
                      <div><div className="text-white/80 font-medium mb-1">Jutalékot kapsz</div>Minden jóváhagyott eladás után megkapod a jutalékod százalékát. A jutalék az inaya.hu saját jutalékából kerül kifizetésre – nem a termék árából.</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-[rgba(212,160,23,0.2)] flex items-center justify-center text-[#f0d060] text-xs font-bold flex-shrink-0">4</div>
                      <div><div className="text-white/80 font-medium mb-1">Szintet lépsz</div>Az eladásaid folyamatosan gyűlnek. Ahogy eléred a következő szint határát, automatikusan magasabb jutalékot kapsz.</div>
                    </div>
                  </div>
                </div>

                {/* Fontos tudnivalók */}
                <div className={cardStyle}>
                  <h3 className="text-lg font-bold text-[#f0d060] mb-4" style={{ fontFamily: "Orbitron, sans-serif" }}>Fontos tudnivalók</h3>
                  <div className="space-y-2 text-sm text-white/50">
                    <div className="flex items-start gap-2"><span className="text-[#f0d060]">•</span>Csak a minimum 2000 Ft feletti jóváhagyott eladások számítanak bele a szintedbe.</div>
                    <div className="flex items-start gap-2"><span className="text-[#f0d060]">•</span>Az eladások száma sosem nullázódik – megőrzöd az elért szintedet.</div>
                    <div className="flex items-start gap-2"><span className="text-[#f0d060]">•</span>A szintváltás automatikus – nem kell igényelni.</div>
                    <div className="flex items-start gap-2"><span className="text-[#f0d060]">•</span>A Gyémánt szinten (100%) a teljes affiliate jutalékot megkapod – ez a maximális elérhető szint.</div>
                    <div className="flex items-start gap-2"><span className="text-[#f0d060]">•</span>A kifizetés manuálisan történik. A jutalékod kifizetéséhez küldj kérelmet az info@inaya.hu címre – a kifizetést mihamarabb feldolgozzuk.</div>
                    <div className="flex items-start gap-2"><span className="text-[#f0d060]">•</span>Ha egy fiók 30 napon belül nem mutat aktivitást, automatikusan inaktívvá válik. Újraaktiváláshoz vedd fel velünk a kapcsolatot.</div>
                    <div className="flex items-start gap-2"><span className="text-[#f0d060]">•</span>Gyanús aktivitás esetén a rendszer jelzést küld.</div>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Partnerek;
