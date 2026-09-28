const express = require("express");
const { body } = require("express-validator");
const { getWallet, addFunds } = require("../controllers/walletController");
const { protect } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * @openapi
 * /funds:
 *   get:
 *     summary: Get the authenticated user's wallet/margin summary
 *     tags: [Funds]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Wallet }
 */
router.get("/", protect, getWallet);

/**
 * @openapi
 * /funds/add:
 *   post:
 *     summary: Add funds to the demo wallet
 *     tags: [Funds]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated wallet }
 */
router.post(
  "/add",
  protect,
  [body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0")],
  validateRequest,
  addFunds
);

module.exports = router;
