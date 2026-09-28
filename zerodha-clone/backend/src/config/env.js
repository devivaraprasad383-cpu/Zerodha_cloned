/**
 * Centralised, validated environment configuration.
 *
 * Rationale: reading `process.env.X` all over the codebase makes it easy to
 * ship a typo'd variable name, or to boot in production without a secret set.
 * Instead every other module imports the frozen `config` object below, and
 * the process refuses to start if a required variable is missing.
 */
require("dotenv").config();

const REQUIRED_IN_PRODUCTION = ["MONGO_URL", "JWT_SECRET"];

const toList = (value, fallback) =>
  (value ? value.split(",").map((v) => v.trim()).filter(Boolean) : fallback);

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  port: Number(process.env.PORT) || 3002,

  mongoUrl:
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/zerodha-clone",

  jwtSecret: process.env.JWT_SECRET || "dev-only-insecure-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  clientOrigins: toList(process.env.CLIENT_ORIGINS, [
    "http://localhost:3000",
    "http://localhost:3001",
  ]),

  priceTickIntervalMs: Number(process.env.PRICE_TICK_INTERVAL_MS) || 2000,

  seedDemoEmail: process.env.SEED_DEMO_EMAIL || "demo@zerodha.local",
  seedDemoPassword: process.env.SEED_DEMO_PASSWORD || "Demo@1234",
});

function assertValidConfig() {
  if (!config.isProduction) return;
  const missing = REQUIRED_IN_PRODUCTION.filter((key) => {
    const envKey = key === "MONGO_URL" ? "MONGO_URL" : key;
    return !process.env[envKey];
  });
  if (missing.length) {
    // Fail fast and loud rather than serving traffic with insecure defaults.
    // eslint-disable-next-line no-console
    console.error(
      `Missing required environment variables in production: ${missing.join(", ")}`
    );
    process.exit(1);
  }
}

module.exports = { config, assertValidConfig };
