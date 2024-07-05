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
  uri: process.env.DATABASE_URL,
  connectTimeout: 20000,
  multipleStatements: true, // Include this if you need to run multiple statements in one query
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
