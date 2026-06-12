import { readFileSync } from "fs";
import { resolve } from "path";

interface OpenAIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export function hasOpenAIKey(): boolean {
  if (process.env.OPENAI_API_KEY) return true;
  try {
    const config = getOpenAIConfig();
    return !!config.apiKey;
  } catch {
    return false;
  }
}

export function getOpenAIConfig(): OpenAIConfig {
  // 1. Check environment variables first
  const envKey = process.env.OPENAI_API_KEY;
  const envBaseURL = process.env.OPENAI_BASE_URL;
  const envModel = process.env.OPENAI_MODEL;

  if (envKey) {
    return {
      apiKey: envKey,
      baseURL: envBaseURL || "https://api.openai.com/v1",
      model: envModel || "gpt-4o-mini",
    };
  }

  // 2. Fall back to openai-credentials.txt
  try {
    const configPath = resolve(process.cwd(), "openai-credentials.txt");
    const content = readFileSync(configPath, "utf-8");
    const lines = content.split("\n");

    const config: Record<string, string> = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      config[key] = value;
    }

    const apiKey = config.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your-api-key-here") {
      throw new Error(
        "OPENAI_API_KEY not found. Set it in environment variables or in openai-credentials.txt."
      );
    }

    return {
      apiKey,
      baseURL: config.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: config.OPENAI_MODEL || "gpt-4o-mini",
    };
  } catch {
    throw new Error(
      "OPENAI_API_KEY not found. Set it in environment variables or create openai-credentials.txt."
    );
  }
}
