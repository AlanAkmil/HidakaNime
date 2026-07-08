const IFILMScraper = require('../lib/scraper');
const kusonime = require('../lib/kusonime');
module.exports = async (req, res) => {
  try {
    const { slug, type } = req.query;
    if (!slug) return res.status(400).json({ success: false, error: 'Parameter "slug" wajib diisi' });

    if (type === 'anime') {
      const data = await kusonime.detail(slug);
      return res.status(200).json({ success: true, data });
    }

    const scraper = new IFILMScraper();
    const result = await scraper.getDetail(slug);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
