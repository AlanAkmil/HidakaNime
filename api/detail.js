const IFILMScraper = require('../lib/scraper');
module.exports = async (req, res) => {
  try {
    const { slug, type } = req.query;
    if (!slug) return res.status(400).json({ success: false, error: 'Parameter "slug" wajib diisi' });
    const scraper = new IFILMScraper();
    const result = type === 'anime' ? await scraper.getAnimeDetail(slug) : await scraper.getDetail(slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
