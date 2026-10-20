/**
 * Validation basique des données d'anime avant écriture en BDD.
 */
function validateAnime(req, res, next) {
  const { title } = req.body;
  const errors = [];

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Le titre est obligatoire.');
    }
  } else {
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      errors.push('Le titre doit être une chaîne de caractères non vide.');
    }
  }

  const validStatuses = ['a_voir', 'en_cours', 'termine', 'pause', 'abandonne'];
  if (req.body.status !== undefined && req.body.status && !validStatuses.includes(req.body.status)) {
    errors.push('Statut invalide.');
  }

  const validPriorities = ['haute', 'moyenne', 'faible'];
  if (req.body.priority && !validPriorities.includes(req.body.priority)) {
    errors.push('Priorité invalide.');
  }

  if (req.body.rating !== undefined && req.body.rating !== null) {
    const r = Number(req.body.rating);
    if (Number.isNaN(r) || r < 0 || r > 10) {
      errors.push('La note doit être comprise entre 0 et 10.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join(' ') });
  }
  next();
}

module.exports = { validateAnime };
