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

const updateForgotPW = async (token, expirationTime, email) => {
  return connection("registered_user")
    .where("registered_user.email", email)
    .update({
      reset_password_token: token,
      reset_password_expires: expirationTime,
    })
    .then((result) => {
      return result[0];
    });
};

const findUserByToken = async (token) => {
  return connection("registered_user")
    .where({ reset_password_token: token })
    .andWhere("reset_password_expires", ">", Date.now())
    .then((user) => {
      if (user.length) {
        return user[0];
      } else {
        return null;
      }
    });
};

const updatePassword = async (username, password) => {
  await connection("registered_user")
    .where("registered_user.Username", username)
    .update({
      reset_password_token: null,
      reset_password_expires: null,
    });
  return connection("user").where("user.Username", username).update({
    password,
  });
};

const getMailByBookingRefId = async (bookingRefId) => {
  const username = await connection("booking")
    .where({ Booking_Ref_ID: bookingRefId })
    .select("User")
    .then((result) => {
      return result[0].User;
    });

  return connection("registered_user")
    .where({ Username: username })
    .select("Email")
    .then((result) => {
      return result[0].Email;
    });
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
  updateForgotPW,
  findUserByToken,
  updatePassword,
  getMailByBookingRefId,
};
