require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

// Read SQL file
const schemaPath = path.join(__dirname, "DBSchema.sql");
const dataPath = path.join(__dirname, "Sample_Data.sql");

const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
const dataSQL = fs.readFileSync(dataPath, "utf-8");

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DEV_DB_HOST,
  user: process.env.DEV_DB_USER,
  password: process.env.DEV_DB_PASSWORD,
  connectTimeout: 20000,
  multipleStatements: true,
});

// Execute SQL script
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL server.");

  connection.query(schemaSQL, (error, results) => {
    if (error) throw error;
    console.log("Schema created successfully.");

    connection.query(dataSQL, (error, results) => {
      if (error) throw error;
      console.log("Data populated successfully.");
      connection.end();
    });
  });
});
