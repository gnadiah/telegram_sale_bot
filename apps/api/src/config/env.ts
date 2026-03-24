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
  database: DatabaseEnv;
  databaseDriver: DatabaseDriver;
  nodeEnv: string;
};

let cachedEnv: AppEnv | undefined;

function parsePositiveIntegerEnv(value: string | undefined, envName: string, fallback: string) {
  const resolvedValue = value ?? fallback;
  const parsedValue = Number(resolvedValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${envName} must be a positive integer`);
  }

  return parsedValue;
}

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

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
    botApiToken: process.env.BOT_API_TOKEN ?? "replace-me",
    database: {
      database: process.env.DB_NAME ?? "telegram_sale_bot",
      host: process.env.DB_HOST ?? "localhost",
      password: process.env.DB_PASSWORD ?? "postgres",
      port: parsePositiveIntegerEnv(process.env.DB_PORT, "DB_PORT", "5432"),
      user: process.env.DB_USER ?? "postgres"
    },
    databaseDriver: process.env.DATABASE_DRIVER === "pglite" ? "pglite" : "pg",
    nodeEnv: process.env.NODE_ENV ?? "development"
  };

  return cachedEnv;
}

export function resetEnv() {
  cachedEnv = undefined;
}
