import { search } from 'marktguru';
import { marktguru } from 'marktguru/src/@types/marktguru';
import { DEFAULT_ZIP } from '../config';

export interface SearchParams {
  query: string;
  zipCode?: number;
  allowedRetailers?: string[];
  maxPrice?: number | null;
  limit?: number;
}

export type Offer = marktguru.Offer;

export async function fetchDeals(params: SearchParams): Promise<Offer[]> {
  const results = await search(params.query, {
    zipCode: params.zipCode ?? DEFAULT_ZIP,
    allowedRetailers: params.allowedRetailers as marktguru.Retailer[] | undefined,
    limit: params.limit ?? 50,
  });

  let filtered = results;

  if (params.maxPrice != null) {
    filtered = filtered.filter(o => o.price <= params.maxPrice!);
  }

  return filtered.sort((a, b) => a.price - b.price);
}
