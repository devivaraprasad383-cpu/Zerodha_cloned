const jwt = require("jsonwebtoken");
const { config } = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { User } = require("../models/User");

/**
 * Verifies the `Authorization: Bearer <token>` header, loads the referenced
 * user, and attaches it to `req.user`. Every portfolio/order route is scoped
 * to `req.user._id`, which is what gives each account an isolated portfolio
 * instead of the original single shared dataset.
 */
const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw ApiError.unauthorized("Missing or malformed Authorization header");
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized("User for this token no longer exists");
  }

  req.user = user;
  next();
});

module.exports = { protect };
