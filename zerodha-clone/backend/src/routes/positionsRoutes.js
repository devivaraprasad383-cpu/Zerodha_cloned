const express = require("express");
const { getPositions } = require("../controllers/positionsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * @openapi
 * /positions:
 *   get:
 *     summary: List the authenticated user's open positions
 *     tags: [Portfolio]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Positions list }
 */
router.get("/", protect, getPositions);

module.exports = router;
