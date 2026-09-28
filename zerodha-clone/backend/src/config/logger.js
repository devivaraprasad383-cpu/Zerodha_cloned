const winston = require("winston");
const { config } = require("./env");

/**
 * Structured logger used in place of scattered console.log calls.
 * - Human-readable, colourised output in development.
 * - Single-line JSON in production/test so logs are easy to ship to an
 *   aggregator (CloudWatch, ELK, Datadog, ...).
 */
const logger = winston.createLogger({
  level: config.isProduction ? "info" : "debug",
  format: config.isProduction
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.printf(
          ({ level, message, timestamp, ...meta }) =>
            `${timestamp} ${level}: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ""
            }`
        )
      ),
  transports: [new winston.transports.Console({ silent: config.isTest })],
});

// Stream adapter so morgan's HTTP access logs flow through winston too.
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
