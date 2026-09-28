const { Instrument } = require("../models/Instrument");

const MAX_TICK_PERCENT = 0.006; // +/- 0.6% per tick keeps movement plausible

/**
 * Perturbs every instrument's lastPrice by a small random walk. This stands
 * in for a real market-data feed so the dashboard's watchlist has something
 * live to render over a websocket; swap this out for a real feed adapter
 * (NSE/BSE, a vendor API) without touching the socket or route layer.
 */
async function tickAllInstruments() {
  const instruments = await Instrument.find({});
  const updates = instruments.map((instrument) => {
    const changePercent = (Math.random() * 2 - 1) * MAX_TICK_PERCENT;
    const nextPrice = Math.max(0.05, instrument.lastPrice * (1 + changePercent));
    instrument.lastPrice = Number(nextPrice.toFixed(2));
    return instrument.save();
  });
  return Promise.all(updates);
}

async function listInstruments() {
  return Instrument.find({}).sort({ symbol: 1 });
}

module.exports = { tickAllInstruments, listInstruments };
