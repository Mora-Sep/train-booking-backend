require("dotenv").config();
const knex = require("knex");

// MySQL Connection
const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const getAdminConnection = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_ADMIN,
    port: process.env.DB_PORT,
    password: process.env.DB_ADMIN_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const getStaffConnection = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_STAFF,
    port: process.env.DB_PORT,
    password: process.env.DB_STAFF_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const getRegisteredUserConnection = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_REGISTERED_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_REGISTERED_USER_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const getGuestConnection = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_GUEST_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_GUEST_PASSWORD,
    database: process.env.DB_NAME,
  },
});

module.exports = {
  db,
  getAdminConnection,
  getStaffConnection,
  getRegisteredUserConnection,
  getGuestConnection,
};
