const connection = require("../config/db").getRegisteredUserConnection;

const findUserByEmail = async (email) => {
  return connection("registered_user")
    .where({ email })
    .then((user) => {
      if (user.length) {
        return user[0];
      } else {
        return null;
      }
    });
};

const findUserByUsername = async (username) => {
  return connection("user")
    .where({ username })
    .then((user) => {
      if (user.length) {
        return user[0];
      } else {
        return null;
      }
    });
};

const createUser = async (user) => {
  return await connection("user")
    .insert(user)
    .then((result) => {
      return result[0];
    });
};

const createRegisteredUser = async (user) => {
  return connection("registered_user").insert(user);
};

const getUserDetails = async (username) => {
  return connection("registered_user as regusr")
    .join("user_category as ctg", "regusr.Category", "ctg.Category_ID")
    .join("user as usr", "regusr.Username", "usr.Username")
    .select(
      "usr.Username",
      "usr.FirstName",
      "usr.LastName",
      "regusr.NIC",
      "regusr.Address",
      "ctg.Category_Name",
      "regusr.Birth_Date",
      "regusr.Gender",
      "regusr.Email",
      "regusr.Contact_Number",
      "regusr.Bookings_Count"
    )
    .where("regusr.Username", username)
    .then((user) => {
      if (user.length) {
        return user[0];
      } else {
        return null;
      }
    });
};

const getPassword = async (username) => {
  return connection("user")
    .where({ username })
    .select("password")
    .then((result) => {
      return result[0].password;
    });
};

const updateUser = async (user) => {
  return connection("user")
    .where("user.username", user.username)
    .update(user)
    .then((result) => {
      return result[0];
    });
};

const updateRU = async (user) => {
  return connection("registered_user")
    .where("registered_user.username", user.username)
    .update(user)
    .then((result) => {
      return result[0];
    });
};

const searchBookedTickets = async (username) => {
  return connection("ticket")
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

const getPendingPayments = async (username) => {
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

const createBooking = async (username, data) => {
  await connection.raw(`SET @refID = FALSE`); //check
  await connection.raw(`SET @finalPrice = FALSE`); //check
  await connection.raw(`SET @status_var = FALSE`);

  const result = connection.raw(
    "CALL UserCreateBooking(?,?,?,?,?,@refID,@finalPrice,@status_var)",
    [
      data.tripID,
      username,
      data.class,
      data.bookingCount,
      JSON.stringify(data.passengers),
    ]
  );
  // console.log("result : ", result);
  return result;
};

const deleteBooking = async (bookingID) => {
  return connection("booking").delete().where("Booking_Ref_ID", bookingID);
};

module.exports = {
  findUserByEmail,
  findUserByUsername,
  createUser,
  createRegisteredUser,
  getUserDetails,
  getPassword,
  updateUser,
  updateRU,
  searchBookedTickets,
  getPendingPayments,
  createBooking,
  deleteBooking,
};
