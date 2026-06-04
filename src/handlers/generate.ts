import { AgnesVideoClient, VideoStatusResponse } from "../api/client.js";

export interface VideoResult {
  url: string;
  taskId: string;
  status: string;
  prompt: string;
  width: number;
  height: number;
  duration: number;
  numFrames: number;
  fps: number;
  model: string;
  timestamp: number;
}

export interface VideoStatusResult {
  taskId: string;
  status: string;
  progress?: number;
  url?: string;
}

const FPS = 24;

function calculateNumFrames(duration: number): number {
  const raw = Math.round(duration * FPS);
  const adjusted = ((raw - 1) / 8) * 8 + 1;
  const frames = Math.max(9, Math.min(441, Math.round(adjusted)));
  return frames;
}

function getActualDuration(numFrames: number): number {
  return Math.round((numFrames / FPS) * 10) / 10;
}

export async function generateVideo(params: {
  prompt: string;
  duration?: number;
  size?: string;
}): Promise<VideoResult> {
  const duration = params.duration || 5;
  const size = params.size || "1152x768";
  const [width, height] = size.split("x").map(Number);
  const model = "agnes-video-v2.0";
  const numFrames = calculateNumFrames(duration);
  const actualDuration = getActualDuration(numFrames);

  const client = new AgnesVideoClient();
  const submitResult = await client.submitVideo({
    model,
    prompt: params.prompt,
    num_frames: numFrames,
    frame_rate: FPS,
    width,
    height,
  });

  const taskId = submitResult.id;
  if (!taskId) {
    throw new Error("Failed to get task ID from video submission");
  }

  // Poll until completed or failed
  let status: VideoStatusResponse;
  let maxRetries = 180; // 30 minutes at 10s intervals
  while (maxRetries > 0) {
    await new Promise((r) => setTimeout(r, 10000));
    status = await client.getVideoStatus(taskId);

    if (status.status === "completed") {
      const url = await client.getVideoUrl(status);
      return {
        url,
        taskId,
        status: status.status,
        prompt: params.prompt,
        width,
        height,
        duration: actualDuration,
        numFrames,
        fps: FPS,
        model,
        timestamp: Date.now(),
      };
    }

    if (status.status === "failed") {
      throw new Error(`Video generation failed: ${status.error || "unknown error"}`);
    }

    maxRetries--;
  }

  throw new Error("Video generation timed out after 30 minutes");
}

export async function checkVideoStatus(taskId: string): Promise<VideoStatusResult> {
  const client = new AgnesVideoClient();
  const status = await client.getVideoStatus(taskId);

  const result: VideoStatusResult = {
    taskId,
    status: status.status,
    progress: status.progress,
  };

  if (status.status === "completed") {
    const url = await client.getVideoUrl(status);
    result.url = url;
  }

  return result;
}
