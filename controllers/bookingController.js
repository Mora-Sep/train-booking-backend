const bookingService = require("../services/bookingService");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getCheckoutSession = async (req, res) => {
  const bookingRefID = req.query.bookingRefID;
  const booking = await bookingService.getBookingCheckout(bookingRefID);
  const price = booking.finalPrice;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.STRIPE_SUCCESS_URL}`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL}`,
      customer_email: booking.email,
      client_reference_id: bookingRefID,
      line_items: [
        {
          price_data: {
            currency: "lkr",
            unit_amount: price * 100,
            product_data: {
              name: `Train Ticket`,
              description: `Train Ticket from ${booking.from} to ${booking.to} booked by ${booking.bookedUser}`,
            },
          },
          quantity: 1,
        },
      ],
    });
    res.status(200).json({ status: "success", session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPaymentIntent = async (req, res) => {
  const { bookingRefID } = req.query;
  const booking = await bookingService.getBookingCheckout(bookingRefID);
  const price = booking.finalPrice;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: "lkr",
      metadata: { bookingRefID },
    });

    res
      .status(200)
      .json({ status: "success", clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const searchTrip = async (req, res) => {
  try {
    const result = await bookingService.searchTrip(
      req.query.from,
      req.query.to,
      req.query.frequency
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getSeats = async (req, res) => {
  try {
    const result = await bookingService.getSeats(
      req.query.from,
      req.query.to,
      req.query.frequency,
      req.query.id
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userSearchBookedTickets = async (req, res) => {
  try {
    const username = req.user.username;
    const tickets = await bookingService.userSearchBookedTickets(username);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userGetPendingPayments = async (req, res) => {
  try {
    const username = req.user.username;
    const pendingPayments = await bookingService.userGetPendingPayments(
      username
    );
    res.status(200).json(pendingPayments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userGetPaymentHistory = async (req, res) => {
  try {
    const username = req.user.username;
    const paymentHistory = await bookingService.userGetPaymentHistory(username);
    res.status(200).json(paymentHistory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userCreateBooking = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await bookingService.userCreateBooking(username, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const userCancelBooking = async (req, res) => {
  try {
    const username = req.user.username;
    const result = await bookingService.userCancelBooking(
      username,
      req.query.bookingRefID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const guestCreateBooking = async (req, res) => {
  try {
    const result = await bookingService.guestCreateBooking(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const guestSearchBookedTickets = async (req, res) => {
  try {
    const result = await bookingService.guestSearchBookedTickets(
      req.query.guestID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const guestGetPendingPayments = async (req, res) => {
  try {
    const result = await bookingService.guestGetPendingPayments(
      req.query.guestID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const guestDeleteBooking = async (req, res) => {
  try {
    const result = await bookingService.guestDeleteBooking(
      req.query.guestID,
      req.query.bookingRefID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const completeBooking = async (req, res) => {
  try {
    const result = await bookingService.completeBooking(req.query.bookingRefID);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const searchBookedTicketByID = async (req, res) => {
  try {
    const { bookingRefID } = req.query;

    // Validate the query parameter
    if (!bookingRefID) {
      return res
        .status(400)
        .json({ error: "Missing bookingRefID in query parameters" });
    }
    const result = await bookingService.searchBookedTicketByID(
      req.query.bookingRefID
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const result = await bookingService.getStatus(req.query.bookingRefID);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const sendTicket = async (req, res) => {
  try {
    const { bookingRefID } = req.body;
    await bookingService.sendTicket(bookingRefID);
    res.status(200).json({ message: "Ticket sent successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  userSearchBookedTickets,
  userGetPendingPayments,
  userGetPaymentHistory,
  userCreateBooking,
  guestSearchBookedTickets,
  guestGetPendingPayments,
  guestCreateBooking,
  guestDeleteBooking,
  completeBooking,
  searchBookedTicketByID,
  searchTrip,
  getSeats,
  getCheckoutSession,
  getPaymentIntent,
  getStatus,
  userCancelBooking,
  sendTicket,
};
