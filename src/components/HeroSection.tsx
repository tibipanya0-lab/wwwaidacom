import { Search, Bot, TrendingDown, Zap, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import InayaAvatar from "./InayaAvatar";
import { supabase } from "@/integrations/supabase/client";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Typewriter effect for the headline
  const headline = "Mondd, mit keresel, és megkeresem neked a legjobb árat.";
  const { displayText, isComplete } = useTypewriter(headline, 40, 500);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/kereses?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/kereses");
    }
  };

  // Pre-fetch: warm up edge function connection on hover
  const prefetchedRef = useRef(false);
  const handleSearchBarHover = useCallback(() => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aliexpress-search`, {
      method: "OPTIONS",
    }).catch(() => {});
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Túl nagy fájl",
        description: "Maximum 5MB méretű képet tölthetsz fel.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Hibás formátum",
        description: "Csak képfájlokat tölthetsz fel.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    toast({
      title: "Kép elemzése...",
      description: "Az AI felismeri a terméket a képen.",
    });

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageBase64 = await base64Promise;

      // Use session token if available, fallback to anon key
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      // Call Vision AI
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageBase64 }),
        }
      );

      if (!response.ok) {
        throw new Error("Vision AI hiba");
      }

      const data = await response.json();
      const keyword = data.keyword;

      if (keyword && keyword !== "ismeretlen") {
        toast({
          title: "Termék felismerve! 🎯",
          description: `Keresés: "${keyword}"`,
        });
        // Navigate to search with the detected keyword
        navigate(`/kereses?q=${encodeURIComponent(keyword)}`);
      } else {
        toast({
          title: "Nem sikerült felismerni",
          description: "Próbálj egy tisztább képet feltölteni a termékről.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Image analysis error:", error);
      toast({
        title: "Hiba történt",
        description: "Nem sikerült elemezni a képet. Próbáld újra!",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32 px-4">

      <div className="container mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge with Inaya Avatar */}
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 sm:gap-3 rounded-full bg-primary/20 border border-primary/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary animate-fade-in">
            <InayaAvatar size="xs" />
            <span>AI Árösszehasonlító</span>
          </div>

          {/* Headline with Typewriter Effect */}
          <h1 className="mb-4 sm:mb-6 text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight min-h-[3rem] sm:min-h-[4rem] lg:min-h-[6rem]">
            <span className="bg-gradient-to-r from-foreground via-amber-500 to-amber-400 bg-clip-text text-transparent">
              {displayText}
            </span>
            {!isComplete && (
              <span className="inline-block w-0.5 sm:w-1 h-6 sm:h-10 lg:h-12 bg-amber-400 ml-1 animate-pulse" />
            )}
          </h1>

          {/* Subheadline - Slide up animation */}
          <p 
            className={`mb-6 sm:mb-10 text-sm sm:text-lg lg:text-xl text-muted-foreground transition-all duration-700 px-2 ${
              isComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Több ezer kupon és akció egyetlen kereséssel.
          </p>

          {/* Search Box */}
          <div className="mx-auto mb-6 sm:mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative" onMouseEnter={handleSearchBarHover}>
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
                  disabled={isAnalyzing}
                  onFocus={() => {
                    // On mobile, scroll to top so keyboard doesn't cover input
                    if (window.innerWidth < 768) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                />
                
                {/* Camera/Image Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isAnalyzing}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title="Kép feltöltése kereséshez"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
                
                <Button 
                  className="rounded-lg sm:rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:from-primary/90 hover:to-primary/70 px-3 sm:px-6 text-xs sm:text-sm" 
                  size="default"
                  onClick={handleSearch}
                  disabled={isAnalyzing}
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
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
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
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
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
