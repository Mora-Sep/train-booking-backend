const userService = require("../services/userService");

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      nic,
      gender,
      address,
      contactNumber: Contact_Number,
      birthday: Birth_Date,
      email,
      password: rawPassword,
    } = req.body;

    const userId = await userService.registerUser({
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
    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await userService.loginUser({ username, password });
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const username = req.user.username;
    const userDetails = await userService.getUserDetails(username);
    res.status(200).json(userDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUserAccount = async (req, res) => {
  try {
    const username = req.user.username;
    const {
      firstName,
      lastName,
      nic,
      gender,
      address,
      contactNumber: Contact_Number,
      birthday: Birth_Date,
      email,
      currentPassword,
      newPassword: rawPassword,
    } = req.body;
    if (currentPassword) {
      await userService.updateUser(username, {
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
      });
    } else {
      await userService.updateUserWOPassword(username, {
        firstName,
        lastName,
        username,
        nic,
        gender,
        address,
        Contact_Number,
        Birth_Date,
        email,
      });
    }
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchBookedTickets = async (req, res) => {
  try {
    const username = req.user.username;
    const tickets = await userService.searchBookedTickets(username);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const username = req.user.username;
    const pendingPayments = await userService.getPendingPayments(username);
    res.status(200).json(pendingPayments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await userService.createBooking(username, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await userService.deleteBooking(username, req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getUserDetails,
  updateUserAccount,
  searchBookedTickets,
  getPendingPayments,
  createBooking,
  deleteBooking,
};
