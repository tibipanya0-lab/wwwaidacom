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
import ProductsSection from "@/components/ProductsSection";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <CityScene3D />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <ProductsSection />
        <CategorySection />
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
