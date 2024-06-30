const express = require("express");
const router = express.Router();
const getAllController = require("../controllers/getAllController");

router.get("/models", async (req, res) => {
  await getAllController.getAllModels(req, res);
});

router.get("/routes", async (req, res) => {
  await getAllController.getAllRoutes(req, res);
});

router.get("/trains", async (req, res) => {
  await getAllController.getAllTrains(req, res);
});

router.get("/stations", async (req, res) => {
  await getAllController.getAllRailwayStations(req, res);
});

module.exports = router;
