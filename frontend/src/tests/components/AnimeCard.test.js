import { describe, expect, it } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import AnimeCard from '@/components/anime/AnimeCard.vue';
import { makeAnime } from '../fixtures/anime';

const global = { stubs: { RouterLink: RouterLinkStub } };

describe('AnimeCard', () => {
  it('affiche les informations principales et les liens', () => {
    const anime = makeAnime();
    const wrapper = mount(AnimeCard, { props: { anime }, global });

    expect(wrapper.text()).toContain('Violet Evergarden');
    expect(wrapper.text()).toContain('2018');
    expect(wrapper.text()).toContain('Kyoto Animation');
    expect(wrapper.text()).toContain('5 / 13');
    expect(wrapper.text()).toContain('Moyenne');
    expect(wrapper.findAllComponents(RouterLinkStub).length).toBeGreaterThan(0);
  });

  it('émet les actions favori, progression et suppression', async () => {
    const anime = makeAnime();
    const wrapper = mount(AnimeCard, { props: { anime }, global });

    await wrapper.get(`button[aria-label="Ajouter ${anime.title} aux favoris"]`).trigger('click');
    expect(wrapper.emitted('favorite')?.[0]).toEqual([anime]);

    await wrapper.get(`button[aria-label="Ajouter un épisode vu à ${anime.title}"]`).trigger('click');
    expect(wrapper.emitted('progress')?.[0]).toEqual([anime, 'increment']);

    await wrapper.get(`button[aria-label="Supprimer ${anime.title}"]`).trigger('click');
    expect(wrapper.emitted('delete')?.[0]).toEqual([anime]);

    await wrapper.get(`button[aria-label="Retirer un épisode vu à ${anime.title}"]`).trigger('click');
    expect(wrapper.emitted('progress')?.[1]).toEqual([anime, 'decrement']);
  });

  it('désactive l’ajout quand la série est terminée et affiche le favori', () => {
    const anime = makeAnime({ episodesWatched: 13, isFavorite: true, rating: null });
    const wrapper = mount(AnimeCard, { props: { anime }, global });

    const increment = wrapper.get(`button[aria-label="Ajouter un épisode vu à ${anime.title}"]`);
    expect(increment.attributes('disabled')).toBeDefined();
    expect(wrapper.get(`button[aria-label="Retirer ${anime.title} des favoris"]`).attributes('aria-pressed')).toBe('true');
    expect(wrapper.find('.text-amber').exists()).toBe(false);
  });

  it('transmet l’état occupé aux boutons de progression', () => {
    const anime = makeAnime();
    const wrapper = mount(AnimeCard, { props: { anime, busy: true }, global });
    expect(
      wrapper.get(`button[aria-label="Ajouter un épisode vu à ${anime.title}"]`).attributes('disabled')
    ).toBeDefined();
  });
});
