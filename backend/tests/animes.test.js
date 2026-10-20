const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const {
  setupTestDatabase,
  resetDatabase,
  closeTestDatabase,
  cleanUploads,
} = require('./helpers');
const app = require('../app');
const database = require('../config/database');

async function createAnime(payload = {}) {
  const response = await request(app)
    .post('/api/animes')
    .send({ title: 'Anime test', releaseDate: '2024-01-01', ...payload });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body.data;
}

describe('API AnimeVault — animes, progression, favoris, historique', () => {
  before(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
    await cleanUploads();
  });

  after(async () => {
    await closeTestDatabase();
  });

  describe('santé', () => {
    it('renvoie 200 quand la base répond', async () => {
      const response = await request(app).get('/api/health');
      assert.equal(response.status, 200);
      assert.equal(response.body.success, true);
      assert.equal(response.body.database, 'ok');
    });

    it('renvoie 503 quand la base est indisponible', async () => {
      const originalPing = database.ping;
      database.ping = async () => {
        throw new Error('base coupée');
      };
      try {
        const response = await request(app).get('/api/health');
        assert.equal(response.status, 503);
        assert.equal(response.body.success, false);
      } finally {
        database.ping = originalPing;
      }
    });

    it('renvoie 404 en JSON pour une route inconnue', async () => {
      const response = await request(app).get('/api/inconnue');
      assert.equal(response.status, 404);
      assert.equal(response.body.success, false);
    });
  });

  describe('création', () => {
    it('crée un anime avec les valeurs par défaut et une entrée d’historique', async () => {
      const anime = await createAnime({ title: 'Minimal' });
      assert.equal(anime.status, 'a_voir');
      assert.equal(anime.priority, 'moyenne');
      assert.equal(anime.language, 'VOSTFR');
      assert.equal(anime.episodeDuration, 24);
      assert.equal(anime.rating, null);
      assert.deepEqual(anime.genres, []);
      assert.ok(anime.id);
      assert.ok(anime.dateAdded);

      const history = await request(app).get(`/api/animes/${anime.id}/history`);
      assert.equal(history.status, 200);
      assert.equal(history.body.data.length, 1);
      assert.equal(history.body.data[0].action, 'ajout');
    });

    it('normalise les listes et ignore les champs inconnus', async () => {
      const anime = await createAnime({
        title: 'Complet',
        genres: [' Action ', 'action', 'Drame', ''],
        studios: ['MAPPA'],
        tags: [' Chef-d’œuvre ', 'chef-d’œuvre'],
        collections: ['Top 2024'],
        episodesTotal: 12,
        episodesWatched: 12,
        rating: 9.5,
        releaseDate: '2024-04-01',
        isFavorite: true,
        champInconnu: 'ignoré',
        id: '00000000-0000-4000-8000-000000000000',
      });
      assert.deepEqual(anime.genres, ['Action', 'Drame']);
      assert.deepEqual(anime.tags, ['Chef-d’œuvre']);
      assert.deepEqual(anime.collections, ['Top 2024']);
      assert.equal(anime.rating, 9.5);
      assert.equal(anime.isFavorite, true);
      assert.notEqual(anime.id, '00000000-0000-4000-8000-000000000000');
      assert.equal(anime.champInconnu, undefined);
    });

    it('refuse un titre vide avec un détail de validation', async () => {
      const response = await request(app).post('/api/animes').send({ title: '   ' });
      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
      assert.ok(response.body.details.some((detail) => detail.field === 'title'));
    });

    it('refuse une note hors bornes', async () => {
      const response = await request(app).post('/api/animes').send({ title: 'Note', rating: 11 });
      assert.equal(response.status, 400);
    });

    it('refuse un doublon titre + date de sortie', async () => {
      await createAnime({ title: 'Doublon', releaseDate: '2020-01-01' });
      const response = await request(app)
        .post('/api/animes')
        .send({ title: 'doublon', releaseDate: '2020-01-01' });
      assert.equal(response.status, 409);
    });
  });

  describe('lecture, filtres, tri et pagination', () => {
    let titans;
    let pokemon;
    let bebop;

    beforeEach(async () => {
      titans = await createAnime({
        title: 'L’Attaque des Titans',
        titleJapanese: 'Shingeki no Kyojin',
        status: 'termine',
        priority: 'haute',
        rating: 9.5,
        genres: ['Action', 'Drame'],
        studios: ['WIT Studio'],
        platform: 'Crunchyroll',
        releaseDate: '2013-04-07',
        isFavorite: true,
        episodesTotal: 25,
        episodesWatched: 25,
      });
      pokemon = await createAnime({
        title: 'Pokémon',
        titleJapanese: 'ポケットモンスター',
        status: 'en_cours',
        priority: 'moyenne',
        rating: 7,
        genres: ['Aventure'],
        studios: ['OLM'],
        platform: 'Netflix',
        releaseDate: '1997-04-01',
        episodesTotal: 20,
        episodesWatched: 5,
      });
      bebop = await createAnime({
        title: 'Cowboy Bebop',
        status: 'a_voir',
        priority: 'faible',
        genres: ['Action'],
        studios: ['Sunrise'],
        releaseDate: '1998-04-03',
        episodesTotal: 26,
      });
    });

    it('renvoie le détail d’un anime et 404 si absent', async () => {
      const response = await request(app).get(`/api/animes/${titans.id}`);
      assert.equal(response.status, 200);
      assert.deepEqual(response.body.data.genres, ['Action', 'Drame']);
      assert.deepEqual(response.body.data.studios, ['WIT Studio']);

      const missing = await request(app).get('/api/animes/00000000-0000-4000-8000-000000000000');
      assert.equal(missing.status, 404);

      const invalid = await request(app).get('/api/animes/pas-un-uuid');
      assert.equal(invalid.status, 400);
    });

    it('recherche sans tenir compte de la casse ni des accents', async () => {
      const titansSearch = await request(app).get('/api/animes?search=attaque');
      assert.equal(titansSearch.body.count, 1);
      assert.equal(titansSearch.body.data[0].id, titans.id);

      const pokemonSearch = await request(app).get('/api/animes?search=pokemon');
      assert.equal(pokemonSearch.body.count, 1);
      assert.equal(pokemonSearch.body.data[0].id, pokemon.id);

      const studioSearch = await request(app).get('/api/animes?search=sunrise');
      assert.equal(studioSearch.body.count, 1);
      assert.equal(studioSearch.body.data[0].id, bebop.id);
    });

    it('échappe les jokers LIKE et les injections SQL', async () => {
      const wildcard = await request(app).get('/api/animes?search=%25');
      assert.equal(wildcard.body.count, 0);

      const injection = await request(app).get(
        `/api/animes?search=${encodeURIComponent("' OR 1=1 -- ")}`
      );
      assert.equal(injection.status, 200);
      assert.equal(injection.body.count, 0);

      const sortInjection = await request(app).get('/api/animes?sortBy=title%3BDROP%20TABLE%20animes');
      assert.equal(sortInjection.status, 400);
      const stillThere = await request(app).get('/api/animes');
      assert.equal(stillThere.body.count, 3);
    });

    it('filtre par statut, priorité, genre, studio, plateforme, année et favori', async () => {
      const cases = [
        ['status=termine', titans.id],
        ['priority=haute', titans.id],
        ['genre=Action', null],
        ['studio=OLM', pokemon.id],
        ['platform=Netflix', pokemon.id],
        ['year=1998', bebop.id],
        ['favorite=true', titans.id],
      ];
      for (const [query, expectedId] of cases) {
        const response = await request(app).get(`/api/animes?${query}`);
        assert.equal(response.status, 200, query);
        if (expectedId) {
          assert.equal(response.body.count, 1, query);
          assert.equal(response.body.data[0].id, expectedId, query);
        } else {
          assert.equal(response.body.count, 2, query);
        }
      }
    });

    it('trie les priorités selon l’ordre métier haute > moyenne > faible', async () => {
      const response = await request(app).get('/api/animes?sortBy=priority&order=asc');
      assert.equal(response.status, 200);
      assert.deepEqual(
        response.body.data.map((anime) => anime.priority),
        ['haute', 'moyenne', 'faible']
      );
    });

    it('trie par note décroissante avec les valeurs nulles en dernier', async () => {
      const response = await request(app).get('/api/animes?sortBy=rating&order=desc');
      assert.deepEqual(
        response.body.data.map((anime) => anime.rating),
        [9.5, 7, null]
      );
    });

    it('pagine côté serveur', async () => {
      const page1 = await request(app).get('/api/animes?limit=2&page=1&sortBy=title&order=asc');
      assert.equal(page1.status, 200);
      assert.equal(page1.body.count, 3);
      assert.equal(page1.body.data.length, 2);
      assert.equal(page1.body.hasMore, true);
      assert.equal(page1.body.page, 1);
      assert.equal(page1.body.limit, 2);

      const page2 = await request(app).get('/api/animes?limit=2&page=2&sortBy=title&order=asc');
      assert.equal(page2.body.data.length, 1);
      assert.equal(page2.body.hasMore, false);
    });

    it('refuse une pagination hors bornes', async () => {
      assert.equal((await request(app).get('/api/animes?limit=101')).status, 400);
      assert.equal((await request(app).get('/api/animes?page=0')).status, 400);
    });

    it('expose les métadonnées de filtres', async () => {
      const response = await request(app).get('/api/animes/meta');
      assert.equal(response.status, 200);
      const genres = response.body.data.genres.find((genre) => genre.name === 'Action');
      assert.equal(genres.count, 2);
      assert.ok(response.body.data.platforms.includes('Netflix'));
      assert.ok(response.body.data.years.includes(2013));
      assert.ok(response.body.data.studios.some((studio) => studio.name === 'OLM'));
    });
  });

  describe('mise à jour', () => {
    it('met à jour partiellement sans écraser les autres champs', async () => {
      const anime = await createAnime({
        title: 'Partiel',
        genres: ['Action'],
        rating: 8,
        status: 'en_cours',
      });
      const response = await request(app).put(`/api/animes/${anime.id}`).send({ title: 'Renommé' });
      assert.equal(response.status, 200);
      assert.equal(response.body.data.title, 'Renommé');
      assert.equal(response.body.data.rating, 8);
      assert.equal(response.body.data.status, 'en_cours');
      assert.deepEqual(response.body.data.genres, ['Action']);
    });

    it('passe en terminé avec une date de fin posée une seule fois', async () => {
      const anime = await createAnime({ title: 'À finir', status: 'en_cours' });
      const first = await request(app)
        .put(`/api/animes/${anime.id}`)
        .send({ status: 'termine', dateFinished: '' });
      assert.equal(first.status, 200);
      assert.equal(first.body.data.status, 'termine');
      assert.ok(first.body.data.dateFinished);
      const finishedAt = first.body.data.dateFinished;

      const second = await request(app)
        .put(`/api/animes/${anime.id}`)
        .send({ status: 'termine', dateFinished: '' });
      assert.equal(second.body.data.dateFinished, finishedAt);

      const history = await request(app).get(`/api/animes/${anime.id}/history`);
      assert.equal(history.body.data.filter((entry) => entry.action === 'termine').length, 1);
    });

    it('efface la date de fin quand le statut quitte terminé', async () => {
      const anime = await createAnime({ title: 'Reprise', status: 'termine' });
      assert.ok(anime.dateFinished);
      const response = await request(app)
        .put(`/api/animes/${anime.id}`)
        .send({ status: 'en_cours' });
      assert.equal(response.status, 200);
      assert.equal(response.body.data.dateFinished, null);
    });

    it('remplace et vide les relations', async () => {
      const anime = await createAnime({ title: 'Relations', genres: ['Action'], studios: ['OLM'] });
      const updated = await request(app)
        .put(`/api/animes/${anime.id}`)
        .send({ genres: ['Drame', 'Romance'], studios: [] });
      assert.deepEqual(updated.body.data.genres, ['Drame', 'Romance']);
      assert.deepEqual(updated.body.data.studios, []);
    });

    it('refuse un doublon lors du renommage', async () => {
      await createAnime({ title: 'Premier', releaseDate: '2020-01-01' });
      const second = await createAnime({ title: 'Second', releaseDate: '2021-01-01' });
      const response = await request(app)
        .put(`/api/animes/${second.id}`)
        .send({ title: 'Premier', releaseDate: '2020-01-01' });
      assert.equal(response.status, 409);
    });

    it('renvoie 404 pour un anime inexistant', async () => {
      const response = await request(app)
        .put('/api/animes/00000000-0000-4000-8000-000000000000')
        .send({ title: 'Fantôme' });
      assert.equal(response.status, 404);
    });
  });

  describe('progression', () => {
    it('applique les règles de statut et de date de fin', async () => {
      const anime = await createAnime({
        title: 'Progression',
        status: 'a_voir',
        episodesTotal: 2,
        episodesWatched: 0,
      });

      const step1 = await request(app)
        .patch(`/api/animes/${anime.id}/progress`)
        .send({ direction: 'increment' });
      assert.equal(step1.body.data.status, 'en_cours');
      assert.equal(step1.body.data.episodesWatched, 1);
      assert.equal(step1.body.data.dateFinished, null);

      const step2 = await request(app)
        .patch(`/api/animes/${anime.id}/progress`)
        .send({ direction: 'increment' });
      assert.equal(step2.body.data.status, 'termine');
      assert.equal(step2.body.data.episodesWatched, 2);
      assert.ok(step2.body.data.dateFinished);
      const finishedAt = step2.body.data.dateFinished;

      const step3 = await request(app)
        .patch(`/api/animes/${anime.id}/progress`)
        .send({ direction: 'increment' });
      assert.equal(step3.body.data.episodesWatched, 2);
      assert.equal(step3.body.data.dateFinished, finishedAt);

      const step4 = await request(app)
        .patch(`/api/animes/${anime.id}/progress`)
        .send({ direction: 'decrement' });
      assert.equal(step4.body.data.status, 'en_cours');
      assert.equal(step4.body.data.episodesWatched, 1);
      assert.equal(step4.body.data.dateFinished, null);
    });

    it('borne la progression entre 0 et le total', async () => {
      const anime = await createAnime({ title: 'Bornes', episodesTotal: 3 });
      const direct = await request(app)
        .patch(`/api/animes/${anime.id}/progress`)
        .send({ episodesWatched: 99 });
      assert.equal(direct.body.data.episodesWatched, 3);
      assert.equal(direct.body.data.status, 'termine');

      const lower = await request(app)
        .patch(`/api/animes/${anime.id}/progress`)
        .send({ episodesWatched: 0 });
      assert.equal(lower.body.data.episodesWatched, 0);
      assert.equal(lower.body.data.status, 'en_cours');
    });

    it('sérialise les incréments concurrents', async () => {
      const anime = await createAnime({ title: 'Concurrent', episodesTotal: 10 });
      await Promise.all(
        Array.from({ length: 5 }, () =>
          request(app).patch(`/api/animes/${anime.id}/progress`).send({ direction: 'increment' })
        )
      );
      const response = await request(app).get(`/api/animes/${anime.id}`);
      assert.equal(response.body.data.episodesWatched, 5);
    });

    it('refuse une direction invalide', async () => {
      const anime = await createAnime({ title: 'Direction' });
      const response = await request(app)
        .patch(`/api/animes/${anime.id}/progress`)
        .send({ direction: 'sideways' });
      assert.equal(response.status, 400);
    });

    it('écrit une entrée de progression avec le détail', async () => {
      const anime = await createAnime({ title: 'Détail', episodesTotal: 5 });
      await request(app).patch(`/api/animes/${anime.id}/progress`).send({ direction: 'increment' });
      const history = await request(app).get(`/api/animes/${anime.id}/history`);
      assert.equal(history.body.data[0].action, 'progression');
      assert.match(history.body.data[0].details, /Épisode 1\/5/);
    });
  });

  describe('favoris', () => {
    it('bascule le favori sans créer d’entrée d’historique', async () => {
      const anime = await createAnime({ title: 'Favori' });
      const before = await request(app).get(`/api/animes/${anime.id}/history`);

      const toggled = await request(app).patch(`/api/animes/${anime.id}/favorite`).send({});
      assert.equal(toggled.body.data.isFavorite, true);

      const explicit = await request(app)
        .patch(`/api/animes/${anime.id}/favorite`)
        .send({ isFavorite: false });
      assert.equal(explicit.body.data.isFavorite, false);

      const after = await request(app).get(`/api/animes/${anime.id}/history`);
      assert.equal(after.body.data.length, before.body.data.length);
    });
  });

  describe('suppression et historique', () => {
    it('supprime un anime en conservant son historique', async () => {
      const anime = await createAnime({ title: 'À supprimer' });
      const response = await request(app).delete(`/api/animes/${anime.id}`);
      assert.equal(response.status, 200);

      const missing = await request(app).get(`/api/animes/${anime.id}`);
      assert.equal(missing.status, 404);

      const history = await request(app).get('/api/stats/history?limit=200');
      const deletion = history.body.data.find((entry) => entry.action === 'suppression');
      assert.ok(deletion);
      assert.equal(deletion.animeId, null);
      assert.equal(deletion.animeTitle, 'À supprimer');
    });

    it('refuse la suppression totale sans confirmation exacte', async () => {
      await createAnime({ title: 'Protégé' });
      assert.equal((await request(app).delete('/api/animes')).status, 400);
      assert.equal((await request(app).delete('/api/animes?confirm=SUPPRIMER')).status, 400);
      const list = await request(app).get('/api/animes');
      assert.equal(list.body.count, 1);
    });

    it('supprime toute la bibliothèque avec la confirmation', async () => {
      await createAnime({ title: 'A' });
      await createAnime({ title: 'B', releaseDate: '2020-01-01' });
      const response = await request(app).delete('/api/animes?confirm=DELETE_ALL');
      assert.equal(response.status, 200);
      assert.equal(response.body.data.deleted, 2);

      const list = await request(app).get('/api/animes');
      assert.equal(list.body.count, 0);

      const history = await request(app).get('/api/stats/history?limit=200');
      assert.ok(history.body.data.length >= 2);
      assert.ok(history.body.data.every((entry) => entry.animeId === null));
    });
  });

  describe('réglages', () => {
    it('lit et met à jour le nom affiché', async () => {
      const initial = await request(app).get('/api/settings');
      assert.equal(initial.body.data.displayName, 'Nassim');

      const updated = await request(app).put('/api/settings').send({ displayName: '  Camille  ' });
      assert.equal(updated.status, 200);
      assert.equal(updated.body.data.displayName, 'Camille');

      const reread = await request(app).get('/api/settings');
      assert.equal(reread.body.data.displayName, 'Camille');
    });

    it('refuse un nom vide ou trop long', async () => {
      assert.equal((await request(app).put('/api/settings').send({ displayName: '' })).status, 400);
      assert.equal(
        (await request(app).put('/api/settings').send({ displayName: 'x'.repeat(41) })).status,
        400
      );
    });
  });

  describe('statistiques', () => {
    it('agrège les données et l’activité mensuelle', async () => {
      const first = await createAnime({
        title: 'Stats A',
        status: 'termine',
        episodesTotal: 12,
        episodesWatched: 12,
        episodeDuration: 24,
        rating: 8,
        genres: ['Action'],
        studios: ['OLM'],
        isFavorite: true,
      });
      await createAnime({
        title: 'Stats B',
        status: 'en_cours',
        episodesTotal: 24,
        episodesWatched: 6,
        episodeDuration: 20,
        genres: ['Action', 'Drame'],
        studios: ['MAPPA'],
        releaseDate: '2020-01-01',
      });
      await request(app).patch(`/api/animes/${first.id}/favorite`).send({ isFavorite: true });

      const response = await request(app).get('/api/stats');
      assert.equal(response.status, 200);
      const stats = response.body.data;
      assert.equal(stats.total, 2);
      assert.equal(stats.termine, 1);
      assert.equal(stats.enCours, 1);
      assert.equal(stats.aVoir, 0);
      assert.equal(stats.totalEpisodesWatched, 18);
      assert.equal(stats.totalMinutesWatched, 408);
      assert.equal(stats.totalHoursWatched, 7);
      assert.equal(stats.remainingEpisodes, 18);
      assert.equal(stats.favoriteCount, 1);
      assert.equal(stats.genreDistribution[0].name, 'Action');
      assert.equal(stats.genreDistribution[0].value, 2);
      assert.equal(stats.ratingDistribution.length, 11);
      assert.equal(stats.ratingDistribution[8].count, 1);
      assert.equal(stats.monthlyActivity.length, 12);
      assert.ok(stats.lastAdded);
    });

    it('filtre l’historique par anime et par limite', async () => {
      const anime = await createAnime({ title: 'Historique' });
      await request(app).patch(`/api/animes/${anime.id}/progress`).send({ direction: 'increment' });

      const filtered = await request(app).get(`/api/stats/history?animeId=${anime.id}&limit=1`);
      assert.equal(filtered.status, 200);
      assert.equal(filtered.body.data.length, 1);
      assert.equal(filtered.body.data[0].animeId, anime.id);

      const invalid = await request(app).get('/api/stats/history?limit=201');
      assert.equal(invalid.status, 400);
    });

    it('vide l’historique uniquement avec la confirmation', async () => {
      await createAnime({ title: 'À vider' });
      assert.equal((await request(app).delete('/api/stats/history')).status, 400);
      assert.equal((await request(app).delete('/api/stats/history?confirm=NOPE')).status, 400);

      const cleared = await request(app).delete('/api/stats/history?confirm=CLEAR_HISTORY');
      assert.equal(cleared.status, 200);
      assert.ok(cleared.body.data.deleted >= 1);

      const history = await request(app).get('/api/stats/history');
      assert.equal(history.body.data.length, 0);
    });
  });
});
