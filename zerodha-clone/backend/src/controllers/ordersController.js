const asyncHandler = require("../utils/asyncHandler");
const { ok, created } = require("../utils/apiResponse");
const { Order } = require("../models/Order");
const orderService = require("../services/orderService");

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  ok(res, orders);
});

const placeOrder = asyncHandler(async (req, res) => {
  const { name, qty, price, mode } = req.body;
  const result = await orderService.placeOrder(req.user, {
    name,
    qty: Number(qty),
    price: Number(price),
    mode,
  });
  created(res, result);
});

module.exports = { getOrders, placeOrder };
