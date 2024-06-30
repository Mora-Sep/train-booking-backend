require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET, JWT_EXPIRATION } = process.env;
const deoRepository = require("../repositories/deoRepository");
const adminRepository = require("../repositories/adminRepository");
const userRepository = require("../repositories/userRepository");
const { validateStaff } = require("../utils/validators");

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

module.exports = {
  getDEOToken,
  registerDEO,
};
