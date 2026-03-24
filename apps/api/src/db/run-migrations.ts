import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getEnv } from "../config/env";

type MigrationRuntime = {
  createPool?: (connection: {
    database: string;
    host: string;
    password: string;
    port: number;
    user: string;
  }) => { end: () => Promise<void> | void };
  drizzleFn?: typeof drizzle;
  env?: {
    database: {
      database: string;
      host: string;
      password: string;
      port: number;
      user: string;
    };
  };
  log?: (message: string) => void;
  migrationsFolder?: string;
  migrateFn?: typeof migrate;
};

export async function runMigrations(runtime: MigrationRuntime = {}) {
  const env = runtime.env ?? getEnv();
  const pool =
    runtime.createPool?.({
      database: env.database.database,
      host: env.database.host,
      password: env.database.password,
      port: env.database.port,
      user: env.database.user
    }) ??
    new Pool({
      database: env.database.database,
      host: env.database.host,
      password: env.database.password,
      port: env.database.port,
      user: env.database.user
    });
  const drizzleFn = runtime.drizzleFn ?? drizzle;
  const migrateFn = runtime.migrateFn ?? migrate;
  const log = runtime.log ?? console.log;

  try {
    const db = drizzleFn(pool as never);

    await migrateFn(db as never, {
      migrationsFolder:
        runtime.migrationsFolder ?? resolve(dirname(fileURLToPath(import.meta.url)), "../../drizzle")
    });
    log("Database migrations applied successfully.");
  } finally {
    await pool.end();
  }
}

if (isDirectExecution()) {
  runMigrations().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

function isDirectExecution() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}
