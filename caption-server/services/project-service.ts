import * as fs from "fs/promises";
import * as path from "path";
import { randomUUID } from "crypto";
import type { VideoProject, CaptionWord, CaptionStyle, CaptionGrouping } from "../types.js";
import { DEFAULT_CAPTION_STYLE, DEFAULT_CAPTION_GROUPING } from "../types.js";

// Always absolute — res.sendFile and the render CLI require absolute paths
const STORAGE_ROOT = path.resolve(process.env.PROJECT_STORAGE_DIR ?? "storage/projects");

export function projectDir(id: string) {
  return path.join(STORAGE_ROOT, id);
}

export function projectFile(id: string) {
  return path.join(projectDir(id), "project.json");
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function createProject(overrides: Partial<VideoProject> = {}): Promise<VideoProject> {
  const id = randomUUID();
  const now = new Date().toISOString();
  const project: VideoProject = {
    id,
    status: "uploaded",
    sourceVideoPath: "",
    sourceVideoExt: "",
    durationMs: 0,
    width: 1080,
    height: 1920,
    fps: 30,
    captions: [],
    captionStyle: DEFAULT_CAPTION_STYLE,
    captionGrouping: DEFAULT_CAPTION_GROUPING,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };

  await ensureDir(projectDir(id));
  await ensureDir(path.join(projectDir(id), "source"));
  await ensureDir(path.join(projectDir(id), "audio", "chunks"));
  await ensureDir(path.join(projectDir(id), "captions"));
  await ensureDir(path.join(projectDir(id), "renders"));

  await fs.writeFile(projectFile(id), JSON.stringify(project, null, 2));
  return project;
}

export async function getProject(id: string): Promise<VideoProject | null> {
  try {
    const raw = await fs.readFile(projectFile(id), "utf-8");
    return JSON.parse(raw) as VideoProject;
  } catch {
    return null;
  }
}

export async function updateProject(
  id: string,
  updates: Partial<VideoProject>,
): Promise<VideoProject> {
  const project = await getProject(id);
  if (!project) throw new Error(`Project ${id} not found`);
  const updated: VideoProject = {
    ...project,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(projectFile(id), JSON.stringify(updated, null, 2));
  return updated;
}

export async function updateCaptions(id: string, captions: CaptionWord[]): Promise<void> {
  await updateProject(id, { captions });
}

export async function updateStyle(id: string, style: CaptionStyle): Promise<void> {
  await updateProject(id, { captionStyle: style });
}

export async function updateGrouping(id: string, grouping: CaptionGrouping): Promise<void> {
  await updateProject(id, { captionGrouping: grouping });
}

export async function deleteProject(id: string): Promise<void> {
  const dir = projectDir(id);
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // ignore if already gone
  }
}

export async function listProjects(): Promise<VideoProject[]> {
  try {
    await ensureDir(STORAGE_ROOT);
    const entries = await fs.readdir(STORAGE_ROOT, { withFileTypes: true });
    const projects: VideoProject[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const p = await getProject(entry.name);
      if (!p) continue;
      // Flag projects that have a finished render on disk
      try {
        await fs.access(getRenderOutputPath(p.id));
        p.hasRender = true;
      } catch {
        p.hasRender = false;
      }
      projects.push(p);
    }
    return projects.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

export async function getRawTranscriptionPath(id: string): Promise<string> {
  return path.join(projectDir(id), "captions", "raw-transcription.json");
}

export async function getCaptionsPath(id: string): Promise<string> {
  return path.join(projectDir(id), "captions", "captions.json");
}

export function getVideoServePath(id: string, ext: string): string {
  return path.join(projectDir(id), "source", `video.${ext}`);
}

export function getAudioPath(id: string): string {
  return path.join(projectDir(id), "audio", "audio.mp3");
}

export function getRenderOutputPath(id: string): string {
  return path.join(projectDir(id), "renders", "final.mp4");
}

export function getChunkDir(id: string): string {
  return path.join(projectDir(id), "audio", "chunks");
}
