import { Search, Sparkles, Bell, ShoppingBag } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Keress rá a termékre",
    description: "Írd be, amit keresel, és az AI azonnal elemzi az összes áruházat.",
    color: "primary",
  },
  {
    icon: Sparkles,
    title: "AI összehasonlít",
    description: "Mesterséges intelligencia elemzi az árakat és értékeléseket.",
    color: "accent",
  },
  {
    icon: Bell,
    title: "Kapj értesítést",
    description: "Állíts be árriadót, és szólunk, ha lecsökkent az ár.",
    color: "deal",
  },
  {
    icon: ShoppingBag,
    title: "Vásárolj okosan",
    description: "Kattints és vásárolj a legjobb áron a kiválasztott boltban.",
    color: "success",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold">
            Hogyan <span className="text-gradient">működik?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            4 egyszerű lépésben a legjobb árakhoz
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-12 hidden h-0.5 w-[calc(100%-200px)] -translate-x-1/2 bg-gradient-to-r from-primary via-accent to-success lg:block" />

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
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div
                    className={`mb-6 flex h-24 w-24 items-center justify-center rounded-2xl ${
                      step.color === "primary"
                        ? "bg-primary/10"
                        : step.color === "accent"
                        ? "bg-accent/10"
                        : step.color === "deal"
                        ? "bg-deal/10"
                        : "bg-success/10"
                    } transition-transform duration-300 hover:scale-110`}
                  >
                    <Icon
                      className={`h-10 w-10 ${
                        step.color === "primary"
                          ? "text-primary"
                          : step.color === "accent"
                          ? "text-accent"
                          : step.color === "deal"
                          ? "text-deal"
                          : "text-success"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
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
