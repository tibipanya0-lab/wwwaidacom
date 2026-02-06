import { MessageCircleQuestion, Brain, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import InayaAvatar from "./InayaAvatar";

const InayaFeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: MessageCircleQuestion,
      title: t("inayaFeatures.feature1.title"),
      description: t("inayaFeatures.feature1.desc"),
    },
    {
      icon: Brain,
      title: t("inayaFeatures.feature2.title"),
      description: t("inayaFeatures.feature2.desc"),
    },
    {
      icon: ShoppingBag,
      title: t("inayaFeatures.feature3.title"),
      description: t("inayaFeatures.feature3.desc"),
    },
  ];

  return (
    <section className="py-16 bg-card/40 dark:bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-12">
          <InayaAvatar size="lg" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t("inayaFeatures.title")} <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Inaya</span>?
          </h2>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-primary/20 bg-card/80 dark:bg-black/60 backdrop-blur-sm p-6 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 text-primary transition-transform group-hover:scale-110">
                <feature.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InayaFeaturesSection;
