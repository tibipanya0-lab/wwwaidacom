import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Admin = () => {
  const { user, isAdmin, isLoading, signIn, signOut } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (error) toast({ title: "Bejelentkezési hiba", description: error.message, variant: "destructive" });
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Betöltés...</div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero"><Bot className="h-8 w-8 text-primary-foreground" /></div>
            <h1 className="text-2xl font-bold">Admin Bejelentkezés</h1>
            <p className="text-muted-foreground text-sm">Inaya Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required /></div>
            <div><Label htmlFor="password">Jelszó</Label><Input id="password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required /></div>
            <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Bejelentkezés..." : "Bejelentkezés"}</Button>
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
          <h1 className="text-2xl font-bold mb-2">Nincs jogosultság</h1>
          <p className="text-muted-foreground mb-4">Nincs admin jogosultságod.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4 mr-2" />Vissza</Button>
            <Button variant="ghost" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Kijelentkezés</Button>
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
          <p className="text-muted-foreground mb-4">
            Az admin funkciók (kuponkezelés, termék import, sync dashboard, embeddings) 
            jelenleg ki vannak kapcsolva.
          </p>
          <p className="text-sm text-muted-foreground">
            Új backend API csatlakoztatás után az admin felület újra elérhető lesz.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Admin;
