import { Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DealsSection = () => {
  // No data source – section shows CTA only
  return (
    <section id="deals" className="py-20 bg-background/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="mb-2 inline-flex items-center gap-2 text-primary">
            <Flame className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Nap ajánlatai</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Mai legjobb <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">akciók</span>
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">Hamarosan elérhető – backend API csatlakoztatás alatt.</p>
        </div>

        <div className="flex justify-center">
          <Link to="/akciok">
            <Button 
              size="lg" 
              className="gap-2 rounded-full px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
            >
              <Flame className="h-5 w-5" />
              Összes akció megtekintése
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
