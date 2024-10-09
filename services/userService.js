require("dotenv").config();
const userRepository = require("../repositories/userRepository");
const { validateUser, validateUserWOPassword } = require("../utils/validators");

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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
  const details = await userRepository.getUserDetails(username);
  if (!user) {
    throw new Error("Incorrect Username or Password");
  }
  if (!bcrypt.compareSync(password, user.Password)) {
    throw new Error("Incorrect Username or Password");
  }

  const payload = {
    username: user.Username,
    firstName: user.FirstName,
    lastName: user.LastName,
    nic: details.NIC,
    bookingsCount: details.Bookings_Count,
    category: details.Category,
    email: details.Email,
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

const forgotPassword = async (email) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error("Email not found");
  }

  // Generate token and set expiration time (1 hour)
  const token = crypto.randomBytes(20).toString("hex");
  const expirationTime = new Date(Date.now() + 3600000); // 1 hour

  await userRepository.updateForgotPW(token, expirationTime, email);

  // Send email with reset link
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // or use your email service provider
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.MAILPW,
    },
  });

  const resetUrl = `${process.env.FRONTEND}/reset-password?token=${token}`;

  const mailOptions = {
    to: email,
    from: process.env.EMAIL,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste it into your browser to complete the process:\n\n
           ${resetUrl}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  await transporter.sendMail(mailOptions);
};

const resetPassword = async (token, newPassword) => {
  const user = await userRepository.findUserByToken(token);
  if (!user) {
    throw new Error("Invalid or expired token");
  }

  const password = bcrypt.hashSync(newPassword, 10);

  await userRepository.updatePassword(user.Username, password);
};

module.exports = {
  registerUser,
  loginUser,
  getUserDetails,
  updateUserWOPassword,
  updateUser,
  forgotPassword,
  resetPassword,
};
