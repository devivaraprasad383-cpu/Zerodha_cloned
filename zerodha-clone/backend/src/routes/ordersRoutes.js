const express = require("express");
const { body } = require("express-validator");
const { getOrders, placeOrder } = require("../controllers/ordersController");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: List the authenticated user's order history
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Orders list }
 */
router.get("/", protect, getOrders);

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Place a BUY or SELL order (validates funds/holdings, updates portfolio atomically)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Order executed }
 *       422: { description: Order rejected (insufficient funds/holdings) }
 */
router.post(
  "/",
  protect,
  [
    body("name").trim().notEmpty().withMessage("Instrument name is required"),
    body("qty").isFloat({ gt: 0 }).withMessage("Quantity must be greater than 0"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
    body("mode").isIn(["BUY", "SELL"]).withMessage("Mode must be BUY or SELL"),
  ],
  validateRequest,
  placeOrder
);

module.exports = router;
