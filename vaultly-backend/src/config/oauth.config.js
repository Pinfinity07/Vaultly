const { google } = require('googleapis');

// Each OAuth flow gets its own client: setCredentials() mutates the client,
// so a shared instance would leak one user's tokens into a concurrent login.
function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/auth/google/callback'
  );
}

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

module.exports = { createOAuthClient, scopes };
