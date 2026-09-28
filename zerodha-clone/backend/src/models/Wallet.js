const { Schema, model } = require("mongoose");

/**
 * One wallet per user. Tracks available cash vs. margin currently locked in
 * open positions, backing the "Funds" screen in the dashboard.
 */
const WalletSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    availableCash: { type: Number, required: true, default: 0 },
    usedMargin: { type: Number, required: true, default: 0 },
    openingBalance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Wallet = model("Wallet", WalletSchema);
module.exports = { Wallet };
