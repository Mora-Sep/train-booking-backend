require("dotenv").config();
const express = require("express");
const userRouter = require("./routes/userRoutes");
const getAllRouter = require("./routes/getAllRoutes");
const adminRouter = require("./routes/adminRoutes");
const deoRouter = require("./routes/deoRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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
