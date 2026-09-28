const http = require("http");
const { Server } = require("socket.io");

const app = require("./src/app");
const { config, assertValidConfig } = require("./src/config/env");
const { connectDB } = require("./src/config/db");
const logger = require("./src/config/logger");
const { attachPriceSocket } = require("./src/sockets/priceSocket");

assertValidConfig();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: config.clientOrigins, credentials: true },
});
attachPriceSocket(io);

let server;

async function start() {
  await connectDB();
  server = httpServer.listen(config.port, () => {
    logger.info(`API listening on port ${config.port} [${config.nodeEnv}]`);
    logger.info(`Swagger docs at http://localhost:${config.port}/api-docs`);
  });
}

function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});

start();

module.exports = { httpServer, io };
