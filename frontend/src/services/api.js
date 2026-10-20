const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status = 0, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * @param {import('@/types/anime').AnimeFilters} [filters]
 */
function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Impossible de joindre le serveur. Vérifie qu’il est bien démarré.', 0);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.error || `La requête a échoué (${response.status}).`,
      response.status,
      payload?.details
    );
  }

  return payload ?? undefined;
}

export const api = {
  /**
   * @param {import('@/types/anime').AnimeFilters} [filters]
   */
  getAnimes(filters) {
    return request(`/animes${buildQuery(filters)}`);
  },

  getAllAnimes() {
    return request(`/animes${buildQuery({ limit: 100, sortBy: 'createdAt', order: 'desc' })}`);
  },

  /**
   * @param {string} id
   */
  getAnime(id) {
    return request(`/animes/${id}`).then((result) => result.data);
  },

  /**
   * @param {import('@/types/anime').AnimeInput} data
   */
  createAnime(data) {
    return request('/animes', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((result) => result.data);
  },

  /**
   * @param {string} id
   * @param {import('@/types/anime').AnimeInput} data
   */
  updateAnime(id, data) {
    return request(`/animes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((result) => result.data);
  },

  /**
   * @param {string} id
   */
  deleteAnime(id) {
    return request(`/animes/${id}`, {
      method: 'DELETE',
    }).then((result) => result.data);
  },

  deleteAllAnimes() {
    return request('/animes?confirm=DELETE_ALL', { method: 'DELETE' }).then(
      (result) => result.data
    );
  },

  /**
   * @param {string} id
   * @param {'increment' | 'decrement'} direction
   */
  updateProgress(id, direction) {
    return request(`/animes/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ direction }),
    }).then((result) => result.data);
  },

  /**
   * @param {string} id
   * @param {boolean} [isFavorite]
   */
  toggleFavorite(id, isFavorite) {
    return request(`/animes/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify(isFavorite === undefined ? {} : { isFavorite }),
    }).then((result) => result.data);
  },

  getMeta() {
    return request('/animes/meta').then((result) => result.data);
  },

  getStats() {
    return request('/stats').then((result) => result.data);
  },

  /**
   * @param {number} [limit]
   */
  getHistory(limit = 12) {
    return request(`/stats/history?limit=${limit}`).then((result) => result.data);
  },

  clearHistory() {
    return request('/stats/history?confirm=CLEAR_HISTORY', {
      method: 'DELETE',
    }).then((result) => result.data);
  },

  /**
   * @param {string} id
   * @param {number} [limit]
   */
  getAnimeHistory(id, limit = 20) {
    return request(`/animes/${id}/history?limit=${limit}`).then((result) => result.data);
  },

  /**
   * @param {string} query
   * @param {AbortSignal} [signal]
   */
  searchExternal(query, signal) {
    return request(`/jikan/search?q=${encodeURIComponent(query)}`, { signal }).then(
      (result) => result.data
    );
  },

  /**
   * @param {File} file
   */
  uploadImage(file) {
    const form = new FormData();
    form.append('image', file);
    return request('/upload', { method: 'POST', body: form }).then((result) => result.url);
  },

  getSettings() {
    return request('/settings').then((result) => result.data);
  },

  /**
   * @param {string} displayName
   */
  updateSettings(displayName) {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify({ displayName }),
    }).then((result) => result.data);
  },

  /**
   * @param {unknown[]} animes
   */
  importJSON(animes) {
    return request('/export/import', {
      method: 'POST',
      body: JSON.stringify({ animes }),
    });
  },

  exportJsonUrl: `${BASE}/export/json`,
  exportCsvUrl: `${BASE}/export/csv`,
};

export { buildQuery };
