import { MessageCircleQuestion, Brain, ShoppingBag } from "lucide-react";

const features = [
  {
    icon: MessageCircleQuestion,
    title: "Kérdezz bátran",
    description: "Írd meg Aidának, milyen stílust vagy konkrét ruhadarabot keresel.",
  },
  {
    icon: Brain,
    title: "AI elemzés",
    description: "Aida átfésüli a legjobb áruházak kínálatát és véleményeit neked.",
  },
  {
    icon: ShoppingBag,
    title: "Vásárolj okosan",
    description: "Kapj közvetlen linket a legjobb ajánlatokhoz, szállítási infókkal és kuponkódokkal.",
  },
];

const AidaFeaturesSection = () => {
  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Hogyan segít neked <span className="text-gradient">Aida</span>?
        </h2>
        
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <feature.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
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

export default AidaFeaturesSection;
