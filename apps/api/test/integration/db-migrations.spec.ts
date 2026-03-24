import { describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { bootstrapTestSchema } from "../../src/db/test-schema-bootstrap";

describe("api db migrations", { timeout: 15_000 }, () => {
  it("applies the admin auth schema changes", async () => {
    const context = await bootstrapTestSchema();

    try {
      const tablesResult = await context.db.execute(sql`
        select table_schema, table_name
        from information_schema.tables
        where (table_schema = 'public' and table_name in ('admin_users', 'admin_refresh_sessions'))
          or (table_schema = 'drizzle' and table_name = '__drizzle_migrations')
        order by table_name, table_schema
      `);
      const tables = tablesResult.rows as Array<{ table_name: string; table_schema: string }>;

      expect(tables).toEqual([
        { table_name: "__drizzle_migrations", table_schema: "drizzle" },
        { table_name: "admin_refresh_sessions", table_schema: "public" },
        { table_name: "admin_users", table_schema: "public" }
      ]);

      const adminUserColumnsResult = await context.db.execute(sql`
        select column_name
        from information_schema.columns
        where table_schema = 'public' and table_name = 'admin_users'
          and column_name in ('role', 'is_active')
        order by column_name
      `);
      const adminUserColumns = adminUserColumnsResult.rows as Array<{ column_name: string }>;

      expect(adminUserColumns.map((row) => row.column_name)).toEqual(["is_active", "role"]);

      const refreshSessionColumnsResult = await context.db.execute(sql`
        select column_name
        from information_schema.columns
        where table_schema = 'public' and table_name = 'admin_refresh_sessions'
        order by ordinal_position
      `);
      const refreshSessionColumns = refreshSessionColumnsResult.rows as Array<{ column_name: string }>;

      expect(refreshSessionColumns.map((row) => row.column_name)).toEqual([
        "id",
        "admin_user_id",
        "family_id",
        "token_hash",
        "expires_at",
        "revoked_at",
        "replaced_by_session_id",
        "created_at",
        "last_used_at",
        "user_agent",
        "ip_address"
      ]);
    } finally {
      await context.close();
    }
  });

  it("applies generated Drizzle migrations to a fresh database", async () => {
    const context = await bootstrapTestSchema();

    try {
      const result = await context.db.execute(sql`
        select table_schema, table_name
        from information_schema.tables
        where (table_schema = 'public' and table_name = 'admin_users')
          or (table_schema = 'drizzle' and table_name = '__drizzle_migrations')
        order by table_name
      `);
      const rows = result.rows as Array<{ table_name: string; table_schema: string }>;

      expect(rows).toEqual([
        { table_name: "__drizzle_migrations", table_schema: "drizzle" },
        { table_name: "admin_users", table_schema: "public" }
      ]);
      const migrationsResult = await context.db.execute(sql`
        select count(*)::int as count
        from drizzle.__drizzle_migrations
      `);
      expect((migrationsResult.rows as Array<{ count: number }>)[0].count).toBe(2);
    } finally {
      await context.close();
    }
  });

  it("keeps the generated migration set stable across fresh bootstrap sessions", async () => {
    const firstContext = await bootstrapTestSchema();
    try {
      const firstResult = await firstContext.db.execute(sql`
        select count(*)::int as count
        from drizzle.__drizzle_migrations
      `);
      const firstCount = (firstResult.rows as Array<{ count: number }>)[0].count;
      expect(firstCount).toBe(2);
    } finally {
      await firstContext.close();
    }

    const secondContext = await bootstrapTestSchema();
    try {
      const secondTables = await secondContext.db.execute(sql`
        select table_name
        from information_schema.tables
        where (table_schema = 'public' and table_name = 'admin_users')
          or (table_schema = 'drizzle' and table_name = '__drizzle_migrations')
        order by table_name
      `);
      const secondRows = secondTables.rows as Array<{ table_name: string }>;
      expect(secondRows.map((row) => row.table_name)).toEqual([
        "__drizzle_migrations",
        "admin_users"
      ]);

      const secondResult = await secondContext.db.execute(sql`
        select count(*)::int as count
        from drizzle.__drizzle_migrations
      `);
      const secondCount = (secondResult.rows as Array<{ count: number }>)[0].count;
      expect(secondCount).toBe(2);
    } finally {
      await secondContext.close();
    }
  });
});
