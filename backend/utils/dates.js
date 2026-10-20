/**
 * Conversions de dates entre MySQL (UTC) et API (ISO 8601 avec Z).
 */
function toIso(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(value)) return new Date(value).toISOString();
    return new Date(`${value.replace(' ', 'T')}Z`).toISOString();
  }
  return null;
}

function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Accepte '', null, une date YYYY-MM-DD ou un datetime ISO.
 * Renvoie null pour une valeur vide, sinon un Date UTC.
 */
function toDbDateTime(value) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return isValidDateOnly(value) ? new Date(`${value}T12:00:00.000Z`) : null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDbDate(value) {
  if (!value) return null;
  return isValidDateOnly(value) ? value : null;
}

module.exports = { toIso, isValidDateOnly, toDbDateTime, toDbDate };
