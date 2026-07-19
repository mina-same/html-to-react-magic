import { Router } from "express";
import { getProject } from "../services/project-service.js";
import { startRender, getJob, cancelJob } from "../services/render-service.js";
import { getRenderOutputPath } from "../services/project-service.js";

const router = Router();

// Start a render
router.post("/projects/:id/render", async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  if (project.status !== "ready" && project.status !== "completed") {
    res.status(409).json({ error: "Project is not ready for rendering" });
    return;
  }
  if (project.captions.length === 0) {
    res.status(400).json({ error: "Project has no captions to render" });
    return;
  }

  const outputPath = getRenderOutputPath(project.id);
  const job = await startRender(project, outputPath);
  res.json({ job });
});

// Get render job status
router.get("/render-jobs/:jobId", async (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Render job not found" });
    return;
  }
  res.json({ job });
});

// Cancel render job
router.post("/render-jobs/:jobId/cancel", async (req, res) => {
  const job = cancelJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Render job not found" });
    return;
  }
  res.json({ job });
});

export default router;
