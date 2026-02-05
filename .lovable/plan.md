
# Teljes Világos Mód Implementáció

## Áttekintés
A jelenlegi implementációban a világos mód csak a CSS változókat módosítja, de a 3D háttér és a szekciók hardkódolt sötét színeket használnak. A teljes világos élményhez minden komponenst frissíteni kell.

## Változtatások

### 1. CityScene3D - Téma-függő megjelenés
A 3D háttér jelenleg mindig sötét. Két opció van:
- **A) Világos módban elrejtjük** a 3D hátteret és egyszerű világos hátteret mutatunk
- **B) Világos verzió készítése** a városképből (világos épületek, kék ég, stb.)

**Javaslat**: A egyszerűbb és elegánsabb megoldás az "A" opció - világos módban egy szép, tiszta világos háttér arany akcentusokkal.

### 2. Szekciók frissítése
Minden szekció jelenleg hardkódolt sötét színeket használ:
- `bg-black/40` → `bg-background/40` vagy téma-függő
- `text-white` → `text-foreground`
- `text-neutral-400` → `text-muted-foreground`
- `border-amber-500/20` → téma-függő border színek

**Érintett fájlok**:
- `CategorySection.tsx`
- `AidaFeaturesSection.tsx`
- `StoresSection.tsx`
- `HowItWorksSection.tsx`
- `CTASection.tsx`
- `HeroSection.tsx`
- `Footer.tsx`

### 3. CityScene3D módosítás
```text
┌─────────────────────────────────────────────────────┐
│  Dark Mode                │  Light Mode             │
├─────────────────────────────────────────────────────┤
│  3D város jelenet         │  Tiszta világos háttér  │
│  Fekete gradiens          │  Fehér/krém gradiens    │
│  Arany fények             │  Arany akcentus körök   │
│  Csillagok                │  Finom mintázat         │
└─────────────────────────────────────────────────────┘
```

---

## Technikai részletek

### CityScene3D.tsx
- Import `useTheme` hook
- Feltételes renderelés: dark módban 3D jelenet, light módban egyszerű világos háttér
- Világos háttér elemek: fehér/szürke gradiens, arany blur körök dekorációként

### Szekció komponensek
Minden szekcióban cserélni kell:
| Jelenlegi | Új |
|-----------|-----|
| `bg-black/40` | `bg-card/40 dark:bg-black/40` |
| `bg-black/60` | `bg-card/60 dark:bg-black/60` |
| `text-white` | `text-foreground` |
| `text-neutral-400` | `text-muted-foreground` |
| `border-amber-500/20` | `border-primary/20` |

### Index.tsx
A háttér a CityScene3D-ben kerül kezelésre, nincs szükség módosításra.

---

## Végeredmény
- **Dark mód**: Marad a jelenlegi 3D városképes elegáns megjelenés
- **Light mód**: Tiszta, világos, modern megjelenés arany akcentusokkal, átlátható szekciókkal
