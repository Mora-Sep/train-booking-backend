const deoService = require("../services/deoService");

const getDEOToken = async (req, res) => {
  try {
    const token = await deoService.getDEOToken(req.body);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const registerDEO = async (req, res) => {
  try {
    const result = await deoService.registerDEO(req.user.username, req.body);
    res.status(201).json({ message: "DEO registered successfully", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDEOToken,
  registerDEO,
};
