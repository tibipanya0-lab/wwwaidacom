import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Plus, Pencil, Trash2, Power, PowerOff, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Coupon = {
  id: string;
  store_name: string;
  code: string;
  description: string;
  discount_percent: number | null;
  discount_amount: string | null;
  min_order_amount: string | null;
  valid_until: string | null;
  category: string;
  is_active: boolean;
  usage_count: number;
};

const emptyForm = {
  store_name: "",
  code: "",
  description: "",
  discount_percent: "",
  discount_amount: "",
  min_order_amount: "",
  valid_until: "",
  category: "általános",
  is_active: true,
  is_automatic: false,
};

// Predefined store list
const STORES = [
  "AliExpress",
  "Alza",
  "Amazon",
  "AutoDoc",
  "Bonami",
  "eMAG",
  "IKEA",
  "Media Markt",
  "Shein",
  "Temu",
  "Trendyol",
  "VidaXL",
  "Wish",
] as const;

const Admin = () => {
  const { user, isAdmin, isLoading, signIn, signOut } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Hiba", description: "Nem sikerült betölteni a kuponokat", variant: "destructive" });
      return;
    }
    setCoupons(data || []);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCoupons();
    }
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      toast({ title: "Bejelentkezési hiba", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const couponData = {
      store_name: form.store_name,
      code: form.is_automatic ? "AUTO" : form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discount_percent: form.discount_percent ? parseInt(form.discount_percent) : null,
      discount_amount: form.discount_amount || null,
      min_order_amount: form.min_order_amount || null,
      valid_until: form.valid_until || null,
      category: form.category,
      is_active: form.is_active,
    };

    // Validation
    if (!form.store_name) {
      toast({ title: "Hiba", description: "Válassz áruházat!", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!form.is_automatic && !form.code.trim()) {
      toast({ title: "Hiba", description: "Add meg a kuponkódot!", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    let error;
    if (editingCoupon) {
      const result = await supabase
        .from("coupons")
        .update(couponData)
        .eq("id", editingCoupon.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("coupons")
        .insert([couponData]);
      error = result.error;
    }

    if (error) {
      toast({ title: "Hiba", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Siker", description: editingCoupon ? "Kupon frissítve!" : "Kupon létrehozva!" });
      setIsDialogOpen(false);
      setEditingCoupon(null);
      setForm(emptyForm);
      fetchCoupons();
    }
    setIsSubmitting(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const isAutomatic = coupon.code === "AUTO";
    setForm({
      store_name: coupon.store_name,
      code: coupon.code,
      description: coupon.description,
      discount_percent: coupon.discount_percent?.toString() || "",
      discount_amount: coupon.discount_amount || "",
      min_order_amount: coupon.min_order_amount || "",
      valid_until: coupon.valid_until?.split("T")[0] || "",
      category: coupon.category,
      is_active: coupon.is_active,
      is_automatic: isAutomatic,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd ezt a kupont?")) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      toast({ title: "Hiba", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Törölve", description: "Kupon sikeresen törölve!" });
      fetchCoupons();
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);

    if (error) {
      toast({ title: "Hiba", description: error.message, variant: "destructive" });
    } else {
      fetchCoupons();
    }
  };

  const openNewCouponDialog = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  // Login form for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Admin Bejelentkezés</h1>
            <p className="text-muted-foreground text-sm">SmartAsszisztens kuponkezelő</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Jelszó</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Bejelentkezés..." : "Bejelentkezés"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza a főoldalra
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not admin message
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Nincs jogosultság</h1>
          <p className="text-muted-foreground mb-4">Nincs admin jogosultságod ehhez az oldalhoz.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Kijelentkezés
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Vissza
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">Kupon Admin</span>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm" onClick={openNewCouponDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Új kupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCoupon ? "Kupon szerkesztése" : "Új kupon létrehozása"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="store_name">Áruház neve*</Label>
                    <Select
                      value={form.store_name}
                      onValueChange={(value) => setForm({ ...form, store_name: value })}
                    >
                      <SelectTrigger id="store_name">
                        <SelectValue placeholder="Válassz áruházat..." />
                      </SelectTrigger>
                      <SelectContent>
                        {STORES.map((store) => (
                          <SelectItem key={store} value={store}>
                            {store}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_automatic"
                      checked={form.is_automatic}
                      onCheckedChange={(checked) => setForm({ 
                        ...form, 
                        is_automatic: checked,
                        code: checked ? "AUTO" : form.code === "AUTO" ? "" : form.code
                      })}
                    />
                    <Label htmlFor="is_automatic">Automatikus kedvezmény (nincs kód)</Label>
                  </div>

                  {!form.is_automatic && (
                    <div>
                      <Label htmlFor="code">Kuponkód*</Label>
                      <Input
                        id="code"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        placeholder="pl. SAVE20"
                        required={!form.is_automatic}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="description">Leírás*</Label>
                    <Input
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="pl. 20% kedvezmény minden termékre"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount_percent">Kedvezmény %</Label>
                      <Input
                        id="discount_percent"
                        type="number"
                        min="0"
                        max="100"
                        value={form.discount_percent}
                        onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount_amount">Vagy fix összeg</Label>
                      <Input
                        id="discount_amount"
                        value={form.discount_amount}
                        onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                        placeholder="pl. 2000 Ft"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min_order_amount">Min. rendelés</Label>
                      <Input
                        id="min_order_amount"
                        value={form.min_order_amount}
                        onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                        placeholder="pl. 10000 Ft"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Kategória</Label>
                      <Input
                        id="category"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="pl. divat"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="valid_until">Érvényesség vége</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={form.valid_until}
                      onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Aktív</Label>
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Mentés..." : editingCoupon ? "Mentés" : "Létrehozás"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Áruház</TableHead>
                <TableHead>Kód</TableHead>
                <TableHead className="hidden md:table-cell">Kedvezmény</TableHead>
                <TableHead className="hidden lg:table-cell">Kategória</TableHead>
                <TableHead className="hidden lg:table-cell">Érvényes</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.store_name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-sm">{coupon.code}</code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {coupon.discount_percent ? `${coupon.discount_percent}%` : coupon.discount_amount || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{coupon.category}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString("hu-HU") : "Korlátlan"}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      coupon.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}>
                      {coupon.is_active ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                      {coupon.is_active ? "Aktív" : "Inaktív"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(coupon)}
                        title={coupon.is_active ? "Deaktiválás" : "Aktiválás"}
                      >
                        {coupon.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)} title="Szerkesztés">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-destructive hover:text-destructive"
                        title="Törlés"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nincsenek kuponok. Hozz létre egyet!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Admin;
