const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/**
 * Place after an array of express-validator checks on a route. Collects any
 * failures into a single 422 instead of letting bad input reach a
 * controller/service.
 */
function validateRequest(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    throw ApiError.unprocessable(
      "Validation failed",
      result.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
}

module.exports = validateRequest;
