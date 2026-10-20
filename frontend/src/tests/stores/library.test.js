import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { api } from '@/services/api';
import { useLibraryStore } from '@/stores/library';
import { makeAnime } from '../fixtures/anime';

/**
 * Fabrique une réponse de liste d'animes pour mocker l'API.
 * @param {import('@/types/anime').Anime[]} [data] Éléments de la page.
 * @param {boolean} [hasMore] Indique s'il reste des pages.
 * @returns {object} Réponse simulée.
 */
function listResponse(data = [makeAnime()], hasMore = false) {
  return {
    success: true,
    data,
    count: data.length,
    page: 1,
    limit: 18,
    hasMore,
  };
}

beforeEach(() => {
  setActivePinia(createPinia());
  vi.restoreAllMocks();
});

describe('store de bibliothèque', () => {
  it('charge la première page et expose les compteurs', async () => {
    const getAnimes = vi.spyOn(api, 'getAnimes').mockResolvedValue(listResponse());

    const store = useLibraryStore();
    await store.fetchAnimes({ search: 'violet' });

    expect(getAnimes).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'violet', page: 1, limit: 18 })
    );
    expect(store.animes).toHaveLength(1);
    expect(store.total).toBe(1);
    expect(store.loading).toBe(false);
    expect(store.isEmpty).toBe(false);
  });

  it('réinitialise la page et conserve le tri demandé', async () => {
    const getAnimes = vi.spyOn(api, 'getAnimes').mockResolvedValue(listResponse());
    const store = useLibraryStore();

    await store.fetchAnimes({ sortBy: 'title', order: 'asc' });
    expect(store.filters.sortBy).toBe('title');
    expect(store.filters.order).toBe('asc');

    await store.fetchAnimes({ status: 'termine' });
    expect(store.page).toBe(1);
    expect(getAnimes).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: 'title', order: 'asc', status: 'termine', page: 1 })
    );
  });

  it('ajoute la page suivante sans doublon', async () => {
    const first = makeAnime({ id: 'a', title: 'A' });
    const second = makeAnime({ id: 'b', title: 'B' });
    vi.spyOn(api, 'getAnimes')
      .mockResolvedValueOnce(listResponse([first], true))
      .mockResolvedValueOnce(listResponse([first, second], false));

    const store = useLibraryStore();
    await store.fetchAnimes();
    await store.loadMore();

    expect(store.animes.map((anime) => anime.id)).toEqual(['a', 'b']);
    expect(store.page).toBe(2);
    expect(store.hasMore).toBe(false);
  });

  it('ne charge pas de page supplémentaire quand tout est affiché', async () => {
    const getAnimes = vi.spyOn(api, 'getAnimes').mockResolvedValue(listResponse());
    const store = useLibraryStore();
    await store.fetchAnimes();

    await store.loadMore();
    expect(getAnimes).toHaveBeenCalledTimes(1);
  });

  it('met à jour un favori et remplace l’anime dans la liste', async () => {
    const anime = makeAnime({ isFavorite: false });
    vi.spyOn(api, 'getAnimes').mockResolvedValue(listResponse([anime]));
    vi.spyOn(api, 'toggleFavorite').mockResolvedValue({ ...anime, isFavorite: true });

    const store = useLibraryStore();
    await store.fetchAnimes();
    const updated = await store.toggleFavorite(store.animes[0]);

    expect(updated.isFavorite).toBe(true);
    expect(store.animes[0].isFavorite).toBe(true);
    expect(api.toggleFavorite).toHaveBeenCalledWith('anime-1', true);
  });

  it('met à jour la progression et retire un anime', async () => {
    const anime = makeAnime({ episodesWatched: 5 });
    vi.spyOn(api, 'getAnimes').mockResolvedValue(listResponse([anime]));
    vi.spyOn(api, 'updateProgress').mockResolvedValue({ ...anime, episodesWatched: 6 });
    vi.spyOn(api, 'deleteAnime').mockResolvedValue({ id: anime.id, title: anime.title });

    const store = useLibraryStore();
    await store.fetchAnimes();
    await store.updateProgress(store.animes[0], 'increment');
    expect(store.animes[0].episodesWatched).toBe(6);

    await store.removeAnime(store.animes[0]);
    expect(store.animes).toHaveLength(0);
    expect(store.total).toBe(0);
  });

  it('expose une erreur lisible quand le chargement échoue', async () => {
    vi.spyOn(api, 'getAnimes').mockRejectedValue(new Error('Serveur indisponible'));
    const store = useLibraryStore();

    await store.fetchAnimes();
    expect(store.error).toBe('Serveur indisponible');
    expect(store.animes).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.isEmpty).toBe(false);
  });

  it('met en cache les métadonnées de filtres', async () => {
    const meta = {
      genres: [{ name: 'Drama', count: 2 }],
      studios: [],
      tags: [],
      collections: [],
      platforms: ['Crunchyroll'],
      years: [2020],
    };
    const getMeta = vi.spyOn(api, 'getMeta').mockResolvedValue(meta);
    const store = useLibraryStore();

    await store.fetchMeta();
    await store.fetchMeta();
    expect(getMeta).toHaveBeenCalledTimes(1);
    expect(store.meta?.genres[0].name).toBe('Drama');

    await store.fetchMeta(true);
    expect(getMeta).toHaveBeenCalledTimes(2);
  });
});
