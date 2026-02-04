import { Search, Bot, Menu, Home, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleCouponSearch = () => {
    navigate("/kereses?coupon=true");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-500/20 bg-black/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600">
            <Bot className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">
            Smart<span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Asszisztens</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1">
            <Home className="h-4 w-4" />
            Kezdőlap
          </Link>
          <Link to="/kereses" className="text-sm font-medium text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1">
            <Bot className="h-4 w-4 text-amber-400" />
            Aida AI
          </Link>
          <a href="#deals" className="text-sm font-medium text-neutral-400 hover:text-amber-400 transition-colors">
            Akciók
          </a>
          <button
            onClick={handleCouponSearch}
            className="text-sm font-medium text-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <Ticket className="h-4 w-4 text-yellow-500" />
            Kupon kereső
          </button>
          <a href="#stores" className="text-sm font-medium text-neutral-400 hover:text-amber-400 transition-colors">
            Áruházak
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/kereses">
            <Button size="sm" className="hidden sm:flex bg-transparent border border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
              <Search className="h-4 w-4" />
              Keresés
            </Button>
          </Link>
          <Link to="/kereses">
            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold hover:from-amber-400 hover:to-yellow-500">
              Próbáld ki
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:text-amber-400">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
