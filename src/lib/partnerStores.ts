export interface PartnerStore {
  id: string;
  name: string;
  logo: string;
  searchUrl: string;
  color: string;
}

export const PARTNER_STORES: PartnerStore[] = [
  {
    id: "aliexpress",
    name: "AliExpress",
    logo: "https://img.icons8.com/color/96/aliexpress.png",
    searchUrl: "https://aliexpress.com",
    color: "#E43225",
  },
  {
    id: "ebay",
    name: "eBay",
    logo: "https://img.icons8.com/color/96/ebay.png",
    searchUrl: "https://ebay.com",
    color: "#0064D2",
  },
  {
    id: "answear",
    name: "Answear.hu",
    logo: "https://answear.hu/favicon.ico",
    searchUrl: "https://answear.hu",
    color: "#000000",
  },
  {
    id: "geekbuying",
    name: "GeekBuying",
    logo: "https://www.geekbuying.com/favicon.ico",
    searchUrl: "https://www.geekbuying.com",
    color: "#FF6900",
  },
  {
    id: "vitapur",
    name: "Vitapur Europe",
    logo: "https://vitapur.hu/favicon.ico",
    searchUrl: "https://vitapur.hu",
    color: "#2E86C1",
  },
  {
    id: "ledfenyforrasok",
    name: "Ledfenyforrasok.hu",
    logo: "https://ledfenyforrasok.hu/favicon.ico",
    searchUrl: "https://ledfenyforrasok.hu",
    color: "#F1C40F",
  },
];

export function getStoreById(id: string): PartnerStore | undefined {
  return PARTNER_STORES.find((s) => s.id === id);
}
