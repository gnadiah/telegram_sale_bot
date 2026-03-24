import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureWorkspaceEnvLoaded, getEnv, resetEnv } from "./env";

afterEach(() => {
  delete process.env.BOT_API_TOKEN;
  delete process.env.TELEGRAM_BOT_TOKEN;
  resetEnv();
});

describe("bot env", () => {
  it("loads the workspace env file through the config layer", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const loadEnvFile = vi.fn();

    delete process.env.NODE_ENV;
    resetEnv();
    ensureWorkspaceEnvLoaded(loadEnvFile);

    expect(loadEnvFile).toHaveBeenCalledTimes(1);
    expect(loadEnvFile.mock.calls[0]?.[0]).toMatch(/\.env$/);

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    resetEnv();
  });

  it("fails fast when the Telegram bot token is still a placeholder", () => {
    process.env.BOT_API_TOKEN = "internal-secret";
    process.env.TELEGRAM_BOT_TOKEN = "replace-me";

    expect(() => getEnv()).toThrow(/TELEGRAM_BOT_TOKEN is missing/i);
  });

  it("fails fast when the Telegram bot token does not look like a BotFather token", () => {
    process.env.BOT_API_TOKEN = "internal-secret";
    process.env.TELEGRAM_BOT_TOKEN = "not-a-real-token";

    expect(() => getEnv()).toThrow(/does not look like a valid BotFather token/i);
  });

  it("returns configured bot env values when the tokens are valid", () => {
    process.env.API_BASE_URL = "http://localhost:8080";
    process.env.BOT_API_TOKEN = "internal-secret";
    process.env.TELEGRAM_BOT_TOKEN = "123456:AA_validToken_12345";

    expect(getEnv()).toEqual({
      apiBaseUrl: "http://localhost:8080",
      botApiToken: "internal-secret",
      telegramBotToken: "123456:AA_validToken_12345"
    });
  });
});
