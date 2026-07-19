import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { randomUUID } from "crypto";
import type { RenderJob, VideoProject } from "../types.js";

const MAX_CONCURRENT_RENDERS = Number(process.env.MAX_CONCURRENT_RENDERS ?? "1");
const PROJECT_ROOT = process.cwd();

// In-memory job store (reset on server restart, acceptable for local MVP)
const jobs = new Map<string, RenderJob>();
let activeRenders = 0;

export function getJob(jobId: string): RenderJob | null {
  return jobs.get(jobId) ?? null;
}

export function listJobsForProject(projectId: string): RenderJob[] {
  return Array.from(jobs.values()).filter((j) => j.projectId === projectId);
}

function updateJob(jobId: string, updates: Partial<RenderJob>): RenderJob {
  const job = jobs.get(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);
  const updated = { ...job, ...updates, updatedAt: new Date().toISOString() };
  jobs.set(jobId, updated);
  return updated;
}

export async function startRender(
  project: VideoProject,
  outputPath: string,
): Promise<RenderJob> {
  // Prevent duplicate renders for same project
  const existing = listJobsForProject(project.id).find(
    (j) => j.status === "queued" || j.status === "rendering",
  );
  if (existing) return existing;

  const jobId = randomUUID();
  const now = new Date().toISOString();
  const job: RenderJob = {
    id: jobId,
    projectId: project.id,
    status: "queued",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(jobId, job);

  // Run async (don't await)
  void executeRender(jobId, project, outputPath);

  return job;
}

async function executeRender(
  jobId: string,
  project: VideoProject,
  outputPath: string,
): Promise<void> {
  // Wait for slot
  while (activeRenders >= MAX_CONCURRENT_RENDERS) {
    await new Promise((r) => setTimeout(r, 1000));
  }

  activeRenders++;
  updateJob(jobId, { status: "rendering", progress: 0 });

  try {
    const durationInFrames = Math.max(
      1,
      Math.ceil((project.durationMs / 1000) * project.fps),
    );

    // Video is served by this same Express server
    const videoUrl = `http://localhost:${process.env.CAPTION_SERVER_PORT ?? 3001}/api/projects/${project.id}/video`;

    const inputProps = {
      videoSrc: videoUrl,
      captions: project.captions,
      captionStyle: project.captionStyle,
      captionGrouping: project.captionGrouping,
      width: project.width,
      height: project.height,
      durationInFrames,
      fps: project.fps,
    };

    // Write props to a temp file to avoid CLI length limits
    const propsFile = path.join(path.dirname(outputPath), `render-props-${jobId}.json`);
    await fs.writeFile(propsFile, JSON.stringify(inputProps));

    const remotionBin = path.join(PROJECT_ROOT, "node_modules", ".bin", "remotion");
    // index.tsx calls registerRoot() — required by the Remotion CLI entry-point validator
    const entryPoint = path.join(PROJECT_ROOT, "src", "remotion", "index.tsx");

    await runRemotionRender(jobId, remotionBin, entryPoint, outputPath, propsFile);

    // Cleanup props file
    await fs.rm(propsFile, { force: true });

    updateJob(jobId, {
      status: "completed",
      progress: 1,
      outputPath,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[render] Job ${jobId} failed:`, message);
    updateJob(jobId, { status: "failed", error: message });
  } finally {
    activeRenders--;
  }
}

function runRemotionRender(
  jobId: string,
  remotionBin: string,
  entryPoint: string,
  outputPath: string,
  propsFile: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "render",
      entryPoint,
      "CaptionedVideo",
      outputPath,
      `--props=${propsFile}`,
      "--log=error",
      "--overwrite",
    ];

    const child = spawn(remotionBin, args, {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    let stderr = "";

    child.stdout?.on("data", (chunk: Buffer) => {
      const line = chunk.toString();
      // Parse Remotion progress: "Rendering frame X/Y"
      const match = line.match(/Rendering\s+frame\s+(\d+)\s*\/\s*(\d+)/i);
      if (match) {
        const rendered = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        if (total > 0) {
          updateJob(jobId, { progress: rendered / total });
        }
      }
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      const line = chunk.toString();
      // Remotion also logs to stderr
      const match = line.match(/(\d+)\s*\/\s*(\d+)\s+frames/i);
      if (match) {
        const rendered = parseInt(match[1], 10);
        const total = parseInt(match[2], 10);
        if (total > 0) updateJob(jobId, { progress: rendered / total });
      }
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Remotion render exited with code ${code}. stderr: ${stderr.slice(-1000)}`,
          ),
        );
      }
    });

    child.on("error", reject);
  });
}

export function cancelJob(jobId: string): RenderJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;
  if (job.status === "queued" || job.status === "rendering") {
    return updateJob(jobId, { status: "cancelled" });
  }
  return job;
}
