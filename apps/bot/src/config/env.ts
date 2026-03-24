import { ensureRelativeEnvFileLoaded } from "@telegram-sale-bot/shared/env";

export type BotEnv = {
  apiBaseUrl: string;
  botApiToken: string;
  telegramBotToken: string;
};

let cachedEnv: BotEnv | undefined;
const envLoadState = { loaded: false };

export function getEnv(): BotEnv {
  ensureWorkspaceEnvLoaded();

  if (cachedEnv) {
    return cachedEnv;
  }

  const botApiToken = readRequiredEnvValue("BOT_API_TOKEN");
  const telegramBotToken = readTelegramBotToken();

  cachedEnv = {
    apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:8080",
    botApiToken,
    telegramBotToken
  };

  return cachedEnv;
}

export function resetEnv() {
  cachedEnv = undefined;
  envLoadState.loaded = false;
}

export function ensureWorkspaceEnvLoaded(
  loadEnvFile: ((path: string) => void) | undefined = process.loadEnvFile?.bind(process)
) {
  ensureRelativeEnvFileLoaded({
    currentFileUrl: import.meta.url,
    loadEnvFile,
    relativePath: "../../../../.env",
    shouldSkip: process.env.NODE_ENV === "test",
    state: envLoadState
  });
}

function readRequiredEnvValue(name: "BOT_API_TOKEN" | "TELEGRAM_BOT_TOKEN") {
  const value = process.env[name]?.trim();

  if (!value || value === "replace-me") {
    throw new Error(`${name} is missing. Set a real value in the root .env file before starting the bot.`);
  }

  return value;
}

function readTelegramBotToken() {
  const value = readRequiredEnvValue("TELEGRAM_BOT_TOKEN");

  if (!/^\d+:[A-Za-z0-9_-]{10,}$/.test(value)) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN does not look like a valid BotFather token. Expected a value like 123456:AA..."
    );
  }

  return value;
}
