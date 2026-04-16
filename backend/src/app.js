import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import storyRoutes from "./routes/story.routes.js";
import saveRoutes from "./routes/save.routes.js";
import commentRoutes from "./routes/comment.routes.js";

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

export function createApp() {
  const app = express();

  app.use(cors({ origin: clientOrigin, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "riddle-theatre-api" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/stories", storyRoutes);
  app.use("/api/saves", saveRoutes);
  app.use("/api/stories", commentRoutes);

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: error.message || "服务器内部错误" });
  });

  return app;
}
