import { afterEach, describe, expect, it } from "vitest";
import { getEnv, resetEnv } from "./env";

describe("getEnv", () => {
  afterEach(() => {
    delete process.env.ADMIN_ACCESS_TOKEN_SECRET;
    delete process.env.ADMIN_ACCESS_TOKEN_TTL_MINUTES;
    delete process.env.ADMIN_REFRESH_COOKIE_NAME;
    delete process.env.ADMIN_REFRESH_TOKEN_DAYS;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
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

  it("throws when numeric env values are invalid", () => {
    process.env.DB_PORT = "";
    process.env.ADMIN_ACCESS_TOKEN_TTL_MINUTES = "abc";
    resetEnv();

    expect(() => getEnv()).toThrow(/must be a positive integer/i);
  });
});
