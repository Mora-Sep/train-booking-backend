const guestRepository = require("../repositories/guestRepository");
const userRepository = require("../repositories/userRepository");
const {
  validateGuestCreateBooking,
  validateGuestID,
} = require("../utils/validators");

const createBooking = async (data) => {
  if (validateGuestCreateBooking(data)) {
    throw new Error(validateGuestCreateBooking(data));
  }

  if (!data.guestID) data.guestID = "____________";

  if (
    typeof data.passengers !== "object" ||
    data.passengers === null ||
    !Array.isArray(data.passengers)
  ) {
    throw new Error("Invalid passengers input");
  }

  const result = await guestRepository.createBooking(data);
  return result;
};

const searchBookedTickets = async (guestID) => {
  if (validateGuestID(guestID)) {
    throw new Error(validateGuestID(guestID));
  }

  const tickets = await guestRepository.searchBookedTickets(guestID);
  return tickets;
};

const getPendingPayments = async (guestID) => {
  if (validateGuestID(guestID)) {
    throw new Error(validateGuestID(guestID));
  }

  const payments = await guestRepository.getPendingPayments(guestID);
  return payments;
};

const deleteBooking = async (guestID, bookingRefID) => {
  if (bookingRefID.length !== 12) throw new Error("Invalid booking ref id");
  if (validateGuestID(guestID)) {
    throw new Error(validateGuestID(guestID));
  }

  const booking = await guestRepository.searchBookedTickets(guestID);

  if (!booking) throw new Error("Booking not found");

  const result = await userRepository.deleteBooking(bookingRefID);
  return result;
};

const completeBooking = async (bookingRefID) => {
  if (bookingRefID.length !== 12) throw new Error("Invalid booking ref id");

  // Transaction Verification needed here

  const result = await guestRepository.completeBooking(bookingRefID);
  return result;
};

module.exports = {
  createBooking,
  searchBookedTickets,
  getPendingPayments,
  deleteBooking,
  completeBooking,
};
