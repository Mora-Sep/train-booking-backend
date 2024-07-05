// Define a middleware function to handle timeouts
const timeoutMiddleware = (req, res, next) => {
  req.setTimeout(20000, () => {
    // Handle timeout (e.g., log, respond with an error)
    res.status(408).json({ error: "Request Timeout" });
  });
  next();
};

module.exports = timeoutMiddleware;
