import { and, eq } from "drizzle-orm";
import { getDb } from "../../config/db";
import { inventoryItems } from "../../db/schema";

export async function getStockSummary(productId: string) {
  const db = await getDb();
  const availableItems = await db.query.inventoryItems.findMany({
    where: and(eq(inventoryItems.productId, productId), eq(inventoryItems.status, "available"))
  });

  return {
    availableStock: availableItems.length
  };
}
