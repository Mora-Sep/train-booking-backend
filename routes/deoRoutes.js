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

router.post(
  "/create/model",
  verifyToken,
  async (req, res) => await deoController.createModel(req, res)
);

router.post(
  "/create/train",
  verifyToken,
  async (req, res) => await deoController.createTrain(req, res)
);

router.post(
  "/create/railway-station",
  verifyToken,
  async (req, res) => await deoController.createRailwayStation(req, res)
);

router.post(
  "/create/route",
  verifyToken,
  async (req, res) => await deoController.createRoute(req, res)
);

router.post(
  "/schedule-trip",
  verifyToken,
  async (req, res) => await deoController.scheduleTrip(req, res)
);

router.patch(
  "/update-delay",
  verifyToken,
  async (req, res) => await deoController.updateDelay(req, res)
);

router.patch(
  "/update-account",
  verifyToken,
  async (req, res) => await deoController.updateProfile(req, res)
);

router.get(
  "/details",
  verifyToken,
  async (req, res) => await deoController.getDEODetails(req, res)
);

module.exports = router;
