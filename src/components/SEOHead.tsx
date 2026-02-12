import { Helmet } from "react-helmet-async";
import { useLanguage, Language } from "@/contexts/LanguageContext";

interface SEOHeadProps {
  title?: string | Record<Language, string>;
  description?: string | Record<Language, string>;
  canonical?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

const BASE_URL = "https://wwwaidacom.lovable.app";

const SEOHead = ({
  title,
  description,
  canonical,
  type = "website",
  jsonLd,
  noindex = false,
}: SEOHeadProps) => {
  const { language } = useLanguage();

  const defaultTitles: Record<Language, string> = {
    hu: "Inaya - AI Árösszehasonlító | Legjobb árak Temu, Shein, Alza",
    en: "Inaya - AI Price Comparison | Best Prices from Temu, Shein, Alza",
    uk: "Inaya - AI Порівняння цін | Найкращі ціни Temu, Shein, Alza",
  };

  const defaultDescriptions: Record<Language, string> = {
    hu: "Találd meg a legjobb árakat másodpercek alatt! AI-alapú árösszehasonlítás 50+ áruházból. Spórolj akár 70%-ot!",
    en: "Find the best prices in seconds! AI-powered price comparison from 50+ stores. Save up to 70%!",
    uk: "Знайдіть найкращі ціни за секунди! AI порівняння цін із 50+ магазинів. Заощаджуйте до 70%!",
  };

  const resolvedTitle = typeof title === "object" ? (title[language] || title.hu) : (title || defaultTitles[language]);
  const resolvedDescription = typeof description === "object" ? (description[language] || description.hu) : (description || defaultDescriptions[language]);

  const fullTitle = resolvedTitle.includes("Inaya") ? resolvedTitle : `${resolvedTitle} | Inaya`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:locale" content={language === "hu" ? "hu_HU" : language === "uk" ? "uk_UA" : "en_US"} />
      <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
