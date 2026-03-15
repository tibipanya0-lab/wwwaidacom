# Inaya.hu Roadmap – 150 feladat

Utolsó frissítés: 2026-03-15

## Jelmagyarázat
- ✅ Kész
- 🔲 Még nincs megcsinálva
- ⚠️ Részben kész
- ➖ Nem kell

---

## 🏠 FRONTEND – Oldalak & Navigáció (1-15)

| # | Feladat | Státusz |
|---|---------|--------|
| 1 | Főoldal (hero section iframe-ben) | ✅ |
| 2 | Keresés oldal (/kereses) – AI chat + 3D háttér | ✅ |
| 3 | Termékek oldal (/termekek) – infinite scroll | ✅ |
| 4 | Termék részletek oldal (/termek/:id) | ✅ |
| 5 | Akciók oldal (/akciok) – szűrés, rendezés | ✅ |
| 6 | Kedvencek oldal (/kedvencek) | ✅ |
| 7 | Áruházak oldal (/aruhazak) | ⚠️ UI kész, backend integráció hiányzik |
| 8 | Kuponok oldal (/kuponok) | ⚠️ UI kész, backend integráció hiányzik |
| 9 | Blog oldal (/blog) – 4 cikk | ⚠️ Placeholder tartalom |
| 10 | GYIK oldal (/gyik) – accordion + schema.org | ✅ |
| 11 | Adatvédelem oldal | ✅ |
| 12 | Süti szabályzat oldal | ✅ |
| 13 | Felhasználási feltételek oldal | ✅ |
| 14 | Partneri tájékoztató oldal | ✅ |
| 15 | 404 Not Found oldal | ✅ |

---

## 🤖 HERO SECTION – Interaktív elemek (16-30)

| # | Feladat | Státusz |
|---|---------|--------|
| 16 | AI chat ablak a hero-ban | ✅ |
| 17 | Chat streaming (SSE typewriter) | ✅ |
| 18 | Chat minimalizálás/tálca | ✅ |
| 19 | Termék panel (jobb oldal, grid) | ✅ |
| 20 | Termék panel – infinite scroll | ✅ |
| 21 | Modál rendszer (akciók, kuponok, kedvencek, boltok, jogi, partner) | ✅ |
| 22 | Forgó arany ikonok (orbit-icons) | ✅ |
| 23 | Forgó arany gyűrű (cart-ring) belső + külső | ✅ |
| 24 | Ellentétesen forgó külső kör | ✅ |
| 25 | Villám effekt (canvas lightning) | ✅ |
| 26 | Arany glow pulzálás animáció | ✅ |
| 27 | Desktop layout: chat bal, termékek jobb | ✅ |
| 28 | Mobil layout: responsive chat + product panel | ✅ |
| 29 | Nyelv választó a hero-ban (5 nyelv) | ✅ |
| 30 | Kosár kattintható terület + animáció | ✅ |

---

## 🌍 TÖBBNYELVŰSÉG (31-40)

| # | Feladat | Státusz |
|---|---------|--------|
| 31 | Magyar (hu) fordítás – 80+ kulcs | ✅ |
| 32 | Ukrán (uk) fordítás | ✅ |
| 33 | Angol (en) fordítás | ✅ |
| 34 | Román (ro) fordítás | ✅ |
| 35 | Német (de) fordítás | ✅ |
| 36 | Nyelvválasztó dropdown (5 zászló) | ✅ |
| 37 | Böngészőnyelv automatikus detektálás | ✅ |
| 38 | localStorage nyelv mentés | ✅ |
| 39 | Hero section nyelvi szinkron (postMessage) | ✅ |
| 40 | Francia (fr) fordítás | 🔲 |

---

## 🎨 UI & DESIGN (41-55)

| # | Feladat | Státusz |
|---|---------|--------|
| 41 | Sötét téma (alapértelmezett) | ✅ |
| 42 | Világos téma toggle | ✅ |
| 43 | Arany/amber szín téma | ✅ |
| 44 | Cookie consent banner | ✅ |
| 45 | SEO Head komponens (react-helmet) | ✅ |
| 46 | PWA manifest | ✅ |
| 47 | Open Graph meta tagek | ✅ |
| 48 | Responsive design (mobil/tablet/desktop) | ✅ |
| 49 | 3D avatar animáció (Three.js) | ✅ |
| 50 | 3D város háttér (CityScene3D) | ✅ |
| 51 | Desktop háttérkép (inaya-desktop-bg.png) | ✅ |
| 52 | Mobil háttérkép (inaya-mobile-bg.png) | ✅ |
| 53 | Loading skeleton komponensek | ✅ |
| 54 | Toast/snackbar értesítések | ✅ |
| 55 | Framer Motion animációk | ✅ |

---

## 🔍 KERESÉS & AI (56-70)

| # | Feladat | Státusz |
|---|---------|--------|
| 56 | Meilisearch full-text keresés (typo-toleráns) | ✅ |
| 57 | Autocomplete/javaslatok (Redis popular) | ✅ |
| 58 | AI asszisztens – Groq tool calling | ✅ |
| 59 | AI asszisztens – Gemini fallback | ✅ |
| 60 | AI streaming válaszok (SSE) | ✅ |
| 61 | Termék-specifikus chat (/chat/:productId) | ✅ |
| 62 | Keresési kifejezés fordítás (HU→EN, Groq LLM) | ✅ |
| 63 | Smart query parsing (100+ magyar szótár) | ✅ |
| 64 | Fuzzy matching & relevance scoring | ✅ |
| 65 | Cross-platform deduplikáció (AliExpress ↔ eBay) | ✅ |
| 66 | Exclude szavak rendszer (75+ blacklist) | ✅ |
| 67 | Ár-tartomány szűrés (min/max price) | ✅ |
| 68 | Rendezés (ár, kedvezmény, értékelés, relevancia) | ✅ |
| 69 | Kategória szűrés | ✅ |
| 70 | Keresés cache (5 perc TTL) | ✅ |

---

## 🛒 TERMÉK FORRÁSOK & API-K (71-85)

| # | Feladat | Státusz |
|---|---------|--------|
| 71 | AliExpress Affiliate API integráció | ✅ |
| 72 | eBay Browse API integráció | ✅ |
| 73 | Banggood API integráció | ✅ |
| 74 | Párhuzamos keresés (asyncio.gather) | ✅ |
| 75 | FX rate háttérfrissítés (USD→HUF) | ✅ |
| 76 | Interleave merge (2 Ali + 1 eBay) | ✅ |
| 77 | AliExpress kuponok scraping | ✅ |
| 78 | Emag integráció | 🔲 |
| 79 | Amazon integráció | 🔲 |
| 80 | Alza integráció | 🔲 |
| 81 | Extreme Digital integráció | 🔲 |
| 82 | ASOS integráció | 🔲 |
| 83 | Temu integráció | 🔲 |
| 84 | Shein integráció | 🔲 |
| 85 | Árukereső.hu adatforrás | 🔲 |

---

## 📊 ADMIN PANEL (86-95)

| # | Feladat | Státusz |
|---|---------|--------|
| 86 | Admin JWT bejelentkezés | ✅ |
| 87 | Dashboard statisztikák (termékek, árak, boltok) | ✅ |
| 88 | Termékek boltonként/kategóriánként | ✅ |
| 89 | Népszerű keresések (Redis) | ✅ |
| 90 | SEO beállítások kezelése | ✅ |
| 91 | Log viewer (backend/harvester/monitor) | ✅ |
| 92 | Partner jelentkezések kezelése | ✅ |
| 93 | Termék CRUD (create/update/delete) | ✅ |
| 94 | Felhasználó kezelés | 🔲 |
| 95 | Analytics dashboard (grafikonok, trendek) | 🔲 |

---

## ⚙️ BACKEND INFRASTRUKTÚRA (96-110)

| # | Feladat | Státusz |
|---|---------|--------|
| 96 | FastAPI + async SQLAlchemy | ✅ |
| 97 | PostgreSQL adatbázis | ✅ |
| 98 | Redis session kezelés (TTL 4h) | ✅ |
| 99 | Meilisearch indexelés | ✅ |
| 100 | Docker deployment | ✅ |
| 101 | Caddy reverse proxy (HTTPS) | ✅ |
| 102 | Rate limiting (slowapi, 120/perc) | ✅ |
| 103 | Error tracking (Sentry SDK) | ✅ |
| 104 | SMS hiba értesítés (textbelt) | ✅ |
| 105 | CORS konfiguráció | ✅ |
| 106 | JWT token auth (python-jose) | ✅ |
| 107 | bcrypt jelszó hash | ✅ |
| 108 | Groq API key pooling (round-robin) | ✅ |
| 109 | Gemini fallback (2.5-flash → 2.0-flash-lite) | ✅ |
| 110 | Load testing script (hey) | ✅ |

---

## 🤖 AI & ML (111-120)

| # | Feladat | Státusz |
|---|---------|--------|
| 111 | FastText kategória-osztályozó (3-szintű) | ✅ |
| 112 | Smart Dispatcher (cache → keyword → ML) | ✅ |
| 113 | Chat session history (30 üzenet, Redis) | ✅ |
| 114 | AI válasz cache (2h TTL) | ✅ |
| 115 | Nyelv detektálás (HU/EN/RO/DE/UK) | ✅ |
| 116 | Összehasonlítás táblázat generálás | ✅ |
| 117 | Vélemény-összesítő generálás | ✅ |
| 118 | Vásárlási útmutató generálás | ✅ |
| 119 | Ajándékötlet generálás | ✅ |
| 120 | Képkeresés (image upload → AI) | ✅ |

---

## 📱 CHROME EXTENSION (121-125)

| # | Feladat | Státusz |
|---|---------|--------|
| 121 | Manifest V3 Chrome extension | ✅ |
| 122 | Content script – termék név kinyerés webshopokból | ✅ |
| 123 | Popup – kézi keresés | ✅ |
| 124 | Badge – olcsóbb ár jelzés | ✅ |
| 125 | Chrome Web Store publikálás | 🔲 |

---

## 📈 HARVESTER & ADATGYŰJTÉS (126-130)

| # | Feladat | Státusz |
|---|---------|--------|
| 126 | Automatikus termékgyűjtés (6 óránként) | ✅ |
| 127 | Népszerű kulcsszavak keresése (HU + EN) | ✅ |
| 128 | PostgreSQL tárolás + Meilisearch reindex | ✅ |
| 129 | Kupon scraper (promossale.com) | ✅ |
| 130 | Ár-történet nyilvántartás | 🔲 |

---

## 🤝 PARTNER & ÜZLET (131-135)

| # | Feladat | Státusz |
|---|---------|--------|
| 131 | Partner regisztráció (form + email) | ✅ |
| 132 | Admin review workflow | ✅ |
| 133 | Partner értesítés emailben | ✅ |
| 134 | Admitad affiliate integráció | ⚠️ Verification meta tag bent van |
| 135 | Affiliate link tracking & statisztikák | 🔲 |

---

## 🚀 JÖVŐBELI FEJLESZTÉSEK (136-150)

| # | Feladat | Státusz |
|---|---------|--------|
| 136 | Felhasználói regisztráció/fiókok | 🔲 |
| 137 | Email értesítések (áresés, akciók) | 🔲 |
| 138 | Ár alert (price drop notification) | 🔲 |
| 139 | Push notification (PWA) | 🔲 |
| 140 | Közösségi funkciók (vélemények, értékelések) | 🔲 |
| 141 | Wishlist megosztás | 🔲 |
| 142 | Árösszehasonlító widgetek (embed) | 🔲 |
| 143 | A/B testing rendszer | 🔲 |
| 144 | Google Analytics / Plausible integráció | 🔲 |
| 145 | Sitemap.xml generálás | 🔲 |
| 146 | Blog CMS (admin-ból szerkeszthető) | 🔲 |
| 147 | Termék vélemények aggregálás | 🔲 |
| 148 | Mobil app (React Native / PWA) | 🔲 |
| 149 | API rate limit dashboard | 🔲 |
| 150 | Többpénznemű ár megjelenítés (EUR, RON, USD) | 🔲 |

---

## Összesítés

| Státusz | Darab |
|---------|-------|
| ✅ Kész | 113 |
| ⚠️ Részben | 4 |
| 🔲 Nincs még | 33 |
| **Összesen** | **150** |
