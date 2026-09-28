const express = require("express");
const { body } = require("express-validator");
const { signup, login, me } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Create an account (also provisions a ₹1,00,000 demo wallet)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *     responses:
 *       201: { description: Account created }
 *       409: { description: Email already registered }
 */
router.post(
  "/signup",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validateRequest,
  signup
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 */
router.get("/me", protect, me);

module.exports = router;
