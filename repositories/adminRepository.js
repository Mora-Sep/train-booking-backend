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
    await adminConnection("User")
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
    await adminConnection("User")
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

const deactivateTrip = async (tripId) => {
  return adminConnection("Scheduled_Trip")
    .update({ Active: 0 })
    .where("Scheduled_ID", tripId);
};

const activateTrip = async (tripId) => {
  return adminConnection("Scheduled_Trip")
    .update({ Active: 1 })
    .where("Scheduled_ID", tripId);
};

module.exports = {
  findAdminByUsername,
  getAdminDetails,
  registerStaff,
  deactivateTrip,
  activateTrip,
  updateProfile,
};
