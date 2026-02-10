import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "hu" | "uk" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  hu: {
    // Header
    "nav.home": "Kezdőlap",
    "nav.inayaAi": "Inaya AI",
    "nav.deals": "Akciók",
    "nav.couponSearch": "Kupon kereső",
    "nav.stores": "Áruházak",
    "nav.search": "Keresés",
    "nav.tryIt": "Próbáld ki",
    
    // Hero
    "hero.badge": "AI-alapú árösszehasonlítás",
    "hero.title1": "Találd meg a",
    "hero.title2": "legjobb árakat",
    "hero.title3": "másodpercek alatt",
    "hero.subtitle": "Az Inaya AI elemzi a legjobb áruházakat és megtalálja neked a tökéletes termékeket a legkedvezőbb áron.",
    "hero.cta": "Kérdezd Inayát",
    "hero.ctaSecondary": "Megnézem az akciókat",
    "hero.stat1": "100+ áruház",
    "hero.stat2": "AI asszisztens",
    "hero.stat3": "Ingyenes",
    
    // Inaya Features
    "inayaFeatures.title": "Hogyan segít neked",
    "inayaFeatures.feature1.title": "Kérdezz bátran",
    "inayaFeatures.feature1.desc": "Írd meg Inayának, milyen stílust vagy konkrét ruhadarabot keresel.",
    "inayaFeatures.feature2.title": "AI elemzés",
    "inayaFeatures.feature2.desc": "Inaya átfésüli a legjobb áruházak kínálatát és véleményeit neked.",
    "inayaFeatures.feature3.title": "Vásárolj okosan",
    "inayaFeatures.feature3.desc": "Kapj közvetlen linket a legjobb ajánlatokhoz, szállítási infókkal és kuponkódokkal.",
    
    // Deals
    "deals.badge": "Aktuális akciók",
    "deals.title": "Mai legjobb",
    "deals.titleHighlight": "ajánlatok",
    "deals.subtitle": "Naponta frissülő kedvezmények a legnépszerűbb áruházakból",
    "deals.viewMore": "Több akció",
    "deals.product": "termék",
    
    // Stores
    "stores.badge": "Partner áruházak",
    "stores.title": "100+",
    "stores.titleHighlight": "áruházból",
    "stores.titleEnd": "keresünk",
    "stores.subtitle": "Minden népszerű magyar és nemzetközi webáruházat figyelünk",
    "stores.searchPlaceholder": "Keress kedvenc áruházadban...",
    "stores.viewProducts": "Termékek",
    "stores.backToAll": "Vissza az összes áruházhoz",
    "stores.noProducts": "Ehhez a bolthoz még nincsenek demo termékek.",
    "stores.noResults": "Nincs találat a keresésre.",
    
    // How it works
    "howItWorks.title": "Hogyan",
    "howItWorks.titleHighlight": "működik?",
    "howItWorks.subtitle": "4 egyszerű lépésben a legjobb árakhoz",
    "howItWorks.step1.title": "Keress rá a termékre",
    "howItWorks.step1.desc": "Írd be, amit keresel, és az AI azonnal elemzi az összes áruházat.",
    "howItWorks.step2.title": "AI összehasonlít",
    "howItWorks.step2.desc": "Mesterséges intelligencia elemzi az árakat és értékeléseket.",
    "howItWorks.step3.title": "Kapj értesítést",
    "howItWorks.step3.desc": "Állíts be árriadót, és szólunk, ha lecsökkent az ár.",
    "howItWorks.step4.title": "Vásárolj okosan",
    "howItWorks.step4.desc": "Kattints és vásárolj a legjobb áron a kiválasztott boltban.",
    
    // Why Inaya
    "whyInaya.title": "Miért az",
    "whyInaya.subtitle": "Számunkra a te elégedettséged és biztonságod az első. Ezért építettük fel az Inayát úgy, hogy megbízható, átlátható és mindig a te érdekeidet szolgálja.",
    "whyInaya.reason1.title": "Megbízható források",
    "whyInaya.reason1.desc": "Csak ellenőrzött és megbízható áruházakból gyűjtünk ajánlatokat, hogy biztonságban érezd magad.",
    "whyInaya.reason2.title": "Felhasználó az első",
    "whyInaya.reason2.desc": "Nem reklámozunk – a te érdeked a legfontosabb. Mindig az objektíven legjobb árat mutatjuk.",
    "whyInaya.reason3.title": "Átlátható működés",
    "whyInaya.reason3.desc": "Nyíltan kommunikáljuk, hogyan működünk, és partneri linkjeinket is jelöljük.",
    "whyInaya.reason4.title": "Közösség által inspirált",
    "whyInaya.reason4.desc": "A fejlesztéseinket a felhasználói visszajelzések alapján végezzük, hogy valóban hasznos legyen.",

    // CTA
    "cta.badge": "100% ingyenes használat",
    "cta.title": "Kezdj el spórolni még ma!",
    "cta.subtitle": "Csatlakozz a 10,000+ okos vásárlóhoz, akik már havonta ezreket spórolnak a SmartAsszisztenssel.",
    "cta.button": "Tudj meg többet",
    
    // Footer
    "footer.description": "AI-alapú árösszehasonlítás. Találd meg a legjobb árakat másodpercek alatt.",
    "footer.usefulLinks": "Hasznos linkek",
    "footer.faq": "Gyakori kérdések",
    "footer.blog": "Blog",
    "footer.partnerInfo": "Partneri tájékoztató",
    "footer.legal": "Jogi információk",
    "footer.privacy": "Adatvédelem",
    "footer.terms": "Felhasználási feltételek",
    "footer.cookies": "Cookie szabályzat",
    "footer.imprint": "Impresszum",
    "footer.affiliate": "Ez az oldal partneri (affiliate) linkeket tartalmaz. Ha ezeken keresztül vásárolsz, jutalékot kaphatunk, ami segít fenntartani Inaya működését, neked azonban ez semmilyen plusz költséggel nem jár. Köszönjük, hogy támogatod a munkánkat!",
    "footer.copyright": "© 2026 Inaya. Minden jog fenntartva.",
    
    // Search page
    "search.back": "Vissza",
    "search.welcome": "Szia! Miben segíthetek?",
    "search.welcomeSubtitle": "Írd be a terméket, és megkeresem a legjobb árakat és kuponokat 50+ boltból!",
    "search.inputPlaceholder": "Írd le mit keresel...",
    "search.powered": "Inaya AI segít megtalálni a legjobb ajánlatokat",
    
    // Deal card
    "dealCard.view": "Megnézem",
    
    // Language
    "language.hu": "Magyar",
    "language.uk": "Українська",
    "language.en": "English",
  },
  uk: {
    // Header
    "nav.home": "Головна",
    "nav.inayaAi": "Inaya AI",
    "nav.deals": "Акції",
    "nav.couponSearch": "Пошук купонів",
    "nav.stores": "Магазини",
    "nav.search": "Пошук",
    "nav.tryIt": "Спробувати",
    
    // Hero
    "hero.badge": "Порівняння цін на основі ШІ",
    "hero.title1": "Знайдіть",
    "hero.title2": "найкращі ціни",
    "hero.title3": "за секунди",
    "hero.subtitle": "Inaya AI аналізує найкращі магазини та знаходить для вас ідеальні товари за найвигіднішою ціною.",
    "hero.cta": "Запитати Inaya",
    "hero.ctaSecondary": "Переглянути акції",
    "hero.stat1": "100+ магазинів",
    "hero.stat2": "ШІ асистент",
    "hero.stat3": "Безкоштовно",
    
    // Inaya Features
    "inayaFeatures.title": "Як вам допоможе",
    "inayaFeatures.feature1.title": "Запитуйте сміливо",
    "inayaFeatures.feature1.desc": "Напишіть Inaya, який стиль або конкретний одяг ви шукаєте.",
    "inayaFeatures.feature2.title": "Аналіз ШІ",
    "inayaFeatures.feature2.desc": "Inaya переглядає пропозиції та відгуки найкращих магазинів для вас.",
    "inayaFeatures.feature3.title": "Купуйте розумно",
    "inayaFeatures.feature3.desc": "Отримайте прямі посилання на найкращі пропозиції з інформацією про доставку та купонами.",
    
    // Deals
    "deals.badge": "Актуальні акції",
    "deals.title": "Найкращі",
    "deals.titleHighlight": "пропозиції",
    "deals.subtitle": "Щоденно оновлювані знижки з найпопулярніших магазинів",
    "deals.viewMore": "Більше акцій",
    "deals.product": "товар",
    
    // Stores
    "stores.badge": "Партнерські магазини",
    "stores.title": "100+",
    "stores.titleHighlight": "магазинів",
    "stores.titleEnd": "шукаємо",
    "stores.subtitle": "Ми відстежуємо всі популярні угорські та міжнародні інтернет-магазини",
    "stores.searchPlaceholder": "Шукайте улюблений магазин...",
    "stores.viewProducts": "Товари",
    "stores.backToAll": "Назад до всіх магазинів",
    "stores.noProducts": "Для цього магазину ще немає демо-товарів.",
    "stores.noResults": "Немає результатів пошуку.",
    
    // How it works
    "howItWorks.title": "Як це",
    "howItWorks.titleHighlight": "працює?",
    "howItWorks.subtitle": "4 простих кроки до найкращих цін",
    "howItWorks.step1.title": "Шукайте товар",
    "howItWorks.step1.desc": "Введіть те, що шукаєте, і ШІ миттєво проаналізує всі магазини.",
    "howItWorks.step2.title": "ШІ порівнює",
    "howItWorks.step2.desc": "Штучний інтелект аналізує ціни та відгуки.",
    "howItWorks.step3.title": "Отримайте сповіщення",
    "howItWorks.step3.desc": "Встановіть ціновий сигнал, і ми повідомимо, коли ціна знизиться.",
    "howItWorks.step4.title": "Купуйте розумно",
    "howItWorks.step4.desc": "Натисніть і купуйте за найкращою ціною у вибраному магазині.",
    
    // Why Inaya
    "whyInaya.title": "Чому",
    "whyInaya.subtitle": "Ваше задоволення та безпека для нас на першому місці. Тому ми створили Inaya надійною, прозорою та завжди на вашому боці.",
    "whyInaya.reason1.title": "Надійні джерела",
    "whyInaya.reason1.desc": "Ми збираємо пропозиції лише з перевірених та надійних магазинів.",
    "whyInaya.reason2.title": "Користувач на першому місці",
    "whyInaya.reason2.desc": "Ми не рекламуємо – ваш інтерес найважливіший. Завжди показуємо об'єктивно найкращу ціну.",
    "whyInaya.reason3.title": "Прозора робота",
    "whyInaya.reason3.desc": "Ми відкрито розповідаємо, як працюємо, і позначаємо партнерські посилання.",
    "whyInaya.reason4.title": "Натхненні спільнотою",
    "whyInaya.reason4.desc": "Ми вдосконалюємося на основі відгуків користувачів.",

    // CTA
    "cta.badge": "100% безкоштовне використання",
    "cta.title": "Почніть економити сьогодні!",
    "cta.subtitle": "Приєднуйтесь до 10 000+ розумних покупців, які вже щомісяця економлять тисячі зі SmartAsszisztens.",
    "cta.button": "Дізнатися більше",
    
    // Footer
    "footer.description": "Порівняння цін на основі ШІ. Знайдіть найкращі ціни за секунди.",
    "footer.usefulLinks": "Корисні посилання",
    "footer.faq": "Часті питання",
    "footer.blog": "Блог",
    "footer.partnerInfo": "Партнерська інформація",
    "footer.legal": "Юридична інформація",
    "footer.privacy": "Конфіденційність",
    "footer.terms": "Умови використання",
    "footer.cookies": "Політика Cookie",
    "footer.imprint": "Імпресум",
    "footer.affiliate": "Цей сайт містить партнерські посилання. Якщо ви купуєте через них, ми можемо отримати комісію, яка допомагає підтримувати роботу Inaya, але це не коштує вам додатково. Дякуємо за підтримку!",
    "footer.copyright": "© 2026 Inaya. Усі права захищені.",
    
    // Search page
    "search.back": "Назад",
    "search.welcome": "Привіт! Чим можу допомогти?",
    "search.welcomeSubtitle": "Введіть товар, і я знайду найкращі ціни та купони з 50+ магазинів!",
    "search.inputPlaceholder": "Напишіть, що шукаєте...",
    "search.powered": "Inaya AI допомагає знайти найкращі пропозиції",
    
    // Deal card
    "dealCard.view": "Переглянути",
    
    // Language
    "language.hu": "Magyar",
    "language.uk": "Українська",
    "language.en": "English",
  },
  en: {
    // Header
    "nav.home": "Home",
    "nav.inayaAi": "Inaya AI",
    "nav.deals": "Deals",
    "nav.couponSearch": "Coupon Search",
    "nav.stores": "Stores",
    "nav.search": "Search",
    "nav.tryIt": "Try it",
    
    // Hero
    "hero.badge": "AI-powered price comparison",
    "hero.title1": "Find the",
    "hero.title2": "best prices",
    "hero.title3": "in seconds",
    "hero.subtitle": "Inaya AI analyzes the best stores and finds the perfect products for you at the best prices.",
    "hero.cta": "Ask Inaya",
    "hero.ctaSecondary": "View deals",
    "hero.stat1": "100+ stores",
    "hero.stat2": "AI assistant",
    "hero.stat3": "Free",
    
    // Inaya Features
    "inayaFeatures.title": "How can help you",
    "inayaFeatures.feature1.title": "Ask freely",
    "inayaFeatures.feature1.desc": "Tell Inaya what style or specific item you're looking for.",
    "inayaFeatures.feature2.title": "AI analysis",
    "inayaFeatures.feature2.desc": "Inaya scans the best stores' offerings and reviews for you.",
    "inayaFeatures.feature3.title": "Shop smart",
    "inayaFeatures.feature3.desc": "Get direct links to the best deals with shipping info and coupon codes.",
    
    // Deals
    "deals.badge": "Current deals",
    "deals.title": "Today's best",
    "deals.titleHighlight": "offers",
    "deals.subtitle": "Daily updated discounts from the most popular stores",
    "deals.viewMore": "More deals",
    "deals.product": "product",
    
    // Stores
    "stores.badge": "Partner stores",
    "stores.title": "100+",
    "stores.titleHighlight": "stores",
    "stores.titleEnd": "we search",
    "stores.subtitle": "We monitor all popular Hungarian and international webshops",
    "stores.searchPlaceholder": "Search your favorite store...",
    "stores.viewProducts": "Products",
    "stores.backToAll": "Back to all stores",
    "stores.noProducts": "No demo products for this store yet.",
    "stores.noResults": "No results found.",
    
    // How it works
    "howItWorks.title": "How does it",
    "howItWorks.titleHighlight": "work?",
    "howItWorks.subtitle": "4 simple steps to the best prices",
    "howItWorks.step1.title": "Search for a product",
    "howItWorks.step1.desc": "Type what you're looking for, and AI instantly analyzes all stores.",
    "howItWorks.step2.title": "AI compares",
    "howItWorks.step2.desc": "Artificial intelligence analyzes prices and reviews.",
    "howItWorks.step3.title": "Get notified",
    "howItWorks.step3.desc": "Set a price alert, and we'll notify you when the price drops.",
    "howItWorks.step4.title": "Shop smart",
    "howItWorks.step4.desc": "Click and buy at the best price in your chosen store.",
    
    // Why Inaya
    "whyInaya.title": "Why",
    "whyInaya.subtitle": "Your satisfaction and safety come first. That's why we built Inaya to be reliable, transparent, and always on your side.",
    "whyInaya.reason1.title": "Trusted sources",
    "whyInaya.reason1.desc": "We only collect offers from verified and trusted stores so you can feel safe.",
    "whyInaya.reason2.title": "User comes first",
    "whyInaya.reason2.desc": "We don't advertise – your interest matters most. We always show the objectively best price.",
    "whyInaya.reason3.title": "Transparent operation",
    "whyInaya.reason3.desc": "We openly communicate how we work and mark our affiliate links.",
    "whyInaya.reason4.title": "Community inspired",
    "whyInaya.reason4.desc": "We improve based on user feedback to be truly useful.",

    // CTA
    "cta.badge": "100% free to use",
    "cta.title": "Start saving today!",
    "cta.subtitle": "Join 10,000+ smart shoppers who already save thousands monthly with SmartAsszisztens.",
    "cta.button": "Learn more",
    
    // Footer
    "footer.description": "AI-powered price comparison. Find the best prices in seconds.",
    "footer.usefulLinks": "Useful links",
    "footer.faq": "FAQ",
    "footer.blog": "Blog",
    "footer.partnerInfo": "Partner information",
    "footer.legal": "Legal information",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms of service",
    "footer.cookies": "Cookie policy",
    "footer.imprint": "Imprint",
    "footer.affiliate": "This site contains affiliate links. If you purchase through them, we may receive a commission that helps maintain Inaya's operation, but it costs you nothing extra. Thank you for your support!",
    "footer.copyright": "© 2026 Inaya. All rights reserved.",
    
    // Search page
    "search.back": "Back",
    "search.welcome": "Hi! How can I help?",
    "search.welcomeSubtitle": "Enter a product and I'll find the best prices and coupons from 50+ stores!",
    "search.inputPlaceholder": "Describe what you're looking for...",
    "search.powered": "Inaya AI helps you find the best deals",
    
    // Deal card
    "dealCard.view": "View",
    
    // Language
    "language.hu": "Magyar",
    "language.uk": "Українська",
    "language.en": "English",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "hu";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
