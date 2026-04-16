import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/:storyId/comments", async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { storyId: req.params.storyId },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    res.json({
      comments: comments.map((item) => ({
        ...item,
        author: item.alias,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:storyId/comments", optionalAuth, async (req, res, next) => {
  try {
    const content = String(req.body?.content || "").trim();
    const fallbackAlias = String(req.body?.alias || "访客").trim() || "访客";

    if (content.length < 2) {
      return res.status(400).json({ error: "评论内容至少 2 个字" });
    }

    const comment = await prisma.comment.create({
      data: {
        storyId: req.params.storyId,
        alias: req.user?.alias || fallbackAlias,
        content,
        userId: req.user?.id || null
      }
    });

    res.status(201).json({ comment: { ...comment, author: comment.alias } });
  } catch (error) {
    next(error);
  }
});

export default router;
