const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { Position } = require("../models/Position");

const getPositions = asyncHandler(async (req, res) => {
  const positions = await Position.find({ user: req.user._id }).sort({ name: 1 });
  ok(res, positions);
});

module.exports = { getPositions };
