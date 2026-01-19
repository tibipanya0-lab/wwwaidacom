import { Bot } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Smart<span className="text-gradient">Asszisztens</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-alapú árösszehasonlítás. Találd meg a legjobb árakat másodpercek alatt.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold">Hasznos linkek</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Gyakori kérdések</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Partneri tájékoztató</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-semibold">Jogi információk</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/adatvedelem" className="hover:text-foreground transition-colors">Adatvédelem</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Felhasználási feltételek</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie szabályzat</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Impresszum</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p className="max-w-2xl mx-auto mb-4 text-xs">
            Ez az oldal partneri (affiliate) linkeket tartalmaz. Ha ezeken keresztül vásárolsz, 
            jutalékot kaphatunk, ami segít fenntartani Aida működését, neked azonban ez semmilyen 
            plusz költséggel nem jár. Köszönjük, hogy támogatod a munkánkat!
          </p>
          <p>© 2025 SmartAsszisztens. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
