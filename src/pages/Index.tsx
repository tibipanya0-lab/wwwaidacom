import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import InayaFeaturesSection from "@/components/InayaFeaturesSection";
import StoresSection from "@/components/StoresSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyInayaSection from "@/components/WhyInayaSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import CityScene3D from "@/components/CityScene3D";
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
    <div className="min-h-screen relative">
      <SEOHead canonical="/" jsonLd={jsonLd} />
      <CityScene3D />
      <Header />

      {/* Hero Video */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      </div>
      <main className="relative z-10">
        <HeroSection />
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
