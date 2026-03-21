import { useState } from "react";
import { ArrowLeft, Store, Search, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
// CityScene3D kihagyva - blokkolja a görgetést
import LanguageSelector from "@/components/LanguageSelector";
import SEOHead from "@/components/SEOHead";
import { PARTNER_STORES } from "@/lib/partnerStores";

const Stores = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={{ hu: "Partnerboltok", en: "Partner Stores", uk: "Партнерські магазини", ro: "Magazine partenere", de: "Partnershops" }}
        description={{ hu: "Böngéssz az Inaya partnerboltjai között! AliExpress, eBay.", en: "Browse Inaya partner stores!", uk: "Переглядайте партнерські магазини Inaya!", ro: "Răsfoiește magazinele partenere Inaya!", de: "Durchsuchen Sie Inaya Partnershops!" }}
        canonical="/aruhazak"
        breadcrumbs={[{ name: "Főoldal", url: "/" }, { name: "Áruházak", url: "/aruhazak" }]}
      />

      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t("search.back")}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">{t("nav.stores")}</span>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="flex-1 pb-20">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("stores.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border bg-card/50 py-3 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {PARTNER_STORES
              .filter((store) =>
                store.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((store, index) => (
                <motion.a
                  key={store.id}
                  href={store.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/50 p-6 hover:border-primary/50 hover:bg-card/80 transition-all"
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl"
                    style={{ backgroundColor: store.color + "15" }}
                  >
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="h-10 w-10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=${store.color.replace('#','')}&color=fff&size=128`;
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground text-center">{store.name}</span>
                  <ExternalLink className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
          </div>

          <p className="text-center text-sm text-muted-foreground italic mt-8">
            Folyamatosan bővítjük a választékunkat!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Stores;
