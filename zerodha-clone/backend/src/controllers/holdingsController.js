const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { Holding } = require("../models/Holding");

const getHoldings = asyncHandler(async (req, res) => {
  const holdings = await Holding.find({ user: req.user._id }).sort({ name: 1 });
  ok(res, holdings);
});

module.exports = { getHoldings };
