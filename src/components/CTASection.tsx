import { Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-8 sm:p-12 lg:p-16">
          {/* Background decorations */}
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-black/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-black/20 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm font-medium text-white">
              <Bot className="h-4 w-4" />
              {t("cta.badge")}
            </div>

            <h2 className="mb-6 text-3xl font-bold text-black sm:text-4xl lg:text-5xl">
              {t("cta.title")}
            </h2>

            <p className="mb-8 text-lg text-black/80">
              {t("cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" className="bg-black text-amber-400 hover:bg-neutral-900 font-semibold">
                {t("cta.button")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
