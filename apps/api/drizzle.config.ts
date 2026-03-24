import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    database: process.env.DB_NAME ?? "telegram_sale_bot",
    host: process.env.DB_HOST ?? "localhost",
    password: process.env.DB_PASSWORD ?? "postgres",
    port: Number(process.env.DB_PORT ?? "5432"),
    user: process.env.DB_USER ?? "postgres"
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/schema/*.ts"
});
