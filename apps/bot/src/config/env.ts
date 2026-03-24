export type BotEnv = {
  apiBaseUrl: string;
  botApiToken: string;
  telegramBotToken: string;
};

let cachedEnv: BotEnv | undefined;

export function getEnv(): BotEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:8080",
    botApiToken: process.env.BOT_API_TOKEN ?? "replace-me",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "replace-me"
  };

  return cachedEnv;
}
