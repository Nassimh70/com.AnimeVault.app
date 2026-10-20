/**
 * @param {(string | false | null | undefined)[]} values
 */
export function cn(...values) {
  return values.filter(Boolean).join(' ');
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * @param {number} watched
 * @param {number} total
 */
export function progressPercent(watched, total) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return clamp((watched / total) * 100, 0, 100);
}

/**
 * @param {string | null | undefined} value
 * @param {'short' | 'long'} [style]
 */
export function formatDate(value, style = 'short') {
  if (!value) return '—';
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * @param {string | null | undefined} value
 */
export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * @param {string | null | undefined} value
 */
export function formatRelative(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diff = date.getTime() - Date.now();
  /** @type {{ unit: Intl.RelativeTimeFormatUnit, ms: number }[]} */
  const units = [
    { unit: 'year', ms: 31_536_000_000 },
    { unit: 'month', ms: 2_592_000_000 },
    { unit: 'week', ms: 604_800_000 },
    { unit: 'day', ms: 86_400_000 },
    { unit: 'hour', ms: 3_600_000 },
    { unit: 'minute', ms: 60_000 },
  ];
  const formatter = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });
  for (const { unit, ms } of units) {
    if (Math.abs(diff) >= ms || unit === 'minute') {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }
  return 'à l’instant';
}

/**
 * @param {string} month
 */
export function formatMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber) return month;
  return new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(
    new Date(year, monthNumber - 1, 1)
  );
}

/**
 * @param {number} hours
 */
export function formatHours(hours) {
  const safe = Number.isFinite(hours) ? hours : 0;
  if (safe < 1) return '0 h';
  if (safe < 48) return `${safe} h`;
  const days = Math.floor(safe / 24);
  const rest = safe % 24;
  return rest ? `${days} j ${rest} h` : `${days} j`;
}

/**
 * @param {number} watched
 * @param {number} total
 */
export function formatEpisodes(watched, total) {
  return `${watched} / ${total > 0 ? total : '?'}`;
}

/**
 * @param {number} count
 * @param {string} singular
 * @param {string} [plural]
 */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count > 1 ? plural : singular}`;
}

/**
 * @param {string} name
 */
export function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * @param {string} value
 */
export function splitList(value) {
  const seen = new Set();
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => {
      if (!item) return false;
      const key = item.toLocaleLowerCase('fr');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
