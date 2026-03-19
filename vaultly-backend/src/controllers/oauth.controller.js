const { google } = require('googleapis');
const { oauth2Client, scopes } = require('../config/oauth.config');
const { generateAccessToken } = require('../services/auth.service');
const prisma = require('../lib/prisma');

const RETRY_DELAYS_MS = [400, 900];

function isTransientDbError(error) {
  const message = String(error?.message || "");

  return (
    error?.name === "PrismaClientInitializationError" ||
    error?.code === "P1001" ||
    message.includes("Can't reach database server") ||
    message.includes("ECONNRESET") ||
    message.includes("ETIMEDOUT")
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withDbRetry(operation) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= RETRY_DELAYS_MS.length || !isTransientDbError(error)) {
        throw error;
      }

      await wait(RETRY_DELAYS_MS[attempt]);
    }
  }
}

// Google OAuth - Redirect to Google
const googleLogin = (req, res) => {
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
  res.redirect(authorizeUrl);
};

// Google OAuth - Callback
const googleCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Set credentials
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      throw new Error('No email found in Google user profile');
    }

    // Find or create user (with retry for transient DB cold-start/network failures).
    let user = await withDbRetry(() =>
      prisma.users.findUnique({
        where: { email: userInfo.email },
      })
    );

    if (!user) {
      try {
        user = await withDbRetry(() =>
          prisma.users.create({
            data: {
              email: userInfo.email,
              full_name: userInfo.name || 'Google User',
              passwordHash: '',
            },
          })
        );
      } catch (error) {
        // If a parallel request created this user first, fetch it and continue.
        if (error?.code === "P2002") {
          user = await withDbRetry(() =>
            prisma.users.findUnique({
              where: { email: userInfo.email },
            })
          );
        } else {
          throw error;
        }
      }
    }

    // Generate JWT token
    const token = generateAccessToken({ userId: user.id, email: user.email });

    // Set cookie and redirect
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
  } catch (error) {
    const safeError = {
      name: error?.name || "OAuthError",
      code: error?.code,
      message: isTransientDbError(error)
        ? "Transient database connectivity issue during OAuth callback"
        : "OAuth callback failed",
    };

    console.error('Google OAuth error:', safeError);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
  }
};

module.exports = {
  googleLogin,
  googleCallback,
};
