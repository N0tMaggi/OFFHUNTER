import { LocaleData } from './types.js';
import en from './en.js';
import de from './de.js';
import nl from './nl.js';

const SUPPORTED = ['en', 'de', 'nl'] as const;
type SupportedLocale = typeof SUPPORTED[number];

function load(): LocaleData {
  const raw = (process.env['LOCALE'] ?? 'en').toLowerCase();
  if (!(SUPPORTED as readonly string[]).includes(raw)) {
    console.warn(`[i18n] Unknown locale "${raw}", falling back to "en"`);
    return en;
  }
  return { en, de, nl }[raw as SupportedLocale];
}

export const locale = load();
export type { LocaleData };
