const connection = require("../config/db").getGuestConnection;

const createBooking = async (data) => {
  await connection.raw(`SET @refID = FALSE`); //check
  await connection.raw(`SET @finalPrice = FALSE`); //check
  await connection.raw(`SET @out_guest_id = FALSE`);
  await connection.raw(`SET @status_var = FALSE`);

  await connection.raw(
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

  const result = await connection.raw(
    "SELECT @refID AS refID, @finalPrice AS finalPrice, @out_guest_id AS outGuestID, @status_var AS statusVar"
  );

  return result[0][0];
};

const searchBookedTickets = async (guestID) => {
  return connection("ticket")
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

const getPendingPayments = async (guestID) => {
  return connection("booked_seat as bk")
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

const completeBooking = async (bookingRefID) => {
  return connection.raw(`CALL CompleteBooking(?)`, [bookingRefID]);
};

module.exports = {
  createBooking,
  searchBookedTickets,
  getPendingPayments,
  completeBooking,
};
