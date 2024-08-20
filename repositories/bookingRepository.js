const ruConnection = require("../config/db").getRegisteredUserConnection;
const guestConnection = require("../config/db").getGuestConnection;

const userCreateBooking = async (username, data) => {
  await ruConnection.raw(`SET @refID = FALSE`); //check
  await ruConnection.raw(`SET @finalPrice = FALSE`); //check
  await ruConnection.raw(`SET @status_var = FALSE`);

  await ruConnection.raw(
    "CALL UserCreateBooking(?,?,?,?,?,@refID,@finalPrice,@status_var)",
    [
      data.tripID,
      username,
      data.class,
      data.bookingCount,
      JSON.stringify(data.passengers),
    ]
  );

  const result = await ruConnection.raw(
    "SELECT @refID AS refID, @finalPrice AS finalPrice, @status_var AS statusVar"
  );
  return result[0][0];
};

const guestCreateBooking = async (data) => {
  await guestConnection.raw(`SET @refID = FALSE`); //check
  await guestConnection.raw(`SET @finalPrice = FALSE`); //check
  await guestConnection.raw(`SET @out_guest_id = FALSE`);
  await guestConnection.raw(`SET @status_var = FALSE`);

  await guestConnection.raw(
    "CALL GuestCreateBooking(?,?,?,?,?,?,?,@refID,@finalPrice,@out_guest_id, @status_var)",
    [
      data.tripID,
      data.guestID,
      data.class,
      data.bookingCount,
      JSON.stringify(data.passengers),
      data.email,
      data.contactNumber,
    ]
  );

  const result = await guestConnection.raw(
    "SELECT @refID AS refID, @finalPrice AS finalPrice, @out_guest_id AS outGuestID, @status_var AS statusVar"
  );

  return result[0][0];
};

const searchTrip = async (from, to, frequency) => {
  return guestConnection("trip")
    .where("originCode", from)
    .andWhere("destinationCode", to)
    .andWhere("frequency", frequency)
    .select(
      "ID",
      "originCode",
      "departureDateAndTime",
      "arrivalDateAndTime",
      "destinationCode",
      "durationMinutes",
      "trainName"
    )
    .then((trips) => {
      if (trips.length) {
        return trips;
      } else {
        return null;
      }
    });
};

const userSearchBookedTickets = async (username) => {
  return ruConnection("ticket")
    .where("bookedUser", username)
    .select(
      "ticketNumber",
      "passenger",
      "route",
      "origin",
      "destination",
      "departureTime",
      "class",
      "bookingRefID",
      "bookedUser",
      "status"
    )
    .then((tickets) => {
      if (tickets.length) {
        return tickets;
      } else {
        return null;
      }
    });
};

const guestSearchBookedTickets = async (guestID) => {
  return guestConnection("ticket")
    .select(
      "ticketNumber",
      "passenger",
      "route",
      "origin",
      "destination",
      "departureTime",
      "class",
      "bookingRefID",
      "status"
    )
    .innerJoin("guest", "ticket.bookingRefID", "guest.Booking_Ref_ID")
    .where("guest.Guest_ID", guestID)
    .then((tickets) => {
      if (tickets.length) {
        return tickets;
      } else {
        return null;
      }
    });
};

const userGetPendingPayments = async (username) => {
  return ruConnection("booked_seat as bk")
    .select(
      "bkset.Booking_Ref_ID as bookingRefID",
      "bkset.Final_Price as price",
      "shf.Scheduled_ID as tripID",
      "bprc.Class as travelClass",
      "bk.Seat_Number as seat",
      "bk.FirstName as firstName",
      "bk.LastName as lastName",
      "bk.IsAdult as isAdult"
    )
    .innerJoin("booking as bkset", "bk.Booking", "bkset.Booking_Ref_ID")
    .innerJoin(
      "base_price as bprc",
      "bkset.BPrice_Per_Booking",
      "bprc.Price_ID"
    )
    .innerJoin(
      "scheduled_trip as shf",
      "bkset.Scheduled_Trip",
      "shf.Scheduled_ID"
    )
    .where("bkset.User", username)
    .andWhere("bkset.Completed", 0)
    .orderBy("bkset.Created_At", "desc")
    .then((rows) => {
      if (rows.length) {
        return rows;
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.error("Error executing query:", err);
    });
};

const guestGetPendingPayments = async (guestID) => {
  return guestConnection("booked_seat as bk")
    .select(
      "bkset.Booking_Ref_ID as bookingRefID",
      "bkset.Final_Price as price",
      "shf.Scheduled_ID as tripID",
      "bprc.Class as travelClass",
      "bk.Seat_Number as seat",
      "bk.FirstName as firstName",
      "bk.LastName as lastName",
      "bk.IsAdult as isAdult"
    )
    .innerJoin("booking as bkset", "bk.Booking", "bkset.Booking_Ref_ID")
    .innerJoin(
      "base_price as bprc",
      "bkset.BPrice_Per_Booking",
      "bprc.Price_ID"
    )
    .innerJoin(
      "scheduled_trip as shf",
      "bkset.Scheduled_Trip",
      "shf.Scheduled_ID"
    )
    .innerJoin("guest as gst", "bkset.Booking_Ref_ID", "gst.Booking_Ref_ID")
    .where("gst.Guest_ID ", guestID)
    .andWhere("bkset.Completed", 0)
    .orderBy("bkset.Created_At", "desc")
    .then((rows) => {
      if (rows.length) {
        return rows;
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.error("Error executing query:", err);
    });
};

const deleteBooking = async (bookingID) => {
  return ruConnection("booking").delete().where("Booking_Ref_ID", bookingID);
};

const completeBooking = async (bookingRefID) => {
  return guestConnection.raw(`CALL CompleteBooking(?)`, [bookingRefID]);
};

const searchBookedTicketByID = async (bookingID) => {
  return guestConnection("ticket")
    .select(
      "ticketNumber",
      "passenger",
      "route",
      "origin",
      "destination",
      "departureTime",
      "class",
      "bookingRefID",
      "status"
    )
    .where("bookingRefID", bookingID)
    .then((tickets) => {
      if (tickets.length) {
        return tickets;
      } else {
        return null;
      }
    });
};

module.exports = {
  userSearchBookedTickets,
  userGetPendingPayments,
  userCreateBooking,
  deleteBooking,
  completeBooking,
  guestCreateBooking,
  guestSearchBookedTickets,
  guestGetPendingPayments,
  searchBookedTicketByID,
  searchTrip,
};
