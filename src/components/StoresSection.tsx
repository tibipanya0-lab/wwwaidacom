import { Store } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const StoresSection = () => {
  const { t } = useLanguage();

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

        <p className="text-center text-muted-foreground">
          Partnerboltok hamarosan elérhetőek – backend API csatlakoztatás alatt.
        </p>
        <p className="text-center text-sm text-muted-foreground italic mt-6">
          Folyamatosan bővítjük a választékunkat!
        </p>
      </div>
    </section>
  );
};

export default StoresSection;
