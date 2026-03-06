import Header from "@/components/Header";
import InayaHeroSection from "@/components/InayaHeroSection";
import CategorySection from "@/components/CategorySection";
import InayaFeaturesSection from "@/components/InayaFeaturesSection";
import StoresSection from "@/components/StoresSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyInayaSection from "@/components/WhyInayaSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import DealsPromoSection from "@/components/DealsPromoSection";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Inaya",
    "description": "AI-alapú árösszehasonlító – találd meg a legjobb árakat másodpercek alatt 50+ áruházból.",
    "url": "https://wwwaidacom.lovable.app",
    "applicationCategory": "ShoppingApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "HUF"
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead canonical="/" jsonLd={jsonLd} />
      <Header />

      <main>
        {/* Hero: 3D Animáció felül + Chat ablak alul */}
        <InayaHeroSection />

        <CategorySection />
        <DealsPromoSection />
        <InayaFeaturesSection />
        <StoresSection />
        <HowItWorksSection />
        <WhyInayaSection />
        <CTASection />
      </main>

      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
