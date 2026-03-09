import { Search, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import InayaAvatar from "./InayaAvatar";

// Typewriter effect hook
const useTypewriter = (text: string, speed: number = 50, delay: number = 0) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText("");
    setIsComplete(false);
    
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayText, isComplete };
};

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const headline = "Mondd, mit keresel, és megkeresem neked a legjobb árat.";
  const { displayText, isComplete } = useTypewriter(headline, 40, 500);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/kereses?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/kereses");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative overflow-hidden py-8 sm:py-14 lg:py-20 px-4">
      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge with Inaya Avatar */}
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 sm:gap-3 rounded-full bg-primary/20 border border-primary/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary animate-fade-in">
            <InayaAvatar size="xs" />
            <span>AI Árösszehasonlító</span>
          </div>

          {/* Headline with Typewriter Effect */}
          <h1 className="mb-3 sm:mb-5 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight min-h-[2.5rem] sm:min-h-[3rem] lg:min-h-[4rem]">
            <span className="bg-gradient-to-r from-foreground via-amber-500 to-amber-400 bg-clip-text text-transparent">
              {displayText}
            </span>
            {!isComplete && (
              <span className="inline-block w-0.5 sm:w-0.5 h-5 sm:h-7 lg:h-8 bg-amber-400 ml-1 animate-pulse" />
            )}
          </h1>

          {/* Subheadline */}
          <p 
            className={`mb-4 sm:mb-8 text-xs sm:text-sm lg:text-base text-muted-foreground transition-all duration-700 px-2 ${
              isComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Több ezer kupon és akció egyetlen kereséssel.
          </p>

          {/* Search Box */}
          <div className="mx-auto mb-6 sm:mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 blur-xl" />
              <div className="relative flex items-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl border border-primary/30 bg-background/60 backdrop-blur-sm p-1.5 sm:p-2 shadow-2xl">
                <Search className="ml-2 sm:ml-4 h-4 w-4 sm:h-5 sm:w-5 text-primary/70 shrink-0" />
                <input
                  type="text"
                  placeholder={t("search.inputPlaceholder")}
                  className="flex-1 bg-transparent px-1 sm:px-2 py-2 sm:py-3 text-sm sm:text-base outline-none placeholder:text-muted-foreground text-foreground min-w-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => {
                    if (window.innerWidth < 768) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                />
                
                <Button 
                  className="rounded-lg sm:rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:from-primary/90 hover:to-primary/70 px-3 sm:px-6 text-xs sm:text-sm" 
                  size="default"
                  onClick={handleSearch}
                >
                  <InayaAvatar size="xs" className="border-0 hidden sm:block" />
                  <span className="sm:hidden">Keresés</span>
                  <span className="hidden sm:inline">{t("hero.cta")}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div 
            className={`flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm transition-all duration-700 delay-300 ${
              isComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                <TrendingDown className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground">
                <strong className="text-foreground">Akár 90%</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <InayaAvatar size="xs" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">AI asszisztens</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                <Zap className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground">
                <strong className="text-foreground">50+ bolt</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
