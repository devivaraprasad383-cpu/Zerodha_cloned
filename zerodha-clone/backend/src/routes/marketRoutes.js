const express = require("express");
const { getInstruments } = require("../controllers/marketController");

const router = express.Router();

/**
 * @openapi
 * /market/instruments:
 *   get:
 *     summary: List instruments with live simulated prices (also streamed over websocket)
 *     tags: [Market]
 *     responses:
 *       200: { description: Instrument list }
 */
router.get("/instruments", getInstruments);

module.exports = router;
