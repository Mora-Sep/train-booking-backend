require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET, JWT_EXPIRATION } = process.env;
const deoRepository = require("../repositories/deoRepository");
const adminRepository = require("../repositories/adminRepository");
const userRepository = require("../repositories/userRepository");
const {
  validateStaff,
  validateCreateTrain,
  validateCreateRailwayStation,
  validateCreateRoute,
  validateScheduleTrip,
  validateAddStation,
  validateStaffUpdate,
} = require("../utils/validators");

const getDEOToken = async ({ username, password }) => {
  const deo = await deoRepository.findDEOByUsername(username);
  if (!deo) {
    throw new Error("Invalid username or password");
  }
  if (!bcrypt.compareSync(password, deo.Password)) {
    throw new Error("Invalid username or password");
  }
  return jwt.sign(
    {
      username: deo.Username,
      role: deo.Role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION || "1h" }
  );
};

const registerDEO = async (username, data) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const error = validateStaff(data);
  if (error) {
    throw new Error(error);
  }

  const existingDEO = await deoRepository.findDEOByUsername(data.username);
  if (existingDEO) {
    throw new Error("DEO already exists");
  }

  const password = bcrypt.hashSync(data.password, 10);

  const result = await userRepository.createUser({
    username: data.username,
    password,
    firstName: data.firstName,
    lastName: data.lastName,
  });

  await adminRepository.registerStaff({
    username: data.username,
    Role: "Data Entry Operator",
  });

  return result;
};

const getDEODetails = async (username) => {
  if (!(await deoRepository.findDEOByUsername(username))) {
    throw new Error("Access Denied!");
  }
  return deoRepository.getDEODetails(username);
};

const updateProfile = async (username, data) => {
  const fetchedDEO = await deoRepository.findDEOByUsername(username);
  if (!fetchedDEO) {
    throw new Error("Access denied!");
  }

  if (validateStaffUpdate(data)) {
    throw new Error(validateStaffUpdate(data));
  }

  if (data.newPassword) {
    if (!bcrypt.compareSync(data.currentPassword, fetchedDEO.Password)) {
      throw new Error("Invalid credentials");
    }
  }

  return deoRepository.updateProfile(username, data);
};

const createModel = async (username, data) => {
  const fetchedDEO = await deoRepository.findDEOByUsername(username);
  if (!fetchedDEO) {
    throw new Error("Access denied!");
  }

  if (
    typeof data.seatsCount !== "object" ||
    data.seatsCount === null ||
    Array.isArray(data.seatsCount)
  ) {
    throw new Error("Invalid seats count input");
  }

  const result = await deoRepository.createModel(data);
  return result;
};

const createTrain = async (username, data) => {
  const fetchedDEO = await deoRepository.findDEOByUsername(username);
  if (!fetchedDEO) {
    throw new Error("Access denied!");
  }

  if (validateCreateTrain(data)) {
    throw new Error(validateCreateTrain(data));
  }

  return deoRepository.createTrain(data);
};

const createRailwayStation = async (username, data) => {
  const fetchedDEO = await deoRepository.findDEOByUsername(username);
  if (!fetchedDEO) {
    throw new Error("Access denied!");
  }

  if (validateCreateRailwayStation(data)) {
    throw new Error(validateCreateRailwayStation(data));
  }

  return deoRepository.createRailwayStation(data);
};

const createRoute = async (username, data) => {
  const fetchedDEO = await deoRepository.findDEOByUsername(username);
  if (!fetchedDEO) {
    throw new Error("Access denied!");
  }

  if (validateCreateRoute(data)) {
    throw new Error(validateCreateRoute(data));
  }

  if (
    typeof data.basePrice !== "object" ||
    data.basePrice === null ||
    Array.isArray(data.basePrice)
  ) {
    throw new Error("Invalid base price input");
  }

  return deoRepository.createRoute(data);
};

const scheduleTrip = async (username, data) => {
  const fetchedDEO = await deoRepository.findDEOByUsername(username);
  if (!fetchedDEO) {
    throw new Error("Access denied!");
  }

  if (validateScheduleTrip(data)) {
    throw new Error(validateScheduleTrip(data));
  }

  return deoRepository.scheduleTrip(data);
};

const addStation = async (username, data) => {
  const fetchedDEO = await deoRepository.findDEOByUsername(username);
  if (!fetchedDEO) {
    throw new Error("Access denied!");
  }

  if (validateAddStation(data)) {
    throw new Error(validateAddStation(data));
  }

  return deoRepository.addStation(data);
};

const updateDelay = async (username, data) => {
  const fetchedDEO = await deoRepository.findDEOByUsername(username);
  if (!fetchedDEO) {
    throw new Error("Access denied!");
  }

  return deoRepository.updateDelay(data);
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
