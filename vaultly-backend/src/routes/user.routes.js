const express = require("express");
const userRouter = express.Router();

const userController = require('../controllers/user.controller');
const authMiddleware = require("../middlewares/authMiddleware");
const { accountUpdateLimiter } = require("../middlewares/rateLimitMiddleware");

userRouter.get("/:id", authMiddleware.authenticate, userController.getUserById);

// Rate limited: changing email checks the current password, so it must not allow guessing.
userRouter.put("/:id", accountUpdateLimiter, authMiddleware.authenticate, userController.updateUserById);

module.exports = userRouter;