const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../app');
const jikanService = require('../services/jikanService');

const originalFetch = global.fetch;

function jikanPayload() {
  return {
    data: [
      {
        mal_id: 16498,
        title: 'Shingeki no Kyojin',
        title_english: 'Attack on Titan',
        title_japanese: '進撃の巨人',
        images: { jpg: { large_image_url: 'https://cdn.example/titan.jpg' } },
        synopsis: '<p>L’humanité &amp; les <i>Titans</i>.<br>Survival.</p>',
        genres: [{ name: 'Action' }, { name: 'Action' }, { name: 'Drame' }],
        studios: [{ name: 'WIT Studio' }],
        episodes: 25,
        duration: '24 min per ep',
        score: 8.5,
        aired: { from: '2013-04-07T00:00:00+00:00' },
        season: 'spring',
        year: 2013,
        url: 'https://myanimelist.net/anime/16498',
      },
    ],
  };
}

function anilistPayload() {
  return {
    data: {
      Page: {
        media: [
          {
            id: 16498,
            title: { romaji: 'Shingeki no Kyojin', english: 'Attack on Titan', native: '進撃の巨人' },
            coverImage: { large: 'https://cdn.example/anilist.jpg', extraLarge: 'https://cdn.example/xl.jpg' },
            description: '<b>Description</b> AniList<br>ligne 2',
            genres: ['Action', 'Drama'],
            episodes: 25,
            duration: 24,
            averageScore: 85,
            season: 'SPRING',
            seasonYear: 2013,
            startDate: { year: 2013, month: 4, day: 7 },
            siteUrl: 'https://anilist.co/anime/16498',
            studios: { nodes: [{ name: 'WIT Studio' }] },
          },
        ],
      },
    },
  };
}

describe('API AnimeVault — recherche externe', () => {
  beforeEach(() => {
    jikanService.clearCache();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('normalise les résultats Jikan et nettoie le HTML', async () => {
    global.fetch = async () => ({ ok: true, json: async () => jikanPayload() });
    const response = await request(app).get('/api/jikan/search?q=attack');
    assert.equal(response.status, 200);
    assert.equal(response.body.count, 1);
    const item = response.body.data[0];
    assert.equal(item.id, 'jikan-16498');
    assert.equal(item.source, 'Jikan');
    assert.equal(item.title, 'Attack on Titan');
    assert.equal(item.synopsis, 'L’humanité & les Titans.\nSurvival.');
    assert.deepEqual(item.genres, ['Action', 'Drame']);
    assert.equal(item.episodeDuration, 24);
    assert.equal(item.releaseDate, '2013-04-07');
    assert.equal(item.malLink, 'https://myanimelist.net/anime/16498');
  });

  it('bascule sur AniList quand Jikan échoue', async () => {
    global.fetch = async (url) => {
      if (String(url).includes('jikan')) throw new Error('Jikan down');
      return { ok: true, json: async () => anilistPayload() };
    };
    const response = await request(app).get('/api/jikan/search?q=titan');
    assert.equal(response.status, 200);
    const item = response.body.data[0];
    assert.equal(item.id, 'anilist-16498');
    assert.equal(item.source, 'AniList');
    assert.equal(item.synopsis, 'Description AniList\nligne 2');
    assert.equal(item.rating, 8.5);
    assert.equal(item.releaseDate, '2013-04-07');
    assert.equal(item.aniListLink, 'https://anilist.co/anime/16498');
  });

  it('bascule sur AniList quand Jikan renvoie zéro résultat', async () => {
    global.fetch = async (url) => {
      if (String(url).includes('jikan')) {
        return { ok: true, json: async () => ({ data: [] }) };
      }
      return { ok: true, json: async () => anilistPayload() };
    };
    const response = await request(app).get('/api/jikan/search?q=titan');
    assert.equal(response.status, 200);
    assert.equal(response.body.data[0].source, 'AniList');
  });

  it('met en cache les résultats pendant dix minutes', async () => {
    let calls = 0;
    global.fetch = async () => {
      calls += 1;
      return { ok: true, json: async () => jikanPayload() };
    };
    await request(app).get('/api/jikan/search?q=attack');
    await request(app).get('/api/jikan/search?q=  ATTACK ');
    assert.equal(calls, 1);
  });

  it('renvoie 502 quand Jikan et AniList sont indisponibles', async () => {
    global.fetch = async () => {
      throw new Error('réseau coupé');
    };
    const response = await request(app).get('/api/jikan/search?q=titan');
    assert.equal(response.status, 502);
    assert.equal(response.body.success, false);
  });

  it('exige au moins deux caractères', async () => {
    let called = false;
    global.fetch = async () => {
      called = true;
      return { ok: true, json: async () => ({ data: [] }) };
    };
    const response = await request(app).get('/api/jikan/search?q=a');
    assert.equal(response.status, 400);
    assert.equal(called, false);
  });
});
