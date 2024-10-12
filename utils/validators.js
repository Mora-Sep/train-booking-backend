const { raw } = require("express");
const joi = require("joi");

const userSchema = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  username: joi.string().required(),
  nic: joi.string().required(),
  rawPassword: joi.string().min(8).max(16).required(),
  email: joi.string().email().required(),
  gender: joi.string().required(),
  address: joi.string().required(),
  Contact_Number: joi.string().required(),
  Birth_Date: joi.string().required(),
});

const userSchemaWOPassword = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  username: joi.string().required(),
  nic: joi.string().required(),
  email: joi.string().email().required(),
  gender: joi.string().required(),
  address: joi.string().required(),
  Contact_Number: joi.string().required(),
  Birth_Date: joi.string().required(),
});

const staffSchema = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  username: joi.string().required(),
  password: joi.string().min(8).max(16).required(),
});

const validateUser = (user) => {
  const { error } = userSchema.validate(user);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateUserWOPassword = (user) => {
  const { error } = userSchemaWOPassword.validate(user);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateStaff = (staff) => {
  const { error } = staffSchema.validate(staff);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateModel = (model) => {
  const { error } = joi.number().validate(model);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateRoute = (route) => {
  const { error } = joi.number().validate(route);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateTrain = (train) => {
  const { error } = joi.number().validate(train);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateRailwayStation = (railwayStation) => {
  const { error } = joi.string().min(2).max(4).validate(railwayStation);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateTrip = (trip) => {
  const { error } = joi.number().validate(trip);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateCreateTrain = (train) => {
  const { error } = joi
    .object({
      number: joi.number().required(),
      name: joi.string().required(),
      model: joi.number().required(),
    })
    .validate(train);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateCreateRailwayStation = (station) => {
  const { error } = joi
    .object({
      code: joi.string().min(3).max(3).required(),
      name: joi.string().required(),
      district: joi.string().required(),
    })
    .validate(station);

  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateCreateRoute = (route) => {
  const { error } = joi
    .object({
      origin: joi.string().length(3).required(),
      destination: joi.string().length(3).required(),
      duration: joi.number().required(),
      basePrice: joi.allow(),
    })
    .validate(route);

  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateScheduleTrip = (trip) => {
  const { error } = joi
    .object({
      routeID: joi.number().required(),
      trainCode: joi.number().required(),
      departureTime: joi.string().required(),
      date: joi.date().required(),
    })
    .validate(trip);

  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateAddStation = (station) => {
  const { error } = joi
    .object({
      tripID: joi.number().required(),
      code: joi.string().required(),
      sequence: joi.number().required(),
    })
    .validate(station);

  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateStaffUpdate = (staff) => {
  let schema;
  if (staff.currentPassword) {
    schema = joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      username: joi.string(),
      currentPassword: joi.string().min(8).max(16).required(),
      newPassword: joi.string().min(8).max(16).required(),
    });
  } else {
    schema = joi.object({
      firstName: joi.string(),
      lastName: joi.string(),
      username: joi.string(),
    });
  }

  const { error } = schema.validate(staff);

  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateCreateBooking = (data) => {
  const { error } = joi
    .object({
      tripID: joi.number().required(),
      from: joi.string().required(),
      to: joi.string().required(),
      passengers: joi.allow(),
    })
    .validate(data);

  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateGuestCreateBooking = (data) => {
  const { error } = joi
    .object({
      tripID: joi.number().required(),
      guestID: joi.allow(),
      class: joi.string().required(),
      bookingCount: joi.number().required(),
      passengers: joi.allow(),
      from: joi.string().required(),
      to: joi.string().required(),
      email: joi.string().email(),
      contactNumber: joi.string(),
    })
    .validate(data);

  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

const validateGuestID = (guestID) => {
  const { error } = joi.string().length(12).validate(guestID);
  if (error) {
    return error.details[0].message;
  } else {
    return null;
  }
};

module.exports = {
  validateUser,
  validateUserWOPassword,
  validateStaff,
  validateModel,
  validateRoute,
  validateTrain,
  validateRailwayStation,
  validateTrip,
  validateCreateTrain,
  validateCreateRailwayStation,
  validateCreateRoute,
  validateScheduleTrip,
  validateAddStation,
  validateStaffUpdate,
  validateCreateBooking,
  validateGuestCreateBooking,
  validateGuestID,
};
