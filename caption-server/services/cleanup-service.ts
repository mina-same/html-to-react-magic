import * as fsp from "fs/promises";
import * as path from "path";
import { listProjects, deleteProject } from "./project-service.js";

const RETENTION_HOURS = Number(process.env.PROJECT_RETENTION_HOURS ?? "24");

export async function cleanupExpiredProjects(): Promise<void> {
  const retentionMs = RETENTION_HOURS * 60 * 60 * 1000;
  const now = Date.now();

  const projects = await listProjects();
  for (const project of projects) {
    // Don't delete actively running projects
    if (project.status === "rendering" || project.status === "extracting-audio" || project.status === "transcribing") {
      continue;
    }
    const age = now - new Date(project.createdAt).getTime();
    if (age > retentionMs) {
      console.log(`[cleanup] Removing expired project ${project.id} (age: ${Math.round(age / 3600000)}h)`);
      await deleteProject(project.id);
    }
  }
}

export async function cleanupOrphanedChunks(projectId: string, chunkDir: string): Promise<void> {
  try {
    const entries = await fsp.readdir(chunkDir);
    for (const entry of entries) {
      if (entry.startsWith("chunk-")) {
        await fsp.rm(path.join(chunkDir, entry), { force: true });
      }
    }
  } catch {
    // Ignore if chunk dir doesn't exist
  }
}

export function startCleanupScheduler(): void {
  // Run once on start, then every hour
  void cleanupExpiredProjects();
  setInterval(() => void cleanupExpiredProjects(), 60 * 60 * 1000);
}
