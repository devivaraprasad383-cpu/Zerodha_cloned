const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const ApiError = require("../utils/ApiError");
const { Wallet } = require("../models/Wallet");

const getWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) throw ApiError.notFound("Wallet not found");
  ok(res, wallet);
});

const addFunds = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const wallet = await Wallet.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { availableCash: amount } },
    { new: true }
  );
  if (!wallet) throw ApiError.notFound("Wallet not found");
  ok(res, wallet);
});

module.exports = { getWallet, addFunds };
