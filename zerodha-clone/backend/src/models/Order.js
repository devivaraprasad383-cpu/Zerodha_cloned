const { Schema, model } = require("mongoose");

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, uppercase: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    mode: { type: String, enum: ["BUY", "SELL"], required: true },
    status: {
      type: String,
      enum: ["EXECUTED", "REJECTED"],
      required: true,
      default: "EXECUTED",
    },
    rejectReason: { type: String },
  },
  { timestamps: true }
);

const Order = model("Order", OrderSchema);
module.exports = { Order };
