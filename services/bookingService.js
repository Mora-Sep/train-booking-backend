const bookingRepository = require("../repositories/bookingRepository");
const userRepository = require("../repositories/userRepository");
const {
  validateCreateBooking,
  validateGuestCreateBooking,
  validateGuestID,
} = require("../utils/validators");

const userCreateBooking = async (username, data) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");

  if (validateCreateBooking(data)) throw new Error(validateCreateBooking(data));

  if (
    typeof data.passengers !== "object" ||
    data.passengers === null ||
    !Array.isArray(data.passengers)
  ) {
    throw new Error("Invalid passengers input");
  }

  return bookingRepository.userCreateBooking(username, data);
};

const guestCreateBooking = async (data) => {
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

  const result = await bookingRepository.guestCreateBooking(data);
  return result;
};

const userSearchBookedTickets = async (username) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");
  return bookingRepository.userSearchBookedTickets(username);
};

const guestSearchBookedTickets = async (guestID) => {
  if (validateGuestID(guestID)) {
    throw new Error(validateGuestID(guestID));
  }

  const tickets = await bookingRepository.guestSearchBookedTickets(guestID);
  return tickets;
};

const userGetPendingPayments = async (username) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");
  return bookingRepository.userGetPendingPayments(username);
};

const guestGetPendingPayments = async (guestID) => {
  if (validateGuestID(guestID)) {
    throw new Error(validateGuestID(guestID));
  }

  const payments = await bookingRepository.guestGetPendingPayments(guestID);
  return payments;
};

const userDeleteBooking = async (username, data) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");

  const booking = await bookingRepository.userSearchBookedTickets(username);
  if (!booking) throw new Error("Booking not found");

  if (data.id.length !== 12) throw new Error("Invalid booking ref id");

  return bookingRepository.deleteBooking(data.id);
};

const guestDeleteBooking = async (guestID, bookingRefID) => {
  if (bookingRefID.length !== 12) throw new Error("Invalid booking ref id");
  if (validateGuestID(guestID)) {
    throw new Error(validateGuestID(guestID));
  }

  const booking = await bookingRepository.guestSearchBookedTickets(guestID);

  if (!booking) throw new Error("Booking not found");

  const result = await bookingRepository.deleteBooking(bookingRefID);
  return result;
};

const completeBooking = async (bookingRefID) => {
  if (bookingRefID.length !== 12) throw new Error("Invalid booking ref id");

  // Transaction Verification needed here

  const result = await bookingRepository.completeBooking(bookingRefID);
  return result;
};

const searchBookedTicketByID = async (bookingRefID) => {
  if (bookingRefID.length !== 12) throw new Error("Invalid booking ref id");
  return bookingRepository.searchBookedTicketByID(bookingRefID);
};

module.exports = {
  userSearchBookedTickets,
  userGetPendingPayments,
  userCreateBooking,
  userDeleteBooking,
  guestCreateBooking,
  guestSearchBookedTickets,
  guestGetPendingPayments,
  guestDeleteBooking,
  completeBooking,
  searchBookedTicketByID,
};
