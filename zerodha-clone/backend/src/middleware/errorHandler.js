const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { config } = require("../config/env");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // Translate common Mongoose/JS errors into ApiError so the response shape
  // stays consistent even for failures the handler didn't explicitly throw.
  if (error.name === "ValidationError") {
    error = ApiError.unprocessable("Validation failed", error.errors);
  } else if (error.code === 11000) {
    error = ApiError.conflict("A record with these unique fields already exists");
  } else if (error.name === "CastError") {
    error = ApiError.badRequest(`Invalid value for ${error.path}`);
  } else if (!(error instanceof ApiError)) {
    error = new ApiError(500, config.isProduction ? "Internal server error" : error.message);
  }

  if (!error.isOperational || error.statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
      ...(config.isProduction ? {} : { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;
