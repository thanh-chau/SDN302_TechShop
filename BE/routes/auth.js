const express = require("express");
const router = express.Router();
const { login, register, getMe } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/register
router.post("/register", register);

// GET /api/auth/me  (protected)
router.get("/me", authenticate, getMe);

module.exports = router;
