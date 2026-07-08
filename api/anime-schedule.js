module.exports = async (req, res) => {
  // kusonime nggak punya konsep jadwal rilis, jadi selalu kosong
  res.status(200).json({ success: true, data: [] });
};
