const guestConnection = require("../config/db").getGuestConnection;

const getModel = async (name) => {
  return await guestConnection("model").where("Name", name).select();
};

const getRoute = async (id) => {
  return await guestConnection("route").where("Route_ID", id).select();
};

const getTrain = async (number) => {
  return await guestConnection("train").where("Number", number).select();
};

const getRailwayStation = async (code) => {
  return await guestConnection("railway_station").where("Code", code).select();
};

module.exports = {
  getModel,
  getRoute,
  getTrain,
  getRailwayStation,
};
