import { Offer } from '../marktguru/client';

export const ITEMS_PER_PAGE = 5;
const TTL_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 200;

export interface PaginationEntry {
  offers: Offer[];
  query: string;
  zipCode: number;
  retailers?: string[];
  maxPrice: number | null;
  showDealLink: boolean;
  page: number;
  expiresAt: number;
}

const cache = new Map<string, PaginationEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiresAt < now) cache.delete(key);
  }
}, 5 * 60 * 1000).unref();

export function storePagination(key: string, entry: Omit<PaginationEntry, 'expiresAt'>): void {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { ...entry, expiresAt: Date.now() + TTL_MS });
}

export function getPagination(key: string): PaginationEntry | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) { cache.delete(key); return undefined; }
  return entry;
}

export function updatePaginationPage(key: string, page: number): void {
  const entry = cache.get(key);
  if (entry) entry.page = page;
}
