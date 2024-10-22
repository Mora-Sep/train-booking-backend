require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

// Read SQL file
const schemaPath = path.join(__dirname, "DBSchema.sql");
const dataPath = path.join(__dirname, "Sample_Data.sql");

const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
const dataSQL = fs.readFileSync(dataPath, "utf-8");

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function generateScheduledTrips(startDate, days) {
  let queries = "";
  const routesTrainsTimes = [
    [1, 8056, "06:10:00"],
    [2, 8058, "06:00:00"],
    [3, 8056, "14:00:00"],
    [4, 8058, "14:30:00"],
    [9, 1005, "08:30:00"],
    [10, 1005, "15:00:00"],
    [5, 4077, "08:00:00"],
    [6, 4077, "16:00:00"],
    [7, 4077, "04:00:00"],
    [8, 4077, "12:00:00"],
  ];

  for (let i = 0; i < days; i++) {
    const dateStr = formatDate(new Date(startDate.getTime() + i * 86400000));
    const dayQueries = routesTrainsTimes
      .map((rt) => `(${rt[0]}, ${rt[1]}, '${rt[2]}', '${dateStr}')`)
      .join(",\n");
    queries += `-- Queries for ${dateStr}\nINSERT INTO scheduled_trip(Route, train, Departure_Time, Date) VALUES\n${dayQueries};\n\n`;
  }
  return queries;
}

function generateIntermediateStations(startDate, days, startingScheduleId) {
  let queries = "";
  const stationsSequences = [
    ["BEL", 1],
    ["MTR", 2],
    ["GLE", 3],
    ["KTS", 4],
    ["FOT", 5],
    ["MDA", 6],
  ];
  const stationsSequences2 = [
    ["BEL", 6],
    ["MTR", 5],
    ["GLE", 4],
    ["KTS", 3],
    ["FOT", 2],
    ["MDA", 1],
  ];
  let scheduleId = startingScheduleId;

  for (let i = 0; i < days; i++) {
    const dateStr = formatDate(new Date(startDate.getTime() + i * 86400000));
    const stationQueries = stationsSequences
      .map((ss) => `(${scheduleId}, '${ss[0]}', ${ss[1]})`)
      .join(",\n");
    const stationQueries2 = stationsSequences2
      .map((ss) => `(${scheduleId + 3}, '${ss[0]}', ${ss[1]})`)
      .join(",\n");
    queries += `-- Intermediate stations for ${dateStr} (Schedule ${scheduleId})\nINSERT INTO intermediate_station (Schedule, Code, Sequence) VALUES\n${stationQueries};\n\n`;
    queries += `-- Intermediate stations for ${dateStr} (Schedule ${
      scheduleId + 3
    })\nINSERT INTO intermediate_station (Schedule, Code, Sequence) VALUES\n${stationQueries2};\n\n`;
    scheduleId += 10; // Increment by 10 for each day's schedules
  }
  return queries;
}

// Start from October 17, 2024
const startDate = new Date(2024, 9, 17); // Month is 0-indexed
const days = 90; // Number of days to generate schedules for
const startingScheduleId = 31; // Starting schedule ID

const scheduledTripQueries = generateScheduledTrips(startDate, days);
const intermediateStationQueries = generateIntermediateStations(
  startDate,
  days,
  startingScheduleId
);

fs.writeFileSync(
  path.join(__dirname, "scheduled_trip_queries.sql"),
  scheduledTripQueries
);
fs.writeFileSync(
  path.join(__dirname, "intermediate_station_queries.sql"),
  intermediateStationQueries
);

console.log(
  "SQL queries have been generated and saved to scheduled_trip_queries.sql and intermediate_station_queries.sql"
);

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DEV_DB_HOST,
  user: process.env.DEV_DB_USER,
  password: process.env.DEV_DB_PASSWORD,
  port: process.env.DB_PORT,
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
      console.log("Initial data populated successfully.");

      connection.query(scheduledTripQueries, (error, results) => {
        if (error) throw error;
        console.log("Scheduled trips created successfully.");

        connection.query(intermediateStationQueries, (error, results) => {
          if (error) throw error;
          console.log("Intermediate stations created successfully.");

          console.log("All queries executed successfully.");
        });

        connection.end();
      });
    });
  });
});
