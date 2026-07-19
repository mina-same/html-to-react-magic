import OpenAI from "openai";
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as path from "path";
import type { CaptionWord, TranscribeOptions, OpenAIWord } from "../types.js";
import { normalizeOpenAIWords, mergeChunkCaptions } from "./caption-service.js";
import { splitAudio } from "./media-service.js";

const OPENAI_MAX_BYTES = 25 * 1024 * 1024;
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT_TRANSCRIPTIONS ?? "2");

let activeTranscriptions = 0;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY environment variable is not set");
  return new OpenAI({ apiKey });
}

async function transcribeSingleFile(
  openai: OpenAI,
  filePath: string,
  offsetMs: number,
  videoDurationMs: number,
  options: TranscribeOptions,
  prevText?: string,
): Promise<CaptionWord[]> {
  const fileStream = fs.createReadStream(filePath);
  const fileName = path.basename(filePath);

  const prompt = [prevText, options.prompt].filter(Boolean).join(" ").slice(-500) || undefined;

  const response = await openai.audio.transcriptions.create({
    file: new File([await fsp.readFile(filePath)], fileName, { type: "audio/mpeg" }),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word", "segment"],
    language: options.language || undefined,
    prompt,
  });

  fileStream.destroy();

  const words: OpenAIWord[] = (response as unknown as { words?: OpenAIWord[] }).words ?? [];
  return normalizeOpenAIWords(words, offsetMs, videoDurationMs);
}

export async function transcribeAudio(
  audioPath: string,
  chunkDir: string,
  videoDurationMs: number,
  options: TranscribeOptions,
): Promise<{ captions: CaptionWord[]; rawResponse: unknown }> {
  while (activeTranscriptions >= MAX_CONCURRENT) {
    await new Promise((r) => setTimeout(r, 500));
  }

  activeTranscriptions++;
  try {
    const openai = getClient();
    const stat = await fsp.stat(audioPath);

    if (stat.size <= OPENAI_MAX_BYTES) {
      // Single file — no chunking needed
      const singleResponse = await openai.audio.transcriptions.create({
        file: new File([await fsp.readFile(audioPath)], "audio.mp3", { type: "audio/mpeg" }),
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word", "segment"],
        language: options.language || undefined,
        prompt: options.prompt || undefined,
      });

      const rawWords: OpenAIWord[] =
        (singleResponse as unknown as { words?: OpenAIWord[] }).words ?? [];
      const captions = normalizeOpenAIWords(rawWords, 0, videoDurationMs);
      return { captions, rawResponse: singleResponse };
    }

    // Large file — chunk it
    const chunks = await splitAudio(audioPath, chunkDir);
    const chunkResults: Array<{ captions: CaptionWord[] }> = [];
    let prevText = "";

    for (const chunk of chunks) {
      const captions = await transcribeSingleFile(
        openai,
        chunk.path,
        chunk.startMs,
        videoDurationMs,
        options,
        prevText,
      );
      chunkResults.push({ captions });
      prevText = captions
        .slice(-10)
        .map((c) => c.text)
        .join(" ");
    }

    const merged = mergeChunkCaptions(chunkResults);
    return {
      captions: merged,
      rawResponse: { chunked: true, chunkCount: chunks.length },
    };
  } finally {
    activeTranscriptions--;
  }
}
