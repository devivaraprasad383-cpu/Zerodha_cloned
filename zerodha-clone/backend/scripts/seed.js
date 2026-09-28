/**
 * Populates a MongoDB instance with demo data so the app is usable the
 * moment it's cloned, without hand-crafting requests:
 *   - a demo user + wallet (credentials from .env, defaults in .env.example)
 *   - the watchlist instruments (canonical market-data source for the
 *     price-simulation socket)
 *   - a starter set of holdings and positions for that demo user, carried
 *     over from the project's original hardcoded dashboard data
 *
 * Usage: npm run seed
 */
require("dotenv").config();
const { connectDB } = require("../src/config/db");
const { config } = require("../src/config/env");
const logger = require("../src/config/logger");
const { User } = require("../src/models/User");
const { Wallet } = require("../src/models/Wallet");
const { Instrument } = require("../src/models/Instrument");
const { Holding } = require("../src/models/Holding");
const { Position } = require("../src/models/Position");
const authService = require("../src/services/authService");

const WATCHLIST = [
  { symbol: "INFY", lastPrice: 1555.45, previousClose: 1580.75 },
  { symbol: "ONGC", lastPrice: 116.8, previousClose: 116.9 },
  { symbol: "TCS", lastPrice: 3194.8, previousClose: 3202.85 },
  { symbol: "KPITTECH", lastPrice: 266.45, previousClose: 257.35 },
  { symbol: "QUICKHEAL", lastPrice: 308.55, previousClose: 309.0 },
  { symbol: "WIPRO", lastPrice: 577.75, previousClose: 575.9 },
  { symbol: "M&M", lastPrice: 779.8, previousClose: 779.85 },
  { symbol: "RELIANCE", lastPrice: 2112.4, previousClose: 2082.4 },
  { symbol: "HUL", lastPrice: 512.4, previousClose: 507.15 },
];

const HOLDINGS = [
  { name: "BHARTIARTL", qty: 2, avg: 538.05 },
  { name: "HDFCBANK", qty: 2, avg: 1383.4 },
  { name: "HINDUNILVR", qty: 1, avg: 2335.85 },
  { name: "INFY", qty: 1, avg: 1350.5 },
  { name: "ITC", qty: 5, avg: 202.0 },
  { name: "KPITTECH", qty: 5, avg: 250.3 },
  { name: "TCS", qty: 1, avg: 3041.7 },
  { name: "WIPRO", qty: 4, avg: 489.3 },
];

const POSITIONS = [
  { product: "CNC", name: "EVEREADY", qty: 2, avg: 316.27 },
  { product: "CNC", name: "JUBLFOOD", qty: 1, avg: 3124.75 },
];

async function seed() {
  await connectDB();
  logger.info("Seeding database...");

  await Instrument.deleteMany({});
  await Instrument.insertMany(WATCHLIST);
  logger.info(`Seeded ${WATCHLIST.length} instruments`);

  let user = await User.findOne({ email: config.seedDemoEmail });
  if (!user) {
    const result = await authService.register({
      name: "Demo User",
      email: config.seedDemoEmail,
      password: config.seedDemoPassword,
    });
    user = result.user;
    logger.info(`Created demo user: ${config.seedDemoEmail} / ${config.seedDemoPassword}`);
  } else {
    logger.info(`Demo user already exists: ${config.seedDemoEmail}`);
  }

  await Holding.deleteMany({ user: user._id });
  await Holding.insertMany(HOLDINGS.map((h) => ({ ...h, user: user._id })));
  logger.info(`Seeded ${HOLDINGS.length} holdings for demo user`);

  await Position.deleteMany({ user: user._id });
  await Position.insertMany(POSITIONS.map((p) => ({ ...p, user: user._id })));
  logger.info(`Seeded ${POSITIONS.length} positions for demo user`);

  const invested = HOLDINGS.reduce((sum, h) => sum + h.qty * h.avg, 0);
  await Wallet.findOneAndUpdate(
    { user: user._id },
    { $inc: { availableCash: -invested } }
  );
  logger.info("Adjusted demo wallet to reflect the value already invested in seeded holdings");

  logger.info("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
