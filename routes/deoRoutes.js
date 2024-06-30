const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const deoController = require("../controllers/deoController");

router.post(
  "/auth",
  async (req, res) => await deoController.getDEOToken(req, res)
);

router.post(
  "/register",
  verifyToken,
  async (req, res) => await deoController.registerDEO(req, res)
);

module.exports = router;
