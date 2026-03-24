import { describe, expect, it, vi } from "vitest";
import { runMigrations } from "./run-migrations";

describe("runMigrations", () => {
  it("logs a success message after migrations complete", async () => {
    const log = vi.fn();
    const end = vi.fn().mockResolvedValue(undefined);
    const migrateFn = vi.fn().mockResolvedValue(undefined);
    const drizzleFn = vi.fn().mockReturnValue({ kind: "db" });
    const pool = { end };

    await runMigrations({
      createPool: () => pool,
      drizzleFn: drizzleFn as never,
      env: {
        database: {
          database: "telegram_sale_bot",
          host: "localhost",
          password: "postgres",
          port: 5432,
          user: "postgres"
        }
      },
      log,
      migrationsFolder: "/tmp/drizzle",
      migrateFn: migrateFn as never
    });

    expect(migrateFn).toHaveBeenCalledWith({ kind: "db" }, { migrationsFolder: "/tmp/drizzle" });
    expect(log).toHaveBeenCalledWith("Database migrations applied successfully.");
    expect(end).toHaveBeenCalledTimes(1);
  });
});
