import { ensureRelativeEnvFileLoaded, parsePositiveIntegerEnv } from "@telegram-sale-bot/shared/env";

type DatabaseDriver = "pg" | "pglite";

type DatabaseEnv = {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
};

export type AppEnv = {
  adminAuth: {
    accessTokenSecret: string;
    accessTokenTtlMinutes: number;
    refreshCookieName: string;
    refreshTokenDays: number;
  };
  adminPassword: string;
  adminUsername: string;
  botApiToken: string;
  cors: {
    allowedOrigins: string[];
  };
  database: DatabaseEnv;
  databaseDriver: DatabaseDriver;
  nodeEnv: string;
  port: number;
};

let cachedEnv: AppEnv | undefined;
const envLoadState = { loaded: false };

function parseCsvEnv(value: string | undefined, fallback: string) {
  const resolvedValue = value ?? fallback;

  return resolvedValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readBotApiToken(nodeEnv: string) {
  const value = process.env.BOT_API_TOKEN?.trim() ?? "replace-me";

  if (nodeEnv !== "test" && (!value || value === "replace-me")) {
    throw new Error("BOT_API_TOKEN is missing. Set a real bot-to-api token in the root .env file before starting the API.");
  }

  return value;
}

export function getEnv(): AppEnv {
  ensureWorkspaceEnvLoaded();

  if (cachedEnv) {
    return cachedEnv;
  }

  const nodeEnv = process.env.NODE_ENV ?? "development";

  cachedEnv = {
    adminAuth: {
      accessTokenSecret: process.env.ADMIN_ACCESS_TOKEN_SECRET ?? "replace-me",
      accessTokenTtlMinutes: parsePositiveIntegerEnv(
        process.env.ADMIN_ACCESS_TOKEN_TTL_MINUTES,
        "ADMIN_ACCESS_TOKEN_TTL_MINUTES",
        "15"
      ),
      refreshCookieName: process.env.ADMIN_REFRESH_COOKIE_NAME ?? "tsb_refresh",
      refreshTokenDays: parsePositiveIntegerEnv(
        process.env.ADMIN_REFRESH_TOKEN_DAYS,
        "ADMIN_REFRESH_TOKEN_DAYS",
        "30"
      )
    },
    adminPassword: process.env.ADMIN_PASSWORD ?? "secret123",
    adminUsername: process.env.ADMIN_USERNAME ?? "admin",
    botApiToken: readBotApiToken(nodeEnv),
    cors: {
      allowedOrigins: parseCsvEnv(process.env.CORS_ALLOWED_ORIGINS, "http://localhost:3000")
    },
    database: {
      database: process.env.DB_NAME ?? "telegram_sale_bot",
      host: process.env.DB_HOST ?? "localhost",
      password: process.env.DB_PASSWORD ?? "postgres",
      port: parsePositiveIntegerEnv(process.env.DB_PORT, "DB_PORT", "5432"),
      user: process.env.DB_USER ?? "postgres"
    },
    databaseDriver: process.env.DATABASE_DRIVER === "pglite" ? "pglite" : "pg",
    nodeEnv,
    port: parsePositiveIntegerEnv(process.env.PORT, "PORT", "8080")
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
