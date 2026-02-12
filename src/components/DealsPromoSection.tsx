import { Flame, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const DealsPromoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-background/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/akciok" className="block">
            <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 p-8 sm:p-12 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 group">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 sm:top-8 sm:right-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <Flame className="h-24 w-24 sm:h-32 sm:w-32 text-primary" />
              </div>
              <div className="absolute bottom-4 left-1/2 opacity-10">
                <Zap className="h-16 w-16 text-primary" />
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold text-primary">
                  <Flame className="h-4 w-4" />
                  🔥 Best of AliExpress
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                  {t("deals.title")}{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {t("deals.titleHighlight")}
                  </span>
                </h2>
                <p className="text-muted-foreground mb-6 text-base sm:text-lg">
                  {t("deals.subtitle")}
                </p>
                <Button
                  size="lg"
                  className="gap-2 rounded-full px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold group-hover:scale-105 transition-transform"
                >
                  <Flame className="h-5 w-5" />
                  {t("deals.viewMore")}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DealsPromoSection;
