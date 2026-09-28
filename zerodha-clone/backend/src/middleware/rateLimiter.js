const rateLimit = require("express-rate-limit");

// General API traffic.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Tighter limit on auth endpoints to slow down credential-stuffing/brute force.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many attempts, please try again later." },
  },
});

module.exports = { apiLimiter, authLimiter };
