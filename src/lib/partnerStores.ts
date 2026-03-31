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
    logo: "https://www.google.com/s2/favicons?domain=answear.hu&sz=64",
    searchUrl: "https://www.dpbolvw.net/click-101662668-13738390?url=https%3A%2F%2Fanswear.hu",
    color: "#000000",
  },
  {
    id: "geekbuying",
    name: "GeekBuying",
    logo: "https://www.google.com/s2/favicons?domain=geekbuying.com&sz=64",
    searchUrl: "https://www.anrdoezrs.net/click-101662668-16996119?url=https%3A%2F%2Fwww.geekbuying.com",
    color: "#FF6700",
  },
  {
    id: "vitapur",
    name: "Vitapur",
    logo: "https://www.google.com/s2/favicons?domain=vitapur.hu&sz=64",
    searchUrl: "https://www.jdoqocy.com/click-101662668-17237823?url=https%3A%2F%2Fvitapur.hu",
    color: "#1A5632",
  },
  {
    id: "notino",
    name: "Notino.hu",
    logo: "https://www.google.com/s2/favicons?domain=notino.hu&sz=64",
    searchUrl: "https://www.dpbolvw.net/click-101662668-13416270?url=https%3A%2F%2Fwww.notino.hu",
    color: "#E91E8C",
  },
  {
    id: "ledfenyforrasok",
    name: "LED Fény",
    logo: "https://www.google.com/s2/favicons?domain=ledfenyforrasok.hu&sz=64",
    searchUrl: "https://tc.tradetracker.net/?c=29508&m=1498395&a=507493&r=&u=https%3A%2F%2Fledfenyforrasok.hu",
    color: "#F1C40F",
  },
  {
    id: "douglas",
    name: "Douglas",
    logo: "https://www.google.com/s2/favicons?domain=douglas.hu&sz=64",
    searchUrl: "https://www.douglas.hu",
    color: "#000000",
  },
  {
    id: "vivantis",
    name: "Vivantis",
    logo: "https://www.google.com/s2/favicons?domain=vivantis.hu&sz=64",
    searchUrl: "https://www.vivantis.hu",
    color: "#C8102E",
  },
  {
    id: "lego",
    name: "LEGO",
    logo: "https://www.google.com/s2/favicons?domain=lego.com&sz=64",
    searchUrl: "https://www.lego.com",
    color: "#FFCF00",
  },
  {
    id: "elisdesign",
    name: "ElisDesign",
    logo: "https://www.google.com/s2/favicons?domain=elisdesign.cz&sz=64",
    searchUrl: "https://www.elisdesign.cz",
    color: "#2C2C2C",
  },
  {
    id: "trotec",
    name: "Trotec",
    logo: "https://www.google.com/s2/favicons?domain=trotec.com&sz=64",
    searchUrl: "https://www.trotec.com",
    color: "#003366",
  },
  {
    id: "spartoo",
    name: "Spartoo.hu",
    logo: "https://www.google.com/s2/favicons?domain=spartoo.hu&sz=64",
    searchUrl: "https://www.spartoo.hu/tt/?tt=23572_949622_507493_",
    color: "#E74C3C",
  },
  {
    id: "nutraceutics",
    name: "Nutraceutics",
    logo: "https://www.google.com/s2/favicons?domain=nutraceutics.hu&sz=64",
    searchUrl: "https://www.anrdoezrs.net/click-101662668-15067062?url=https%3A%2F%2Fwww.nutraceutics.hu",
    color: "#1B5E20",
  },
  {
    id: "pandahall",
    name: "PandaHall",
    logo: "https://www.google.com/s2/favicons?domain=pandahall.com&sz=64",
    searchUrl: "https://www.tkqlhce.com/click-101662668-15609730?url=https%3A%2F%2Fwww.pandahall.com",
    color: "#E91E63",
  },
  {
    id: "alza",
    name: "Alza.hu",
    logo: "https://www.google.com/s2/favicons?domain=alza.hu&sz=64",
    searchUrl: "https://tracking.affiliateport.eu/click?o=1710&a=8341&deep_link=https%3A%2F%2Fwww.alza.hu",
    color: "#00A0E2",
  },
  {
    id: "brasty",
    name: "Brasty.hu",
    logo: "https://www.google.com/s2/favicons?domain=brasty.hu&sz=64",
    searchUrl: "https://tracking.affiliateport.eu/click?o=1115&a=8341&deep_link=https%3A%2F%2Fwww.brasty.hu",
    color: "#8B0000",
  },
  {
    id: "goldentree",
    name: "Golden Tree",
    logo: "https://www.google.com/s2/favicons?domain=goldentree.hu&sz=64",
    searchUrl: "https://goldentree.hu",
    color: "#2E7D32",
  },
];

export function getStoreById(id: string): PartnerStore | undefined {
  return PARTNER_STORES.find((s) => s.id === id);
}
