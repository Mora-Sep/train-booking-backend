const express = require("express");
const router = express.Router();

const guestController = require("../controllers/guestController");

router.post("/complete", guestController.completeBooking);

module.exports = router;
