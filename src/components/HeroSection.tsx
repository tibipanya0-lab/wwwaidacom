import { Search, Bot, TrendingDown, Zap, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

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

      // Call Vision AI
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
    <section className="relative overflow-hidden py-20 lg:py-32">

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-400 animate-fade-in">
            <Bot className="h-4 w-4" />
            {t("hero.badge")}
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl animate-fade-in text-white" style={{ animationDelay: "0.1s" }}>
            {t("hero.title1")}{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">{t("hero.title2")}</span>
            <br />
            {t("hero.title3")}
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-neutral-400 sm:text-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {t("hero.subtitle")}
          </p>

          {/* Search Box */}
          <div className="mx-auto mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/10 blur-xl" />
              <div className="relative flex items-center gap-2 rounded-2xl border border-primary/30 bg-background/60 backdrop-blur-sm p-2 shadow-2xl">
                <Search className="ml-4 h-5 w-5 text-primary/70" />
                <input
                  type="text"
                  placeholder={t("search.inputPlaceholder")}
                  className="flex-1 bg-transparent px-2 py-3 text-base outline-none placeholder:text-muted-foreground text-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isAnalyzing}
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Kép feltöltése kereséshez"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </button>
                
                <Button 
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold hover:from-primary/90 hover:to-primary/70 px-6" 
                  size="lg" 
                  onClick={handleSearch}
                  disabled={isAnalyzing}
                >
                  <Bot className="h-5 w-5" />
                  {t("hero.cta")}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                <TrendingDown className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-neutral-400">
                <strong className="text-white">{t("hero.stat1")}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                <Bot className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-neutral-400">
                <strong className="text-white">{t("hero.stat2")}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-neutral-400">
                <strong className="text-white">{t("hero.stat3")}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
