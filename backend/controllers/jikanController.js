/**
 * Intégration API externe Jikan (MyAnimeList) — recherche automatique d'animes.
 * Documentation: https://docs.api.jikan.moe/
 */
const JikanController = {
  async search(req, res) {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Requête de recherche trop courte.' });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=8&order_by=popularity&sfw=true`,
        {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'AnimeVault/1.0 (+https://github.com)',
          },
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Jikan API a répondu avec le statut ${response.status}`);
      const json = await response.json();

      const results = (json.data || []).map((item) => ({
        malId: item.mal_id,
        title: item.title,
        titleJapanese: item.title_japanese || '',
        image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
        synopsis: item.synopsis || '',
        genres: (item.genres || []).map((g) => g.name),
        studios: (item.studios || []).map((s) => s.name),
        episodesTotal: item.episodes || 0,
        episodeDuration: item.duration ? parseInt(item.duration, 10) || 24 : 24,
        rating: item.score || null,
        releaseDate: item.aired?.from ? item.aired.from.split('T')[0] : '',
        season: item.season ? `${item.season} ${item.year || ''}`.trim() : '',
        malLink: item.url || '',
        status: 'a_voir',
      }));

      res.json({ success: true, data: results });
    } catch (err) {
      const message = err?.name === 'AbortError'
        ? 'La recherche Jikan a dépassé le délai de réponse.'
        : `Impossible de contacter Jikan: ${err.message}`;
      res.status(502).json({ success: false, error: message });
    }
  },
};

module.exports = JikanController;
