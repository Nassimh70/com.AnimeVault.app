const settingsModel = require('../models/settingsModel');

const SettingsController = {
  async get(req, res) {
    const settings = await settingsModel.getAll();
    res.json({ success: true, data: { displayName: settings.displayName || 'Nassim' } });
  },

  async update(req, res) {
    await settingsModel.set('displayName', req.body.displayName);
    const settings = await settingsModel.getAll();
    res.json({ success: true, data: { displayName: settings.displayName || 'Nassim' } });
  },
};

module.exports = SettingsController;
