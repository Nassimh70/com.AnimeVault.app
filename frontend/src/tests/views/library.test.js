import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import LibraryView from '@/views/LibraryView.vue';
import { api } from '@/services/api';
import { makeAnime } from '../fixtures/anime';

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/library', component: LibraryView },
      { path: '/anime/:id', component: { template: '<div />' } },
      { path: '/anime/:id/edit', component: { template: '<div />' } },
      { path: '/favorites', component: { template: '<div />' } },
    ],
  });
}

function meta() {
  return {
    genres: [{ name: 'Drama', count: 1 }],
    studios: [{ name: 'Kyoto Animation', count: 1 }],
    tags: [],
    collections: [],
    platforms: ['Crunchyroll'],
    years: [2018],
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(api, 'getMeta').mockResolvedValue(meta());
});

describe('vue Bibliothèque', () => {
  it('affiche un état vide spécifique quand la recherche ne trouve rien', async () => {
    vi.spyOn(api, 'getAnimes').mockResolvedValue({
      success: true,
      data: [],
      count: 0,
      page: 1,
      limit: 18,
      hasMore: false,
    });

    const router = makeRouter();
    await router.push('/library?search=introuvable');
    await router.isReady();

    const wrapper = mount(LibraryView, {
      global: { plugins: [createPinia(), router] },
    });
    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain('Aucun anime ne correspond');
    expect(wrapper.text()).not.toContain('Ta bibliothèque est vide');
    expect(wrapper.text()).toContain('Réinitialiser les filtres');
  });

  it('affiche les cartes et le compteur de résultats', async () => {
    const anime = makeAnime();
    vi.spyOn(api, 'getAnimes').mockResolvedValue({
      success: true,
      data: [anime],
      count: 1,
      page: 1,
      limit: 18,
      hasMore: false,
    });

    const router = makeRouter();
    await router.push('/library');
    await router.isReady();

    const wrapper = mount(LibraryView, {
      global: { plugins: [createPinia(), router] },
    });
    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain('Violet Evergarden');
    expect(wrapper.text()).toContain('1 anime');
    expect(wrapper.text()).toContain('fin de la collection');
    expect(api.getAnimes).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 18, sortBy: 'createdAt', order: 'desc' })
    );
  });
});
