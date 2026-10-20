import { useCallback, useEffect, useState } from 'react';
import { api, type AnimeFilters } from '../services/api';
import type { Anime, AnimeInput } from '../types/anime';

export function useAnimes(filters?: AnimeFilters) {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnimes(filters);
      setAnimes(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (data: AnimeInput) => {
    const anime = await api.createAnime(data);
    await refresh();
    return anime;
  }, [refresh]);

  const update = useCallback(async (id: string, data: AnimeInput) => {
    const anime = await api.updateAnime(id, data);
    await refresh();
    return anime;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await api.deleteAnime(id);
    await refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(async (anime: Anime) => {
    await api.updateAnime(anime.id, { isFavorite: !anime.isFavorite } as AnimeInput);
    await refresh();
  }, [refresh]);

  return { animes, loading, error, refresh, create, update, remove, toggleFavorite };
}
