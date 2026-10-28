const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_for_development";

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Using default secret for signing.');
}

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Accepts a small payload { userId, role }
function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
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
