const adminService = require("../services/adminService");

const getAdminToken = async (req, res) => {
  try {
    const token = await adminService.getAdminToken(req.body);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const getAdminDetails = async (req, res) => {
  try {
    const username = req.user.username;
    const userDetails = await adminService.getAdminDetails(username);
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getScheduledTrips = async (req, res) => {
  try {
    const username = req.user.username;
    const scheduledTrips = await adminService.getScheduledTrips(username);
    res.status(200).json(scheduledTrips);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await adminService.registerAdmin(username, req.body);
    res.status(200).json({ message: "Admin registered successfully!", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const admin = req.user.username;
    const result = await adminService.updateProfile(admin, req.body);
    res.status(201).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const deactivateTrip = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await adminService.deactivateTrip(username, req.query);
    res.status(200).json({ message: "Trip deactivated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const activateTrip = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await adminService.activateTrip(username, req.query);
    res.status(200).json({ message: "Trip reactivated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteModel = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await adminService.deleteModel(username, req.query.id);
    res.status(200).json({ message: "Model deleted successfully", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await adminService.deleteRoute(username, req.query.id);
    res.status(200).json({ message: "Route deleted successfully", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTrain = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await adminService.deleteTrain(username, req.query.id);
    res.status(200).json({ message: "Train deleted successfully", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteRailwayStation = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await adminService.deleteRailwayStation(
      username,
      req.query.id
    );
    res
      .status(200)
      .json({ message: "Railway station deleted successfully", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteScheduledTrip = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await adminService.deleteScheduledTrip(
      username,
      req.query.id
    );
    res
      .status(200)
      .json({ message: "Scheduled trip deleted successfully", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAdminToken,
  getAdminDetails,
  registerAdmin,
  deleteModel,
  deleteRoute,
  deleteTrain,
  deleteRailwayStation,
  deleteScheduledTrip,
  deactivateTrip,
  activateTrip,
  updateProfile,
  getScheduledTrips,
};
