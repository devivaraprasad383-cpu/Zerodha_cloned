const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");

const { config } = require("./config/env");
const logger = require("./config/logger");
const swaggerSpec = require("./config/swagger");
const apiRoutes = require("./routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const ApiError = require("./utils/ApiError");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "100kb" }));
app.use(mongoSanitize()); // strips `$`/`.` operators from user input to block NoSQL injection
app.use(morgan(config.isProduction ? "combined" : "dev", { stream: logger.stream, skip: () => config.isTest }));
app.use("/api", apiLimiter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", apiRoutes);

// The original project exposed unauthenticated, unversioned routes like
// `GET /allHoldings` and `POST /newOrder` directly on the root path. Anyone
// with an old bookmark/Postman collection gets a clear pointer to the new
// API instead of a bare 404.
const legacyRouteMap = {
  "/allHoldings": "/api/holdings",
  "/allPositions": "/api/positions",
  "/newOrder": "/api/orders",
};
Object.entries(legacyRouteMap).forEach(([oldPath, newPath]) => {
  app.all(oldPath, (_req, _res, next) =>
    next(
      ApiError.badRequest(
        `This endpoint moved. Use ${newPath} (now authenticated — see /api-docs).`
      )
    )
  );
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
