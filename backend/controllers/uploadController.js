const uploadService = require('../services/uploadService');
const { AppError } = require('../utils/errors');

const UploadController = {
  async upload(req, res) {
    if (!req.file || !req.file.buffer) {
      throw new AppError(400, 'Aucun fichier reçu (champ « image »).');
    }
    const saved = await uploadService.saveImage(req.file.buffer);
    if (!saved) {
      throw new AppError(
        415,
        'Format d’image non supporté. Utilise un fichier JPEG, PNG, WebP ou GIF valide.'
      );
    }
    res.json({ success: true, url: saved.url });
  },
};

module.exports = UploadController;
