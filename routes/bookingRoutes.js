const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const bookingController = require("../controllers/bookingController");

router.get(
  "/get-checkout-session",
  async (req, res) => await bookingController.getCheckoutSession(req, res)
);

router.get(
  "/get-payment-intent",
  async (req, res) => await bookingController.getPaymentIntent(req, res)
);

router.get(
  "/search",
  async (req, res) => await bookingController.searchTrip(req, res)
);

router.get(
  "/get/seats",
  async (req, res) => await bookingController.getSeats(req, res)
);

router.get(
  "/user/search/tickets",
  verifyToken,
  async (req, res) => await bookingController.userSearchBookedTickets(req, res)
);

router.get(
  "/user/pending/payments",
  verifyToken,
  async (req, res) => await bookingController.userGetPendingPayments(req, res)
);

router.get(
  "/user/payment-history",
  verifyToken,
  async (req, res) => await bookingController.userGetPaymentHistory(req, res)
);

router.post(
  "/user/create/booking",
  verifyToken,
  async (req, res) => await bookingController.userCreateBooking(req, res)
);

router.post(
  "/guest/create/booking",
  async (req, res) => await bookingController.guestCreateBooking(req, res)
);

router.get(
  "/guest/search/tickets",
  async (req, res) => await bookingController.guestSearchBookedTickets(req, res)
);

router.get(
  "/guest/pending/payments",
  async (req, res) => await bookingController.guestGetPendingPayments(req, res)
);

router.get(
  "/search-by-id",
  async (req, res) => await bookingController.searchBookedTicketByID(req, res)
);

router.delete(
  "/guest/delete/booking",
  async (req, res) => await bookingController.guestDeleteBooking(req, res)
);

router.post(
  "/complete",
  async (req, res) => await bookingController.completeBooking(req, res)
);
router.post(
  "/cancel",
  verifyToken,
  async (req, res) => await bookingController.userCancelBooking(req, res)
);

router.get(
  "/status",
  async (req, res) => await bookingController.getStatus(req, res)
);

router.post(
  "/send-ticket",
  async (req, res) => await bookingController.sendTicket(req, res)
);

module.exports = router;
