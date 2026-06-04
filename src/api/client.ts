import { loadEnv } from "../storage/store.js";

export interface VideoRequest {
  model: string;
  prompt: string;
  num_frames: number;
  frame_rate: number;
  width: number;
  height: number;
}

export interface VideoSubmitResponse {
  id: string;
}

export interface VideoStatusResponse {
  id: string;
  status: string;
  progress?: number;
  video_url?: string;
  url?: string;
  remixed_from_video_id?: string;
  error?: string;
}

export class AgnesVideoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    const env = loadEnvSync();
    this.apiKey = env.AGNES_API_KEY;
    this.baseUrl = env.AGNES_API_URL.replace(/\/+$/, "");
  }

  async submitVideo(request: VideoRequest): Promise<VideoSubmitResponse> {
    const response = await fetch(`${this.baseUrl}/v1/videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Agnes Video API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      id: data.id,
    };
  }

  async getVideoStatus(taskId: string): Promise<VideoStatusResponse> {
    const response = await fetch(`${this.baseUrl}/v1/videos/${taskId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Agnes Video API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  async getVideoUrl(status: VideoStatusResponse): Promise<string> {
    for (const key of ["remixed_from_video_id", "video_url", "url"]) {
      const v = status[key as keyof VideoStatusResponse];
      if (typeof v === "string" && v.startsWith("http")) {
        return v;
      }
    }
    throw new Error("No video URL found in response");
  }
}

function loadEnvSync(): { AGNES_API_KEY: string; AGNES_API_URL: string } {
  const apiKey = process.env.AGNES_API_KEY;
  const apiUrl = process.env.AGNES_API_URL || "https://apihub.agnes-ai.com";

  if (!apiKey) {
    throw new Error(
      "AGNES_API_KEY is required. Set it in .env file or environment variables."
    );
  }

  return {
    AGNES_API_KEY: apiKey,
    AGNES_API_URL: apiUrl,
  };
}
