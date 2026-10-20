const { describe, it, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const path = require('path');
const request = require('supertest');

const {
  setupTestDatabase,
  resetDatabase,
  closeTestDatabase,
  cleanUploads,
  PNG_1X1,
} = require('./helpers');
const { env } = require('../config/env');
const app = require('../app');

async function createAnime(payload = {}) {
  const response = await request(app)
    .post('/api/animes')
    .send({ title: 'Upload test', releaseDate: '2024-01-01', ...payload });
  assert.equal(response.status, 201, JSON.stringify(response.body));
  return response.body.data;
}

function filePathFromUrl(url) {
  return path.join(env.uploadsDir, path.basename(url));
}

describe('API AnimeVault — upload et nettoyage des images', () => {
  before(async () => {
    await setupTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
    await cleanUploads();
  });

  after(async () => {
    await cleanUploads();
    await closeTestDatabase();
  });

  it('accepte une image PNG valide et renvoie son URL', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('image', PNG_1X1, { filename: 'cover.png', contentType: 'image/png' });
    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.match(response.body.url, /^\/uploads\/\d+-\d+\.png$/);
    const stat = await fs.stat(filePathFromUrl(response.body.url));
    assert.ok(stat.size > 0);
  });

  it('refuse un faux JPEG dont les octets ne sont pas une image', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('image', Buffer.from('ceci nest pas une image'), {
        filename: 'fake.jpg',
        contentType: 'image/jpeg',
      });
    assert.equal(response.status, 415);
    assert.equal(response.body.success, false);
  });

  it('refuse un fichier de plus de 5 Mo', async () => {
    const big = Buffer.concat([PNG_1X1, Buffer.alloc(5 * 1024 * 1024 + 10)]);
    const response = await request(app)
      .post('/api/upload')
      .attach('image', big, { filename: 'big.png', contentType: 'image/png' });
    assert.equal(response.status, 413);
    assert.equal(response.body.success, false);
  });

  it('renvoie 400 sans fichier', async () => {
    const response = await request(app).post('/api/upload');
    assert.equal(response.status, 400);
  });

  it('supprime l’ancienne image locale quand elle est remplacée', async () => {
    const uploaded = await request(app)
      .post('/api/upload')
      .attach('image', PNG_1X1, { filename: 'cover.png', contentType: 'image/png' });
    const url = uploaded.body.url;
    const anime = await createAnime({ title: 'Remplacement', image: url });
    assert.equal(anime.image, url);

    const updated = await request(app).put(`/api/animes/${anime.id}`).send({ image: '' });
    assert.equal(updated.status, 200);
    await assert.rejects(fs.stat(filePathFromUrl(url)), { code: 'ENOENT' });
  });

  it('conserve une image encore référencée par un autre anime', async () => {
    const uploaded = await request(app)
      .post('/api/upload')
      .attach('image', PNG_1X1, { filename: 'shared.png', contentType: 'image/png' });
    const url = uploaded.body.url;
    const first = await createAnime({ title: 'Partagé A', image: url });
    await createAnime({ title: 'Partagé B', releaseDate: '2023-01-01', image: url });

    await request(app).put(`/api/animes/${first.id}`).send({ image: '' }).expect(200);
    const stat = await fs.stat(filePathFromUrl(url));
    assert.ok(stat.size > 0);
  });

  it('supprime l’image locale à la suppression du dernier anime qui la référence', async () => {
    const uploaded = await request(app)
      .post('/api/upload')
      .attach('image', PNG_1X1, { filename: 'delete.png', contentType: 'image/png' });
    const url = uploaded.body.url;
    const anime = await createAnime({ title: 'Suppression image', image: url });

    await request(app).delete(`/api/animes/${anime.id}`).expect(200);
    await assert.rejects(fs.stat(filePathFromUrl(url)), { code: 'ENOENT' });
  });

  it('refuse un chemin d’image hors uploads', async () => {
    const response = await request(app)
      .post('/api/animes')
      .send({ title: 'Traversée', image: '/uploads/../.env' });
    assert.equal(response.status, 400);
  });
});
