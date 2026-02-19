// Partner store configurations – placeholder until new backend API is connected
// Will be populated from POST /api/search responses

export interface PartnerStore {
  id: string;
  name: string;
  logo: string;
  searchUrl: string;
  color: string;
}

export const PARTNER_STORES: PartnerStore[] = [];

export function getStoreById(id: string): PartnerStore | undefined {
  return PARTNER_STORES.find((s) => s.id === id);
}
