import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import * as fs from "fs/promises";
import * as path from "path";
import type { VideoMetadata, AudioChunk } from "../types.js";

const OPENAI_MAX_BYTES = 25 * 1024 * 1024; // 25 MB

const resolvedFfmpegPath = process.env.FFMPEG_PATH ?? ffmpegInstaller.path;
const resolvedFfprobePath = process.env.FFPROBE_PATH ?? ffprobeInstaller.path;

ffmpeg.setFfmpegPath(resolvedFfmpegPath);
ffmpeg.setFfprobePath(resolvedFfprobePath);
console.log(`[ffmpeg] ${resolvedFfmpegPath}`);

export async function inspectMedia(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(new Error(`ffprobe failed: ${err.message}`));

      const videoStream = metadata.streams.find((s) => s.codec_type === "video");
      const audioStream = metadata.streams.find((s) => s.codec_type === "audio");

      if (!videoStream) return reject(new Error("No video stream found in file"));

      const rateStr = videoStream.r_frame_rate ?? "30/1";
      const [num, den] = rateStr.split("/").map(Number);
      const fps = den > 0 ? Math.round((num / den) * 100) / 100 : 30;

      resolve({
        durationMs: Math.round((Number(metadata.format.duration) || 0) * 1000),
        width: videoStream.width ?? 0,
        height: videoStream.height ?? 0,
        fps: fps || 30,
        hasAudio: !!audioStream,
        codec: videoStream.codec_name ?? "unknown",
        sizeBytes: Number(metadata.format.size) || 0,
      });
    });
  });
}

export async function extractAudio(
  inputPath: string,
  outputPath: string,
  onProgress?: (pct: number) => void,
): Promise<{ path: string; sizeBytes: number; durationMs: number }> {
  return new Promise((resolve, reject) => {
    let totalDuration = 0;

    const cmd = ffmpeg(inputPath)
      .noVideo()
      .audioChannels(1)
      .audioFrequency(16000)
      .audioBitrate("64k")
      .audioCodec("libmp3lame")
      .output(outputPath)
      .on("codecData", (data) => {
        const parts = data.duration?.split(":").map(Number);
        if (parts?.length === 3) {
          totalDuration = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
        }
      })
      .on("progress", (progress) => {
        if (totalDuration > 0 && onProgress) {
          const timemark = progress.timemark ?? "0:0:0";
          const parts = timemark.split(":").map(Number);
          const elapsedMs = (parts[0] * 3600 + parts[1] * 60 + (parts[2] || 0)) * 1000;
          onProgress(Math.min(elapsedMs / totalDuration, 1));
        }
      })
      .on("end", async () => {
        try {
          const stat = await fs.stat(outputPath);
          // Use duration captured from codecData; fall back to probing the original video (not the audio output)
          const durationMs = totalDuration > 0 ? totalDuration : (await inspectMedia(inputPath)).durationMs;
          resolve({ path: outputPath, sizeBytes: stat.size, durationMs });
        } catch (e) {
          reject(e);
        }
      })
      .on("error", (e) => reject(new Error(`Audio extraction failed: ${e.message}`)));

    cmd.run();
  });
}

function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(new Error(`ffprobe failed: ${err.message}`));
      resolve(Math.round((Number(metadata.format.duration) || 0) * 1000));
    });
  });
}

export async function splitAudio(
  audioPath: string,
  chunkDir: string,
): Promise<AudioChunk[]> {
  const durationMs = await getAudioDuration(audioPath);
  const stat = await fs.stat(audioPath);

  if (stat.size <= OPENAI_MAX_BYTES) {
    return [
      {
        index: 0,
        path: audioPath,
        startMs: 0,
        endMs: durationMs,
        sizeBytes: stat.size,
      },
    ];
  }

  // Estimate chunk duration to stay under 25 MB
  const bytesPerMs = stat.size / durationMs;
  const safeChunkMs = Math.floor((OPENAI_MAX_BYTES * 0.85) / bytesPerMs);
  const numChunks = Math.ceil(durationMs / safeChunkMs);

  await fs.mkdir(chunkDir, { recursive: true });
  const chunks: AudioChunk[] = [];

  for (let i = 0; i < numChunks; i++) {
    const startMs = i * safeChunkMs;
    const endMs = Math.min((i + 1) * safeChunkMs, durationMs);
    const chunkPath = path.join(chunkDir, `chunk-${i.toString().padStart(3, "0")}.mp3`);

    await splitChunk(audioPath, chunkPath, startMs / 1000, (endMs - startMs) / 1000);

    const chunkStat = await fs.stat(chunkPath);
    chunks.push({ index: i, path: chunkPath, startMs, endMs, sizeBytes: chunkStat.size });
  }

  return chunks;
}

function splitChunk(
  inputPath: string,
  outputPath: string,
  startSec: number,
  durationSec: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startSec)
      .setDuration(durationSec)
      .output(outputPath)
      .audioCodec("copy")
      .on("end", () => resolve())
      .on("error", (e) => reject(new Error(`Chunk split failed: ${e.message}`)))
      .run();
  });
}

export function validateAcceptedFormat(ext: string, mimeType: string): string | null {
  const allowed = new Set(["mp4", "mov", "webm", "m4v", "avi", "mkv"]);
  const extNorm = ext.replace(/^\./, "").toLowerCase();
  if (!allowed.has(extNorm)) {
    return `Unsupported file extension: .${extNorm}`;
  }
  const allowedMimes = new Set([
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-m4v",
    "video/x-msvideo",
    "video/x-matroska",
    "video/mpeg",
    "application/octet-stream", // some browsers send this for .mov
  ]);
  if (!allowedMimes.has(mimeType)) {
    return `Unsupported MIME type: ${mimeType}`;
  }
  return null;
}
