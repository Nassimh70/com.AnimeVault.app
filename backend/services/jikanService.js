/**
 * Recherche externe : Jikan (MyAnimeList) puis fallback AniList.
 * Tout se passe côté serveur, avec cache mémoire de 10 minutes.
 */
const { AppError } = require('../utils/errors');

const JIKAN_URL = 'https://api.jikan.moe/v4/anime';
const ANILIST_URL = 'https://graphql.anilist.co';
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const REQUEST_TIMEOUT_MS = 10 * 1000;

const cache = new Map();

function cacheKey(query) {
  return query.trim().toLocaleLowerCase('fr');
}

function readCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key, data) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function clearCache() {
  cache.clear();
}

function stripHtml(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&#(\d+);/g, (_, decimal) => {
      const code = Number(decimal);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseDuration(duration) {
  if (!duration || typeof duration !== 'string') return 24;
  const hours = /(\d+)\s*hr/i.exec(duration);
  const minutes = /(\d+)\s*min/i.exec(duration);
  const total = (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
  if (total > 0) return total;
  const fallback = Number.parseInt(duration, 10);
  return Number.isFinite(fallback) && fallback > 0 ? fallback : 24;
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (!value || typeof value !== 'string') continue;
    const key = value.toLocaleLowerCase('fr');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function mapJikanItem(item) {
  return {
    id: `jikan-${item.mal_id}`,
    source: 'Jikan',
    malId: item.mal_id ?? null,
    aniListId: null,
    title: item.title_english || item.title || 'Anime',
    titleJapanese: item.title_japanese || '',
    image:
      item.images?.jpg?.large_image_url ||
      item.images?.webp?.large_image_url ||
      item.images?.jpg?.image_url ||
      '',
    synopsis: stripHtml(item.synopsis || ''),
    genres: uniqueStrings((item.genres || []).map((genre) => genre.name)),
    studios: uniqueStrings((item.studios || []).map((studio) => studio.name)),
    episodesTotal: Number(item.episodes) || 0,
    episodeDuration: parseDuration(item.duration),
    rating: item.score === null || item.score === undefined ? null : Number(item.score),
    releaseDate: item.aired?.from ? String(item.aired.from).slice(0, 10) : '',
    season: item.season ? `${item.season} ${item.year || ''}`.trim() : '',
    malLink: item.url || '',
    aniListLink: '',
    status: 'a_voir',
  };
}

function mapAniListItem(item) {
  const year = item.startDate?.year || item.seasonYear || null;
  const month = item.startDate?.month || null;
  const day = item.startDate?.day || null;
  return {
    id: `anilist-${item.id}`,
    source: 'AniList',
    malId: null,
    aniListId: item.id ?? null,
    title: item.title?.english || item.title?.romaji || item.title?.native || 'Anime',
    titleJapanese: item.title?.native || '',
    image: item.coverImage?.extraLarge || item.coverImage?.large || '',
    synopsis: stripHtml(item.description || ''),
    genres: uniqueStrings(item.genres || []),
    studios: uniqueStrings((item.studios?.nodes || []).map((studio) => studio.name)),
    episodesTotal: Number(item.episodes) || 0,
    episodeDuration: Number(item.duration) || 24,
    rating:
      item.averageScore === null || item.averageScore === undefined
        ? null
        : Math.round((Number(item.averageScore) / 10) * 2) / 2,
    releaseDate: year
      ? `${year}-${String(month || 1).padStart(2, '0')}-${String(day || 1).padStart(2, '0')}`
      : '',
    season: item.season ? `${String(item.season).toLowerCase()} ${year || ''}`.trim() : year ? String(year) : '',
    malLink: '',
    aniListLink: item.siteUrl || '',
    status: 'a_voir',
  };
}

async function fetchJikan(query) {
  const url = `${JIKAN_URL}?q=${encodeURIComponent(query)}&limit=8&order_by=popularity&sfw=true`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'AnimeVault/2.0' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Jikan a répondu ${response.status}`);
  const payload = await response.json();
  return (payload.data || []).map(mapJikanItem);
}

async function fetchAniList(query) {
  const response = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      query: `query ($search: String) {
        Page(page: 1, perPage: 8) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title { romaji english native }
            coverImage { large extraLarge }
            description
            genres
            episodes
            duration
            averageScore
            season
            seasonYear
            startDate { year month day }
            siteUrl
            studios { nodes { name } }
          }
        }
      }`,
      variables: { search: query },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`AniList a répondu ${response.status}`);
  const payload = await response.json();
  return (payload?.data?.Page?.media || []).map(mapAniListItem);
}

async function search(query) {
  const key = cacheKey(query);
  const cached = readCache(key);
  if (cached) return cached;

  let results = [];
  let jikanOk = false;
  let anilistOk = false;

  try {
    results = await fetchJikan(query);
    jikanOk = true;
  } catch {
    jikanOk = false;
  }

  if (results.length === 0) {
    try {
      results = await fetchAniList(query);
      anilistOk = true;
    } catch {
      anilistOk = false;
    }
  }

  if (!jikanOk && !anilistOk) {
    throw new AppError(
      502,
      'La recherche externe est momentanément indisponible. Réessaie dans quelques instants.'
    );
  }

  writeCache(key, results);
  return results;
}

module.exports = { search, clearCache, stripHtml, mapJikanItem, mapAniListItem, parseDuration };
