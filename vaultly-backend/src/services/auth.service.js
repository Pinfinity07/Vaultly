const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Set it in your environment for JWT signing.');
}

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Access and refresh tokens share a secret, so each carries a type and each check
// accepts only its own. Without it a 7-day refresh token passed as an access token,
// and a stolen access token could be traded for fresh refresh tokens indefinitely.
// Accepts a small payload { userId, role }
function generateAccessToken(payload) {
  return jwt.sign({ ...payload, type: "access" }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: "HS256" });
}

function generateRefreshToken(payload) {
  return jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, { expiresIn: "7d", algorithm: "HS256" });
}

function verifyToken(token, type) {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    return payload.type === type ? payload : null;
  } catch (err) {
    return null;
  }
}

function verifyAccessToken(token) {
  return verifyToken(token, "access");
}

function verifyRefreshToken(token) {
  return verifyToken(token, "refresh");
}

async function findUserByEmail(email) {
  return await prisma.users.findUnique({ where: { email } });
}

async function findUserById(id) {
  return await prisma.users.findUnique({ where: { id } });
}

async function createUser({ full_name, email, passwordHash, role = "user" }) {
  return await prisma.users.create({ data: { full_name, email, passwordHash, role } });
}

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  findUserByEmail,
  findUserById,
  createUser,
};
