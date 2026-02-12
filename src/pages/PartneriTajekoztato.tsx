import { ArrowLeft, Handshake, Link2, Wallet, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const PartneriTajekoztato = () => {
  const sections = [
    {
      icon: Link2,
      title: "Hogyan működik?",
      description:
        "Az oldalon található linkek egy része úgynevezett \"affiliate link\". Ha ezekre kattintasz és vásárolsz, mi egy kis jutalékot kaphatunk a kereskedőtől.",
    },
    {
      icon: Wallet,
      title: "Neked ez kerül valamibe?",
      description:
        "Nem. A termékek ára számodra nem változik, sőt, a nálunk talált kuponokkal gyakran sokkal olcsóbban vásárolhatsz, mintha közvetlenül mennél az oldalra.",
    },
    {
      icon: Sparkles,
      title: "Miért jó ez?",
      description:
        "Ez a jutalék teszi lehetővé, hogy Inaya, a mesterséges intelligencia asszisztens ingyenes maradjon, és folyamatosan kutassa neked a legjobb akciókat.",
    },
    {
      icon: ShieldCheck,
      title: "Függetlenség",
      description:
        "Csak olyan ajánlatokat mutatunk meg, amiket mi is jónak tartunk. A jutalék lehetősége nem befolyásolja, hogy melyik a valódi legjobb ár.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <SEOHead title="Partneri tájékoztató" description="Affiliate partneri tájékoztató – hogyan működik az Inaya együttműködési rendszere." canonical="/partneri-tajekoztato" />
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
              <Handshake className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Partneri tájékoztató
            </h1>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-6 md:p-8 mb-8">
            <p className="text-neutral-300 leading-relaxed text-lg">
              Az Inaya AI küldetése, hogy segítsen neked megtalálni a legjobb ajánlatokat és kuponokat. 
              Szeretnénk teljesen átláthatóan működni:
            </p>
          </div>

          <div className="grid gap-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-black/40 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-6 transition-all duration-300 hover:border-amber-500/40"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 shrink-0">
                    <section.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {section.title}
                    </h2>
                    <p className="text-neutral-300 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-2xl border border-amber-500/30 p-6">
            <p className="text-center text-neutral-300">
              Köszönjük, hogy az Inayát választod! 💛
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PartneriTajekoztato;
