const { Schema, model } = require("mongoose");

/**
 * Canonical market-data record for a tradable symbol. This replaces the
 * hardcoded `dashboard/src/data/data.js` watchlist as the single source of
 * truth, and is what the price-simulation socket perturbs on each tick.
 */
const InstrumentSchema = new Schema(
  {
    symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
    exchange: { type: String, default: "NSE" },
    lastPrice: { type: Number, required: true },
    previousClose: { type: Number, required: true },
  },
  { timestamps: true }
);

InstrumentSchema.virtual("dayChangePercent").get(function dayChangePercent() {
  if (!this.previousClose) return 0;
  return ((this.lastPrice - this.previousClose) / this.previousClose) * 100;
});
InstrumentSchema.set("toJSON", { virtuals: true });

const Instrument = model("Instrument", InstrumentSchema);
module.exports = { Instrument };
