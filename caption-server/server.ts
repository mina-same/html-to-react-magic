import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import uploadRouter from "./routes/upload.js";
import projectsRouter from "./routes/projects.js";
import transcribeRouter from "./routes/transcribe.js";
import renderRouter from "./routes/render.js";
import downloadRouter from "./routes/download.js";
import { startCleanupScheduler } from "./services/cleanup-service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.CAPTION_SERVER_PORT ?? 3001);

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests from the React dev server (any localhost port) and from the renderer (no origin)
      if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        cb(null, true);
      } else {
        cb(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);

app.use(express.json({ limit: "10mb" }));

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    port: PORT,
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/projects", uploadRouter);          // POST /api/projects (upload)
app.use("/api/projects", projectsRouter);         // GET/PATCH/DELETE /api/projects/:id
app.use("/api/transcribe", transcribeRouter);     // POST /api/transcribe/:id
app.use("/api", renderRouter);                    // POST /api/projects/:id/render, GET /api/render-jobs/:id
app.use("/api", downloadRouter);                  // GET /api/projects/:id/download/*

// ─── Error handler ────────────────────────────────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[server] Error:", err.message);
    if (err.message?.includes("File too large")) {
      res.status(413).json({ error: `File exceeds ${process.env.MAX_UPLOAD_SIZE_MB ?? 500}MB limit` });
      return;
    }
    res.status(500).json({ error: err.message ?? "Internal server error" });
  },
);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Caption server running at http://localhost:${PORT}`);
  console.log(`OpenAI key: ${process.env.OPENAI_API_KEY ? "configured" : "NOT SET"}`);
  startCleanupScheduler();
});

export default app;
