import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AidaFeaturesSection from "@/components/AidaFeaturesSection";
import DealsSection from "@/components/DealsSection";
import StoresSection from "@/components/StoresSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import LuxuryBackground from "@/components/LuxuryBackground";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <LuxuryBackground />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <AidaFeaturesSection />
        <DealsSection />
        <StoresSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
