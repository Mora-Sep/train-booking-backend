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
  validateStaffUpdate,
} = require("../utils/validators");
const { JWT_SECRET, JWT_EXPIRATION } = process.env;

const formatDateWithTime = (dateString) => {
  const date = new Date(dateString);

  // Get current time
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Format YYYY-MM-DD HH:MM:SS
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(
    2,
    "0"
  )} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
};

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
  if (!(await adminRepository.findAdminByUsername(username))) {
    throw new Error("Access Denied!");
  }
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

const updateProfile = async (username, data) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  if (validateStaffUpdate(data)) {
    throw new Error(validateStaffUpdate(data));
  }

  if (data.newPassword) {
    if (!bcrypt.compareSync(data.currentPassword, fetchedAdmin.Password)) {
      throw new Error("Invalid credentials");
    }
  }

  return adminRepository.updateProfile(username, data);
};

const deactivateTrip = async (username, data) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  if (Number.isInteger(data.tripId)) {
    throw new Error("Invalid trip ID");
  }

  return adminRepository.deactivateTrip(data.tripId);
};

const activateTrip = async (username, data) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  if (Number.isInteger(data.tripId)) {
    throw new Error("Invalid trip ID");
  }

  return adminRepository.activateTrip(data.tripId);
};

const getScheduledTrips = async (username) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  return adminRepository.getAllScheduledTrips();
};

const deleteModel = async (username, id) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const error = validateModel(id);
  if (error) {
    throw new Error(error);
  }

  return deleteRepository.deleteModel(id);
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

const getTotalReport = async (username, startDate, endDate) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  if (!startDate || !endDate) {
    throw new Error("Invalid date range");
  }

  startDate = formatDateWithTime(startDate);
  endDate = formatDateWithTime(endDate);

  const totalRevenue = await adminRepository.getRevenue(startDate, endDate);
  const totalBookings = await adminRepository.getTotalBookings(
    startDate,
    endDate
  );

  return { totalRevenue, totalBookings };
};

const getCurrentStats = async (username) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  const activeTrips = await adminRepository.getActiveTrips();
  const currentUsers = await adminRepository.totalUsers();
  const currentGuests = await adminRepository.totalGuests();
  const totalAdults = await adminRepository.getBookedAdults();
  const totalChildren = await adminRepository.getBookedChildren();

  return {
    activeTrips,
    currentUsers,
    currentGuests,
    totalAdults,
    totalChildren,
  };
};

const getTrainStats = async (username) => {
  const fetchedAdmin = await adminRepository.findAdminByUsername(username);
  if (!fetchedAdmin) {
    throw new Error("Access denied!");
  }

  return adminRepository.getTrainStats();
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
  getTotalReport,
  getCurrentStats,
  getTrainStats,
};
