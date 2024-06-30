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
  const { error } = joi.string().min(2).max(4).validate(model);
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

module.exports = {
  validateUser,
  validateUserWOPassword,
  validateStaff,
  validateModel,
  validateRoute,
  validateTrain,
  validateRailwayStation,
  validateTrip,
};
