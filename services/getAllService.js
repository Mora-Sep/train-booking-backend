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

const getRSCodeByName = async (name) => {
  return await getAllRepository.getRSCodeByName(name);
};

module.exports = {
  getAllModels,
  getAllRoutes,
  getAllTrains,
  getAllRailwayStations,
  getRSCodeByName,
};
