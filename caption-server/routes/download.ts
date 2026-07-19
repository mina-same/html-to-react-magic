import { Router } from "express";
import * as fsp from "fs/promises";
import * as path from "path";
import { getProject } from "../services/project-service.js";
import { getRenderOutputPath } from "../services/project-service.js";
import { exportSRT } from "../services/caption-service.js";

const router = Router();

// Download rendered MP4
router.get("/projects/:id/download/video", async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const outputPath = getRenderOutputPath(project.id);
  try {
    await fsp.access(outputPath);
  } catch {
    res.status(404).json({ error: "Rendered video not found. Start a render first." });
    return;
  }

  const filename = `captions-${project.id.slice(0, 8)}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "video/mp4");
  res.sendFile(outputPath);
});

// Download SRT file
router.get("/projects/:id/download/srt", async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (project.captions.length === 0) {
    res.status(400).json({ error: "No captions available to export" });
    return;
  }

  const srt = exportSRT(project.captions, project.captionGrouping);
  const filename = `captions-${project.id.slice(0, 8)}.srt`;
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/x-subrip; charset=utf-8");
  res.send(Buffer.from(srt, "utf-8"));
});

export default router;
