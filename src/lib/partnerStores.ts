// Partner store configurations – only stores with active API/feed integration

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
    logo: "🌍",
    searchUrl: "https://www.aliexpress.com/wholesale?SearchText=",
    color: "#E62E04",
  },
];

export function getStoreById(id: string): PartnerStore | undefined {
  return PARTNER_STORES.find((s) => s.id === id);
}
