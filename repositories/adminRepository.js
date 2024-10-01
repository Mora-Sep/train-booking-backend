const adminConnection = require("../config/db").getAdminConnection;
const bcrypt = require("bcrypt");

const findAdminByUsername = async (username) => {
  return adminConnection("staff as stf")
    .join("user as usr", "stf.Username", "usr.Username")
    .select(
      "usr.Username",
      "usr.Password",
      "usr.FirstName",
      "usr.LastName",
      "stf.Role"
    )
    .where("stf.Username", username)
    .andWhere("stf.Role", "Admin")
    .then((admin) => {
      if (admin.length) {
        return admin[0];
      } else {
        return null;
      }
    });
};

const getAdminDetails = async (username) => {
  return adminConnection("staff as stf")
    .join("user as usr", "stf.Username", "usr.Username")
    .select("usr.Username", "usr.FirstName", "usr.LastName", "stf.Role")
    .where("stf.Username", username)
    .then((admin) => {
      if (admin.length) {
        return admin[0];
      } else {
        return null;
      }
    });
};

const registerStaff = async (admin) => {
  return adminConnection("staff")
    .insert(admin)
    .then((result) => {
      return result;
    });
};

const updateProfile = async (username, data) => {
  if (data.newPassword) {
    await adminConnection("user")
      .where({ username: username })
      .update({
        firstname: data.firstName,
        lastname: data.lastName,
        password: bcrypt.hashSync(data.newPassword, 10),
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return err;
      });
  } else {
    await adminConnection("user")
      .where({ username: username })
      .update({ firstname: data.firstName, lastname: data.lastName })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return err;
      });
  }
};

const getAllScheduledTrips = async () => {
  return adminConnection("admin_trip")
    .select("*")
    .then((trips) => {
      return trips;
    });
};

const deactivateTrip = async (tripId) => {
  return adminConnection("scheduled_trip")
    .update({ Active: 0 })
    .where("Scheduled_ID", tripId);
};

const activateTrip = async (tripId) => {
  return adminConnection("scheduled_trip")
    .update({ Active: 1 })
    .where("Scheduled_ID", tripId);
};

const getRevenue = async (startDate, endDate) => {
  return adminConnection("booking")
    .whereBetween("Created_At", [startDate, endDate])
    .sum("Final_Price as totalRevenue")
    .then((result) => {
      return result[0].totalRevenue;
    });
};

const getTotalBookings = async (startDate, endDate) => {
  return adminConnection("booking")
    .whereBetween("Created_At", [startDate, endDate])
    .count("Booking_Ref_ID as totalBookings")
    .then((result) => {
      return result[0].totalBookings;
    });
};

const getActiveTrips = async () => {
  return adminConnection("scheduled_trip")
    .where("Active", 1)
    .count("Scheduled_ID as activeTrips")
    .then((result) => {
      return result[0].activeTrips;
    });
};

const totalUsers = async () => {
  return adminConnection("user")
    .count("Username as currentRegisteredUsers")
    .then((result) => {
      return result[0].currentRegisteredUsers;
    });
};

const totalGuests = async () => {
  return adminConnection("guest")
    .count("Guest_ID as currentGuestUsers")
    .then((result) => {
      return result[0].currentGuestUsers;
    });
};

const getBookedAdults = async () => {
  return adminConnection("booked_seat")
    .where("IsAdult", 1)
    .count("Booking as totalAdults")
    .then((result) => {
      return result[0].totalAdults;
    });
};

const getBookedChildren = async () => {
  return adminConnection("booked_seat")
    .where("IsAdult", 0)
    .count("Booking as totalChildren")
    .then((result) => {
      return result[0].totalChildren;
    });
};

module.exports = {
  findAdminByUsername,
  getAdminDetails,
  registerStaff,
  deactivateTrip,
  activateTrip,
  updateProfile,
  getAllScheduledTrips,
  getRevenue,
  getTotalBookings,
  getActiveTrips,
  totalUsers,
  totalGuests,
  getBookedAdults,
  getBookedChildren,
};
