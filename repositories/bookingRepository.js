const ruConnection = require("../config/db").getRegisteredUserConnection;
const guestConnection = require("../config/db").getGuestConnection;

const userCreateBooking = async (username, data, finalPrice) => {
  await ruConnection.raw(`SET @refID = FALSE`);
  await ruConnection.raw(`SET @finalPrice = FALSE`);
  await ruConnection.raw(`SET @status_var = FALSE`);

  await ruConnection.raw(
    "CALL UserCreateBooking(?,?,?,?,?,?,@refID,@finalPrice,@status_var)",
    [
      data.tripID,
      username,
      data.from,
      data.to,
      JSON.stringify(data.passengers),
      finalPrice,
    ]
  );

  const result = await ruConnection.raw(
    "SELECT @refID AS refID, @finalPrice AS finalPrice, @status_var AS statusVar"
  );
  return result[0][0];
};

const guestCreateBooking = async (data, finalPrice) => {
  await guestConnection.raw(`SET @refID = FALSE`);
  await guestConnection.raw(`SET @finalPrice = FALSE`);
  await guestConnection.raw(`SET @out_guest_id = FALSE`);
  await guestConnection.raw(`SET @status_var = FALSE`);

  await guestConnection.raw(
    "CALL GuestCreateBooking(?,?,?,?,?,?,?,?,@refID,@finalPrice,@out_guest_id, @status_var)",
    [
      data.tripID,
      data.guestID,
      JSON.stringify(data.passengers),
      data.from,
      data.to,
      data.email,
      data.contactNumber,
      finalPrice,
    ]
  );

  const result = await guestConnection.raw(
    "SELECT @refID AS refID, @finalPrice AS finalPrice, @out_guest_id AS outGuestID, @status_var AS statusVar"
  );

  return result[0][0];
};

const userCancelBooking = async (username, bookingRefID) => {
  const currentDateTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  // Check if the booking exists for the user
  const bookingExists = await ruConnection.raw(
    `SELECT COUNT(*) as count 
     FROM booking 
     WHERE Booking_Ref_ID = ? AND User = ? AND Created_At > ?`,
    [bookingRefID, username, currentDateTime]
  );

  if (bookingExists[0][0].count > 0) {
    await ruConnection.transaction(async (trx) => {
      try {
        const bookedSeatCountResult = await trx.raw(
          `SELECT COUNT(*) as seatCount 
           FROM booked_seat 
           WHERE Booking = ?`,
          [bookingRefID]
        );
        const bookedSeatCount = bookedSeatCountResult[0][0].seatCount;

        await trx.raw(
          `DELETE FROM booking WHERE Booking_Ref_ID = ? AND User = ?`,
          [bookingRefID, username]
        );

        await trx.raw(
          `UPDATE registered_user 
           SET Bookings_Count = GREATEST(Bookings_Count - ?, 0) 
           WHERE Username = ?`,
          [bookedSeatCount, username]
        );

        // Commit the transaction
        await trx.commit();
        return {
          status: "success",
          message:
            "Booking cancelled successfully, and Bookings_Count updated.",
        };
      } catch (error) {
        // Rollback the transaction in case of an error
        await trx.rollback();
        throw new Error("Error while cancelling the booking.");
      }
    });
  } else {
    return { status: "error", message: "Booking not found or not authorized." };
  }
};

const searchTrip = async (from, to, date) => {
  // Find trips that include the origin and destination stations
  const rawTrips = await guestConnection("trip")
    .innerJoin("intermediate_station as is1", "trip.ID", "is1.Schedule")
    .innerJoin("intermediate_station as is2", "trip.ID", "is2.Schedule")
    .innerJoin("railway_station as rs1", "is1.Code", "rs1.Code")
    .innerJoin("railway_station as rs2", "is2.Code", "rs2.Code")
    .where("is1.Code", from)
    .andWhere("is2.Code", to)
    .andWhere("is1.Sequence", "<", guestConnection.raw("is2.Sequence"))
    .andWhere("trip.date", date)
    .select(
      "trip.ID",
      "is1.Code as originCode",
      "is1.Sequence as originSequence",
      "is2.Sequence as destinationSequence",
      "rs1.Name as originName",
      "trip.departureDateAndTime",
      "trip.arrivalDateAndTime",
      "is2.Code as destinationCode",
      "rs2.Name as destinationName",
      "trip.originName as routeOrigin",
      "trip.destinationName as routeDestination",
      "trip.durationMinutes",
      "trip.numberOfIntermediateStations as numberOfStops",
      "trip.trainName"
    )
    .then((trips) => {
      if (trips.length) {
        return trips;
      } else {
        return null;
      }
    });

  if (!rawTrips || rawTrips.length === 0) {
    return null;
  }

  // Fetch seat reservations for each trip
  const seatReservationsPromises = rawTrips.map((trip) =>
    guestConnection("seat_reservation")
      .where("ID", trip.ID)
      .select(
        "class",
        "totalCount",
        "totalCarts",
        "reservedCount",
        "bookedSeats"
      )
      .then((seatReservations) =>
        seatReservations.length ? seatReservations : null
      )
  );

  const seatReservations = await Promise.all(seatReservationsPromises);

  const priceList = rawTrips.map((trip) =>
    guestConnection("price_list")
      .where("scheduled_trip_id", trip.ID)
      .select("class_name AS class", "price")
      .then((prices) => (prices.length ? prices : null))
  );

  const prices = await Promise.all(priceList);

  // Combine trip and seat reservation data
  let combinedData = [];

  if (rawTrips) {
    combinedData = rawTrips.map((trip, index) => {
      const tripSeatReservations = seatReservations[index];
      const tripPrices = prices[index].map((priceObj) => {
        return {
          class: priceObj.class,
          price:
            Number(priceObj.price) *
            (Number(trip.destinationSequence) - Number(trip.originSequence)),
        };
      });

      return {
        ...trip,
        seatReservations: tripSeatReservations,
        prices: tripPrices,
      };
    });
  } else {
    console.log("No trips found.");
  }

  return combinedData;
};

const getSeats = async (from, to, date, id) => {
  // Find trips that include the origin and destination stations
  const rawTrips = await guestConnection("trip")
    .innerJoin("intermediate_station as is1", "trip.ID", "is1.Schedule")
    .innerJoin("intermediate_station as is2", "trip.ID", "is2.Schedule")
    .innerJoin("railway_station as rs1", "is1.Code", "rs1.Code")
    .innerJoin("railway_station as rs2", "is2.Code", "rs2.Code")
    .where("is1.Code", from)
    .andWhere("is2.Code", to)
    .andWhere("is1.Sequence", "<", guestConnection.raw("is2.Sequence"))
    .andWhere("trip.date", date)
    .then((trips) => (trips.length ? trips : null));

  if (!rawTrips || rawTrips.length === 0) {
    return null;
  }

  // Fetch seat reservations for each trip
  const filteredTrip = rawTrips.filter((trip) => trip.ID === Number(id));

  const seatReservations = await guestConnection("seat_reservation")
    .where("ID", filteredTrip[0].ID)
    .select("class", "totalCount", "totalCarts", "reservedCount", "bookedSeats")
    .then((seatReservations) =>
      seatReservations.length ? seatReservations : null
    );

  if (seatReservations) {
    // Create an empty array to store formatted seat data for each class
    const formattedSeats = [];

    seatReservations.forEach((reservation) => {
      const { totalCarts, totalCount, bookedSeats } = reservation;

      const seatNumbers = bookedSeats ? bookedSeats.split(",").map(Number) : [];

      // Calculate the number of seats per cart and group them by cart
      const seatsPerCart = Math.ceil(totalCount / totalCarts);

      // Create a list for the current class's carts
      const carts = [];
      for (let i = 0; i < totalCarts; i++) {
        const startValue = i * seatsPerCart + 1;
        const endValue = (i + 1) * seatsPerCart;
        const cartSeats = [];
        seatNumbers.map((seat) => {
          if (seat >= startValue && seat <= endValue) {
            cartSeats.push(seat);
          }
        });
        carts.push(cartSeats); // Add seats for each cart
      }

      // Add the cart list as an entry in the main list
      formattedSeats.push(carts); // Each class becomes an entry as [[carts]]
    });
    return formattedSeats;
  } else {
    return "No seat reservations found.";
  }
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
  const data = await ruConnection("booking as bkset")
    .select(
      "bkset.Booking_Ref_ID as bookingRefID",
      "bkset.Final_Price as price",
      "rs1.Name as from",
      "rs2.Name as to"
    )
    .innerJoin("railway_station as rs1", "bkset.from_station", "rs1.Code")
    .innerJoin("railway_station as rs2", "bkset.to_station", "rs2.Code")
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

  if (!data) {
    return null;
  }

  for (const booking of data) {
    const passengers = await ruConnection("booked_seat as bk")
      .select(
        "bk.Seat_Number as seat",
        "bk.Class as class",
        "bk.IsAdult as isAdult"
      )
      .where("bk.Booking", booking.bookingRefID)
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

    booking.passengers = passengers;
  }

  return data;
};

const userGetPaymentHistory = async (username) => {
  const data = await ruConnection("booking as bkset")
    .select(
      "bkset.Booking_Ref_ID as bookingRefID",
      "bkset.Final_Price as price",
      "rs1.Name as from",
      "rs2.Name as to"
    )
    .innerJoin("railway_station as rs1", "bkset.from_station", "rs1.Code")
    .innerJoin("railway_station as rs2", "bkset.to_station", "rs2.Code")
    .where("bkset.User", username)
    .andWhere("bkset.Completed", 1)
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

  if (!data) {
    return null;
  }

  for (const booking of data) {
    const passengers = await ruConnection("booked_seat as bk")
      .select(
        "bk.FirstName as firstName",
        "bk.LastName as lastName",
        "bk.Seat_Number as seat",
        "bk.IsAdult as isAdult"
      )
      .where("bk.Booking", booking.bookingRefID)
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

    booking.passengers = passengers;
  }

  return data;
};

const guestGetPendingPayments = async (guestID) => {
  const data = await guestConnection("booking as bkset")
    .select(
      "bkset.Booking_Ref_ID as bookingRefID",
      "bkset.Final_Price as price",
      "shf.Scheduled_ID as tripID",
      "bprc.Class as travelClass"
    )
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

  if (!data) {
    return null;
  }

  for (const booking of data) {
    const passengers = await guestConnection("booked_seat as bk")
      .select(
        "bk.FirstName as firstName",
        "bk.LastName as lastName",
        "bk.Seat_Number as seat",
        "bk.IsAdult as isAdult"
      )
      .where("bk.Booking", booking.bookingRefID)
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

    booking.passengers = passengers;
  }

  return data;
};

const completeBooking = async (bookingRefID) => {
  return guestConnection.raw(`CALL CompleteBooking(?)`, [bookingRefID]);
};

const getBookingCheckout = async (bookingRefID) => {
  return guestConnection("booking")
    .select(
      "Final_Price as finalPrice",
      "User as bookedUser",
      "from_station as from",
      "to_station as to"
    )
    .where("Booking_Ref_ID", bookingRefID)
    .then((booking) => {
      if (booking.length) {
        return booking[0];
      } else {
        return null;
      }
    });
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

// Fetch sequences for intermediate stations
async function getStationSequence(scheduledTripId, stationCode) {
  const result = await guestConnection("intermediate_station")
    .select("Sequence")
    .where({ Schedule: scheduledTripId, Code: stationCode })
    .first(); // ensures only one row is returned
  return result?.Sequence;
}

// Fetch base price per class
async function getBasePricePerClass(scheduledTripId, travelClass) {
  const result = await guestConnection("scheduled_trip as sht")
    .join("route as rut", "sht.Route", "rut.Route_ID")
    .join("base_price as bprc", "rut.Route_ID", "bprc.Route")
    .join("class as cls", "bprc.Class", "cls.Class_Code")
    .select("bprc.Price")
    .where({
      "sht.Scheduled_ID": scheduledTripId,
      "cls.Class_Name": travelClass,
    })
    .first();
  return result?.Price;
}

// Fetch user discount
async function getUserDiscount(username) {
  if (!username) return 0.0; // Guest user
  const result = await ruConnection("registered_user as usr")
    .join("user_category as ctg", "usr.Category", "ctg.Category_ID")
    .select("ctg.Discount")
    .where({ "usr.Username": username })
    .first();
  return result?.Discount || 0.0;
}

const getStatus = async (bookingRefID) => {
  const result = await guestConnection("booking")
    .select("Completed")
    .where("Booking_Ref_ID", bookingRefID)
    .first();
  return result?.Completed;
};

const getTicketDetails = async (bookingRefID) => {
  const result = await guestConnection("ticket")
    .select("*")
    .where("bookingRefID", bookingRefID);
  return result;
};

module.exports = {
  userSearchBookedTickets,
  userGetPendingPayments,
  userGetPaymentHistory,
  userCreateBooking,
  completeBooking,
  guestCreateBooking,
  guestSearchBookedTickets,
  guestGetPendingPayments,
  searchBookedTicketByID,
  searchTrip,
  getStationSequence,
  getBasePricePerClass,
  getUserDiscount,
  getSeats,
  getBookingCheckout,
  getStatus,
  userCancelBooking,
  getTicketDetails,
};
