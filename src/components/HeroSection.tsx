import { Search, Bot, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate("/kereses");
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in">
            <Bot className="h-4 w-4" />
            AI-alapú árösszehasonlítás
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Találd meg a{" "}
            <span className="text-gradient">legjobb árakat</span>
            <br />
            másodpercek alatt
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground sm:text-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Az AI összehasonlítja az árakat a Temu, Shein, Alza és 100+ áruházból.
            <br className="hidden sm:block" />
            Spórolj akár 70%-ot minden vásárláson!
          </p>

          {/* Search Box */}
          <div className="mx-auto mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl gradient-hero opacity-10 blur-xl" />
              <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
                <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Mit keresel? pl. iPhone tok, futócipő, laptop..."
                  className="flex-1 bg-transparent px-2 py-3 text-base outline-none placeholder:text-muted-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="hero" size="lg" className="rounded-xl" onClick={handleSearch}>
                  <Bot className="h-5 w-5" />
                  Kérdezd Aidát
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <TrendingDown className="h-4 w-4 text-success" />
              </div>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Átlag 45%</strong> megtakarítás
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <span className="text-muted-foreground">
                <strong className="text-foreground">100+</strong> áruház
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Azonnali</strong> eredmények
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
