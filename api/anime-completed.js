const kusonime = require('../lib/kusonime');
module.exports = async (req, res) => {
  try {
    const data = await kusonime.latest();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
