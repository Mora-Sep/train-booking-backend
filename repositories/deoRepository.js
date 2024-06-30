const deoConnection = require("../config/db").getStaffConnection;

const findDEOByUsername = async (username) => {
  return deoConnection("staff as stf")
    .join("user as usr", "stf.Username", "usr.Username")
    .select(
      "usr.Username",
      "usr.Password",
      "usr.FirstName",
      "usr.LastName",
      "stf.Role"
    )
    .where("stf.Username", username)
    .andWhere("stf.Role", "Data Entry Operator")
    .then((deo) => {
      if (deo.length) {
        return deo[0];
      } else {
        return null;
      }
    });
};

module.exports = {
  findDEOByUsername,
};
