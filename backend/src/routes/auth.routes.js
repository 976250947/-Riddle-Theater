import { Router } from "express";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

function serializeUser(user) {
  return {
    id: user.id,
    username: user.username,
    alias: user.alias,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.post("/register", async (req, res, next) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();
    const alias = String(req.body?.alias || username).trim() || username;

    if (username.length < 2 || password.length < 6) {
      return res.status(400).json({ error: "用户名至少 2 位，密码至少 6 位" });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(409).json({ error: "用户名已存在" });
    }

    const user = await prisma.user.create({
      data: {
        username,
        alias,
        passwordHash: await hashPassword(password),
        role: "REGISTERED"
      }
    });

    const token = signToken(user);
    res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "").trim();
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || user.role !== "REGISTERED") {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "用户名或密码错误" });
    }

    const token = signToken(user);
    res.json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/guest", async (req, res, next) => {
  try {
    const alias = String(req.body?.alias || "旅人").trim() || "旅人";
    const suffix = Math.random().toString(36).slice(2, 8);
    const user = await prisma.user.create({
      data: {
        username: `guest_${Date.now()}_${suffix}`,
        alias,
        role: "GUEST"
      }
    });

    const token = signToken(user);
    res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

export default router;
