import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ArrowLeft, LogOut, Package, Store, Tag, Search, BarChart3, Settings, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type Stats = {
  database: { products: number; prices: number; stores: number; categories: number };
  products_by_store: { store: string; count: number }[];
  products_by_category: { category: string; count: number }[];
  recent_products: { name: string; created_at: string }[];
  redis: { active_sessions?: number; popular_searches?: { query: string; count: number }[] };
  timestamp: string;
};

type SeoConfig = Record<string, { title: string; description: string; og_image: string }>;

type LogData = { lines: string[]; count: number; level_filter?: string };

const Admin = () => {
  const { user, isAdmin, isLoading, signIn, signOut } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "seo" | "logs">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [seo, setSeo] = useState<SeoConfig | null>(null);
  const [logs, setLogs] = useState<LogData | null>(null);
  const [logType, setLogType] = useState<"app" | "harvester" | "monitor">("app");
  const [loadingData, setLoadingData] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const authHeaders = () => ({
    Authorization: `Bearer ${user?.token}`,
    "Content-Type": "application/json",
  });

  const fetchStats = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/v1/admin/stats", { headers: authHeaders() });
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
    setLoadingData(false);
  };

  const fetchSeo = async () => {
    setLoadingData(true);
    try {
      const res = await fetch("/api/v1/admin/seo", { headers: authHeaders() });
      if (res.ok) setSeo(await res.json());
    } catch { /* ignore */ }
    setLoadingData(false);
  };

  const fetchLogs = async (type: string = logType) => {
    setLoadingData(true);
    try {
      const endpoint = type === "app" ? "/api/v1/admin/logs?lines=100" : `/api/v1/admin/logs/${type}?lines=100`;
      const res = await fetch(endpoint, { headers: authHeaders() });
      if (res.ok) setLogs(await res.json());
    } catch { /* ignore */ }
    setLoadingData(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      if (activeTab === "stats") fetchStats();
      else if (activeTab === "seo") fetchSeo();
      else if (activeTab === "logs") fetchLogs();
    }
  }, [activeTab, user, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) toast({ title: "Bejelentkezesi hiba", description: error.message, variant: "destructive" });
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Betoltes...</div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero"><Bot className="h-8 w-8 text-primary-foreground" /></div>
            <h1 className="text-2xl font-bold">Admin Bejelentkezes</h1>
            <p className="text-muted-foreground text-sm">Inaya Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required /></div>
            <div><Label htmlFor="password">Jelszo</Label><Input id="password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required /></div>
            <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Bejelentkezes..." : "Bejelentkezes"}</Button>
          </form>
          <div className="mt-4 text-center"><Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Vissza</Button></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Nincs jogosultsag</h1>
          <p className="text-muted-foreground mb-4">Nincs admin jogosultsagod.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Vissza</Button>
            <Button variant="ghost" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Kijelentkezes</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Vissza</Button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero"><Bot className="h-5 w-5 text-primary-foreground" /></div>
              <div><span className="text-lg font-bold">Admin Panel</span><p className="text-xs text-muted-foreground">{user.email}</p></div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 flex gap-1">
          {[
            { id: "stats" as const, label: "Statisztikak", icon: BarChart3 },
            { id: "seo" as const, label: "SEO", icon: Settings },
            { id: "logs" as const, label: "Logok", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Dashboard</h2>
              <Button variant="outline" size="sm" onClick={fetchStats} disabled={loadingData}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />Frissites
              </Button>
            </div>

            {stats && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Package className="h-4 w-4" /><span className="text-xs">Termekek</span></div>
                    <p className="text-2xl font-bold">{stats.database.products.toLocaleString("hu-HU")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Tag className="h-4 w-4" /><span className="text-xs">Arak</span></div>
                    <p className="text-2xl font-bold">{stats.database.prices.toLocaleString("hu-HU")}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Store className="h-4 w-4" /><span className="text-xs">Boltok</span></div>
                    <p className="text-2xl font-bold">{stats.database.stores}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1"><Search className="h-4 w-4" /><span className="text-xs">Aktiv session-ok</span></div>
                    <p className="text-2xl font-bold">{stats.redis.active_sessions ?? 0}</p>
                  </div>
                </div>

                {/* Products by Store */}
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-semibold mb-3">Termekek boltonkent</h3>
                  <div className="space-y-2">
                    {stats.products_by_store.map((s) => (
                      <div key={s.store} className="flex items-center justify-between">
                        <span className="text-sm">{s.store}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((s.count / stats.database.products) * 200, 200)}px` }} />
                          <span className="text-sm font-mono text-muted-foreground w-12 text-right">{s.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Searches */}
                {stats.redis.popular_searches && stats.redis.popular_searches.length > 0 && (
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="font-semibold mb-3">Nepszeru keresesek</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {stats.redis.popular_searches.map((s) => (
                        <div key={s.query} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5">
                          <span className="text-sm truncate">{s.query}</span>
                          <span className="text-xs font-mono text-muted-foreground ml-2">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Products */}
                <div className="rounded-lg border border-border p-4">
                  <h3 className="font-semibold mb-3">Legutolso termekek</h3>
                  <div className="space-y-1.5">
                    {stats.recent_products.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1 mr-4">{p.name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(p.created_at).toLocaleString("hu-HU")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">SEO Beallitasok</h2>
              <Button variant="outline" size="sm" onClick={fetchSeo} disabled={loadingData}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />Frissites
              </Button>
            </div>

            {seo && Object.entries(seo).map(([path, settings]) => (
              <div key={path} className="rounded-lg border border-border p-4">
                <h3 className="font-mono text-sm text-primary mb-3">{path}</h3>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <Input
                      value={settings.title}
                      onChange={(e) => setSeo({ ...seo, [path]: { ...settings, title: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <Input
                      value={settings.description}
                      onChange={(e) => setSeo({ ...seo, [path]: { ...settings, description: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">OG Image</Label>
                    <Input
                      value={settings.og_image}
                      onChange={(e) => setSeo({ ...seo, [path]: { ...settings, og_image: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={async () => {
                      const p = path === "/" ? "" : path.slice(1);
                      const res = await fetch(`/api/v1/admin/seo/${p}`, {
                        method: "PUT",
                        headers: authHeaders(),
                        body: JSON.stringify(settings),
                      });
                      if (res.ok) toast({ title: "Mentve", description: `${path} SEO frissitve` });
                    }}
                  >
                    Mentes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Logok</h2>
              <Button variant="outline" size="sm" onClick={() => fetchLogs(logType)} disabled={loadingData}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingData ? "animate-spin" : ""}`} />Frissites
              </Button>
            </div>

            <div className="flex gap-2">
              {[
                { id: "app" as const, label: "Backend" },
                { id: "harvester" as const, label: "Harvester" },
                { id: "monitor" as const, label: "Monitor" },
              ].map((t) => (
                <Button
                  key={t.id}
                  variant={logType === t.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setLogType(t.id); fetchLogs(t.id); }}
                >
                  {t.label}
                </Button>
              ))}
            </div>

            {logs && (
              <div className="rounded-lg border border-border bg-black/90 p-4 overflow-auto max-h-[60vh]">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {logs.lines.join("\n")}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
