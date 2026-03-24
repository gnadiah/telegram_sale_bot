import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { getEnv } from "./env";
import * as schema from "../db/schema";

export type DbContext = {
  close: () => Promise<void>;
  db: any;
};

let dbContextPromise: Promise<DbContext> | undefined;

export async function initializeDatabase() {
  await getDbContext();
}

export async function getDb() {
  const context = await getDbContext();

  return context.db;
}

export function setDbContextForTests(context: DbContext) {
  dbContextPromise = Promise.resolve(context);
}

export async function resetDatabase() {
  if (!dbContextPromise) {
    return;
  }

  const context = await dbContextPromise;
  await context.close();
  dbContextPromise = undefined;
}

async function getDbContext() {
  if (!dbContextPromise) {
    dbContextPromise = createDbContext();
  }

  return dbContextPromise;
}

async function createDbContext(): Promise<DbContext> {
  const env = getEnv();

  if (env.databaseDriver === "pglite") {
    const client = new PGlite();
    const db = drizzlePglite(client, { schema });

    return {
      close: async () => {
        await client.close();
      },
      db
    };
  }

  const pool = new Pool({
    database: env.database.database,
    host: env.database.host,
    password: env.database.password,
    port: env.database.port,
    user: env.database.user
  });
  const db = drizzlePg(pool, { schema });

  return {
    close: async () => {
      await pool.end();
    },
    db
  };
}
