import { Search, Bot, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

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
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-600/20 blur-xl" />
              <div className="relative flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-black/60 backdrop-blur-sm p-2 shadow-2xl">
                <Search className="ml-4 h-5 w-5 text-amber-400/70" />
                <input
                  type="text"
                  placeholder={t("search.inputPlaceholder")}
                  className="flex-1 bg-transparent px-2 py-3 text-base outline-none placeholder:text-neutral-500 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-amber-400 hover:to-yellow-500 px-6" size="lg" onClick={handleSearch}>
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
