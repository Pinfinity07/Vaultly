require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes.js");
const expenseRoutes = require("./routes/expense.routes.js");
const userRoutes = require("./routes/user.routes.js");
const groupRoutes = require("./routes/group.routes.js");
const goalRoutes = require("./routes/goal.routes.js");
const analyticsRoutes = require("./routes/analytics.routes.js");
const oauthRoutes = require("./routes/oauth.routes.js");

const cors = require("cors");

const app = express();
// Exact origins only. Requests carry auth cookies, so a pattern such as
// https://vaultly*.vercel.app would let anyone's Vercel project read users' data.
// Add preview deployments through CORS_ORIGINS (comma-separated).
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://vaultly-one.vercel.app',
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()),
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin);
    if (isAllowed) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(cookieParser());

// Health check endpoint for wake-up calls
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is awake" });
});

app.use("/auth", authRoutes);
app.use("/auth", oauthRoutes);
app.use("/expenses", expenseRoutes);
app.use("/users", userRoutes);
app.use("/groups", groupRoutes);
app.use("/goals", goalRoutes);
app.use("/analytics", analyticsRoutes);

const PORT = process.env.PORT || 8000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;