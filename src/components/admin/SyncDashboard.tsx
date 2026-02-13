import { useState, useEffect, useCallback } from "react";
import { Play, Square, RefreshCw, AlertTriangle, Loader2, Database, Pickaxe, Trash2, ShieldAlert, Star, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HARD_LIMIT = 40000;
const TOTAL_TARGET = 5000;

const CATEGORY_NAMES = ["Divat", "Elektronika", "Otthon", "Sport", "Szépség", "Gyerek", "Autó & Szerszám"];
const CATEGORY_QUOTA = Math.floor(TOTAL_TARGET / CATEGORY_NAMES.length);

type SyncRow = {
  id: string;
  category_name: string;
  keyword: string;
  keyword_index: number;
  status: string;
  pages_completed: number;
  products_fetched: number;
  products_saved: number;
  products_filtered: number;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
};

const SyncDashboard = () => {
  const [syncRows, setSyncRows] = useState<SyncRow[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isRatingCleanup, setIsRatingCleanup] = useState(false);
  const [ratingCleanupResult, setRatingCleanupResult] = useState<{ removedLowRating: number; removedNotFound: number; totalDeleted: number } | null>(null);
  const [idCleanupCount, setIdCleanupCount] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    const [syncRes, countRes] = await Promise.all([
      supabase.from("sync_status").select("*").order("updated_at", { ascending: false }),
      supabase.from("products").select("*", { count: "exact", head: true }),
    ]);
    if (syncRes.data) setSyncRows(syncRes.data as SyncRow[]);
    setProductCount(countRes.count || 0);

    // Fetch per-category product counts
    const counts: Record<string, number> = {};
    const catPromises = CATEGORY_NAMES.map(async (cat) => {
      const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category", cat);
      counts[cat] = count || 0;
    });
    await Promise.all(catPromises);
    setCategoryCounts(counts);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const totalKeywords = syncRows.length;
  const doneKeywords = syncRows.filter(r => r.status === "done").length;
  const inProgressRow = syncRows.find(r => r.status === "in_progress");
  const isRunning = !!inProgressRow;
  const progressPercent = totalKeywords > 0 ? Math.round((doneKeywords / totalKeywords) * 100) : 0;
  const totalFetched = syncRows.reduce((s, r) => s + r.products_fetched, 0);
  const totalSaved = syncRows.reduce((s, r) => s + r.products_saved, 0);
  const totalFiltered = syncRows.reduce((s, r) => s + (r.products_filtered || 0), 0);
  const categories = [...new Set(syncRows.map(r => r.category_name))];
  const currentCategory = inProgressRow?.category_name || (doneKeywords < totalKeywords ? syncRows.find(r => r.status === "pending")?.category_name : null);
  const limitPercent = Math.min(100, Math.round((productCount / HARD_LIMIT) * 100));
  const isAtLimit = productCount >= HARD_LIMIT;

  const handleStart = async () => {
    if (isAtLimit) {
      toast({ title: "Hard limit elérve!", description: `${productCount.toLocaleString("hu-HU")}/${HARD_LIMIT.toLocaleString("hu-HU")} — Takaríts először!`, variant: "destructive" });
      return;
    }
    setIsStarting(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-sync`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      toast({ title: "Robot elindítva", description: "A szinkronizálás megkezdődött." });
      setTimeout(fetchData, 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ismeretlen hiba";
      setErrors(prev => [`${new Date().toLocaleTimeString("hu-HU")} — Indítás hiba: ${msg}`, ...prev].slice(0, 5));
      toast({ title: "Hiba", description: msg, variant: "destructive" });
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      await supabase.from("sync_status").update({ status: "pending" }).eq("status", "in_progress");
      toast({ title: "Robot megállítva", description: "Az aktuális feladat pendingre állítva." });
      fetchData();
    } catch {
      toast({ title: "Hiba", description: "Nem sikerült megállítani.", variant: "destructive" });
    } finally {
      setIsStopping(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Biztosan visszaállítod az összes kategóriát? Ez újraindítja a teljes ciklust.")) return;
    await supabase.from("sync_status").update({ status: "pending", pages_completed: 0, products_fetched: 0, products_saved: 0, completed_at: null, started_at: null }).neq("status", "___");
    toast({ title: "Visszaállítva", description: "Minden kategória újra pending." });
    fetchData();
  };

  const handleCleanup = async () => {
    if (!confirm("Törölni akarod a 30 napnál régebbi termékeket? Ez nem vonható vissza!")) return;
    setIsCleaning(true);
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("products")
        .delete({ count: "exact" })
        .lt("created_at", thirtyDaysAgo);
      toast({ title: "Takarítás kész!", description: `${count || 0} régi termék törölve.` });
      fetchData();
    } catch {
      toast({ title: "Hiba", description: "Takarítás sikertelen.", variant: "destructive" });
    } finally {
      setIsCleaning(false);
    }
  };

  const handleRatingCleanup = async () => {
    if (!confirm("Elindítod az értékelés-alapú tisztítást? A 3 csillag alatti és kevés véleménnyel rendelkező termékek törlődnek.")) return;
    setIsRatingCleanup(true);
    setRatingCleanupResult(null);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rating-cleanup`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setRatingCleanupResult({
        removedLowRating: data.removedLowRating || 0,
        removedNotFound: data.removedNotFound || 0,
        totalDeleted: data.totalDeleted || 0,
      });
      toast({ title: "Értékelés tisztítás kész!", description: `${data.totalDeleted || 0} gyenge minőségű termék eltávolítva.` });
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ismeretlen hiba";
      setErrors(prev => [`${new Date().toLocaleTimeString("hu-HU")} — Rating cleanup hiba: ${msg}`, ...prev].slice(0, 5));
      toast({ title: "Hiba", description: msg, variant: "destructive" });
    } finally {
      setIsRatingCleanup(false);
    }
  };

  const handleIdCleanup = async () => {
    if (!confirm("Törölni akarod az összes external_id nélküli terméket? Ezek nem frissíthetőek az API-n keresztül.")) return;
    try {
      const { count } = await supabase
        .from("products")
        .delete({ count: "exact" })
        .is("external_id", null);
      const deleted = count || 0;
      setIdCleanupCount(deleted);
      toast({ title: "ID tisztítás kész!", description: `${deleted} frissíthetetlen termék eltávolítva.` });
      fetchData();
    } catch {
      toast({ title: "Hiba", description: "ID tisztítás sikertelen.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hard limit warning */}
      {isAtLimit && (
        <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-4 flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-destructive shrink-0" />
          <div>
            <p className="font-bold text-destructive">🚫 HARD LIMIT ELÉRVE!</p>
            <p className="text-sm text-destructive/80">A termékszám elérte a {HARD_LIMIT.toLocaleString("hu-HU")}-es határt. A robot automatikusan leállt. Takaríts a folytatáshoz!</p>
          </div>
        </div>
      )}

      {/* Product count + limit gauge */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Products tábla (SELECT count(*))</p>
            <h2 className="text-3xl font-bold text-primary">{productCount.toLocaleString("hu-HU")}</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Hard Limit</p>
            <p className={`text-lg font-bold ${isAtLimit ? "text-destructive" : limitPercent > 80 ? "text-amber-500" : "text-muted-foreground"}`}>
              {limitPercent}% / {HARD_LIMIT.toLocaleString("hu-HU")}
            </p>
          </div>
        </div>
        <Progress value={limitPercent} className={`h-3 ${isAtLimit ? "[&>div]:bg-destructive" : limitPercent > 80 ? "[&>div]:bg-amber-500" : ""}`} />
      </div>

      {/* Current mining status */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Pickaxe className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Aktuális folyamat</p>
            <h2 className="text-xl font-bold">
              {isRunning
                ? `⛏️ Most bányászom: ${inProgressRow.category_name}`
                : doneKeywords === totalKeywords && totalKeywords > 0
                  ? "✅ Teljes ciklus kész!"
                  : "⏸️ Robot várakozik"}
            </h2>
            {inProgressRow && (
              <p className="text-sm text-muted-foreground mt-1">
                Kulcsszó: <span className="font-medium text-foreground">{inProgressRow.keyword}</span>
                {" · "}Oldal: {inProgressRow.pages_completed}/13
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{doneKeywords} / {totalKeywords} kulcsszó kész</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={<Database className="h-5 w-5" />} label="Összes termék" value={productCount.toLocaleString("hu-HU")} accent />
        <StatCard icon={<Pickaxe className="h-5 w-5" />} label="API-ból letöltve" value={totalFetched.toLocaleString("hu-HU")} />
        <StatCard icon={<RefreshCw className="h-5 w-5" />} label="AI feldolgozva & mentve" value={totalSaved.toLocaleString("hu-HU")} />
        <StatCard icon={<ShieldAlert className="h-5 w-5" />} label="⭐ Elvetve (alacsony rating)" value={totalFiltered.toLocaleString("hu-HU")} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Kategóriák" value={`${categories.length} db`} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleStart} disabled={isStarting || isRunning || isAtLimit} variant="hero" className="gap-2">
          {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Robot Indítása
        </Button>
        <Button onClick={handleStop} disabled={isStopping || !isRunning} variant="destructive" className="gap-2">
          {isStopping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
          Robot Megállítása
        </Button>
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Ciklus Visszaállítása
        </Button>
        <Button onClick={handleCleanup} disabled={isCleaning} variant="outline" className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
          {isCleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          🧹 Takarítás (30+ napos)
        </Button>
        <Button onClick={handleRatingCleanup} disabled={isRatingCleanup} variant="outline" className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10">
          {isRatingCleanup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
          ⭐ Értékelés Tisztítás
        </Button>
        <Button onClick={handleIdCleanup} variant="outline" className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
          🆔 ID nélküliek törlése
        </Button>
      </div>

      {/* Rating cleanup result */}
      {ratingCleanupResult && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" /> Utólagos szűrés eredménye
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Alacsony értékelés</p>
              <p className="text-lg font-bold text-destructive">{ratingCleanupResult.removedLowRating} db</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nem elérhető termék</p>
              <p className="text-lg font-bold text-destructive">{ratingCleanupResult.removedNotFound} db</p>
            </div>
            <div>
              <p className="text-muted-foreground">Összesen eltávolítva</p>
              <p className="text-lg font-bold text-destructive">{ratingCleanupResult.totalDeleted} db</p>
            </div>
          </div>
        </div>
      )}

      {/* ID cleanup result */}
      {idCleanupCount !== null && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-primary" /> ID Tisztítás eredménye
          </h3>
          <p className="text-sm">Eltávolítva: <span className="font-bold text-destructive">{idCleanupCount} db</span> frissíthetetlen (external_id nélküli) termék.</p>
        </div>
      )}

      {/* Category quota saturation */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Kategória kvóta telítettség ({CATEGORY_QUOTA} / kategória)
        </h3>
        <div className="space-y-2">
          {CATEGORY_NAMES.map(cat => {
            const count = categoryCounts[cat] || 0;
            const pct = Math.min(100, Math.round((count / CATEGORY_QUOTA) * 100));
            const isFull = count >= CATEGORY_QUOTA;
            const isOver = count > CATEGORY_QUOTA;
            const isCurrent = cat === currentCategory;
            return (
              <div key={cat} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isFull ? "bg-destructive/5 border border-destructive/20" : isCurrent ? "bg-primary/5 border border-primary/20" : ""}`}>
                <span className="text-sm font-medium w-36 truncate">
                  {isFull ? "✅ " : isCurrent ? "⛏️ " : ""}{cat}
                </span>
                <Progress
                  value={pct}
                  className={`h-2.5 flex-1 ${isFull ? "[&>div]:bg-destructive" : isCurrent ? "[&>div]:bg-amber-500 [&>div]:animate-pulse" : pct > 70 ? "[&>div]:bg-amber-500" : ""}`}
                />
                <span className={`text-xs font-mono w-24 text-right ${isFull ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                  {isOver ? "🚫 " : ""}{count} / {CATEGORY_QUOTA}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyword-level category breakdown */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold mb-3">Kulcsszó állapotok</h3>
        <div className="space-y-2">
          {categories.map(cat => {
            const catRows = syncRows.filter(r => r.category_name === cat);
            const catDone = catRows.filter(r => r.status === "done").length;
            const catTotal = catRows.length;
            const catPct = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
            const isCurrent = cat === currentCategory;
            return (
              <div key={cat} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isCurrent ? "bg-primary/5 border border-primary/20" : ""}`}>
                <span className="text-sm font-medium w-36 truncate">{isCurrent ? "⛏️ " : ""}{cat}</span>
                <Progress value={catPct} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground w-16 text-right">{catDone}/{catTotal}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error list */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Utolsó hibák
          </h3>
          <div className="space-y-1 text-sm text-destructive/80">
            {errors.map((err, i) => <p key={i}>{err}</p>)}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 mb-1 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
    <p className={`text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
  </div>
);

export default SyncDashboard;
