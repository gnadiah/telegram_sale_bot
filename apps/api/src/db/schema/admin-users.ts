import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const adminUsers = pgTable("admin_users", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  isActive: boolean("is_active").default(true).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).default("super_admin").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  username: varchar("username", { length: 255 }).notNull().unique()
});
