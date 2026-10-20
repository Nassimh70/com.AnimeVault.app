import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, buildQuery } from '@/services/api';
import { makeAnime } from '../fixtures/anime';

/**
 * Fabrique une fausse Response JSON pour mocker fetch.
 * @param {*} payload Corps de la réponse.
 * @param {number} [status] Code HTTP.
 * @returns {Response} Fausse Response.
 */
function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => payload,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('client API', () => {
  it('construit une query string en ignorant les valeurs vides', () => {
    expect(buildQuery({ search: 'WIT Studio', page: 2, status: '', favorite: true })).toBe(
      '?search=WIT+Studio&page=2&favorite=true'
    );
    expect(buildQuery({})).toBe('');
    expect(buildQuery()).toBe('');
  });

  it('encode correctement les filtres spéciaux', () => {
    expect(buildQuery({ search: 'L’Attaque des Titans', genre: 'Science-Fiction' })).toBe(
      '?search=L%E2%80%99Attaque+des+Titans&genre=Science-Fiction'
    );
  });

  it('récupère la liste des animes et transmet les filtres', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        success: true,
        data: [makeAnime()],
        count: 1,
        page: 1,
        limit: 18,
        hasMore: false,
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.getAnimes({ status: 'en_cours', limit: 18 });
    expect(result.count).toBe(1);
    expect(result.data[0].title).toBe('Violet Evergarden');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/animes?status=en_cours&limit=18',
      expect.objectContaining({ headers: expect.any(Headers) })
    );
  });

  it('crée un anime en JSON', async () => {
    const anime = makeAnime();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: anime }, 201));
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.createAnime({ title: anime.title, genres: ['Drama'] });
    expect(result.id).toBe('anime-1');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers).toBeInstanceOf(Headers);
    expect(options.headers.get('Content-Type')).toBe('application/json');
    expect(options.body).toBe(JSON.stringify({ title: 'Violet Evergarden', genres: ['Drama'] }));
  });

  it('lève une ApiError avec le message et les détails du serveur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { success: false, error: 'Titre déjà utilisé.', details: [{ path: 'title' }] },
          409
        )
      )
    );

    await expect(api.createAnime({ title: 'Doublon' })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Titre déjà utilisé.',
      status: 409,
      details: [{ path: 'title' }],
    });
  });

  it('traduit une panne réseau en message lisible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(api.getStats()).rejects.toEqual(
      expect.objectContaining({
        name: 'ApiError',
        status: 0,
        message: 'Impossible de joindre le serveur. Vérifie qu’il est bien démarré.',
      })
    );
  });

  it('remonte le statut HTTP quand le corps n’est pas JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        json: async () => null,
      })
    );

    await expect(api.getAnime('abc')).rejects.toBeInstanceOf(ApiError);
    await expect(api.getAnime('abc')).rejects.toMatchObject({ status: 500 });
  });

  it('envoie les fichiers via FormData sans forcer le Content-Type', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ success: true, url: '/uploads/cover.png' }));
    vi.stubGlobal('fetch', fetchMock);

    const file = new File(['png'], 'cover.png', { type: 'image/png' });
    await expect(api.uploadImage(file)).resolves.toBe('/uploads/cover.png');

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.headers.get('Content-Type')).toBeNull();
  });
});
