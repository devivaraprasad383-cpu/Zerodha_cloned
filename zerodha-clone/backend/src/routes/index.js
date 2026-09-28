const express = require("express");

const authRoutes = require("./authRoutes");
const holdingsRoutes = require("./holdingsRoutes");
const positionsRoutes = require("./positionsRoutes");
const ordersRoutes = require("./ordersRoutes");
const walletRoutes = require("./walletRoutes");
const marketRoutes = require("./marketRoutes");

const router = express.Router();

router.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

router.use("/auth", authRoutes);
router.use("/holdings", holdingsRoutes);
router.use("/positions", positionsRoutes);
router.use("/orders", ordersRoutes);
router.use("/funds", walletRoutes);
router.use("/market", marketRoutes);

module.exports = router;
