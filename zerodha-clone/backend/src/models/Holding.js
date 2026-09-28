const { Schema, model } = require("mongoose");

const HoldingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, uppercase: true, trim: true },
    qty: { type: Number, required: true, min: 0 },
    avg: { type: Number, required: true, min: 0 }, // weighted average buy price
  },
  { timestamps: true }
);

HoldingSchema.index({ user: 1, name: 1 }, { unique: true });

const Holding = model("Holding", HoldingSchema);
module.exports = { Holding };
