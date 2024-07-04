require("dotenv").config();
const userRepository = require("../repositories/userRepository");
const {
  validateUser,
  validateUserWOPassword,
  validateCreateBooking,
} = require("../utils/validators");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRATION } = process.env;

const registerUser = async ({
  firstName,
  lastName,
  username,
  nic,
  gender,
  address,
  Contact_Number,
  Birth_Date,
  email,
  rawPassword,
}) => {
  if (await userRepository.findUserByEmail(email)) {
    throw new Error("Email already in use");
  }
  if (await userRepository.findUserByUsername(username))
    throw new Error("Username already in use");

  const error = validateUser({
    firstName,
    lastName,
    username,
    nic,
    gender,
    address,
    Contact_Number,
    Birth_Date,
    email,
    rawPassword,
  });

  if (error) {
    throw new Error(error);
  }

  const password = bcrypt.hashSync(rawPassword, 10);

  const result = await userRepository.createUser({
    username,
    password,
    firstName,
    lastName,
  });
  await userRepository.createRegisteredUser({
    username,
    nic,
    address,
    Contact_Number,
    Birth_Date,
    email,
    gender,
  });
  return result;
};

const loginUser = async ({ username, password }) => {
  const user = await userRepository.findUserByUsername(username);
  if (!user) {
    throw new Error("Incorrect Username or Password");
  }
  if (!bcrypt.compareSync(password, user.Password)) {
    throw new Error("Incorrect Username or Password");
  }

  const payload = {
    username: user.Username,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION || "1h",
  });

  return token;
};

const getUserDetails = async (username) => {
  return userRepository.getUserDetails(username);
};

const updateUserWOPassword = async (
  username,
  {
    firstName,
    lastName,
    nic,
    gender,
    address,
    Contact_Number,
    Birth_Date,
    email,
  }
) => {
  const user = {
    username,
    firstName,
    lastName,
    nic,
    gender,
    address,
    Contact_Number,
    Birth_Date,
    email,
  };
  const error = validateUserWOPassword(user);
  if (error) {
    throw new Error(error);
  }

  const newUser = {
    username,
    firstName,
    lastName,
  };

  const newRU = {
    username,
    nic,
    address,
    Contact_Number,
    Birth_Date,
    email,
    gender,
  };

  const result = await userRepository.updateUser(newUser);

  await userRepository.updateRU(newRU);

  return result;
};

const updateUser = async (
  username,
  {
    firstName,
    lastName,
    nic,
    gender,
    address,
    Contact_Number,
    Birth_Date,
    email,
    currentPassword,
    rawPassword,
  }
) => {
  const user = await userRepository.findUserByUsername(username);

  if (!user) {
    throw new Error("Incorrect Username or Password");
  }

  if (!bcrypt.compareSync(currentPassword, user.Password)) {
    throw new Error("Incorrect Username or Password");
  }

  const vUser = {
    username,
    firstName,
    lastName,
    nic,
    gender,
    address,
    Contact_Number,
    Birth_Date,
    email,
    rawPassword,
  };
  const error = validateUser(vUser);
  if (error) {
    throw new Error(error);
  }

  const password = bcrypt.hashSync(rawPassword, 10);

  const newUser = {
    username,
    password,
    firstName,
    lastName,
  };

  const newRU = {
    username,
    nic,
    address,
    Contact_Number,
    Birth_Date,
    email,
    gender,
  };

  const result = await userRepository.updateUser(newUser);

  await userRepository.updateRU(newRU);

  return result;
};

const searchBookedTickets = async (username) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");
  return userRepository.searchBookedTickets(username);
};

const getPendingPayments = async (username) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");
  return userRepository.getPendingPayments(username);
};

const createBooking = async (username, data) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");

  if (validateCreateBooking(data)) throw new Error(validateCreateBooking(data));

  if (
    typeof data.passengers !== "object" ||
    data.passengers === null ||
    !Array.isArray(data.passengers)
  ) {
    throw new Error("Invalid passengers input");
  }

  return userRepository.createBooking(username, data);
};

const deleteBooking = async (username, data) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");

  const booking = await userRepository.searchBookedTickets(username);
  if (!booking) throw new Error("Booking not found");

  if (data.id.length !== 12) throw new Error("Invalid booking ref id");

  return userRepository.deleteBooking(data.id);
};

module.exports = {
  registerUser,
  loginUser,
  getUserDetails,
  updateUserWOPassword,
  updateUser,
  searchBookedTickets,
  getPendingPayments,
  createBooking,
  deleteBooking,
};
