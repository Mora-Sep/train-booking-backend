const adminConnection = require("../config/db").getAdminConnection;

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

module.exports = {
  findAdminByUsername,
  getAdminDetails,
  registerStaff,
};
