import { LocaleData } from './types';

const SUPPORTED = ['en', 'de', 'nl'] as const;
type SupportedLocale = typeof SUPPORTED[number];

function load(): LocaleData {
  const raw = (process.env['LOCALE'] ?? 'en').toLowerCase();
  if (!(SUPPORTED as readonly string[]).includes(raw)) {
    console.warn(`[i18n] Unknown locale "${raw}", falling back to "en"`);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./en').default as LocaleData;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(`./${raw as SupportedLocale}`).default as LocaleData;
}

export const locale = load();
export type { LocaleData };
