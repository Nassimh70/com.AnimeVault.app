/**
 * Gestion des images téléversées : détection du type réel (octets magiques),
 * écriture sur disque et nettoyage des fichiers orphelins.
 */
const fs = require('fs/promises');
const path = require('path');
const { randomInt } = require('crypto');
const { env } = require('../config/env');
const animeModel = require('../models/animeModel');

const IMAGE_SIGNATURES = [
  {
    mime: 'image/jpeg',
    extension: 'jpg',
    matches: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  {
    mime: 'image/png',
    extension: 'png',
    matches: (buffer) =>
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a,
  },
  {
    mime: 'image/gif',
    extension: 'gif',
    matches: (buffer) => buffer.length >= 6 && buffer.subarray(0, 4).toString('ascii') === 'GIF8',
  },
  {
    mime: 'image/webp',
    extension: 'webp',
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

function detectImageType(buffer) {
  if (!buffer || buffer.length === 0) return null;
  return IMAGE_SIGNATURES.find((signature) => signature.matches(buffer)) || null;
}

function isLocalUpload(image) {
  return typeof image === 'string' && /^\/uploads\/[A-Za-z0-9._-]+$/.test(image);
}

function uploadPath(image) {
  if (!isLocalUpload(image)) return null;
  const filename = path.basename(image);
  const fullPath = path.join(env.uploadsDir, filename);
  const root = path.resolve(env.uploadsDir) + path.sep;
  if (!path.resolve(fullPath).startsWith(root)) return null;
  return fullPath;
}

async function saveImage(buffer) {
  const signature = detectImageType(buffer);
  if (!signature) return null;

  await fs.mkdir(env.uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${randomInt(0, 1_000_000_000)}.${signature.extension}`;
  await fs.writeFile(path.join(env.uploadsDir, filename), buffer);
  return { url: `/uploads/${filename}`, mime: signature.mime };
}

async function removeImageIfOrphan(image) {
  const fullPath = uploadPath(image);
  if (!fullPath) return false;
  const references = await animeModel.countByImage(image);
  if (references > 0) return false;
  try {
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Nettoyage impossible pour ${image} : ${error.message}`);
    }
    return false;
  }
}

async function cleanupOrphanUploads() {
  let files;
  try {
    files = await fs.readdir(env.uploadsDir);
  } catch (error) {
    if (error.code === 'ENOENT') return 0;
    throw error;
  }

  let removed = 0;
  for (const file of files) {
    if (file === '.gitkeep' || file.startsWith('.')) continue;
    const url = `/uploads/${file}`;
    const references = await animeModel.countByImage(url);
    if (references === 0) {
      try {
        await fs.unlink(path.join(env.uploadsDir, file));
        removed += 1;
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(`Nettoyage impossible pour ${url} : ${error.message}`);
        }
      }
    }
  }
  return removed;
}

module.exports = {
  detectImageType,
  isLocalUpload,
  saveImage,
  removeImageIfOrphan,
  cleanupOrphanUploads,
};
