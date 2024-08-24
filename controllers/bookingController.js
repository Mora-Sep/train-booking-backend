const bookingService = require("../services/bookingService");

const searchTrip = async (req, res) => {
  try {
    const result = await bookingService.searchTrip(
      req.query.from,
      req.query.to,
      req.query.frequency
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userSearchBookedTickets = async (req, res) => {
  try {
    const username = req.user.username;
    const tickets = await bookingService.userSearchBookedTickets(username);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userGetPendingPayments = async (req, res) => {
  try {
    const username = req.user.username;
    const pendingPayments = await bookingService.userGetPendingPayments(
      username
    );
    res.status(200).json(pendingPayments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userCreateBooking = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await bookingService.userCreateBooking(username, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userDeleteBooking = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await bookingService.userDeleteBooking(username, req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const guestCreateBooking = async (req, res) => {
  try {
    const result = await bookingService.guestCreateBooking(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const guestSearchBookedTickets = async (req, res) => {
  try {
    const result = await bookingService.guestSearchBookedTickets(
      req.query.guestID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const guestGetPendingPayments = async (req, res) => {
  try {
    const result = await bookingService.guestGetPendingPayments(
      req.query.guestID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const guestDeleteBooking = async (req, res) => {
  try {
    const result = await bookingService.guestDeleteBooking(
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
    const result = await bookingService.completeBooking(req.query.bookingRefID);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchBookedTicketByID = async (req, res) => {
  try {
    const result = await bookingService.searchBookedTicketByID(
      req.query.bookingRefID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  userSearchBookedTickets,
  userGetPendingPayments,
  userCreateBooking,
  userDeleteBooking,
  guestSearchBookedTickets,
  guestGetPendingPayments,
  guestCreateBooking,
  guestDeleteBooking,
  completeBooking,
  searchBookedTicketByID,
  searchTrip,
};
