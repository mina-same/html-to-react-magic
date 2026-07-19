import { Router } from "express";
import * as fsp from "fs/promises";
import {
  getProject,
  updateProject,
  getAudioPath,
  getChunkDir,
  getRawTranscriptionPath,
} from "../services/project-service.js";
import { extractAudio } from "../services/media-service.js";
import { transcribeAudio } from "../services/openai-service.js";
import type { TranscribeOptions } from "../types.js";

const router = Router();

router.post("/:id", async (req, res) => {
  const project = await getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server" });
    return;
  }

  if (project.status === "transcribing" || project.status === "extracting-audio") {
    res.status(409).json({ error: "Transcription already in progress" });
    return;
  }

  const { language, prompt } = req.body as TranscribeOptions;

  // Respond immediately; processing happens asynchronously
  res.json({ message: "Transcription started", projectId: project.id });

  void runTranscription(project.id, language, prompt);
});

async function runTranscription(
  projectId: string,
  language?: string,
  prompt?: string,
): Promise<void> {
  try {
    const project = await getProject(projectId);
    if (!project) return;

    // Step 1: Extract audio
    await updateProject(projectId, { status: "extracting-audio", error: undefined });
    const audioPath = getAudioPath(projectId);
    await extractAudio(project.sourceVideoPath, audioPath);

    // Step 2: Transcribe
    await updateProject(projectId, { status: "transcribing" });
    const chunkDir = getChunkDir(projectId);

    const { captions, rawResponse } = await transcribeAudio(
      audioPath,
      chunkDir,
      project.durationMs,
      { language, prompt },
    );

    // Save raw response (immutable)
    const rawPath = await getRawTranscriptionPath(projectId);
    await fsp.writeFile(rawPath, JSON.stringify(rawResponse, null, 2));

    // Detect RTL direction from first Arabic caption
    let direction: "ltr" | "rtl" | "auto" = "auto";
    const rtlTest = /[؀-ۿ]/;
    if (captions.some((c) => rtlTest.test(c.text))) {
      direction = "rtl";
    }

    await updateProject(projectId, {
      status: "ready",
      captions,
      language,
      transcriptionPrompt: prompt,
      captionStyle: {
        ...(project.captionStyle),
        direction,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Transcription failed";
    console.error(`[transcribe] Project ${projectId} failed:`, msg);
    await updateProject(projectId, { status: "failed", error: msg });
  }
}

export default router;
