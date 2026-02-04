import { Bot } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-amber-500/20 bg-black/80 backdrop-blur-sm py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600">
                <Bot className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white">
                Smart<span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Asszisztens</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400">
              AI-alapú árösszehasonlítás. Találd meg a legjobb árakat másodpercek alatt.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Hasznos linkek</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">Gyakori kérdések</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Partneri tájékoztató</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Jogi információk</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="/adatvedelem" className="hover:text-amber-400 transition-colors">Adatvédelem</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Felhasználási feltételek</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Cookie szabályzat</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Impresszum</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-amber-500/20 pt-6 text-center text-sm text-neutral-400">
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
