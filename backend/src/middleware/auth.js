import { prisma } from "../lib/prisma.js";
import { getBearerToken, verifyToken } from "../lib/auth.js";

export async function optionalAuth(req, _res, next) {
  try {
    const token = getBearerToken(req.headers);
    if (!token) {
      req.user = null;
      return next();
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req.headers);
    if (!token) {
      return res.status(401).json({ error: "未登录" });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: "登录状态无效" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "登录状态无效" });
  }
}
