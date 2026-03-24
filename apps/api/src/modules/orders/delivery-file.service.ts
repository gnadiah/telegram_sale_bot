import { eq } from "drizzle-orm";
import { NotFound } from "@tsed/exceptions";
import { getDb } from "../../config/db";
import { inventoryItems, orderDeliveries } from "../../db/schema";

export async function getDeliveryFile(orderId: string) {
  const db = await getDb();
  const delivery = await db.query.orderDeliveries.findFirst({
    where: eq(orderDeliveries.orderId, orderId)
  });

  if (!delivery) {
    throw new NotFound("Delivery file not found");
  }

  const soldItems = await db.query.inventoryItems.findMany({
    where: eq(inventoryItems.soldOrderId, orderId)
  });

  return {
    content: soldItems.map((item: typeof inventoryItems.$inferSelect) => item.content).join("\n"),
    delivery
  };
}
