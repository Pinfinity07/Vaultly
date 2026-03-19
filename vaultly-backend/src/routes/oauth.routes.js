const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauth.controller');
const { oauthLimiter } = require('../middlewares/rateLimitMiddleware');

// Google OAuth routes
router.get('/google', oauthLimiter, oauthController.googleLogin);
router.get('/google/callback', oauthLimiter, oauthController.googleCallback);

module.exports = router;
