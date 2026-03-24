import { defineConfig } from "drizzle-kit";
import { getEnv } from "./src/config/env";

const env = getEnv();

export default defineConfig({
  dbCredentials: {
    database: env.database.database,
    host: env.database.host,
    password: env.database.password,
    port: env.database.port,
    user: env.database.user
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema/*.ts"
});
