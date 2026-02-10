import { Store, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import aliexpressLogo from "@/assets/aliexpress-logo.png";

const STORE_LOGOS: Record<string, string> = {
  AliExpress: aliexpressLogo,
};

const StoresSection = () => {
  const { t } = useLanguage();

  const { data: stores } = useQuery({
    queryKey: ["homepage-stores"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("store_name");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((p) => { counts[p.store_name] = (counts[p.store_name] || 0) + 1; });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    },
  });

  return (
    <section id="stores" className="py-20 bg-card/60 dark:bg-black/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-2 inline-flex items-center gap-2 text-amber-500 dark:text-amber-400">
            <Store className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">{t("stores.badge")}</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {t("stores.title")} <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">{t("stores.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("stores.subtitle")}
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {(stores || []).map((store, index) => (
            <motion.div
              key={store.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="group relative flex flex-col items-center rounded-2xl border border-amber-500/20 bg-card/80 dark:bg-black/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 w-64"
            >
              <div className="absolute right-3 top-3">
                <CheckCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              </div>
              {STORE_LOGOS[store.name] ? (
                <img
                  src={STORE_LOGOS[store.name]}
                  alt={store.name}
                  className="mb-4 h-12 w-12 rounded-xl object-contain transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="mb-4 h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                  {store.name.charAt(0)}
                </div>
              )}
              <h3 className="font-semibold text-foreground">{store.name}</h3>
              <p className="text-xs text-muted-foreground">{store.count}+ {t("deals.product")}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground italic mt-6">
          Folyamatosan bővítjük a választékunkat!
        </p>
      </div>
    </section>
  );
};

export default StoresSection;