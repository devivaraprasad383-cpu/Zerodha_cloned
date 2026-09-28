const jwt = require("jsonwebtoken");
const { config } = require("../config/env");

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

module.exports = { signToken };
