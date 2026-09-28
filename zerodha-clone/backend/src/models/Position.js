const { Schema, model } = require("mongoose");

const PositionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    product: { type: String, enum: ["CNC", "MIS", "NRML"], default: "CNC" },
    name: { type: String, required: true, uppercase: true, trim: true },
    qty: { type: Number, required: true },
    avg: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

PositionSchema.index({ user: 1, name: 1, product: 1 }, { unique: true });

const Position = model("Position", PositionSchema);
module.exports = { Position };
