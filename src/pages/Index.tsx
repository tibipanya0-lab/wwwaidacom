import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AidaFeaturesSection from "@/components/AidaFeaturesSection";
import DealsSection from "@/components/DealsSection";
import StoresSection from "@/components/StoresSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <AidaFeaturesSection />
        <DealsSection />
        <StoresSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
