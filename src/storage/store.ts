import fs from "fs";
import path from "path";

export type EnvVars = {
  AGNES_API_KEY: string;
  AGNES_API_URL: string;
};

export async function loadEnv(): Promise<EnvVars> {
  try {
    const dotenv = await import("dotenv");
    dotenv.config({ path: path.join(process.cwd(), ".env") });
  } catch {
    // skip
  }

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

function getMetaDir(): string {
  return path.join(process.cwd(), "generated-meta");
}

function getHistoryFile(): string {
  return path.join(getMetaDir(), "history.json");
}

export function saveMeta(url: string, meta: Record<string, unknown>): void {
  try {
    const metaDir = getMetaDir();
    if (!fs.existsSync(metaDir)) {
      fs.mkdirSync(metaDir, { recursive: true });
    }
    const fileName = `${Date.now()}.json`;
    const filePath = path.join(metaDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(meta, null, 2));

    let history: Record<string, unknown>[] = [];
    const historyFile = getHistoryFile();
    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
    }
    history.unshift({ url, fileName, timestamp: Date.now() });
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  } catch {
    // Silently fail meta saving
  }
}

export function getMeta(fileName: string): Record<string, unknown> | null {
  try {
    const metaDir = getMetaDir();
    const filePath = path.join(metaDir, fileName);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function getHistory(): Record<string, unknown>[] {
  try {
    const historyFile = getHistoryFile();
    if (!fs.existsSync(historyFile)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  } catch {
    return [];
  }
}
