# CLAUDE.md — Inaya Frontend (wwwaidacom) onboarding

> Ezt a fájlt a Claude / AI asszisztens minden induláskor olvassa be.
> Cél: gyors, pontos mentál-modell az `inaya.hu` frontendről, hogy ne kelljen
> vakon kódot túrni. Ha valami eltér a valóságtól, frissítsd.
> Karbantartja: Tibi + agentek.

---

## 1. Projekt cél

Az **inaya.hu** magyar dropshipping / affiliate webshop **publikus frontendje**.
Single-page React alkalmazás, ami a `inaya-backend` (FastAPI, `/api/v1/*`)
endpointjait fogyasztja: termék lista/részlet/keresés, kupon, áruház, kedvenc,
asszisztens chat, partner (creator) program, admin felület. Magyar nyelvű UI,
magyar route-ok (`/kereses`, `/termekek`, `/akciok`, `/kedvencek`, …).

> **FIGYELEM**: a koordinációs taskleírás (#11) "Next.js + Drizzle"-t mond,
> de a valós stack **Vite + React + react-router + Supabase** (utóbbi csak
> nagyon korlátozottan, ld. §7). Ha a leírás eltér a kódtól, mindig a kód a
> forrás. Ezt a CLAUDE.md tükrözi.

## 2. Tech stack

- **Bundler / dev server**: Vite 5 + `@vitejs/plugin-react-swc` (port 8080,
  `vite.config.ts:11`).
- **Nyelv**: TypeScript (`strict` light, `tsconfig.app.json` + `tsconfig.json`).
- **UI**: React 18.3, shadcn/ui (Radix UI primitive-k Tailwind-del, ld.
  `components.json` + `src/components/ui/`).
- **Stílus**: Tailwind CSS 3.4 + `tailwindcss-animate` + `@tailwindcss/typography`.
  Design tokenek HSL CSS változókban (`src/index.css`), `tailwind.config.ts`
  ezeket köti névre (`primary`, `accent`, `deal`, `warning`, `sidebar`, …).
  Dark mode `class` stratégia, gyakorlatban a `:root` és `.dark` ugyanazokat
  a tokeneket adják → alapból sötét.
- **Fontok**: Plus Jakarta Sans (Google Fonts import az `index.css`-ben).
- **Routing**: `react-router-dom` v6 `BrowserRouter`, kliensoldali (ld. §3).
- **Adatlekérés**: `@tanstack/react-query` (provider az `App.tsx`-ben),
  konkrét fetch hívások jellemzően kézzel írt `fetch()`-en mennek
  (`src/lib/api.ts`, `src/pages/*`). Nincs egységes API kliens generálás.
- **Form / validáció**: `react-hook-form` + `@hookform/resolvers` + `zod`.
- **Ikonok**: `lucide-react`.
- **Animáció / 3D**: `framer-motion`, `@react-three/fiber` + `@react-three/drei`
  + `three` (a `CityScene3D.tsx` és az `InayaHero/Animation` komponensekben).
- **Toast / notification**: `sonner` és `@radix-ui/react-toast` (kettő párhuzamosan).
- **SEO**: `react-helmet-async` (`src/components/SEOHead.tsx`).
- **Statikus prerender**: `puppeteer` headless böngésző hajtja végre
  postbuild fázisban (`scripts/prerender.mjs`), a sitemap-szerű route lista
  abban statikusan található.
- **Auth**: saját JWT a backend `/api/v1/auth/login`-ról, `localStorage`-ban
  tárolva (`src/hooks/useAuth.tsx`). NEM Supabase auth.
- **Supabase**: `@supabase/supabase-js` betöltve, ténylegesen csak az admin
  Sync Dashboard használja (ld. §7).
- **Tesztelés**: `vitest` + `@testing-library/react` + `jsdom`
  (`vitest.config.ts`, jelenlegi tesztek a `src/test/` alatt).
- **Deploy target**: a VPS-en futó nginx/FastAPI mögé másolt statikus build
  (`/opt/inaya-backend/static/`), ld. §9.
- **Lovable**: `lovable-tagger` Vite plugin **csak `mode === "development"`**
  alatt aktív (`vite.config.ts:16`) — a Lovable.dev hosztolt IDE-hez köthető,
  build-be nem kerül bele. A `.lovable/` mappa is jelen van.

## 3. Route-térkép

Forrás: `src/App.tsx:65-95`. Minden route a `BrowserRouter` alatt fut, a
`Suspense + lazy()` lazy-loadolja a page komponenseket (kivéve `Index` és
`NotFound`, amiket eager).

| URL                              | Page komponens                  | Cél / leírás                                       | Backend végpontok (kb.)                        |
|----------------------------------|---------------------------------|----------------------------------------------------|------------------------------------------------|
| `/`                              | `pages/Index.tsx`               | Főoldal, hero + inline asszisztens chat            | `/api/v1/assistant`, `/api/v1/products`        |
| `/kereses`                       | `pages/Search.tsx`              | Termékkereső (Meili-szerű find)                    | `/api/v1/search/?q=…`                          |
| `/termekek`                      | `pages/Products.tsx`            | Termék lista (paginated)                           | `/api/v1/products/?cursor=…` és `/api/v1/search`|
| `/termek/:id`                    | `pages/ProductDetail.tsx`       | Termék részlet + chat widget                       | `/api/v1/products/:id`, `/api/v1/chat/:id`     |
| `/akciok`                        | `pages/Deals.tsx`               | Akciós termékek                                    | `/api/v1/deals/search?q=…&deals_only=true`     |
| `/kedvencek`                     | `pages/Favorites.tsx`           | Kedvencek (kliensoldali tárolás `FavoritesContext`)| (saját state)                                  |
| `/adatvedelem`                   | `pages/Adatvedelem.tsx`         | Statikus adatkezelési tájékoztató                  | —                                              |
| `/suti-szabalyzat`               | `pages/SutiSzabalyzat.tsx`      | Statikus cookie szabályzat                         | —                                              |
| `/felhasznalasi-feltetelek`      | `pages/FelhasznalasiFeltetelek.tsx` | Statikus ÁSZF                                  | —                                              |
| `/gyik`                          | `pages/GYIK.tsx`                | Statikus GYIK                                      | —                                              |
| `/partneri-tajekoztato`          | `pages/PartneriTajekoztato.tsx` | Partner / creator tájékoztató                      | —                                              |
| `/blog`                          | `pages/Blog.tsx`                | Blog landing                                       | (statikus / TBD)                               |
| `/admin`                         | `pages/Admin.tsx`               | Admin felület (auth védett)                        | `/api/v1/admin/*`, `/api/v1/creators/admin/*`  |
| `/aruhazak`                      | `pages/Stores.tsx`              | Áruház (affiliate) listaoldal                      | (`src/lib/partnerStores.ts` lokál data)        |
| `/kuponok`                       | `pages/Coupons.tsx`             | Kuponok                                            | (Supabase `coupons` tábla potenciálisan)       |
| `/partnerek` (és `/partner` → 301) | `pages/Partnerek.tsx`         | Creator / influencer dashboard, regisztráció, chat | `/api/v1/creators/*`, `/api/v1/chat/creator/*` |
| `*`                              | `pages/NotFound.tsx`            | 404                                                | —                                              |

A `GlobalChatWidget` floating chat **NEM** jelenik meg a főoldalon és a
`/partnerek`, ill. a `/akciok` oldalon centerelt módon (`App.tsx:62-93`).

A `useRefTracking` hook (`App.tsx:42-56`) `?ref=...` paraméter esetén
`POST /api/v1/creators/track-click` hívással loggol a creator-rendszerbe és
`localStorage.inaya_ref`-ben eltárolja.

## 4. Komponens-rétegek

```
src/
├── components/
│   ├── ui/                   # shadcn/ui primitives (Radix wrap-ek):
│   │                         #   accordion, alert, avatar, badge, breadcrumb,
│   │                         #   button, calendar, card, chart, checkbox,
│   │                         #   collapsible, command, dialog, drawer,
│   │                         #   dropdown-menu, form, input, label, popover,
│   │                         #   progress, select, separator, sheet, skeleton,
│   │                         #   sonner, switch, table, tabs, textarea, toast,
│   │                         #   toaster, toggle, tooltip, use-toast
│   ├── admin/
│   │   └── SyncDashboard.tsx # ⚠️ EZ az egyetlen Supabase-t használó komponens
│   ├── ChatMessage.tsx       # chat üzenet bubble
│   ├── CityScene3D.tsx       # 3D scene (react-three-fiber)
│   ├── CookieConsent.tsx     # cookie banner
│   ├── CouponCard.tsx        # kupon kártya
│   ├── DealCard.tsx          # akciós termék kártya
│   ├── Footer.tsx            # globális footer
│   ├── GlobalChatWidget.tsx  # floating asszisztens chat (/api/v1/assistant)
│   ├── Header.tsx            # globális header / nav
│   ├── HeroSection.tsx       # generikus hero
│   ├── InayaAnimation.tsx    # avatar animáció
│   ├── InayaAvatar.tsx       # avatar render
│   ├── InayaHeroSection.tsx  # főoldal hero + inline chat
│   ├── LanguageSelector.tsx  # nyelv váltó (LanguageContext)
│   ├── NavLink.tsx           # nav link wrapper
│   ├── ProductCard.tsx       # termék kártya
│   ├── ProductChatWidget.tsx # termék-specifikus chat (/api/v1/chat/:id[/stream])
│   ├── SEOHead.tsx           # react-helmet-async meta tag wrapper
│   └── ThinkingIndicator.tsx # chat „gondolkodik” loader
├── pages/                    # route komponensek (ld. §3)
├── hooks/
│   ├── use-mobile.tsx        # viewport breakpoint hook
│   ├── use-toast.ts          # shadcn toast helper
│   └── useAuth.tsx           # admin JWT auth provider + hook
├── contexts/
│   ├── AuthContext (a useAuth-ben definiálva)
│   ├── FavoritesContext.tsx  # localStorage-perzisztens kedvencek
│   ├── LanguageContext.tsx   # i18n (HU default)
│   └── ThemeContext.tsx      # téma toggle (next-themes mellé)
├── integrations/
│   └── supabase/             # client.ts + types.ts (auto-generated)
├── lib/
│   ├── api.ts                # backend fetch wrapper-ek (search, products, chat, classify)
│   ├── partnerStores.ts      # statikus áruház adat (Stores oldalhoz)
│   └── utils.ts              # cn() classnames helper
├── assets/                   # statikus képek a buildhez
├── App.tsx                   # provider tree + Routes
├── main.tsx                  # React root render
├── index.css                 # Tailwind alaprétegek + design tokens
└── App.css                   # legacy global CSS
```

Réteg-konvenció (lazán követett):
1. **UI primitives** — `components/ui/*` (kizárólag prezentáció).
2. **Composite components** — `components/*.tsx` (üzleti widget-ek).
3. **Pages** — `pages/*.tsx` (route szintű komponensek, a backend hívások
   többségét itt találod inline `fetch`-csel).
4. **Contexts + hooks** — globális kliens-állapot.
5. **Lib** — pure helper-ek és API wrapper-ek.

## 5. Adatréteg

### 5.1 Backend (`inaya-backend`, FastAPI)

Az **elsődleges adatforrás**. Az `src/lib/api.ts:1` szerint:

```ts
export const API_BASE = window.location.hostname === "inaya.hu"
  ? ""                                                          // prod: same-origin
  : "https://citations-cast-friends-bookmarks.trycloudflare.com"; // dev: cloudflared tunnel
```

Tehát éles üzemben az nginx/FastAPI ugyanarról a domainről szolgálja ki a
statikus buildet és az API-t (`/api/v1/*`). Lokál fejlesztésben egy Cloudflare
tunnel proxy-zik a backendhez. Ha a tunnel URL változik, ezt a sort **kézzel
kell** átírni (nincs env változó rá).

Ismert hívási pontok (Grep `/api/v1/`):

- **Auth**: `/api/v1/auth/login` — `src/hooks/useAuth.tsx:37`.
- **Search**: `/api/v1/search/?q=…&limit&offset` — `src/lib/api.ts:69, 97`.
- **Products**: `/api/v1/products/?limit=40&cursor=…` — `src/lib/api.ts:110`,
  `src/pages/ProductDetail.tsx:139`.
- **Deals**: `/api/v1/deals/search?...&deals_only=true` — `src/pages/Deals.tsx:36`.
- **Chat (termék)**: `/api/v1/chat/:productId` és `/stream` —
  `src/components/ProductChatWidget.tsx:45,123`, `src/lib/api.ts:124`.
- **Assistant (global)**: `/api/v1/assistant` —
  `src/components/GlobalChatWidget.tsx:137,172`.
- **Classify**: `/api/v1/classify` — `src/lib/api.ts:135` (⚠️ a backend
  `app/api/v1/classify.py` jelenleg **nincs** include-olva a router.py-ba,
  ld. backend CLAUDE.md §11 #2 — a hívás 404-et fog dobni).
- **Admin**: `/api/v1/admin/stats|seo|logs[/...]` —
  `src/pages/Admin.tsx:56–338`.
- **Creators / partner program**: `/api/v1/creators/...`,
  `/api/v1/chat/creator/(send|messages)` — `src/pages/Partnerek.tsx`,
  `src/App.tsx:49`.

### 5.2 Supabase (`hfjggeybwtoysaumvtpq.supabase.co`)

`src/integrations/supabase/client.ts` env-ből húzza a publishable key-t
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — a `.env` fájl
**be van commitolva** a repo gyökerébe; csak anon key, nem service role).

A `supabase/` mappa egy teljes Supabase projektet ír le:

- **Migrációk** (`supabase/migrations/2026...`): táblák amiket a séma
  generálás (`src/integrations/supabase/types.ts`) tükröz:
  - `public.coupons` — kupon kódok, kategória, kedvezmény, érvényesség
  - `public.products` — termékek (cím, ár, képek, kategória, embedding,
    rating, tags, gender, …)
  - `public.sync_status` — háttér-szinkron job-ok állapota (a SyncDashboard
    erre épít)
  - `public.user_roles` — admin / felhasználó szerepkörök
  - RPC-k: `has_role`, `search_products`, `semantic_search`
- **Edge Functions** (`supabase/functions/`): `ai-proxy`, `aliexpress-coupons`,
  `aliexpress-import`, `analyze-image`, `daily-sync`, `generate-embeddings`,
  `inaya-chat`, `rating-cleanup`, `search-coupons`, `search-intent`,
  `semantic-search`.

⚠️ **Kontextus**: a futási kódban `supabase.*` hívás csak a
`src/components/admin/SyncDashboard.tsx`-ben van (Grep `@/integrations/supabase`).
A többi page tisztán a FastAPI backendet hívja. A Supabase függvények és
táblák tehát egy **párhuzamos / részben legacy** adatréteg, valószínűleg a
Lovable.dev mintaprojekt öröksége és/vagy az aktuális dropshipping
kísérletezés. A CLAUDE.md backendben (`app/services/` oldalon) ezeknek nincs
közvetlen megfelelője — a backend a saját Postgres-ét használja.

### 5.3 Kliensoldali állapot

- **Kedvencek**: `localStorage` (`FavoritesContext`).
- **Admin auth**: `localStorage` `inaya_admin_token`, `inaya_admin_email`
  (`useAuth.tsx`).
- **Referral**: `localStorage` `inaya_ref` (`App.tsx:47`).
- **Téma**: `next-themes` + `ThemeContext` (alapból sötét).
- **Nyelv**: `LanguageContext` (HU default).

## 6. Integrációk

| Modul / fájl                                       | Szolgáltatás       | Cél                                      |
|----------------------------------------------------|--------------------|------------------------------------------|
| `src/lib/api.ts` + page-ek inline `fetch`          | inaya-backend FastAPI | Termék, search, chat, asszisztens, admin |
| `src/integrations/supabase/*`                      | Supabase           | Csak `SyncDashboard` (lásd §5.2)         |
| `src/hooks/useAuth.tsx`                            | Backend JWT        | Admin login, `/api/v1/auth/login`        |
| `src/pages/Partnerek.tsx`                          | Backend creators API | Partner / influencer dashboard         |
| `src/components/CookieConsent.tsx`                 | (saját)            | Cookie banner — GA4 nincs ide drótozva   |
| `react-helmet-async` (`SEOHead.tsx`)               | —                  | Meta tag-ek SEO-hoz                      |
| `puppeteer` (`scripts/prerender.mjs`)              | Headless Chromium  | Statikus prerender postbuild lépésben    |
| `lovable-tagger`                                   | Lovable.dev        | Csak dev mode-ban aktív                  |

A frontendbe **nincs Stripe / payment SDK** közvetlenül beépítve (a fizetést
a backend webhook-jai kezelik). **Nincs Google OAuth** kliens sem (a backend
oldalán előkészített `GOOGLE_CLIENT_*` envek vannak, de itt használat nem).

## 7. Dev parancsok

A `package.json` csak ezeket adja meg:

| Parancs                | Mit csinál                                                          |
|------------------------|---------------------------------------------------------------------|
| `bun run dev` / `npm run dev`     | Vite dev server (`localhost:8080`, HMR overlay tiltva)   |
| `bun run build` / `npm run build` | Production build → `dist/`, utána `postbuild` futtatja a prerender-t |
| `bun run build:dev`               | Build development módban                                 |
| `bun run preview`                 | `vite preview` a `dist/`-en                              |
| `bun run lint`                    | ESLint a teljes repón (`eslint.config.js`)               |
| `bun run test`                    | `vitest run` egyszer                                     |
| `bun run test:watch`              | `vitest` watch módban                                    |

A user `bun`-t preferálja (lockfile: `bun.lock` + `bun.lockb`), de az
`npm install` is működik (`package-lock.json` is be van commitolva). Vegyes
lock-fileok jelen vannak — ne válts ide-oda gondolkodás nélkül.

> **Önellenőrzés zárás előtt** (Tibi szabálya): minden frontend változtatás
> után futtasd a `bun run lint`-et és a `bun run test`-et. Ha pirosak,
> javítsd vagy magyarázd el, miért hagytad így. Ne mondd "kész" piros tesztek
> mellett.

## 8. Konvenciók

- **Routing**: minden új oldalt `App.tsx`-be kell felvenni a `*` (NotFound)
  fölé. A magyar URL-ek ékezet nélküliek (`/kereses`, `/termekek`, `/akciok`,
  `/aruhazak`, `/kedvencek`, `/kuponok`, `/partnerek`).
- **File naming**: page komponensek PascalCase (`pages/ProductDetail.tsx`),
  shadcn UI primitives kebab-case (`components/ui/dropdown-menu.tsx`).
- **Import alias**: `@/...` → `src/...` (Vite + tsconfig path alias).
- **Stílus**: HSL CSS változók + Tailwind szemantikus osztályok
  (`bg-primary`, `text-foreground`, `border-border`, …). NE drótozz be hex
  színt komponensbe — vagy add hozzá tokent az `index.css`-hez és kösd be a
  `tailwind.config.ts`-ben.
- **Form-ok**: `react-hook-form` + `zodResolver`, hibák `<FormMessage>`-ben.
- **Toast**: `import { useToast } from "@/hooks/use-toast"` (shadcn) vagy
  `sonner` (a `Toaster as Sonner` mounted az `App.tsx`-ben). Vegyes — válassz
  egyet komponensen belül.
- **Adathívás**: vékony `fetch()` page-ből vagy `lib/api.ts`-ből; loading /
  error state-et magad kezeld (`useState`, vagy ahol már be van vezetve,
  `useQuery`). A repo nem teljesen react-query-fied.
- **Auth fejléc**: `Authorization: Bearer ${token}` a `localStorage`-ból
  (ld. `Admin.tsx` `authHeaders()` helper-jét).
- **SEO**: új public page → tegyél `<SEOHead>` komponenst a tetejére, majd
  add hozzá az URL-t a `scripts/prerender.mjs` `ROUTES` listájához.
- **Lazy load**: új page-et `lazy(() => import("./pages/Foo"))`-vel
  importálj az `App.tsx`-ben (kivéve az `Index`-et és `NotFound`-ot).
- **Magyar UI szövegek + magyar kommentek**: oké és preferált.

## 9. Élesüzem / deploy

- **VPS**: `91.214.112.239`, `/opt/inaya-backend/static/` (a backend
  konténer ezt szolgálja ki — eddig a backend `app/main.py`-ban
  `StaticFiles` mount nincs, de nginx/Caddy valószínűleg igen).
- **Build → deploy**: `./deploy.sh` (`deploy.sh:1-23`):
  1. `npm run build` (lokál Vite build → `dist/`).
  2. `rsync -az --delete dist/ root@VPS:/opt/inaya-backend/static/`
     (kihagyja: `douglas/`, `admin.html`, `inaya-hero.html`).
  3. Külön `scp` a `public/inaya-hero.html`-re.
- **CI**: nincs (jelenleg).
- **Branch policy**: `main`-re közvetlen push **TILOS**. Új munkához
  `agent/<rövid-kebab-leírás>` branch + draft PR (Tibi reviewzza és mergeli).
- **Build trigger**: a `src/lib/api.ts` végén egy `// build trigger`
  komment látszik — vagyis a `dist/` cache invalidáláshoz néha érdemes
  egy nem-funkcionális commit. Hasonlóan a `vite.config.ts:1`
  `// cache-bust: 2026-03-17-v2`.

## 10. Watch out for / kockázatok / anomáliák

1. **API_BASE hardcoded Cloudflare tunnel**: `src/lib/api.ts:1` egy konkrét
   `*.trycloudflare.com` URL-re hivatkozik. Ha a tunnel megszűnik vagy URL-t
   vált, lokálban minden `/api/v1` hívás eldől → kézzel cseréld a
   konstansot. Nincs `VITE_API_BASE` env override.
2. **`/api/v1/classify` 404**: a backend router nem include-olja
   (backend CLAUDE.md §11 #2). A `lib/api.ts` `classifyProduct()` exportált,
   de jelenleg nem hívódik élesben. Ha hívni akarod, előbb a backend
   `router.py`-ben include-old.
3. **Supabase „árnyékréteg”**: 22 migráció, 11 edge function, generált
   types — de a frontendben **csak** `SyncDashboard.tsx` használja. Ha
   bármit változtatsz a Supabase oldalon, ne feltételezd, hogy a fő
   user flow-ra hatással lesz; és fordítva, az inaya backend nem fog
   értesülni róla.
4. **`.env` be van commitolva**: a Supabase URL + anon key a repo része
   (`.env`). Anon key publikus, sebezhetőséget önmagában nem jelent, de
   service role key SOHA ne kerüljön ide. Új secret → `.gitignore` először.
5. **Két lockfile**: `bun.lock(b)` és `package-lock.json` is jelen — vegyes
   használat. Ha függőséget változtatsz, frissítsd mindkettőt vagy egyezz
   meg Tibivel, melyiket dobjuk.
6. **Lovable maradványok**: `.lovable/`, `lovable-tagger` plugin,
   `vite_react_shadcn_ts` mint `package.json:name`. Ne építs rá tartós
   fícsőrt — Tibi ezt fokozatosan saját hand-rolled megoldásra cseréli.
7. **`README.md` és `ROADMAP.md` valószínűleg elavult** (a Lovable starter
   öröksége). Ne onnan tájékozódj — ez a CLAUDE.md a hiteles forrás.
8. **`pages/Admin.tsx` fetch URL-ek `/api/v1/...` (relative)**, nem
   `${API_BASE}/api/v1/...`. Az admin oldal csak prod (`inaya.hu`) origin
   alól működik — lokál dev-ben (port 8080) sima 404-et fog kapni, hacsak
   nem proxyzol Vite oldalon. Ezt érdemes tudni, ha admin oldalt
   debuggolsz lokálban.
9. **`SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` `import.meta.env`-ből**: ha
   a `.env`-et töröld vagy átnevezd, a `createClient(...)` `undefined`-dal
   robban a `SyncDashboard` mountoláskor.
10. **3D scene (`react-three/fiber` + `three`) nehéz**: első bundle-be
    nem szabad, hogy bekerüljön. Jelenleg az `InayaHeroSection` a főoldalon
    eager-ben van. Ha lassul az LCP, érdemes lazy-zni.
11. **Két termék típus** (`ApiProduct` és `BackendProduct` a `lib/api.ts`-ben)
    kissé eltérő mezőkkel. A `mapHit` a kettőt egy formára mossa, de
    típushibák könnyen csúsznak.
12. **`scripts/prerender.mjs` ROUTES listája statikus**: új public route
    hozzáadásakor ide is kell tenni, különben SEO szempontból nem rendereli.
13. **`postbuild` puppeteer-t indít** → `npm run build` headless Chromiumot
    rángat. CI / Docker buildnél ezt vedd számításba (chromium binary kell).
14. **`deploy.sh` rsync `--delete`**: ha a `dist/` üres / sérült, az élesről
    is törölhet. Build hibára figyelj a `set -e` előtt.
15. **Backend mappa NEM git repo lokálisan** (`/Users/tibi/inaya-backend`)
    — a frontend igen. Ne keverd a két workflow-t.

---

*Frissítve: 2026-04-26 — első verzió, Cowork agent (#11 issue) generálta a
backend `/Users/tibi/inaya-backend/CLAUDE.md` mintájára. Ha módosul a stack
vagy új modul kerül be, ezt a fájlt is hozd szinkronba.*
