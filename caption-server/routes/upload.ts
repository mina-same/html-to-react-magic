import { Router } from "express";
import multer from "multer";
import * as fsp from "fs/promises";
import * as path from "path";
import * as os from "os";
import {
  createProject,
  updateProject,
  getVideoServePath,
} from "../services/project-service.js";
import { inspectMedia, validateAcceptedFormat } from "../services/media-service.js";

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "500");

const upload = multer({
  dest: path.join(os.tmpdir(), "caption-uploads"),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const err = validateAcceptedFormat(ext, file.mimetype);
    if (err) return cb(new Error(err));
    cb(null, true);
  },
});

const router = Router();

router.post("/", upload.single("video"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No video file provided" });
    return;
  }

  let project;
  try {
    // Create project directory structure first
    project = await createProject();

    // Validate with ffprobe before accepting
    let metadata;
    try {
      metadata = await inspectMedia(file.path);
    } catch (e) {
      await fsp.rm(file.path, { force: true });
      const msg = e instanceof Error ? e.message : "Could not read video metadata";
      res.status(422).json({ error: `Invalid or corrupted video: ${msg}` });
      return;
    }

    if (!metadata.hasAudio) {
      await fsp.rm(file.path, { force: true });
      res.status(422).json({ error: "Video has no audio track" });
      return;
    }

    if (metadata.width === 0 || metadata.height === 0) {
      await fsp.rm(file.path, { force: true });
      res.status(422).json({ error: "Video has invalid dimensions" });
      return;
    }

    // Copy then delete — rename fails across filesystems (/tmp → storage)
    const ext = path.extname(file.originalname).toLowerCase().replace(/^\./, "") || "mp4";
    const destPath = getVideoServePath(project.id, ext);
    await fsp.copyFile(file.path, destPath);
    await fsp.rm(file.path, { force: true });

    // Update project with metadata
    project = await updateProject(project.id, {
      sourceVideoPath: destPath,
      sourceVideoExt: ext,
      durationMs: metadata.durationMs,
      width: metadata.width,
      height: metadata.height,
      fps: metadata.fps,
      status: "uploaded",
    });

    res.json({ project });
  } catch (err) {
    // Cleanup temp file
    if (file.path) await fsp.rm(file.path, { force: true }).catch(() => {});
    console.error("[upload] Error:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    res.status(500).json({ error: msg });
  }
});

export default router;
