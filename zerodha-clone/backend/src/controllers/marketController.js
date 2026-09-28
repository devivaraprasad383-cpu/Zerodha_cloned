const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const marketDataService = require("../services/marketDataService");

const getInstruments = asyncHandler(async (_req, res) => {
  const instruments = await marketDataService.listInstruments();
  ok(res, instruments);
});

module.exports = { getInstruments };
