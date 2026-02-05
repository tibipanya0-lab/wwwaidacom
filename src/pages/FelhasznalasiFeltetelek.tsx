import { Bot, ArrowLeft, FileText, ShieldCheck, Link2, Ban } from "lucide-react";
import { Link } from "react-router-dom";

const FelhasznalasiFeltetelek = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Aida
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
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Felhasználási Feltételek</h1>
              <p className="text-sm text-muted-foreground">Hatályos: 2026. február 5-től</p>
            </div>
          </div>
          
          <div className="space-y-8 text-muted-foreground">
            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">1</span>
                A szolgáltatás célja
              </h2>
              <p>
                Az Aida AI egy információs platform, amely mesterséges intelligencia segítségével gyűjti össze 
                a harmadik felek (pl. Temu, AliExpress) által kínált kuponokat és akciókat. 
                Az oldal használata <span className="text-foreground font-medium">ingyenes</span>.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">2</span>
                Felelősség korlátozása
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Kuponok érvényessége</h3>
                    <p className="text-sm">
                      Bár Aida mindent megtesz a kódok ellenőrzéséért, nem tudjuk garantálni, hogy minden kupon 
                      minden pillanatban működik. A kedvezmények érvényesítése a partner webáruházak feladata.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Vásárlási folyamat</h3>
                    <p className="text-sm">
                      Te nem az Aida AI-tól vásárolsz. Bármilyen termékkel kapcsolatos reklamációt, szállítást 
                      vagy garanciális ügyintézést az adott webáruháznál kell intézned.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Árak</h3>
                    <p className="text-sm">
                      Az oldalon megjelenő árak tájékoztató jellegűek, a végleges árat mindig a partnerbolt oldalán látod.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">3</span>
                Affiliate kapcsolatok
              </h2>
              <div className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm">
                    Az oldalunkon található linkek egy része úgynevezett "affiliate link". Ha ezen keresztül vásárolsz, 
                    mi jutalékot kaphatunk a partnertől. Ez számodra{" "}
                    <span className="text-foreground font-medium">semmilyen többletköltséggel nem jár</span>, 
                    és nem befolyásolja az árat.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card/30 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive text-sm font-bold">4</span>
                Tiltott tevékenységek
              </h2>
              <div className="flex gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <Ban className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm">
                    Tilos az oldal tartalmát (szövegek, AI logika, kódok) engedély nélkül másolni, 
                    automatizált szoftverekkel (botokkal) tömegesen gyűjteni vagy az oldal működését szándékosan zavarni.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Kérdésed van? Írj nekünk: <a href="mailto:info@aida.hu" className="text-primary hover:underline">info@aida.hu</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FelhasznalasiFeltetelek;
