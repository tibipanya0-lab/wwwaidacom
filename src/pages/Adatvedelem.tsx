import { ArrowLeft, Shield, Search, Cookie, Link2, Lock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Adatvedelem = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <Header />

      <main className="container mx-auto px-4 py-12 pt-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Vissza
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Adatvédelmi tájékoztató
              </h1>
              <p className="text-sm text-neutral-400 mt-1">Utoljára frissítve: 2026. február</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/30 p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/20 shrink-0">
                <Eye className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-neutral-300 leading-relaxed">
                <strong className="text-white">Fontos:</strong> Az Inaya AI oldalon nincs regisztrációs lehetőség, 
                így nem gyűjtünk és nem tárolunk nevet, e-mail címet vagy jelszavakat. 
                A szolgáltatás használata teljesen anonim.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Section 1 - Data Collection */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 shrink-0">
                  <Search className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Milyen adatokat gyűjtünk és miért?
                  </h2>
                  <div className="space-y-4 text-neutral-300">
                    <div>
                      <h3 className="font-medium text-white mb-1">Keresési adatok</h3>
                      <p className="text-sm leading-relaxed">
                        Amikor a keresőt használod, a rendszerünk feldolgozza a kulcsszavakat vagy a feltöltött képet. 
                        Ezeket az adatokat anonimizálva használjuk az AI fejlesztéséhez és a keresési találatok javításához.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Technikai adatok</h3>
                      <p className="text-sm leading-relaxed">
                        Mint minden weboldal, mi is naplózzuk az IP-címedet, a böngésződ típusát és a látogatás idejét 
                        a biztonság és a statisztikák miatt (Google Analytics).
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Sütik (Cookies)</h3>
                      <p className="text-sm leading-relaxed">
                        A sütik segítenek abban, hogy a partneráruházak felismerjék, tőlünk érkeztél, így kaphatunk jutalékot.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 - Image Search */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 shrink-0">
                  <Eye className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Kép alapú keresés
                  </h2>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    Ha képet töltesz fel a keresőnkbe, azt a rendszerünk elemzi. A feltöltött képeket 
                    nem tároljuk véglegesen, és nem használjuk fel téged azonosításra.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 - Third Parties */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 shrink-0">
                  <Link2 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Harmadik felek (Linkek és Partnerek)
                  </h2>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    Oldalunk külső webhelyekre mutató linkeket tartalmaz. Ezen oldalak adatkezelési 
                    gyakorlatáért nem vállalunk felelősséget. Javasoljuk, hogy olvasd el az ő tájékoztatójukat is.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4 - Security */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 shrink-0">
                  <Lock className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Adatbiztonság és tárolás
                  </h2>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                    Mivel az Inaya AI oldalon nincs regisztráció, nem tárolunk rólad profiladatokat, 
                    jelszavakat vagy személyes azonosításra alkalmas információkat.
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-background/30 border border-border">
                      <h3 className="font-medium text-white mb-1 text-sm">🔒 Biztonságos kapcsolat</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Az oldal SSL (HTTPS) titkosítást használ, ami garantálja, hogy a böngésződ és a szerver 
                        közötti kommunikáció védett és illetéktelenek számára olvashatatlan.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background/30 border border-border">
                      <h3 className="font-medium text-white mb-1 text-sm">💾 Adattárolás</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Csak a szolgáltatás működéséhez elengedhetetlen technikai adatokat (pl. anonim sütik) 
                        kezeljük ideiglenesen, amelyek nem kapcsolhatók össze a te személyeddel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-500/20 text-center">
            <p className="text-sm text-neutral-400">
              Kérdésed van? Írj nekünk: <a href="mailto:info@inaya.hu" className="text-amber-400 hover:underline">info@inaya.hu</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Adatvedelem;
