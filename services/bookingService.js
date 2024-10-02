const bookingRepository = require("../repositories/bookingRepository");
const userRepository = require("../repositories/userRepository");
const getAllRepository = require("../repositories/getAllRepository");
const {
  validateCreateBooking,
  validateGuestCreateBooking,
  validateGuestID,
} = require("../utils/validators");

const userCreateBooking = async (username, data) => {
  if (!username) throw new Error("Invalid username");

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

  const finalPrice = await calculateFinalPrice(
    data.tripID,
    username,
    data.passengers,
    data.from,
    data.to
  );

  for (const passenger of data.passengers) {
    if (passenger.class === "First Class") {
      passenger.class = "F";
    } else if (passenger.class === "Second Class") {
      passenger.class = "S";
    } else if (passenger.class === "Third Class") {
      passenger.class = "T";
    }
  }

  return bookingRepository.userCreateBooking(username, data, finalPrice);
};

const userCancelBooking = async (username, bookingRefID) => {
  const fetchedUser = userRepository.findUserByUsername(username);
  if (!fetchedUser) throw new Error("No such user exists");

  if (bookingRefID.length !== 12) throw new Error("Invalid booking ref id");

  return bookingRepository.userCancelBooking(username, bookingRefID);
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

  const finalPrice = await calculateFinalPrice(
    data.tripID,
    null,
    data.class,
    data.bookingCount,
    data.from,
    data.to
  );

  const result = await bookingRepository.guestCreateBooking(data, finalPrice);
  return result;
};

const searchTrip = async (from, to, frequency) => {
  let fromCode, toCode;

  if (!from || !to || !frequency) {
    throw new Error("Invalid search parameters");
  }

  if (from.length !== 3 || to.length !== 3) {
    const fromCodeRes = await getAllRepository.getRSCodeByName(from);
    const toCodeRes = await getAllRepository.getRSCodeByName(to);

    fromCode = fromCodeRes[0]?.Code;
    toCode = toCodeRes[0]?.Code;
  } else {
    fromCode = from;
    toCode = to;
  }

  // Check if frequency is a valid date and convert it to a day of the week
  if (!isNaN(Date.parse(frequency))) {
    const date = new Date(frequency);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    frequency = daysOfWeek[date.getUTCDay()]; // or use date.getDay() if you want local time instead of UTC
  }

  let list1 = await bookingRepository.searchTrip(fromCode, toCode, frequency);
  list1 = list1 || [];

  if (["Sunday", "Saturday"].includes(frequency)) {
    const list2 = await bookingRepository.searchTrip(
      fromCode,
      toCode,
      "Weekends"
    );

    if (list2 && list2.length) {
      list1 = list1.concat(list2);
    }
  }

  if (
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(frequency)
  ) {
    const list3 = await bookingRepository.searchTrip(
      fromCode,
      toCode,
      "Weekdays"
    );

    if (list3 && list3.length) {
      list1 = list1.concat(list3);
    }
  }

  const list4 = await bookingRepository.searchTrip(fromCode, toCode, "Daily");

  if (list4 && list4.length) {
    list1 = list1.concat(list4);
  }

  return list1;
};

const getSeats = async (from, to, frequency, id) => {
  let fromCode, toCode;

  if (!from || !to || !frequency) {
    throw new Error("Invalid search parameters");
  }

  if (from.length !== 3 || to.length !== 3) {
    const fromCodeRes = await getAllRepository.getRSCodeByName(from);
    const toCodeRes = await getAllRepository.getRSCodeByName(to);

    fromCode = fromCodeRes[0]?.Code;
    toCode = toCodeRes[0]?.Code;
  } else {
    fromCode = from;
    toCode = to;
  }

  // Check if frequency is a valid date and convert it to a day of the week
  if (!isNaN(Date.parse(frequency))) {
    const date = new Date(frequency);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    frequency = daysOfWeek[date.getUTCDay()]; // or use date.getDay() if you want local time instead of UTC
  }

  let list1 = await bookingRepository.getSeats(fromCode, toCode, frequency, id);
  list1 = list1 || [];

  if (["Sunday", "Saturday"].includes(frequency)) {
    const list2 = await bookingRepository.getSeats(
      fromCode,
      toCode,
      "Weekends"
    );

    list1 = list1.concat(list2);
  }

  if (
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(frequency)
  ) {
    const list3 = await bookingRepository.getSeats(
      fromCode,
      toCode,
      "Weekdays",
      id
    );

    list1 = list1.concat(list3);
  }

  const list4 = await bookingRepository.getSeats(fromCode, toCode, "Daily", id);

  if (list4 && list4.length) {
    list1 = list1.concat(list4);
  }

  return list1;
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

const getBookingCheckout = async (bookingRefID) => {
  if (bookingRefID.length !== 12) throw new Error("Invalid booking ref id");

  const result = await bookingRepository.getBookingCheckout(bookingRefID);
  const user = await userRepository.getUserDetails(result.bookedUser);
  const fromStation = await getAllRepository.getRSNameByCode(result.from);
  const toStation = await getAllRepository.getRSNameByCode(result.to);

  result.email = user.Email;
  result.from = fromStation[0].Name;
  result.to = toStation[0].Name;
  return result;
};

const searchBookedTicketByID = async (bookingRefID) => {
  if (bookingRefID.length !== 12) throw new Error("Invalid booking ref id");
  return bookingRepository.searchBookedTicketByID(bookingRefID);
};

async function calculateFinalPrice(
  scheduledTripId,
  username,
  passengers,
  fromStation,
  toStation
) {
  // Fetch station sequences
  const originSequence = await bookingRepository.getStationSequence(
    scheduledTripId,
    fromStation
  );
  const destinationSequence = await bookingRepository.getStationSequence(
    scheduledTripId,
    toStation
  );

  if (!originSequence || !destinationSequence) {
    throw new Error("Invalid origin or destination station");
  }

  if (originSequence >= destinationSequence) {
    throw new Error("Origin station must be before destination station");
  }

  // Calculate distance factor based on the sequence difference
  const distanceFactor = destinationSequence - originSequence;
  let basicPrice = 0;

  for (const passenger of passengers) {
    if (passenger.class === "F") {
      passenger.class = "First Class";
    } else if (passenger.class === "S") {
      passenger.class = "Second Class";
    } else if (passenger.class === "T") {
      passenger.class = "Third Class";
    }

    // Fetch base price per class
    const basePricePerClass = await bookingRepository.getBasePricePerClass(
      scheduledTripId,
      passenger.class
    );
    if (!basePricePerClass) {
      throw new Error("Could not retrieve base price for the class");
    }
    // Calculate basic price for the segment
    basicPrice = basicPrice + basePricePerClass * distanceFactor;
  }

  // Fetch discount percentage based on the user category
  let discountPercent;
  if (username)
    discountPercent = await bookingRepository.getUserDiscount(username);
  else discountPercent = 0.0; // Guest user

  // Apply discount to the basic price
  const discount = basicPrice * discountPercent;
  const finalPrice = basicPrice - discount;

  return finalPrice.toFixed(2); // Return price formatted to 2 decimal places
}

const getStatus = async (bookingRefID) => {
  const isCompleted = await bookingRepository.getStatus(bookingRefID);
  return isCompleted;
};

module.exports = {
  userSearchBookedTickets,
  userGetPendingPayments,
  userCreateBooking,
  guestCreateBooking,
  guestSearchBookedTickets,
  guestGetPendingPayments,
  guestDeleteBooking,
  completeBooking,
  searchBookedTicketByID,
  searchTrip,
  calculateFinalPrice,
  getSeats,
  getBookingCheckout,
  getStatus,
  userCancelBooking,
};
