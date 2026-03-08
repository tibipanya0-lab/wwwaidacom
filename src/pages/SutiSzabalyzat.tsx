import { ArrowLeft, Cookie, ShoppingCart, Settings, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import InayaAvatar from "@/components/InayaAvatar";
import SEOHead from "@/components/SEOHead";

const SutiSzabalyzat = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Cookie szabályzat" description="Inaya cookie szabályzata. Tudj meg többet a weboldal által használt cookie-król." canonical="/suti-szabalyzat" />
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
              <h1 className="text-3xl font-bold">Cookie szabályzat</h1>
              <p className="text-sm text-muted-foreground">Utoljára frissítve: 2026. március</p>
            </div>
          </div>

          <div className="space-y-8 text-muted-foreground">
            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">1</span>
                Mi az a cookie?
              </h2>
              <p>
                A cookie egy kis szövegfájl, amelyet a weboldal helyez el a böngészőjében a megfelelő működés biztosítása érdekében.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">2</span>
                Általunk használt cookie-k
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Settings className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Szükséges cookie-k</h3>
                    <p className="text-sm">
                      A weboldal alapvető működéséhez szükségesek.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Analitikai cookie-k</h3>
                    <p className="text-sm">
                      Névtelen látogatottsági statisztikák gyűjtése (pl. Google Analytics).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <ShoppingCart className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Affiliate cookie-k</h3>
                    <p className="text-sm">
                      Az affiliate partnerek által elhelyezett cookie-k, amelyek jutalékszámítás céljából követik a hivatkozásokat.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">3</span>
                Cookie-k kezelése
              </h2>
              <p className="mb-4">
                A cookie-kat böngészője beállításaiban kezelheti.
              </p>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-200">
                  <strong>Fontos:</strong> A szükséges cookie-k letiltása a weboldal működési zavarát okozhatja.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">4</span>
                Beleegyezés
              </h2>
              <p>
                Az oldal első látogatásakor cookie-k elfogadására vonatkozó értesítést kap.
              </p>
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
