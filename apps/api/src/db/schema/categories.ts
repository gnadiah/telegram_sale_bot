import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  isActive: boolean("is_active").default(true).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sortOrder: integer("sort_order").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});
