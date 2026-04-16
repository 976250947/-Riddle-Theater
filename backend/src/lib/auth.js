import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "riddle-theatre-dev-secret";

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;
  return bcrypt.compare(password, passwordHash);
}

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      alias: user.alias,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getBearerToken(headers) {
  const auth = headers.authorization || headers.Authorization || "";
  return typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
}
