import { useLanguage } from "@/contexts/LanguageContext";
import AidaAvatar from "./AidaAvatar";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-amber-500/20 bg-card/80 dark:bg-black/80 backdrop-blur-sm py-8 sm:py-12 relative z-10 safe-area-bottom">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 sm:gap-8 grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <AidaAvatar size="sm" className="sm:hidden" />
              <AidaAvatar size="md" className="hidden sm:block" />
              <span className="text-lg sm:text-xl font-bold text-foreground">
                Aida
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-2 sm:mb-4 font-semibold text-foreground text-sm sm:text-base">{t("footer.usefulLinks")}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="/gyik" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-1 inline-block">{t("footer.faq")}</a></li>
              <li><a href="/blog" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-1 inline-block">{t("footer.blog")}</a></li>
              <li><a href="/partneri-tajekoztato" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-1 inline-block">{t("footer.partnerInfo")}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-2 sm:mb-4 font-semibold text-foreground text-sm sm:text-base">{t("footer.legal")}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li><a href="/adatvedelem" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-1 inline-block">{t("footer.privacy")}</a></li>
              <li><a href="/felhasznalasi-feltetelek" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-1 inline-block">{t("footer.terms")}</a></li>
              <li><a href="/suti-szabalyzat" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-1 inline-block">{t("footer.cookies")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 border-t border-amber-500/20 pt-4 sm:pt-6 text-center text-muted-foreground">
          <p className="max-w-2xl mx-auto mb-3 sm:mb-4 text-[10px] sm:text-xs leading-relaxed px-2">
            {t("footer.affiliate")}
          </p>
          <p className="text-xs sm:text-sm">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
