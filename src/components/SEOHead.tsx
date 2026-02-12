import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

const BASE_URL = "https://wwwaidacom.lovable.app";

const SEOHead = ({
  title = "Inaya - AI Árösszehasonlító | Legjobb árak Temu, Shein, Alza",
  description = "Találd meg a legjobb árakat másodpercek alatt! AI-alapú árösszehasonlítás 50+ áruházból: Temu, Shein, Alza, AliExpress. Spórolj akár 70%-ot!",
  canonical,
  type = "website",
  jsonLd,
  noindex = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes("Inaya") ? title : `${title} | Inaya`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
