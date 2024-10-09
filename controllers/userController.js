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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.forgotPassword(email);
    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getUserDetails,
  updateUserAccount,
  forgotPassword,
  resetPassword,
};
