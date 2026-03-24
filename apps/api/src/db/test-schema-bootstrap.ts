import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema";

export async function bootstrapTestSchema() {
  const client = new PGlite();
  const db = drizzlePglite(client, { schema });
  const migrationsFolder = resolve(dirname(fileURLToPath(import.meta.url)), "../../drizzle");

  await migrate(db, { migrationsFolder });

  return {
    close: async () => {
      await client.close();
    },
    db
  };
}
