import { Helmet } from "react-helmet-async";
import { useLanguage, Language } from "@/contexts/LanguageContext";

interface SEOHeadProps {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  canonical?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  breadcrumbs?: { name: string; url: string }[];
}

const BASE_URL = "https://inaya.hu";

const SUPPORTED_LANGS: Language[] = ["hu", "uk", "en", "ro", "de"];

const LOCALE_MAP: Record<Language, string> = {
  hu: "hu_HU",
  en: "en_US",
  uk: "uk_UA",
  ro: "ro_RO",
  de: "de_DE",
};

const SEOHead = ({
  title,
  description,
  canonical,
  type = "website",
  jsonLd,
  noindex = false,
  breadcrumbs,
}: SEOHeadProps) => {
  const { language } = useLanguage();

  const defaultTitles: Record<Language, string> = {
    hu: "Inaya - AI Arösszehasonlító | Legjobb árak AliExpress, eBay",
    en: "Inaya - AI Price Comparison | Best Prices from AliExpress, eBay",
    uk: "Inaya - AI Порівняння цін | Найкращі ціни AliExpress, eBay",
    ro: "Inaya - Comparator de prețuri AI | Cele mai bune prețuri AliExpress, eBay",
    de: "Inaya - KI-Preisvergleich | Beste Preise AliExpress, eBay",
  };

  const defaultDescriptions: Record<Language, string> = {
    hu: "Találd meg a legjobb árakat másodpercek alatt! AI-alapú árösszehasonlítás AliExpress, eBay áruházakból. Spórolj akár 70%-ot!",
    en: "Find the best prices in seconds! AI-powered price comparison from AliExpress, eBay. Save up to 70%!",
    uk: "Знайдіть найкращі ціни за секунди! AI порівняння цін із AliExpress, eBay. Заощаджуйте до 70%!",
    ro: "Găsește cele mai bune prețuri în câteva secunde! Comparator de prețuri AI din AliExpress, eBay. Economisește până la 70%!",
    de: "Finden Sie die besten Preise in Sekunden! KI-gestützter Preisvergleich aus AliExpress, eBay. Sparen Sie bis zu 70%!",
  };

  const resolvedTitle =
    typeof title === "object"
      ? title[language] || title.hu || Object.values(title)[0]
      : title || defaultTitles[language];
  const resolvedDescription =
    typeof description === "object"
      ? description[language] || description.hu || Object.values(description)[0]
      : description || defaultDescriptions[language];

  const fullTitle = resolvedTitle.includes("Inaya")
    ? resolvedTitle
    : `${resolvedTitle} | Inaya`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  // Build JSON-LD array
  const jsonLdItems: Record<string, unknown>[] = [];

  // Organization schema (always present)
  jsonLdItems.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Inaya",
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.ico`,
    description: defaultDescriptions.hu,
    sameAs: [],
  });

  // WebSite schema with SearchAction (on homepage)
  if (canonical === "/" || !canonical) {
    jsonLdItems.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Inaya",
      url: BASE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/kereses?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });
  }

  // Breadcrumb schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    jsonLdItems.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${BASE_URL}${item.url}`,
      })),
    });
  }

  // Custom JSON-LD from props
  if (jsonLd) {
    if (Array.isArray(jsonLd)) {
      jsonLdItems.push(...jsonLd);
    } else {
      jsonLdItems.push(jsonLd);
    }
  }

  return (
    <Helmet>
      <html lang={language} />
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Hreflang tags for all supported languages */}
      {canonicalUrl &&
        SUPPORTED_LANGS.map((lang) => (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={canonicalUrl}
          />
        ))}
      {canonicalUrl && (
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:locale" content={LOCALE_MAP[language] || "hu_HU"} />
      {SUPPORTED_LANGS.filter((l) => l !== language).map((lang) => (
        <meta
          key={lang}
          property="og:locale:alternate"
          content={LOCALE_MAP[lang]}
        />
      ))}
      <meta property="og:site_name" content="Inaya" />
      <meta
        property="og:image"
        content={`${BASE_URL}/og-image.png`}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={`${BASE_URL}/og-image.png`} />

      {/* JSON-LD Structured Data */}
      {jsonLdItems.map((item, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
