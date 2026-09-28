const { config } = require("../config/env");
const { tickAllInstruments, listInstruments } = require("../services/marketDataService");
const logger = require("../config/logger");

let tickerStarted = false;

/**
 * Attaches a "market" namespace that streams simulated live-price ticks to
 * every connected dashboard client. A single module-level interval drives
 * all sockets, instead of starting a new interval per connection.
 */
function attachPriceSocket(io) {
  const market = io.of("/market");

  market.on("connection", async (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);
    socket.emit("instruments", await listInstruments());

    socket.on("disconnect", () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  if (!tickerStarted) {
    tickerStarted = true;
    setInterval(async () => {
      try {
        const updated = await tickAllInstruments();
        if (updated.length) {
          market.emit("priceUpdate", updated);
        }
      } catch (err) {
        logger.error(`Price tick failed: ${err.message}`);
      }
    }, config.priceTickIntervalMs);
  }
}

module.exports = { attachPriceSocket };
