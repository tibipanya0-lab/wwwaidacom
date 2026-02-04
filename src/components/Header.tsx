import { Bot, Menu, Home, Flame, Ticket, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import LanguageSelector from "./LanguageSelector";

const Header = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { favoritesCount } = useFavorites();

  const handleCouponSearch = () => {
    navigate("/kereses?coupon=true");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Aida
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            {t("nav.home")}
          </Link>
          <Link to="/kereses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <Bot className="h-4 w-4 text-primary" />
            {t("nav.aidaAi")}
          </Link>
          <Link to="/akciok" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-500" />
            {t("nav.deals")}
          </Link>
          <button
            onClick={handleCouponSearch}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <Ticket className="h-4 w-4 text-yellow-500" />
            {t("nav.couponSearch")}
          </button>
          <a href="#stores" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            {t("nav.stores")}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/kedvencek" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-transparent"
            >
              <Heart className={`h-5 w-5 ${favoritesCount > 0 ? "fill-primary text-primary" : ""}`} />
            </Button>
            {favoritesCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {favoritesCount > 9 ? "9+" : favoritesCount}
              </span>
            )}
          </Link>
          <LanguageSelector />
          <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:text-primary">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
