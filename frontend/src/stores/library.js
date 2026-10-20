import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api } from '@/services/api';

const DEFAULT_LIMIT = 18;

export const useLibraryStore = defineStore('library', () => {
  const animes = ref([]);
  const total = ref(0);
  const hasMore = ref(false);
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref(null);
  const page = ref(1);
  const filters = ref({
    sortBy: 'createdAt',
    order: 'desc',
    limit: DEFAULT_LIMIT,
  });

  const meta = ref(null);
  const metaLoading = ref(false);
  const metaError = ref(null);

  const isEmpty = computed(() => !loading.value && !error.value && animes.value.length === 0);

  /**
   * @param {import('@/types/anime').AnimeFilters} [nextFilters]
   */
  async function fetchAnimes(nextFilters) {
    if (nextFilters) {
      filters.value = { ...filters.value, ...nextFilters, page: 1 };
    }
    loading.value = true;
    error.value = null;
    page.value = 1;
    try {
      const response = await api.getAnimes({ ...filters.value, page: 1, limit: DEFAULT_LIMIT });
      animes.value = response.data;
      total.value = response.count;
      hasMore.value = response.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger la bibliothèque.';
      animes.value = [];
      total.value = 0;
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value || loadingMore.value) return;
    loadingMore.value = true;
    const nextPage = page.value + 1;
    try {
      const response = await api.getAnimes({
        ...filters.value,
        page: nextPage,
        limit: DEFAULT_LIMIT,
      });
      const known = new Set(animes.value.map((anime) => anime.id));
      animes.value.push(...response.data.filter((anime) => !known.has(anime.id)));
      page.value = nextPage;
      hasMore.value = response.hasMore;
      total.value = response.count;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger la suite.';
    } finally {
      loadingMore.value = false;
    }
  }

  /**
   * @param {boolean} [force]
   */
  async function fetchMeta(force = false) {
    if (metaLoading.value || (meta.value && !force)) return;
    metaLoading.value = true;
    metaError.value = null;
    try {
      meta.value = await api.getMeta();
    } catch (err) {
      metaError.value = err instanceof Error ? err.message : 'Filtres indisponibles.';
    } finally {
      metaLoading.value = false;
    }
  }

  /**
   * @param {import('@/types/anime').Anime} updated
   */
  function replaceAnime(updated) {
    const index = animes.value.findIndex((anime) => anime.id === updated.id);
    if (index !== -1) animes.value[index] = updated;
  }

  /**
   * @param {import('@/types/anime').Anime} anime
   */
  async function toggleFavorite(anime) {
    const updated = await api.toggleFavorite(anime.id, !anime.isFavorite);
    replaceAnime(updated);
    return updated;
  }

  /**
   * @param {import('@/types/anime').Anime} anime
   * @param {'increment' | 'decrement'} direction
   */
  async function updateProgress(anime, direction) {
    const updated = await api.updateProgress(anime.id, direction);
    replaceAnime(updated);
    return updated;
  }

  /**
   * @param {import('@/types/anime').Anime} anime
   */
  async function removeAnime(anime) {
    await api.deleteAnime(anime.id);
    animes.value = animes.value.filter((item) => item.id !== anime.id);
    total.value = Math.max(0, total.value - 1);
  }

  function reset() {
    animes.value = [];
    total.value = 0;
    hasMore.value = false;
    page.value = 1;
    error.value = null;
  }

  return {
    animes,
    total,
    hasMore,
    loading,
    loadingMore,
    error,
    page,
    filters,
    meta,
    metaLoading,
    metaError,
    isEmpty,
    fetchAnimes,
    loadMore,
    fetchMeta,
    replaceAnime,
    toggleFavorite,
    updateProgress,
    removeAnime,
    reset,
  };
});
