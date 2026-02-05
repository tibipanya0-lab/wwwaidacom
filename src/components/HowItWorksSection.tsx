import { Search, Sparkles, Bell, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.desc"),
    },
    {
      icon: Sparkles,
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.desc"),
    },
    {
      icon: Bell,
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.desc"),
    },
    {
      icon: ShoppingBag,
      title: t("howItWorks.step4.title"),
      description: t("howItWorks.step4.desc"),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-card/40 dark:bg-black/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            {t("howItWorks.title")} <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">{t("howItWorks.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-12 hidden h-0.5 w-[calc(100%-200px)] -translate-x-1/2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step number */}
                  <div className="absolute -top-3 right-1/2 translate-x-1/2 lg:right-auto lg:left-1/2 lg:-translate-x-1/2 lg:-top-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-xs font-bold text-black">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 transition-transform duration-300 hover:scale-110">
                    <Icon className="h-10 w-10 text-amber-500 dark:text-amber-400" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
