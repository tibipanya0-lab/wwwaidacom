import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import InayaAvatar from "./InayaAvatar";

const CTASection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-20 bg-card/40 dark:bg-black/40 backdrop-blur-sm px-4">
      <div className="container mx-auto">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-6 sm:p-8 md:p-12 lg:p-16">
          {/* Background decorations */}
          <div className="absolute -right-20 -top-20 h-40 sm:h-60 w-40 sm:w-60 rounded-full bg-black/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-40 sm:h-60 w-40 sm:w-60 rounded-full bg-black/20 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-black/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white">
              <InayaAvatar size="xs" className="border-white/30" />
              {t("cta.badge")}
            </div>

            <h2 className="mb-4 sm:mb-6 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black">
              {t("cta.title")}
            </h2>

            <p className="mb-6 sm:mb-8 text-sm sm:text-lg text-black/80 px-2">
              {t("cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="bg-black text-amber-400 hover:bg-neutral-900 font-semibold w-full sm:w-auto text-sm sm:text-base"
                onClick={() => navigate("/kereses")}
              >
                {t("cta.button")}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
