import { MessageCircleQuestion, Brain, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AidaFeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageCircleQuestion,
      title: t("aidaFeatures.feature1.title"),
      description: t("aidaFeatures.feature1.desc"),
    },
    {
      icon: Brain,
      title: t("aidaFeatures.feature2.title"),
      description: t("aidaFeatures.feature2.desc"),
    },
    {
      icon: ShoppingBag,
      title: t("aidaFeatures.feature3.title"),
      description: t("aidaFeatures.feature3.desc"),
    },
  ];

  return (
    <section className="py-16 bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-white">
          {t("aidaFeatures.title")} <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Aida</span>?
        </h2>
        
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-amber-500/20 bg-black/60 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-transform group-hover:scale-110">
                <feature.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AidaFeaturesSection;
