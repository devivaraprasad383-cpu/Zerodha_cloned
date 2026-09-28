const swaggerJsdoc = require("swagger-jsdoc");
const { config } = require("./env");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Zerodha Clone Trading API",
      version: "2.0.0",
      description:
        "REST API for authentication, portfolio holdings/positions, order execution and live market data.",
    },
    servers: [{ url: `http://localhost:${config.port}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // JSDoc `@openapi` blocks live next to each route file.
  apis: ["./src/routes/*.js"],
});

module.exports = swaggerSpec;
