const SL_TZ = 'Asia/Colombo';
const SL_OFFSET = '+05:30';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Parse API report dateTime as Sri Lanka wall-clock time → epoch ms */
export function parseReportDateTime(raw: unknown): number {
  if (!raw) return 0;

  if (Array.isArray(raw)) {
    const [y, mo, d, h = 0, m = 0, s = 0] = raw as number[];
    return new Date(
      `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(m)}:${pad(s)}${SL_OFFSET}`,
    ).getTime();
  }

  if (typeof raw === 'string') {
    const value = raw.trim();
    if (!value) return 0;
    if (value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)) {
      return new Date(value).getTime();
    }
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const withSeconds = normalized.length === 16 ? `${normalized}:00` : normalized;
    return new Date(`${withSeconds}${SL_OFFSET}`).getTime();
  }

  return 0;
}

/** Current Sri Lanka time for Java LocalDateTime (yyyy-MM-ddTHH:mm:ss) */
export function getSriLankaNowForApi(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

export function formatReportDateTime(raw: unknown, unknownLabel = 'Unknown time'): string {
  const ms = parseReportDateTime(raw);
  if (!ms || Number.isNaN(ms)) return unknownLabel;

  return new Date(ms).toLocaleString('en-GB', {
    timeZone: SL_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function minutesSinceReport(raw: unknown): number {
  const ms = parseReportDateTime(raw);
  if (!ms) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - ms) / 60000);
}

export function isWithin24Hours(raw: unknown): boolean {
  const ms = parseReportDateTime(raw);
  if (!ms) return false;
  return Date.now() - ms <= 24 * 60 * 60 * 1000;
}

export function formatReportTimeAgo(
  raw: unknown,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  const diff = minutesSinceReport(raw);
  if (!Number.isFinite(diff)) return '';
  if (diff < 1) return t('common.justNow');
  if (diff < 60) return t('common.minutesAgo', { count: diff });
  return t('common.hoursAgo', { count: Math.floor(diff / 60) });
}
