import { ArrowLeft, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const GYIK = () => {
  const faqItems = [
    {
      question: "Mi az az Inaya AI és hogyan működik?",
      answer:
        "Inaya egy mesterséges intelligenciával támogatott kereső, amely több ezer kupon és akció között böngészik helyetted. Csak írd be, mit keresel, és Inaya megmutatja a legolcsóbb opciókat és a működő kódokat.",
    },
    {
      question: "Ingyenes az oldal használata?",
      answer:
        "Igen, az Inaya AI használata teljesen ingyenes. Mi jutalékot kaphatunk a partnereinktől, ha náluk vásárolsz, de ez neked egy filléredbe sem kerül, sőt, a kuponokkal pénzt spórolsz!",
    },
    {
      question: "Miért nem működik egy kupon?",
      answer:
        "Az akciók és kuponkódok gyorsan változnak. Inaya igyekszik mindig a legfrissebbeket mutatni, de előfordulhat, hogy egy kód lejárt vagy egy készlet elfogyott. Ilyenkor érdemes kipróbálni a következő ajánlatot a listában.",
    },
    {
      question: "Hogyan működik a kép alapú keresés?",
      answer:
        "Láttál valahol egy jó cipőt vagy táskát? Csak kattints a kamera ikonra a keresőben, töltsd fel a képet, és Inaya megkeresi neked ugyanazt a terméket (vagy egy hasonlót) a legjobb áron.",
    },
    {
      question: "Biztonságos az Inayán keresztül vásárolni?",
      answer:
        "Igen, mert a vásárlást nem nálunk, hanem megbízható nagyáruházak hivatalos oldalán végzed el. Mi csak a legjobb utat mutatjuk meg neked a kedvezményekhez.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <SEOHead
        title={{ hu: "Gyakran Ismételt Kérdések", en: "Frequently Asked Questions", uk: "Часті запитання", ro: "Întrebări frecvente", de: "Häufig gestellte Fragen" }}
        description={{
          hu: "Válaszok a leggyakrabban felmerülő kérdésekre az Inaya AI árösszehasonlítóval kapcsolatban.",
          en: "Answers to the most frequently asked questions about Inaya AI price comparison.",
          uk: "Відповіді на найпоширеніші запитання про Inaya AI порівняння цін.",
          ro: "Răspunsuri la cele mai frecvente întrebări despre Inaya AI.",
          de: "Antworten auf die häufigsten Fragen zu Inaya AI Preisvergleich.",
        }}
        canonical="/gyik"
        breadcrumbs={[{ name: "Főoldal", url: "/" }, { name: "GYIK", url: "/gyik" }]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": { "@type": "Answer", "text": item.answer }
          }))
        }}
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

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <HelpCircle className="h-8 w-8 text-amber-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Gyakran Ismételt Kérdések
            </h1>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-amber-500/20 last:border-0"
                >
                  <AccordionTrigger className="text-left text-white hover:text-amber-400 hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-neutral-300 leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GYIK;
