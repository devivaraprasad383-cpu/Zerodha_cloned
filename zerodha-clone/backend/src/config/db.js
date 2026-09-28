const mongoose = require("mongoose");
const { config } = require("./env");
const logger = require("./logger");

/**
 * Connects to MongoDB with a small retry loop so a container that starts
 * before its `mongo` dependency is ready (e.g. under docker-compose) doesn't
 * crash-loop — it backs off and tries again a few times instead.
 */
async function connectDB({ retries = 5, delayMs = 2000 } = {}) {
  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(config.mongoUrl);
      logger.info(`MongoDB connected -> ${redact(config.mongoUrl)}`);
      return mongoose.connection;
    } catch (err) {
      logger.error(
        `MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`
      );
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

function redact(uri) {
  // Never log credentials that might be embedded in the connection string.
  return uri.replace(/\/\/(.*):(.*)@/, "//***:***@");
}

module.exports = { connectDB };
