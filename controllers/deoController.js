const deoService = require("../services/deoService");

const getDEOToken = async (req, res) => {
  try {
    const token = await deoService.getDEOToken(req.body);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const registerDEO = async (req, res) => {
  try {
    const result = await deoService.registerDEO(req.user.username, req.body);
    res.status(201).json({ message: "DEO registered successfully", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDEODetails = async (req, res) => {
  try {
    const deo = req.user.username;
    const deoDetails = await deoService.getDEODetails(deo);
    res.status(200).json(deoDetails);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const deo = req.user.username;
    const result = await deoService.updateProfile(deo, req.body);
    res.status(201).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const createModel = async (req, res) => {
  try {
    const deo = req.user.username;
    const result = await deoService.createModel(deo, req.body);
    res.status(201).json({ message: "Model created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createTrain = async (req, res) => {
  try {
    const deo = req.user.username;
    const result = await deoService.createTrain(deo, req.body);
    res.status(201).json({ message: "Train created successfully", result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createRailwayStation = async (req, res) => {
  try {
    const deo = req.user.username;
    const result = await deoService.createRailwayStation(deo, req.body);
    res.status(201).json({ message: "Railway Station created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createRoute = async (req, res) => {
  try {
    const deo = req.user.username;
    const result = await deoService.createRoute(deo, req.body);
    res.status(201).json({ message: "Route created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const scheduleTrip = async (req, res) => {
  try {
    const deo = req.user.username;
    const result = await deoService.scheduleTrip(deo, req.body);
    res.status(201).json({ tripID: result[0].new_trip_id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addStation = async (req, res) => {
  try {
    const deo = req.user.username;
    const result = await deoService.addStation(deo, req.body);
    res.status(201).json({ message: "Station added successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateDelay = async (req, res) => {
  try {
    const deo = req.user.username;
    const result = await deoService.updateDelay(deo, req.query);
    res.status(201).json({ message: "Delay updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDEOToken,
  registerDEO,
  getDEODetails,
  createModel,
  createTrain,
  createRailwayStation,
  createRoute,
  scheduleTrip,
  addStation,
  updateDelay,
  updateProfile,
};
