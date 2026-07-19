import type {
  VideoProject,
  CaptionWord,
  CaptionStyle,
  CaptionGrouping,
  RenderJob,
  TranscribeOptions,
} from "@/types/captions";
import { trackAIUsage } from "@/lib/ai-usage";

const API_BASE =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_CAPTION_API_URL
    ? import.meta.env.VITE_CAPTION_API_URL
    : "http://localhost:3001";

async function apiFetch<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  const body = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return body as T;
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function listProjects(): Promise<VideoProject[]> {
  const data = await apiFetch<{ projects: VideoProject[] }>("/api/projects");
  return data.projects;
}

export async function getProject(projectId: string): Promise<VideoProject> {
  const data = await apiFetch<{ project: VideoProject }>(`/api/projects/${projectId}`);
  return data.project;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiFetch(`/api/projects/${projectId}`, { method: "DELETE" });
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadVideo(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<VideoProject> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("video", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(e.loaded / e.total);
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const body = JSON.parse(xhr.responseText) as { project?: VideoProject; error?: string };
        if (xhr.status >= 400) {
          reject(new Error(body.error ?? `Upload failed: HTTP ${xhr.status}`));
        } else if (body.project) {
          resolve(body.project);
        } else {
          reject(new Error("Unexpected server response"));
        }
      } catch {
        reject(new Error("Failed to parse server response"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", `${API_BASE}/api/projects`);
    xhr.send(formData);
  });
}

// ─── Transcription ────────────────────────────────────────────────────────────

export async function startTranscription(
  projectId: string,
  options: TranscribeOptions = {},
): Promise<void> {
  await apiFetch(`/api/transcribe/${projectId}`, {
    method: "POST",
    body: JSON.stringify(options),
  });
  // Whisper bills per audio minute and reports no token count — log the call with 0 tokens.
  trackAIUsage("caption-transcription", "whisper-1");
}

// ─── Captions ─────────────────────────────────────────────────────────────────

export async function updateCaptions(
  projectId: string,
  captions: CaptionWord[],
): Promise<VideoProject> {
  const data = await apiFetch<{ project: VideoProject }>(`/api/projects/${projectId}/captions`, {
    method: "PATCH",
    body: JSON.stringify({ captions }),
  });
  return data.project;
}

export async function updateStyle(
  projectId: string,
  style: CaptionStyle,
): Promise<VideoProject> {
  const data = await apiFetch<{ project: VideoProject }>(`/api/projects/${projectId}/style`, {
    method: "PATCH",
    body: JSON.stringify({ style }),
  });
  return data.project;
}

export async function updateGrouping(
  projectId: string,
  grouping: CaptionGrouping,
): Promise<VideoProject> {
  const data = await apiFetch<{ project: VideoProject }>(`/api/projects/${projectId}/grouping`, {
    method: "PATCH",
    body: JSON.stringify({ grouping }),
  });
  return data.project;
}

// ─── Render ───────────────────────────────────────────────────────────────────

export async function startRender(projectId: string): Promise<RenderJob> {
  const data = await apiFetch<{ job: RenderJob }>(`/api/projects/${projectId}/render`, {
    method: "POST",
  });
  return data.job;
}

export async function getRenderJob(jobId: string): Promise<RenderJob> {
  const data = await apiFetch<{ job: RenderJob }>(`/api/render-jobs/${jobId}`);
  return data.job;
}

export async function cancelRenderJob(jobId: string): Promise<RenderJob> {
  const data = await apiFetch<{ job: RenderJob }>(`/api/render-jobs/${jobId}/cancel`, {
    method: "POST",
  });
  return data.job;
}

// ─── Downloads ────────────────────────────────────────────────────────────────

export function getVideoDownloadUrl(projectId: string): string {
  return `${API_BASE}/api/projects/${projectId}/download/video`;
}

export function getSRTDownloadUrl(projectId: string): string {
  return `${API_BASE}/api/projects/${projectId}/download/srt`;
}

export function getVideoStreamUrl(projectId: string): string {
  return `${API_BASE}/api/projects/${projectId}/video`;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkServerHealth(): Promise<{
  ok: boolean;
  openaiConfigured: boolean;
}> {
  try {
    return await apiFetch("/health");
  } catch {
    return { ok: false, openaiConfigured: false };
  }
}
