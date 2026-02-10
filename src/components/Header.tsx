import { Menu, Home, Flame, Ticket, Heart, X, Grid3X3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useState } from "react";
import InayaAvatar from "./InayaAvatar";

const Header = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { favoritesCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleCouponSearch = () => {
    navigate("/kereses?coupon=true");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-lg safe-area-top">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
          <InayaAvatar size="sm" className="sm:hidden" />
          <InayaAvatar size="md" className="hidden sm:block" />
          <span className="text-lg sm:text-xl font-bold text-foreground">
            Inaya
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            {t("nav.home")}
          </Link>
          <Link to="/kereses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <InayaAvatar size="sm" />
            {t("nav.inayaAi")}
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
          <Link to="/aruhazak" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <Grid3X3 className="h-4 w-4" />
            {t("nav.stores")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
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
          <ThemeToggle />
          <LanguageSelector />
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-foreground hover:text-primary relative z-50"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background border-l border-primary/20">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <InayaAvatar size="sm" />
                  <span className="text-lg font-bold">Inaya</span>
                </SheetTitle>
              </SheetHeader>
              
              <nav className="mt-8 flex flex-col gap-2">
                <SheetClose asChild>
                  <Link 
                    to="/" 
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Home className="h-5 w-5" />
                    <span className="font-medium">{t("nav.home")}</span>
                  </Link>
                </SheetClose>
                
                <SheetClose asChild>
                  <Link 
                    to="/kereses" 
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <InayaAvatar size="sm" />
                    <span className="font-medium">{t("nav.inayaAi")}</span>
                  </Link>
                </SheetClose>
                
                <SheetClose asChild>
                  <Link 
                    to="/akciok" 
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">{t("nav.deals")}</span>
                  </Link>
                </SheetClose>
                
                <SheetClose asChild>
                  <button
                    onClick={() => {
                      navigate("/kereses?coupon=true");
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                  >
                    <Ticket className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{t("nav.couponSearch")}</span>
                  </button>
                </SheetClose>
                
                <SheetClose asChild>
                  <Link 
                    to="/kedvencek" 
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Heart className={`h-5 w-5 ${favoritesCount > 0 ? "fill-primary text-primary" : ""}`} />
                    <span className="font-medium">Kedvencek</span>
                    {favoritesCount > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {favoritesCount > 9 ? "9+" : favoritesCount}
                      </span>
                    )}
                  </Link>
                </SheetClose>
                
                <div className="my-4 border-t border-primary/20" />
                
                <SheetClose asChild>
                  <Link 
                    to="/aruhazak" 
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Grid3X3 className="h-5 w-5" />
                    <span className="font-medium">{t("nav.stores")}</span>
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
