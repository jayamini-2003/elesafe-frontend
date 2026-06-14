import type { Locale, TranslationParams } from './types';
import { en, type TranslationTree } from './translations/en';
import { si } from './translations/si';

const catalogs: Record<Locale, TranslationTree> = { en, si };

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === 'string' ? value : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: TranslationParams,
): string {
  const raw = getNestedValue(catalogs[locale] as unknown as Record<string, unknown>, key)
    ?? getNestedValue(en as unknown as Record<string, unknown>, key)
    ?? key;

  if (!params) return raw;

  return Object.entries(params).reduce(
    (text, [name, value]) => text.replaceAll(`{{${name}}}`, String(value)),
    raw,
  );
}

export function localizeGpsError(message: string, t: (key: string) => string): string {
  if (message.includes('permission denied') || message.includes('Allow location access')) {
    return t('gps.permissionDenied');
  }
  if (message.includes('services are off') || message.includes('enable GPS')) {
    return t('gps.servicesOff');
  }
  if (message.includes('timed out') || message.includes('Move outdoors')) {
    return t('gps.timeout');
  }
  return t('gps.unknown');
}

export { en, si };
export type { Locale, TranslationParams, TranslationTree };
