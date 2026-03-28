import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages for better initial load
const Search = lazy(() => import("./pages/Search"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Deals = lazy(() => import("./pages/Deals"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Adatvedelem = lazy(() => import("./pages/Adatvedelem"));
const SutiSzabalyzat = lazy(() => import("./pages/SutiSzabalyzat"));
const FelhasznalasiFeltetelek = lazy(() => import("./pages/FelhasznalasiFeltetelek"));
const GYIK = lazy(() => import("./pages/GYIK"));
const PartneriTajekoztato = lazy(() => import("./pages/PartneriTajekoztato"));
const Blog = lazy(() => import("./pages/Blog"));
const Admin = lazy(() => import("./pages/Admin"));
const Stores = lazy(() => import("./pages/Stores"));
const Coupons = lazy(() => import("./pages/Coupons"));
const Partnerek = lazy(() => import("./pages/Partnerek"));
const GlobalChatWidget = lazy(() => import("./components/GlobalChatWidget"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground">Betöltés...</div>
  </div>
);

// GlobalChatWidget csak nem-főoldalas oldalakon jelenik meg –
// a főoldalon az InayaHeroSection adja az inline chatet.
function useRefTracking() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("inaya_ref", ref);
      const base = window.location.hostname === "inaya.hu" ? "" : "https://citations-cast-friends-bookmarks.trycloudflare.com";
      fetch(`${base}/api/v1/creators/track-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, page_url: window.location.href }),
      }).catch(() => {});
    }
  }, []);
}

function AppRoutes() {
  useRefTracking();
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const isDeals = location.pathname === "/akciok";

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/kereses" element={<Search />} />
          <Route path="/termekek" element={<Products />} />
          <Route path="/termek/:id" element={<ProductDetail />} />
          <Route path="/akciok" element={<Deals />} />
          <Route path="/kedvencek" element={<Favorites />} />
          <Route path="/adatvedelem" element={<Adatvedelem />} />
          <Route path="/suti-szabalyzat" element={<SutiSzabalyzat />} />
          <Route path="/felhasznalasi-feltetelek" element={<FelhasznalasiFeltetelek />} />
          <Route path="/gyik" element={<GYIK />} />
          <Route path="/partneri-tajekoztato" element={<PartneriTajekoztato />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/aruhazak" element={<Stores />} />
          <Route path="/kuponok" element={<Coupons />} />
          <Route path="/partnerek" element={<Partnerek />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {/* Floating chat - nem jelenik meg főoldalon */}
      {!isHomepage && (
        <Suspense fallback={null}>
          <GlobalChatWidget centered={isDeals} />
        </Suspense>
      )}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <AuthProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
