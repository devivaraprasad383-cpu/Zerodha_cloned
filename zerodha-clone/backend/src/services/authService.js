const bcrypt = require("bcryptjs");
const { User } = require("../models/User");
const { Wallet } = require("../models/Wallet");
const ApiError = require("../utils/ApiError");
const { signToken } = require("./tokenService");

const STARTING_DEMO_BALANCE = 100000; // ₹1,00,000 paper-trading balance for every new signup
const SALT_ROUNDS = 10;

async function register({ name, email, password }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  await Wallet.create({
    user: user._id,
    availableCash: STARTING_DEMO_BALANCE,
    usedMargin: 0,
    openingBalance: STARTING_DEMO_BALANCE,
  });

  return { user, token: signToken(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  return { user, token: signToken(user) };
}

module.exports = { register, login, STARTING_DEMO_BALANCE };
