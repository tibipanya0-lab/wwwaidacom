import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead canonical="/" />
      <Header />
      <main>
        {/* Sections will be rebuilt */}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
