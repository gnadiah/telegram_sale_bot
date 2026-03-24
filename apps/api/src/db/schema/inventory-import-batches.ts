import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { products } from "./products";

export const inventoryImportBatches = pgTable("inventory_import_batches", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  id: text("id").primaryKey(),
  originalFilename: varchar("original_filename", { length: 255 }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sourceType: varchar("source_type", { length: 64 }).notNull(),
  totalAccepted: integer("total_accepted").notNull(),
  totalReceived: integer("total_received").notNull()
});
