import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureWorkspaceEnvLoaded, getEnv, resetEnv } from "./env";

describe("getEnv", () => {
  afterEach(() => {
    delete process.env.ADMIN_ACCESS_TOKEN_SECRET;
    delete process.env.ADMIN_ACCESS_TOKEN_TTL_MINUTES;
    delete process.env.ADMIN_REFRESH_COOKIE_NAME;
    delete process.env.ADMIN_REFRESH_TOKEN_DAYS;
    delete process.env.BOT_API_TOKEN;
    delete process.env.CORS_ALLOWED_ORIGINS;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    resetEnv();
  });

  it("reads split postgres connection fields from env", () => {
    process.env.DB_HOST = "db.internal";
    process.env.DB_PORT = "5433";
    process.env.DB_NAME = "telegram_sale_bot";
    process.env.DB_USER = "postgres";
    process.env.DB_PASSWORD = "super-secret";
    resetEnv();

    const env = getEnv();

    expect(env.database).toEqual({
      database: "telegram_sale_bot",
      host: "db.internal",
      password: "super-secret",
      port: 5433,
      user: "postgres"
    });
  });

  it("reads token auth env values", () => {
    process.env.ADMIN_ACCESS_TOKEN_SECRET = "secret";
    process.env.ADMIN_ACCESS_TOKEN_TTL_MINUTES = "15";
    process.env.ADMIN_REFRESH_TOKEN_DAYS = "30";
    process.env.ADMIN_REFRESH_COOKIE_NAME = "tsb_refresh";
    resetEnv();

    expect(getEnv().adminAuth).toEqual({
      accessTokenSecret: "secret",
      accessTokenTtlMinutes: 15,
      refreshCookieName: "tsb_refresh",
      refreshTokenDays: 30
    });
  });

  it("reads allowed CORS origins from env", () => {
    process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000, https://admin.example.com";
    resetEnv();

    expect(getEnv().cors.allowedOrigins).toEqual([
      "http://localhost:3000",
      "https://admin.example.com"
    ]);
  });

  it("fails fast outside tests when the bot api token is still a placeholder", () => {
    process.env.NODE_ENV = "development";
    process.env.BOT_API_TOKEN = "replace-me";
    resetEnv();

    expect(() => getEnv()).toThrow(/BOT_API_TOKEN is missing/i);
  });

  it("throws when numeric env values are invalid", () => {
    process.env.DB_PORT = "";
    process.env.ADMIN_ACCESS_TOKEN_TTL_MINUTES = "abc";
    resetEnv();

    expect(() => getEnv()).toThrow(/must be a positive integer/i);
  });

  it("reads the http port from env", () => {
    process.env.PORT = "9090";
    resetEnv();

    expect(getEnv().port).toBe(9090);
  });

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
  });
});
