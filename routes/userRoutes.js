const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middleware/authMiddleware");

router.post(
  "/register",
  async (req, res) => await userController.register(req, res)
);

router.post("/login", async (req, res) => await userController.login(req, res));

router.get(
  "/details",
  verifyToken,
  async (req, res) => await userController.getUserDetails(req, res)
);

router.put(
  "/update",
  verifyToken,
  async (req, res) => await userController.updateUserAccount(req, res)
);

router.post(
  "/forgot-password",
  async (req, res) => await userController.forgotPassword(req, res)
);

router.post(
  "/reset-password",
  async (req, res) => await userController.resetPassword(req, res)
);

module.exports = router;
