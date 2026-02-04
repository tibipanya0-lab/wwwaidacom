import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AidaFeaturesSection from "@/components/AidaFeaturesSection";
import DealsSection from "@/components/DealsSection";
import StoresSection from "@/components/StoresSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import CityScene3D from "@/components/CityScene3D";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <CityScene3D />
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
