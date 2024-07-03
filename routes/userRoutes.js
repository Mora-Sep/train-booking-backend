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

router.get(
  "/search/tickets",
  verifyToken,
  async (req, res) => await userController.searchBookedTickets(req, res)
);

router.get(
  "/pending/payments",
  verifyToken,
  async (req, res) => await userController.getPendingPayments(req, res)
);

router.post(
  "/create/booking",
  verifyToken,
  async (req, res) => await userController.createBooking(req, res)
);

router.delete(
  "/delete/booking",
  verifyToken,
  async (req, res) => await userController.deleteBooking(req, res)
);

module.exports = router;
