const IFILMScraper = require('../lib/scraper');
module.exports = async (req, res) => {
  try {
    const scraper = new IFILMScraper();
    const result = await scraper.getDonghuaSchedule();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
