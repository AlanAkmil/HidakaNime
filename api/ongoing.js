const IFILMScraper = require('../lib/scraper');
module.exports = async (req, res) => {
  try {
    const { page } = req.query;
    const scraper = new IFILMScraper();
    const result = await scraper.getDonghuaOngoing(parseInt(page) || 1);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
