import type { Anime, AnimeInput, Stats } from '../types/anime';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || 'Une erreur est survenue.');
  }
  return json;
}

export interface AnimeFilters {
  search?: string;
  status?: string;
  priority?: string;
  genre?: string;
  studio?: string;
  platform?: string;
  year?: string;
  favorite?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

function buildQuery(filters: AnimeFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function mapJikanResults(items: any[] = []): any[] {
  return items.map((item) => ({
    source: 'Jikan',
    malId: item.mal_id,
    title: item.title,
    titleJapanese: item.title_japanese || '',
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    synopsis: item.synopsis || '',
    genres: (item.genres || []).map((g: any) => g.name),
    studios: (item.studios || []).map((s: any) => s.name),
    episodesTotal: item.episodes || 0,
    episodeDuration: item.duration ? parseInt(item.duration, 10) || 24 : 24,
    rating: item.score || null,
    releaseDate: item.aired?.from ? item.aired.from.split('T')[0] : '',
    season: item.season ? `${item.season} ${item.year || ''}`.trim() : '',
    malLink: item.url || '',
    status: 'a_voir',
  }));
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<i>|<\/i>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function mapAniListResults(items: any[] = []): any[] {
  return items.map((item) => {
    const title = item.title?.english || item.title?.romaji || item.title?.native || 'Anime';
    const seasonYear = item.seasonYear || item.startDate?.year || '';
    const season = item.season ? `${String(item.season).toLowerCase()} ${seasonYear}`.trim() : String(seasonYear || '').trim();

    return {
      source: 'AniList',
      malId: `anilist-${item.id}`,
      title,
      titleJapanese: item.title?.native || '',
      image: item.coverImage?.large || item.coverImage?.extraLarge || '',
      synopsis: stripHtml(item.description || ''),
      genres: item.genres || [],
      studios: item.studios?.nodes?.map((studio: any) => studio.name).filter(Boolean) || [],
      episodesTotal: item.episodes || 0,
      episodeDuration: 24,
      rating: item.averageScore ? Math.round(item.averageScore / 10) : null,
      releaseDate: item.startDate?.year
        ? `${item.startDate.year}-${String(item.startDate.month || 1).padStart(2, '0')}-${String(item.startDate.day || 1).padStart(2, '0')}`
        : '',
      season,
      malLink: item.siteUrl || '',
      status: 'a_voir',
    };
  });
}

export const api = {
  async getAnimes(filters?: AnimeFilters): Promise<Anime[]> {
    const json = await request<{ data: Anime[] }>(`${BASE}/animes${buildQuery(filters)}`);
    return json.data;
  },
  async getAnime(id: string): Promise<Anime> {
    const json = await request<{ data: Anime }>(`${BASE}/animes/${id}`);
    return json.data;
  },
  async createAnime(data: AnimeInput): Promise<Anime> {
    const json = await request<{ data: Anime }>(`${BASE}/animes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return json.data;
  },
  async updateAnime(id: string, data: AnimeInput): Promise<Anime> {
    const json = await request<{ data: Anime }>(`${BASE}/animes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return json.data;
  },
  async updateProgress(id: string, direction: 'increment' | 'decrement'): Promise<Anime> {
    const json = await request<{ data: Anime }>(`${BASE}/animes/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ direction }),
    });
    return json.data;
  },
  async deleteAnime(id: string): Promise<void> {
    await request(`${BASE}/animes/${id}`, { method: 'DELETE' });
  },
  async getStats(): Promise<Stats> {
    const json = await request<{ data: Stats }>(`${BASE}/stats`);
    return json.data;
  },
  async getHistory(): Promise<any[]> {
    const json = await request<{ data: any[] }>(`${BASE}/stats/history`);
    return json.data;
  },
  async searchJikan(q: string): Promise<any[]> {
    try {
      const json = await request<{ data: any[] }>(`${BASE}/jikan/search?q=${encodeURIComponent(q)}`);
      if (json.data?.length) return json.data;
    } catch {
      // On passe directement au fallback public.
    }

    try {
      const response = await fetch(`https://graphql.anilist.co`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          query: `query ($search: String) { Page(page: 1, perPage: 8) { media(search: $search, type: ANIME, sort: POPULARITY_DESC) { id title { romaji english native } coverImage { large extraLarge } description(asHtml: false) genres episodes averageScore seasonYear startDate { year month day } siteUrl studios { nodes { name } } } } }`,
          variables: { search: q },
        }),
      });
      if (!response.ok) return [];
      const json = await response.json();
      return mapAniListResults(json?.data?.Page?.media || []);
    } catch {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=8&order_by=popularity&sfw=true`, {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) return [];
        const json = await response.json();
        return mapJikanResults(json.data || []);
      } catch {
        return [];
      }
    }
  },
  async uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Échec de l'upload.");
    return json.url;
  },
  exportJSONUrl: `${BASE}/export/json`,
  exportCSVUrl: `${BASE}/export/csv`,
  async importJSON(animes: any[]): Promise<{ imported: number; total: number }> {
    return request(`${BASE}/export/import`, { method: 'POST', body: JSON.stringify({ animes }) });
  },
};
