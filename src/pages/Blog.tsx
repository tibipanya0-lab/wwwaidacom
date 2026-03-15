import { ArrowLeft, BookOpen, Clock, Layers, Camera, Package } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InayaAvatar from "@/components/InayaAvatar";
import SEOHead from "@/components/SEOHead";

const Blog = () => {
  const articles = [
    {
      icon: Clock,
      title: 'A "Flash Sale" pszichológiája',
      content:
        "Hogyan sürgetnek az órákkal, amik valójában sosem járnak le. Sok webshop úgy működik, hogy a visszaszámláló végén egyszerűen újraindul – mintha mindig 'utolsó esélyed' lenne. Inaya figyeli az árakat hosszú távon, és megmutatja, mikor valódi az akció, és mikor csak marketing trükk.",
    },
    {
      icon: Layers,
      title: "Kuponhalmozás",
      content:
        "Miért érdemesebb néha két kisebb kupont használni egy nagy helyett (ha a rendszer engedi). Egyes webshopok lehetővé teszik több kupon kombinálását – ilyenkor egy 10%+5% kombináció jobb lehet, mint egy 12%-os egyedülálló kupon. Inaya mindig a legjobb kombinációt keresi neked.",
    },
    {
      icon: Camera,
      title: "Kép alapú keresés ereje",
      content:
        "Hogyan találhatod meg ugyanazt a terméket feleannyiért egy másik eladónál, csak egy fotó alapján. Töltsd fel a képet a keresőbe, és Inaya megkeresi neked ugyanazt (vagy nagyon hasonló) terméket a legjobb áron – akár más boltban, akár más eladónál.",
    },
    {
      icon: Package,
      title: "Vám és szállítás",
      content:
        'Mire figyelj, hogy a "filléres" cucc a végén ne legyen drágább, mintha itthon vetted volna. 150€ felett vámot és ÁFA-t kell fizetned, ami akár 30-40%-kal is megdrágíthatja a rendelést. Inaya figyelmezteti, ha a kosár értéke közelít ehhez a határhoz.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <SEOHead
        title={{ hu: "Blog - Okos vásárlási tippek", en: "Blog - Smart Shopping Tips", uk: "Блог - Розумні поради", ro: "Blog - Sfaturi de cumpărare", de: "Blog - Smarte Einkaufstipps" }}
        description={{
          hu: "Vásárlási tippek, kuponhalmozási trükkök és online shopping tanácsok az Inaya AI-tól.",
          en: "Shopping tips, coupon stacking tricks and online shopping advice from Inaya AI.",
          uk: "Поради щодо покупок, трюки з купонами та поради від Inaya AI.",
          ro: "Sfaturi de cumpărare, trucuri cu cupoane și sfaturi de la Inaya AI.",
          de: "Einkaufstipps, Gutschein-Tricks und Online-Shopping-Ratschläge von Inaya AI.",
        }}
        canonical="/blog"
        breadcrumbs={[{ name: "Főoldal", url: "/" }, { name: "Blog", url: "/blog" }]}
      />
      <Header />

      <main className="container mx-auto px-4 py-12 pt-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Vissza
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <BookOpen className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Inaya Blog
            </h1>
          </div>

          {/* Intro from Inaya */}
          <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl border border-amber-500/30 p-6 md:p-8 mb-10">
            <div className="flex items-start gap-4">
              <InayaAvatar size="md" />
              <div>
                <p className="text-white font-medium mb-2">Szia, Inaya vagyok! 👋</p>
                <p className="text-neutral-300 leading-relaxed">
                  Naponta több tízezer árat elemzek a legnagyobb külföldi webshopokon. 
                  Észrevetted már, hogy valami hónapok óta 'akciós', mégsem változik az ára? 
                  Elárulom, mi történik a háttérben.
                </p>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="grid gap-6">
            {articles.map((article, index) => (
              <article
                key={index}
                className="bg-black/40 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-6 md:p-8 transition-all duration-300 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 shrink-0">
                    <article.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-3">
                      {article.title}
                    </h2>
                    <p className="text-neutral-300 leading-relaxed">
                      {article.content}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              to="/kereses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all duration-300"
            >
              Próbáld ki az Inaya keresőt
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
