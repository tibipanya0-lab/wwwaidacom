import { useState, useEffect, useCallback } from "react";
import { Play, Square, RefreshCw, AlertTriangle, Loader2, Database, Pickaxe, Trash2, ShieldAlert, Star, BarChart3, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const HARD_LIMIT = 40000;
const TOTAL_TARGET = 5000;

const CATEGORY_NAMES = ["Divat", "Elektronika", "Otthon", "Sport", "Szépség", "Gyerek", "Autó & Szerszám"];
const DEFAULT_QUOTA = Math.floor(TOTAL_TARGET / CATEGORY_NAMES.length);
const CATEGORY_QUOTAS: Record<string, number> = { "Divat": 2000 };
const getCategoryQuota = (name: string) => CATEGORY_QUOTAS[name] ?? DEFAULT_QUOTA;

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
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-lg font-medium">Sync Dashboard jelenleg nem elérhető.</p>
      <p className="text-sm mt-2">Új backend API csatlakoztatás után újra elérhető lesz.</p>
    </div>
  );
};

export default SyncDashboard;
