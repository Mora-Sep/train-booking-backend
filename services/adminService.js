require("dotenv").config();
const adminRepository = require("../repositories/adminRepository");
const userRepository = require("../repositories/userRepository");
const deleteRepository = require("../repositories/deleteRepository");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  validateStaff,
  validateModel,
  validateRoute,
  validateTrain,
  validateRailwayStation,
  validateTrip,
} = require("../utils/validators");
const { JWT_SECRET, JWT_EXPIRATION } = process.env;

const getAdminToken = async ({ username, password }) => {
  const admin = await adminRepository.findAdminByUsername(username);
  if (!admin) {
    throw new Error("Invalid username or password");
  }
  if (!bcrypt.compareSync(password, admin.Password)) {
    throw new Error("Invalid username or password");
  }
  return jwt.sign(
    {
      username: admin.Username,
      role: admin.Role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION || "1h" }
  );
};

const getAdminDetails = async (username) => {
  return adminRepository.getAdminDetails(username);
};

const registerAdmin = async (username, data) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const error = validateStaff(data);
  if (error) {
    throw new Error(error);
  }

  const existingAdmin = await adminRepository.findAdminByUsername(
    data.username
  );
  if (existingAdmin) {
    throw new Error("Admin already exists");
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
    Role: "Admin",
  });

  return result;
};

const deleteModel = async (username, name) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const error = validateModel(name);
  if (error) {
    throw new Error(error);
  }

  return deleteRepository.deleteModel(name);
};

const deleteRoute = async (username, id) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const error = validateRoute(id);
  if (error) {
    throw new Error(error);
  }

  return deleteRepository.deleteRoute(id);
};

const deleteTrain = async (username, number) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const error = validateTrain(number);
  if (error) {
    throw new Error(error);
  }

  return deleteRepository.deleteTrain(number);
};

const deleteRailwayStation = async (username, code) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const error = validateRailwayStation(code);
  if (error) {
    throw new Error(error);
  }

  return deleteRepository.deleteRailwayStation(code);
};

const deleteScheduledTrip = async (username, id) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const error = validateTrip(id);
  if (error) {
    throw new Error(error);
  }

  return deleteRepository.deleteScheduledTrip(id);
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
};
