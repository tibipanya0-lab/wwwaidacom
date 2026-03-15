# Inaya.hu Roadmap – 145 feladat

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

## 📊 ADMIN PANEL (86-94)

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
| 94 | Analytics dashboard (grafikonok, trendek) | 🔲 |

---

## ⚙️ BACKEND INFRASTRUKTÚRA (95-109)

| # | Feladat | Státusz |
|---|---------|--------|
| 95 | FastAPI + async SQLAlchemy | ✅ |
| 96 | PostgreSQL adatbázis | ✅ |
| 97 | Redis session kezelés (TTL 4h) | ✅ |
| 98 | Meilisearch indexelés | ✅ |
| 99 | Docker deployment | ✅ |
| 100 | Caddy reverse proxy (HTTPS) | ✅ |
| 101 | Rate limiting (slowapi, 120/perc) | ✅ |
| 102 | Error tracking (Sentry SDK) | ✅ |
| 103 | SMS hiba értesítés (textbelt) | ✅ |
| 104 | CORS konfiguráció | ✅ |
| 105 | JWT token auth (python-jose) | ✅ |
| 106 | bcrypt jelszó hash | ✅ |
| 107 | Groq API key pooling (round-robin) | ✅ |
| 108 | Gemini fallback (2.5-flash → 2.0-flash-lite) | ✅ |
| 109 | Load testing script (hey) | ✅ |

---

## 🤖 AI & ML (110-119)

| # | Feladat | Státusz |
|---|---------|--------|
| 110 | FastText kategória-osztályozó (3-szintű) | ✅ |
| 111 | Smart Dispatcher (cache → keyword → ML) | ✅ |
| 112 | Chat session history (30 üzenet, Redis) | ✅ |
| 113 | AI válasz cache (2h TTL) | ✅ |
| 114 | Nyelv detektálás (HU/EN/RO/DE/UK) | ✅ |
| 115 | Összehasonlítás táblázat generálás | ✅ |
| 116 | Vélemény-összesítő generálás | ✅ |
| 117 | Vásárlási útmutató generálás | ✅ |
| 118 | Ajándékötlet generálás | ✅ |
| 119 | Képkeresés (image upload → AI) | ✅ |

---

## 📱 CHROME EXTENSION (120-124)

| # | Feladat | Státusz |
|---|---------|--------|
| 120 | Manifest V3 Chrome extension | ✅ |
| 121 | Content script – termék név kinyerés webshopokból | ✅ |
| 122 | Popup – kézi keresés | ✅ |
| 123 | Badge – olcsóbb ár jelzés | ✅ |
| 124 | Chrome Web Store publikálás | 🔲 |

---

## 📈 HARVESTER & ADATGYŰJTÉS (125-129)

| # | Feladat | Státusz |
|---|---------|--------|
| 125 | Automatikus termékgyűjtés (6 óránként) | ✅ |
| 126 | Népszerű kulcsszavak keresése (HU + EN) | ✅ |
| 127 | PostgreSQL tárolás + Meilisearch reindex | ✅ |
| 128 | Kupon scraper (promossale.com) | ✅ |
| 129 | Ár-történet nyilvántartás | 🔲 |

---

## 🤝 PARTNER & ÜZLET (130-133)

| # | Feladat | Státusz |
|---|---------|--------|
| 130 | Partner regisztráció (form + email) | ✅ |
| 131 | Admin review workflow | ✅ |
| 132 | Partner értesítés emailben | ✅ |
| 133 | Affiliate link tracking & statisztikák | 🔲 |

---

## 🚀 JÖVŐBELI FEJLESZTÉSEK (134-145)

| # | Feladat | Státusz |
|---|---------|--------|
| 134 | Email értesítések (áresés, akciók) | 🔲 |
| 135 | Ár alert (price drop notification) | 🔲 |
| 136 | Push notification (PWA) | 🔲 |
| 137 | Árösszehasonlító widgetek (embed) | 🔲 |
| 138 | A/B testing rendszer | 🔲 |
| 139 | Google Analytics / Plausible integráció | 🔲 |
| 140 | Sitemap.xml generálás | 🔲 |
| 141 | Blog CMS (admin-ból szerkeszthető) | 🔲 |
| 142 | Termék vélemények aggregálás | 🔲 |
| 143 | Mobil app (React Native / PWA) | 🔲 |
| 144 | API rate limit dashboard | 🔲 |
| 145 | Többpénznemű ár megjelenítés (EUR, RON, USD) | 🔲 |

---

## Összesítés

| Státusz | Darab |
|---------|-------|
| ✅ Kész | 113 |
| ⚠️ Részben | 3 |
| 🔲 Nincs még | 29 |
| **Összesen** | **145** |
