import { Router } from "express";
import { getStoryDetail, listStories } from "../services/story.service.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json({ stories: await listStories() });
  } catch (error) {
    next(error);
  }
});

router.get("/:storyId", async (req, res, next) => {
  try {
    const detail = await getStoryDetail(req.params.storyId);
    if (!detail) {
      return res.status(404).json({ error: "故事不存在" });
    }
    res.json({ story: detail });
  } catch (error) {
    next(error);
  }
});

export default router;
