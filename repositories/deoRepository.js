const deoConnection = require("../config/db").getStaffConnection;
const bcrypt = require("bcrypt");

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

const updateProfile = async (username, data) => {
  if (data.newPassword) {
    if (
      !(await deoConnection("User")
        .select("password")
        .where({ username: username })) ===
      bcrypt.hashSync(data.currentPassword, 10)
    )
      throw new Error("Invalid Credentials");

    await deoConnection("User")
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
    await deoConnection("User")
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

const getDEODetails = async (username) => {
  return deoConnection("staff as stf")
    .join("user as usr", "stf.Username", "usr.Username")
    .select("usr.Username", "usr.FirstName", "usr.LastName", "stf.Role")
    .where("stf.Username", username)
    .then((deo) => {
      if (deo.length) {
        return deo[0];
      } else {
        return null;
      }
    });
};

const createModel = async (data) => {
  await deoConnection.raw(`SET @status_var = FALSE`);
  const status = await deoConnection.raw(
    "CALL CreateModel(?, ?, @status_var)",
    [data.modelName, JSON.stringify(data.seatsCount)]
  );
  return status;
};

const createTrain = async (data) => {
  return deoConnection.insert(data).into("train");
};

const createRailwayStation = async (data) => {
  await deoConnection.raw(`SET @status_var = FALSE`);
  const status = await deoConnection.raw(
    "CALL CreateRailwayStation(?, ?, ?, @status_var)",
    [data.code, data.name, data.district]
  );

  return status;
};

const createRoute = async (data) => {
  await deoConnection.raw(`SET @status_var = FALSE`);
  const status = await deoConnection.raw(
    "CALL CreateRoute(?, ?, ?, ?, @status_var)",
    [
      data.origin,
      data.destination,
      data.duration,
      JSON.stringify(data.basePrice),
    ]
  );

  return status;
};

const scheduleTrip = async (data) => {
  await deoConnection.raw(`SET @status_var = FALSE`);
  const status = await deoConnection.raw(
    "CALL ScheduleTrip(?, ?, ?, ?, @status_var)",
    [data.routeID, data.trainCode, data.departureTime, data.frequency]
  );

  return status;
};

const updateDelay = async (data) => {
  await deoConnection("scheduled_trip")
    .where({ Scheduled_ID: data.scheduledID })
    .update({ Delay_Minutes: data.delay })
    .then((result) => {
      return result;
    })
    .catch((err) => {
      return err;
    });
};

module.exports = {
  findDEOByUsername,
  getDEODetails,
  createModel,
  createTrain,
  createRailwayStation,
  createRoute,
  scheduleTrip,
  updateDelay,
  updateProfile,
};
