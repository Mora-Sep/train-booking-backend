const guestService = require("../services/guestService");

const createBooking = async (req, res) => {
  try {
    const result = await guestService.createBooking(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchBookedTickets = async (req, res) => {
  try {
    const result = await guestService.searchBookedTickets(req.query.guestID);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const result = await guestService.getPendingPayments(req.query.guestID);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const result = await guestService.deleteBooking(
      req.query.guestID,
      req.query.bookingRefID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const completeBooking = async (req, res) => {
  try {
    const result = await guestService.completeBooking(req.query.bookingRefID);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createBooking,
  searchBookedTickets,
  getPendingPayments,
  deleteBooking,
  completeBooking,
};
