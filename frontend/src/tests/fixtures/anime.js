/**
 * Fabrique un anime de test complet, surchargeable partiellement.
 * @param {Partial<import('@/types/anime').Anime>} [overrides] Champs à surcharger.
 * @returns {import('@/types/anime').Anime} Anime de test.
 */
export function makeAnime(overrides = {}) {
  return {
    id: 'anime-1',
    title: 'Violet Evergarden',
    titleJapanese: 'ヴァイオレット・エヴァーガーデン',
    image: 'https://example.test/cover.jpg',
    synopsis: 'Une histoire de lettres et de sentiments.',
    genres: ['Drama', 'Fantasy'],
    studios: ['Kyoto Animation'],
    author: '',
    episodesTotal: 13,
    episodesWatched: 5,
    episodeDuration: 24,
    releaseDate: '2018-01-11',
    season: '2018',
    status: 'en_cours',
    rating: 9,
    comment: '',
    priority: 'moyenne',
    platform: 'Crunchyroll',
    language: 'VOSTFR',
    malLink: 'https://example.test/mal',
    aniListLink: 'https://example.test/anilist',
    isFavorite: false,
    tags: [],
    collections: [],
    dateAdded: '2026-01-01T10:00:00.000Z',
    dateFinished: null,
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    ...overrides,
  };
}
