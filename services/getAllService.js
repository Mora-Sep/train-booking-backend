const getAllRepository = require("../repositories/getAllRepository");

const getAllModels = async () => {
  return await getAllRepository.getAllModels();
};

const getAllRoutes = async () => {
  return await getAllRepository.getAllRoutes();
};

const getAllTrains = async () => {
  return await getAllRepository.getAllTrains();
};

const getAllRailwayStations = async () => {
  return await getAllRepository.getAllRailwayStations();
};

module.exports = {
  getAllModels,
  getAllRoutes,
  getAllTrains,
  getAllRailwayStations,
};
