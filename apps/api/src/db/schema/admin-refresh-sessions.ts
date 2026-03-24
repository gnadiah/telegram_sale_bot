import { foreignKey, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { adminUsers } from "./admin-users";

export const adminRefreshSessions = pgTable(
  "admin_refresh_sessions",
  {
    id: text("id").primaryKey(),
    adminUserId: text("admin_user_id").notNull(),
    familyId: text("family_id").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    replacedBySessionId: text("replaced_by_session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address")
  },
  (table) => ({
    adminUserIdFk: foreignKey({
      columns: [table.adminUserId],
      foreignColumns: [adminUsers.id]
    }).onDelete("cascade"),
    replacedBySessionIdFk: foreignKey({
      columns: [table.replacedBySessionId],
      foreignColumns: [table.id]
    }).onDelete("set null")
  })
);
