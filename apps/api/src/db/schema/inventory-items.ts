import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { inventoryImportBatches } from "./inventory-import-batches";
import { products } from "./products";

export const inventoryItems = pgTable("inventory_items", {
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  importBatchId: text("import_batch_id").references(() => inventoryImportBatches.id, {
    onDelete: "set null"
  }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  soldAt: timestamp("sold_at", { withTimezone: true }),
  soldOrderId: text("sold_order_id"),
  status: varchar("status", { length: 32 }).notNull()
});
