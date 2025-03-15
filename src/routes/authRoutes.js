const express = require("express");
const { login, refresh, protected, logout } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout)
router.post("/refresh", refresh);
router.get('/refresh', refresh);
router.get("/protected", authenticate, protected);

module.exports = router;