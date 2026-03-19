const express = require("express");

const authRouter = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/rateLimitMiddleware");

authRouter.post("/signup", authLimiter, authController.signup)

authRouter.post("/login", authLimiter, authController.login)

authRouter.post("/logout", authController.logout)

authRouter.get("/me", authMiddleware.authenticate, authController.ifLoggedIn)

module.exports = authRouter;