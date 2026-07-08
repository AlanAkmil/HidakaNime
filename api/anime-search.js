const kusonime = require('../lib/kusonime');
module.exports = async (req, res) => {
  try {
    const { q, page } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Parameter "q" wajib diisi' });
    const data = await kusonime.search(q, parseInt(page) || 1);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
