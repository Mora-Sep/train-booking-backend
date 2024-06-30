const adminConnection = require("../config/db").getAdminConnection;

const deleteModel = async (name) => {
  return await adminConnection("model").where("Name", name).del();
};

const deleteRoute = async (id) => {
  return await adminConnection("route").where("Route_ID", id).del();
};

const deleteTrain = async (number) => {
  return await adminConnection("train").where("Number", number).del();
};

const deleteRailwayStation = async (code) => {
  return await adminConnection("railway_station").where("Code", code).del();
};

const deleteScheduledTrip = async (id) => {
  return await adminConnection("scheduled_trip")
    .where("Scheduled_ID", id)
    .del();
};

module.exports = {
  deleteModel,
  deleteRoute,
  deleteTrain,
  deleteRailwayStation,
  deleteScheduledTrip,
};
