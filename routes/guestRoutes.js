const express = require("express");
const router = express.Router();
const guestController = require("../controllers/guestController");

router.post(
  "/create/booking",
  async (req, res) => await guestController.createBooking(req, res)
);

router.get(
  "/search/tickets",
  async (req, res) => await guestController.searchBookedTickets(req, res)
);

router.get(
  "/pending/payments",
  async (req, res) => await guestController.getPendingPayments(req, res)
);

router.delete(
  "/delete/booking",
  async (req, res) => await guestController.deleteBooking(req, res)
);

module.exports = router;
