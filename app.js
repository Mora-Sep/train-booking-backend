require("dotenv").config();
const express = require("express");
const cors = require("cors");
const timeoutMiddleware = require("./middleware/timeoutMiddleware");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const axios = require("axios");
const userRouter = require("./routes/userRoutes");
const getAllRouter = require("./routes/getAllRoutes");
const adminRouter = require("./routes/adminRoutes");
const deoRouter = require("./routes/deoRoutes");
const bookingRouter = require("./routes/bookingRoutes");

const app = express();

// Webhook endpoint to handle Stripe events
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Complete the booking here using session details (like session.id)
      // Call your complete booking endpoint
      try {
        axios.post(
          `http://localhost:3002/api/booking/complete/?bookingRefID=${session.client_reference_id}`
        );
      } catch (error) {
        console.error("Error completing the booking:", error);
      }

      res.status(200).send("Success");
    } else {
      res.status(400).send("Unhandled event type");
    }
  }
);

const port = process.env.PORT || 3000;
const corsOptions = {
  origin: "https://train-booking-frontend-eight.vercel.app", // Allow requests from this origin
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
