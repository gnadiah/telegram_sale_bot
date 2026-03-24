import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const orderDeliveries = pgTable("order_deliveries", {
  deliveredAt: timestamp("delivered_at", { withTimezone: true }).defaultNow().notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  id: text("id").primaryKey(),
  lineCount: integer("line_count").notNull(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" })
});
