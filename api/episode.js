const IFILMScraper = require('../lib/scraper');
module.exports = async (req, res) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.status(400).json({ success: false, error: 'Parameter "slug" wajib diisi' });
    const scraper = new IFILMScraper();
    const result = await scraper.getEpisode(slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
