import { Bot, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Adatvedelem = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Smart<span className="text-gradient">Asszisztens</span>
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
          <h1 className="text-3xl font-bold mb-8">Adatvédelmi Tájékoztató</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">1. Bevezetés</h2>
              <p>
                A SmartAsszisztens (a továbbiakban: "Szolgáltatás") elkötelezett a felhasználók személyes adatainak védelme mellett. 
                Ez az adatvédelmi tájékoztató ismerteti, hogyan gyűjtjük, használjuk és védjük az Ön személyes adatait.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">2. Adatkezelő</h2>
              <p>
                Az adatkezelő: SmartAsszisztens<br />
                Székhely: Budapest, Magyarország<br />
                E-mail: info@smartasszisztens.hu
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">3. Gyűjtött adatok</h2>
              <p>A Szolgáltatás használata során az alábbi adatokat gyűjthetjük:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Keresési előzmények és lekérdezések</li>
                <li>Böngészési adatok (cookie-k, IP-cím)</li>
                <li>Regisztráció esetén: név, e-mail cím</li>
                <li>Az AI asszisztenssel folytatott beszélgetések</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">4. Az adatkezelés célja</h2>
              <p>Az adatokat az alábbi célokra használjuk:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>A Szolgáltatás működtetése és fejlesztése</li>
                <li>Személyre szabott keresési eredmények biztosítása</li>
                <li>Ügyfélszolgálati megkeresések kezelése</li>
                <li>Statisztikai elemzések készítése</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">5. Cookie-k (sütik)</h2>
              <p>
                Weboldalunk cookie-kat használ a felhasználói élmény javítása érdekében. 
                A cookie-k kis szöveges fájlok, amelyeket a böngészője tárol. 
                Ön bármikor törölheti vagy letilthatja a cookie-kat a böngésző beállításaiban.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">6. Adatbiztonság</h2>
              <p>
                Az Ön adatait megfelelő technikai és szervezési intézkedésekkel védjük az illetéktelen hozzáférés, 
                módosítás, közzététel vagy megsemmisítés ellen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">7. Az Ön jogai</h2>
              <p>Önnek joga van:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Hozzáférést kérni a személyes adataihoz</li>
                <li>Kérni az adatok helyesbítését vagy törlését</li>
                <li>Visszavonni az adatkezeléshez adott hozzájárulását</li>
                <li>Panaszt tenni az illetékes adatvédelmi hatóságnál</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">8. Kapcsolat</h2>
              <p>
                Adatvédelmi kérdésekkel kapcsolatban kérjük, vegye fel velünk a kapcsolatot az 
                info@smartasszisztens.hu e-mail címen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">9. Módosítások</h2>
              <p>
                Fenntartjuk a jogot, hogy ezt az adatvédelmi tájékoztatót bármikor módosítsuk. 
                A változásokról a weboldalon keresztül tájékoztatjuk felhasználóinkat.
              </p>
              <p className="mt-4 text-sm">
                Utolsó frissítés: 2025. január 19.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Adatvedelem;
