import { ArrowLeft, Cookie, ShoppingCart, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import InayaAvatar from "@/components/InayaAvatar";

const SutiSzabalyzat = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <InayaAvatar size="md" />
              <span className="text-xl font-bold text-foreground">
                Inaya
              </span>
            </Link>
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Vissza a főoldalra
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Süti (Cookie) Szabályzat</h1>
              <p className="text-sm text-muted-foreground">Utoljára frissítve: 2026. február</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-6 mb-8">
            <p className="text-muted-foreground">
              Üdvözöllek az Inaya AI kuponoldalon! Ez a tájékoztató segít megérteni, mik azok a sütik, 
              hogyan használjuk őket, és miért fontosak neked is.
            </p>
          </div>
          
          <div className="space-y-8 text-muted-foreground">
            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">1</span>
                Mik azok a sütik (cookie-k)?
              </h2>
              <p>
                A sütik kisméretű szöveges fájlok, amelyeket a böngésződ tárol el, amikor meglátogatod az oldalt. 
                Segítenek megjegyezni a beállításaidat, és biztosítják az oldal gyors működését.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">2</span>
                Miért használunk sütiket?
              </h2>
              <p className="mb-4">Az Inaya AI két fő célból használ sütiket:</p>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Settings className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Működés</h3>
                    <p className="text-sm">
                      Hogy az oldal gyors legyen, emlékezzen a kereséseidre és a sötét mód beállításra.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ShoppingCart className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Affiliate (Partneri) jutalék</h3>
                    <p className="text-sm">
                      Ez a legfontosabb rész. Amikor rákattintasz egy kuponra vagy egy termékre, 
                      egy süti jelzi a webáruháznak (pl. Temu, AliExpress), hogy tőlünk érkeztél. 
                      Ez nekünk segít abban, hogy fenntartsuk az oldalt, számodra viszont{" "}
                      <span className="text-foreground font-medium">semmilyen extra költséggel nem jár</span>, 
                      sőt, így kapod meg a kedvezményeket.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">3</span>
                Hogyan vezérelheted a sütiket?
              </h2>
              <p className="mb-4">
                A böngésződ beállításaiban bármikor törölheted a sütiket, vagy letilthatod azokat.
              </p>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-200">
                  <strong>Fontos:</strong> A sütik letiltása esetén előfordulhat, hogy bizonyos kuponok 
                  vagy kedvezmények nem fognak megfelelően működni.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Kérdésed van? Írj nekünk: <a href="mailto:info@inaya.hu" className="text-primary hover:underline">info@inaya.hu</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SutiSzabalyzat;
