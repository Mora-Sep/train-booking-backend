const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const verifyToken = require("../middleware/authMiddleware");

router.post(
  "/auth",
  async (req, res) => await adminController.getAdminToken(req, res)
);

router.get(
  "/details",
  verifyToken,
  async (req, res) => await adminController.getAdminDetails(req, res)
);

router.post(
  "/register",
  verifyToken,
  async (req, res) => await adminController.registerAdmin(req, res)
);

router.delete(
  "/model",
  verifyToken,
  async (req, res) => await adminController.deleteModel(req, res)
);

router.delete(
  "/route",
  verifyToken,
  async (req, res) => await adminController.deleteRoute(req, res)
);

router.delete(
  "/train",
  verifyToken,
  async (req, res) => await adminController.deleteTrain(req, res)
);

router.delete(
  "/station",
  verifyToken,
  async (req, res) => await adminController.deleteRailwayStation(req, res)
);

router.delete(
  "/trip",
  verifyToken,
  async (req, res) => await adminController.deleteScheduledTrip(req, res)
);

module.exports = router;
