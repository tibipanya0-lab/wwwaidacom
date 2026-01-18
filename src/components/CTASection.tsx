import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12 lg:p-16">
          {/* Background decorations */}
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
              <Sparkles className="h-4 w-4" />
              100% ingyenes használat
            </div>

            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Kezdj el spórolni még ma!
            </h2>

            <p className="mb-8 text-lg text-white/80">
              Csatlakozz a 10,000+ okos vásárlóhoz, akik már havonta ezreket spórolnak az ÁrVadásszal.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90">
                Ingyenes regisztráció
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="xl" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 hover:text-white">
                Tudj meg többet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
