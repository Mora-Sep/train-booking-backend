require("dotenv").config();
const express = require("express");
const cors = require("cors");
const timeoutMiddleware = require("./middleware/timeoutMiddleware");
const userRouter = require("./routes/userRoutes");
const getAllRouter = require("./routes/getAllRoutes");
const adminRouter = require("./routes/adminRoutes");
const deoRouter = require("./routes/deoRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: "http://localhost:3000", // Allow requests from this origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(timeoutMiddleware);

// Routes
app.use("/api/get", getAllRouter);
app.use("/api/admin", adminRouter);
app.use("/api/deo", deoRouter);
app.use("/api/users", userRouter);
app.use("/api/booking", bookingRouter);

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
