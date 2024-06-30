const guestConnection = require("../config/db").getGuestConnection;

const getAllModels = async () => {
  return await guestConnection("model").select();
};

const getAllRoutes = async () => {
  return await guestConnection("route").select();
};

const getAllTrains = async () => {
  return await guestConnection("train").select();
};

const getAllRailwayStations = async () => {
  return await guestConnection("railway_station").select();
};

module.exports = {
  getAllModels,
  getAllRoutes,
  getAllTrains,
  getAllRailwayStations,
};
