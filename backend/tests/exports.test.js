const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { setupTestDatabase, resetDatabase, closeTestDatabase } = require('./helpers');
const app = require('../app');

async function createAnime(payload = {}) {
  const response = await request(app)
    .post('/api/animes')
    .send({ title: 'Export test', releaseDate: '2024-01-01', ...payload });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body.data;
}

describe('API AnimeVault — export et import', () => {
  before(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  after(async () => {
    await closeTestDatabase();
  });

  describe('export JSON', () => {
    it('télécharge un JSON complet avec les relations', async () => {
      await createAnime({ title: 'JSON', genres: ['Action'], studios: ['OLM'] });
      const response = await request(app).get('/api/export/json');
      assert.equal(response.status, 200);
      assert.match(response.headers['content-type'], /application\/json/);
      assert.match(response.headers['content-disposition'], /attachment/);
      const payload = JSON.parse(response.text);
      assert.equal(payload.count, 1);
      assert.equal(payload.animes[0].title, 'JSON');
      assert.deepEqual(payload.animes[0].genres, ['Action']);
      assert.ok(payload.exportedAt);
    });
  });

  describe('export CSV', () => {
    it('ajoute un BOM, échappe les guillemets et protège les formules', async () => {
      await createAnime({
        title: '=SUM(1,2)',
        comment: 'Ligne "citée", avec virgule\net retour',
        genres: ['Action', 'Drame'],
      });
      const response = await request(app).get('/api/export/csv');
      assert.equal(response.status, 200);
      assert.match(response.headers['content-type'], /text\/csv/);
      assert.match(response.headers['content-disposition'], /animevault-export\.csv/);

      assert.equal(response.text.charCodeAt(0), 0xfeff);
      assert.match(response.text, /"id","title"/);
      assert.ok(response.text.includes('"\'=SUM(1,2)"'));
      assert.ok(response.text.includes('"Ligne ""citée"", avec virgule'));
      assert.ok(response.text.includes('\r\n'));
      assert.ok(response.text.includes('"Action|Drame"'));
    });

    it('protège aussi les cellules commençant par +, - ou @', async () => {
      await createAnime({ title: 'Plus', comment: '+cmd|calc', synopsis: '@import' });
      const response = await request(app).get('/api/export/csv');
      assert.ok(response.text.includes('"\'+cmd|calc"'));
      assert.ok(response.text.includes('"\'@import"'));
    });
  });

  describe('import JSON', () => {
    it('importe les entrées valides, signale doublons et erreurs', async () => {
      const payload = {
        animes: [
          {
            title: 'Importé',
            releaseDate: '2022-02-02',
            genres: ['Action'],
            studios: ['MAPPA'],
            episodesTotal: 12,
            episodesWatched: 3,
            rating: 8.5,
            isFavorite: true,
          },
          { title: 'Importé', releaseDate: '2022-02-02' },
          { title: '' },
        ],
      };
      const response = await request(app).post('/api/export/import').send(payload);
      assert.equal(response.status, 200);
      assert.equal(response.body.imported, 1);
      assert.equal(response.body.skipped, 2);
      assert.equal(response.body.total, 3);
      assert.equal(response.body.errors.length, 2);
      assert.equal(response.body.errors[0].index, 1);
      assert.match(response.body.errors[0].message, /Doublon/);
      assert.equal(response.body.errors[1].index, 2);

      const list = await request(app).get('/api/animes');
      assert.equal(list.body.count, 1);
      assert.equal(list.body.data[0].title, 'Importé');
      assert.deepEqual(list.body.data[0].genres, ['Action']);

      const history = await request(app).get('/api/stats/history');
      assert.equal(history.body.data[0].action, 'ajout');
      assert.match(history.body.data[0].details, /Importé/);
    });

    it('est idempotent sur un même fichier', async () => {
      const anime = { title: 'Réimport', releaseDate: '2021-03-03', genres: ['Drame'] };
      const first = await request(app).post('/api/export/import').send([anime]);
      assert.equal(first.body.imported, 1);
      const second = await request(app).post('/api/export/import').send([anime]);
      assert.equal(second.body.imported, 0);
      assert.equal(second.body.skipped, 1);
      const list = await request(app).get('/api/animes');
      assert.equal(list.body.count, 1);
    });

    it('accepte un export complet et conserve les identifiants libres', async () => {
      const created = await createAnime({ title: 'Exporté', releaseDate: '2019-09-09' });
      const exported = await request(app).get('/api/export/json');
      const payload = JSON.parse(exported.text);
      await request(app).delete(`/api/animes/${created.id}`).expect(200);

      const imported = await request(app).post('/api/export/import').send(payload);
      assert.equal(imported.status, 200);
      assert.equal(imported.body.imported, 1);
      const list = await request(app).get('/api/animes');
      assert.equal(list.body.data[0].id, created.id);
    });

    it('refuse un format sans tableau animes', async () => {
      const response = await request(app).post('/api/export/import').send({ foo: 'bar' });
      assert.equal(response.status, 400);
      assert.equal(response.body.success, false);
    });
  });
});
