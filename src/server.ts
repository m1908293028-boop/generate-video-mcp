#!/usr/bin/env node
import { mkdir } from "fs/promises";
import { join } from "path";
import { generateVideo, checkVideoStatus, VideoResult, VideoStatusResult } from "./handlers/generate.js";
import { saveMeta, getMeta, getHistory } from "./storage/store.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const STORAGE_DIR = join(process.cwd(), "generated-videos");
const META_DIR = join(process.cwd(), "generated-meta");

export async function runServer(): Promise<void> {
  await mkdir(STORAGE_DIR, { recursive: true });
  await mkdir(META_DIR, { recursive: true });

  const server = new McpServer({
    name: "generate-video-mcp",
    version: "1.0.0",
  });

  // --- Tools ---

  server.tool(
    "generate_video",
    {
      prompt: z.string().describe("视频生成的自然语言提示词"),
      duration: z.number().int().min(1).max(20).optional().default(5),
      size: z
        .string()
        .describe("视频分辨率，格式为 WxH，如 1152x768")
        .optional()
        .default("1152x768"),
    },
    async ({ prompt, duration, size }) => {
      try {
        const result = await generateVideo({ prompt, duration, size });
        await saveMeta(result.url, {
          type: "generate_video",
          prompt: result.prompt,
          size: `${result.width}x${result.height}`,
          duration: result.duration,
          num_frames: result.numFrames,
          fps: result.fps,
          model: result.model,
          task_id: result.taskId,
          timestamp: result.timestamp,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                message: "视频生成成功",
                url: result.url,
                prompt: result.prompt,
                size: `${result.width}x${result.height}`,
                duration: result.duration,
                num_frames: result.numFrames,
                fps: result.fps,
                model: result.model,
                task_id: result.taskId,
                timestamp: result.timestamp,
              }),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "check_video_status",
    {
      task_id: z.string().describe("视频生成任务 ID"),
    },
    async ({ task_id }) => {
      try {
        const result = await checkVideoStatus(task_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                task_id: result.taskId,
                status: result.status,
                progress: result.progress,
                url: result.url,
              }),
            },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // --- Resources ---

  server.resource(
    "meta",
    "meta://{path}",
    async (uri) => {
      const path = uri.pathname?.replace(/^\/+/, "") || "";
      const meta = getMeta(path);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: meta ? JSON.stringify(meta, null, 2) : '{"error": "metadata not found"}',
          },
        ],
      };
    }
  );

  server.resource(
    "history",
    "history://",
    async (uri) => {
      const history = getHistory();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(history, null, 2),
          },
        ],
      };
    }
  );

  // --- Start ---

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);
