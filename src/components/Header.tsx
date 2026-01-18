import { Search, Bot, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">
            Smart<span className="text-gradient">Asszisztens</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#deals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Akciók
          </a>
          <a href="#stores" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Áruházak
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Hogyan működik
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="glass" size="sm" className="hidden sm:flex">
            <Search className="h-4 w-4" />
            Keresés
          </Button>
          <Button variant="hero" size="sm">
            Ingyenes
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
