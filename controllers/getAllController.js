const getAllService = require("../services/getAllService");

const getAllModels = async (req, res) => {
  try {
    const models = await getAllService.getAllModels();
    res.status(200).json(models);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllRoutes = async (req, res) => {
  try {
    const routes = await getAllService.getAllRoutes();
    res.status(200).json(routes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllTrains = async (req, res) => {
  try {
    const trains = await getAllService.getAllTrains();
    res.status(200).json(trains);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllRailwayStations = async (req, res) => {
  try {
    const railwayStations = await getAllService.getAllRailwayStations();
    res.status(200).json(railwayStations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllModels,
  getAllRoutes,
  getAllTrains,
  getAllRailwayStations,
};
