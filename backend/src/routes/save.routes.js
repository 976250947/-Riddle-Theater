import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const saves = await prisma.saveSlot.findMany({
      where: { userId: req.user.id },
      orderBy: { slotId: "asc" }
    });

    res.json({
      saves: saves.map((item) => ({
        slotId: item.slotId,
        data: item.payload,
        updatedAt: item.updatedAt,
        title: item.title,
        storyId: item.storyId
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const slotId = String(req.body?.slotId || "").trim();
    const data = req.body?.data;
    const title = String(req.body?.title || "").trim() || data?.story?.title || data?.story?.id || null;

    if (!slotId || !data) {
      return res.status(400).json({ error: "slotId 和 data 为必填" });
    }

    const saved = await prisma.saveSlot.upsert({
      where: {
        userId_slotId: {
          userId: req.user.id,
          slotId
        }
      },
      update: {
        payload: data,
        title,
        storyId: data?.story?.id || null
      },
      create: {
        slotId,
        payload: data,
        title,
        storyId: data?.story?.id || null,
        userId: req.user.id
      }
    });

    res.json({ ok: true, slotId: saved.slotId, updatedAt: saved.updatedAt });
  } catch (error) {
    next(error);
  }
});

router.delete("/:slotId", requireAuth, async (req, res, next) => {
  try {
    await prisma.saveSlot.delete({
      where: {
        userId_slotId: {
          userId: req.user.id,
          slotId: req.params.slotId
        }
      }
    });

    res.json({ ok: true });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "存档不存在" });
    }
    next(error);
  }
});

export default router;
