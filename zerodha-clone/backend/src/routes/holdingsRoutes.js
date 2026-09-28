const express = require("express");
const { getHoldings } = require("../controllers/holdingsController");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * @openapi
 * /holdings:
 *   get:
 *     summary: List the authenticated user's holdings
 *     tags: [Portfolio]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Holdings list }
 */
router.get("/", protect, getHoldings);

module.exports = router;
