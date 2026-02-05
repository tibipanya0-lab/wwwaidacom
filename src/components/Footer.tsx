import { useLanguage } from "@/contexts/LanguageContext";
import AidaAvatar from "./AidaAvatar";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-amber-500/20 bg-black/80 backdrop-blur-sm py-12 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AidaAvatar size="md" />
              <span className="text-xl font-bold text-white">
                Aida
              </span>
            </div>
            <p className="text-sm text-neutral-400">
              {t("footer.description")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">{t("footer.usefulLinks")}</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="/gyik" className="hover:text-amber-400 transition-colors">{t("footer.faq")}</a></li>
              <li><a href="/blog" className="hover:text-amber-400 transition-colors">{t("footer.blog")}</a></li>
              <li><a href="/partneri-tajekoztato" className="hover:text-amber-400 transition-colors">{t("footer.partnerInfo")}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 font-semibold text-white">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li><a href="/adatvedelem" className="hover:text-amber-400 transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="/felhasznalasi-feltetelek" className="hover:text-amber-400 transition-colors">{t("footer.terms")}</a></li>
              <li><a href="/suti-szabalyzat" className="hover:text-amber-400 transition-colors">{t("footer.cookies")}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-amber-500/20 pt-6 text-center text-sm text-neutral-400">
          <p className="max-w-2xl mx-auto mb-4 text-xs">
            {t("footer.affiliate")}
          </p>
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
