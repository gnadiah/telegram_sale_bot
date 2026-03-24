import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { products } from "./products";

export const orders = pgTable("orders", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  orderCode: varchar("order_code", { length: 64 }).notNull().unique(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  telegramUserId: varchar("telegram_user_id", { length: 255 }).notNull(),
  telegramUsername: varchar("telegram_username", { length: 255 }),
  totalPriceSnapshot: integer("total_price_snapshot").notNull(),
  unitPriceSnapshot: integer("unit_price_snapshot").notNull()
});
