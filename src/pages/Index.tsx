import InayaHeroSection from "@/components/InayaHeroSection";
import CookieConsent from "@/components/CookieConsent";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead canonical="/" />
      <InayaHeroSection />
      <CookieConsent />
    </div>
  );
};

export default Index;
