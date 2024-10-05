const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");

// Define the register route
router.post(
  "/register",
  async (req, res) => await userController.register(req, res)
);

// Define the login route
router.post("/login", async (req, res) => await userController.login(req, res));

// Define the getUserDetails route
router.get(
  "/details",
  verifyToken,
  async (req, res) => await userController.getUserDetails(req, res)
);

// Define the updateUserWOPassword route
router.put(
  "/update",
  verifyToken,
  async (req, res) => await userController.updateUserAccount(req, res)
);

// Forgot password
router.post(
  "/forgot-password",
  async (req, res) => await userController.forgotPassword(req, res)
);

// Reset password
router.post(
  "/reset-password",
  async (req, res) => await userController.resetPassword(req, res)
);

module.exports = router;
