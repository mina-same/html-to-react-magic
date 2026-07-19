import { Router } from "express";
import * as fs from "fs";
import * as fsp from "fs/promises";
import {
  getProject,
  listProjects,
  updateCaptions,
  updateStyle,
  updateGrouping,
  deleteProject,
  getRawTranscriptionPath,
  getVideoServePath,
} from "../services/project-service.js";

const router = Router();

// List all projects
router.get("/", async (_req, res) => {
  try {
    const projects = await listProjects();
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: "Failed to list projects" });
  }
});

// Get a single project
router.get("/:id", async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ project });
});

// Update captions
router.patch("/:id/captions", async (req, res) => {
  const { captions } = req.body as { captions: unknown };
  if (!Array.isArray(captions)) {
    res.status(400).json({ error: "captions must be an array" });
    return;
  }
  try {
    await updateCaptions(req.params.id, captions as Parameters<typeof updateCaptions>[1]);
    const project = await getProject(req.params.id);
    res.json({ project });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update captions";
    res.status(500).json({ error: msg });
  }
});

// Update caption style
router.patch("/:id/style", async (req, res) => {
  const { style } = req.body as { style: unknown };
  if (!style || typeof style !== "object") {
    res.status(400).json({ error: "style must be an object" });
    return;
  }
  try {
    await updateStyle(req.params.id, style as Parameters<typeof updateStyle>[1]);
    const project = await getProject(req.params.id);
    res.json({ project });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update style";
    res.status(500).json({ error: msg });
  }
});

// Update caption grouping
router.patch("/:id/grouping", async (req, res) => {
  const { grouping } = req.body as { grouping: unknown };
  if (!grouping || typeof grouping !== "object") {
    res.status(400).json({ error: "grouping must be an object" });
    return;
  }
  try {
    await updateGrouping(req.params.id, grouping as Parameters<typeof updateGrouping>[1]);
    const project = await getProject(req.params.id);
    res.json({ project });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update grouping";
    res.status(500).json({ error: msg });
  }
});

const VIDEO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  m4v: "video/x-m4v",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
};

// Serve video with proper HTTP range support so browsers can seek
router.get("/:id/video", async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project || !project.sourceVideoExt) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  const videoPath = getVideoServePath(project.id, project.sourceVideoExt);

  let stat: fsp.FileHandle | Awaited<ReturnType<typeof fsp.stat>>;
  try {
    stat = await fsp.stat(videoPath);
  } catch {
    res.status(404).json({ error: "Video file not found on disk" });
    return;
  }

  const total = (stat as Awaited<ReturnType<typeof fsp.stat>>).size;
  const contentType = VIDEO_MIME[project.sourceVideoExt] ?? "video/mp4";
  const range = req.headers.range;

  if (range) {
    const [startStr, endStr] = range.replace("bytes=", "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? Math.min(parseInt(endStr, 10), total - 1) : total - 1;

    if (isNaN(start) || start >= total) {
      res.status(416).set("Content-Range", `bytes */${total}`).end();
      return;
    }

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": contentType,
    });
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": total,
      "Accept-Ranges": "bytes",
      "Content-Type": contentType,
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    await deleteProject(req.params.id);
    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete project";
    res.status(500).json({ error: msg });
  }
});

export default router;
