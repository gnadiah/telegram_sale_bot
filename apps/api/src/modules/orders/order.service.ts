import { and, asc, eq, inArray } from "drizzle-orm";
import { BadRequest, Conflict, NotFound } from "@tsed/exceptions";
import { getDb } from "../../config/db";
import { inventoryItems, orderDeliveries, orders, products } from "../../db/schema";

type CreateOrderInput = {
  productId: string;
  quantity: number;
  telegramUserId: string;
  telegramUsername?: string;
};

const productLocks = new Map<string, Promise<void>>();

export async function createOrder(input: CreateOrderInput) {
  validateQuantity(input.quantity);

  return withProductLock(input.productId, async () => {
    const db = await getDb();

    return db.transaction(async (tx: any) => {
      const product = await tx.query.products.findFirst({
        where: eq(products.id, input.productId)
      });

      if (!product || !product.isActive) {
        throw new NotFound("Product not found");
      }

      const availableItems = await tx.query.inventoryItems.findMany({
        where: and(eq(inventoryItems.productId, input.productId), eq(inventoryItems.status, "available"))
      });

      if (availableItems.length < input.quantity) {
        throw new Conflict("Insufficient stock");
      }

      const selectedItems = availableItems.slice(0, input.quantity);
      const orderId = crypto.randomUUID();
      const orderCode = `ORD${Date.now()}`;
      const [order] = await tx
        .insert(orders)
        .values({
          id: orderId,
          orderCode,
          productId: input.productId,
          quantity: input.quantity,
          status: "fulfilled",
          telegramUserId: input.telegramUserId,
          telegramUsername: input.telegramUsername ?? null,
          totalPriceSnapshot: product.price * input.quantity,
          unitPriceSnapshot: product.price
        })
        .returning();

      await tx
        .update(inventoryItems)
        .set({
          soldAt: new Date(),
          soldOrderId: orderId,
          status: "sold"
        })
        .where(inArray(inventoryItems.id, selectedItems.map((item: typeof inventoryItems.$inferSelect) => item.id)));

      const [delivery] = await tx
        .insert(orderDeliveries)
        .values({
          filename: `${orderCode}.txt`,
          id: crypto.randomUUID(),
          lineCount: selectedItems.length,
          orderId
        })
        .returning();

      return {
        delivery,
        items: selectedItems.map((item: typeof inventoryItems.$inferSelect) => item.content),
        order
      };
    });
  });
}

export async function listOrdersForAdmin() {
  const db = await getDb();

  return db.select().from(orders).orderBy(asc(orders.createdAt));
}

export async function getOrderDetail(orderId: string) {
  const db = await getDb();
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId)
  });

  if (!order) {
    throw new NotFound("Order not found");
  }

  const items = await db.query.inventoryItems.findMany({
    where: eq(inventoryItems.soldOrderId, orderId)
  });

  return {
    ...order,
    items: items.map((item: typeof inventoryItems.$inferSelect) => item.content)
  };
}

function validateQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new BadRequest("Quantity must be a positive integer");
  }
}

async function withProductLock<T>(productId: string, callback: () => Promise<T>): Promise<T> {
  const previous = productLocks.get(productId) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });

  productLocks.set(productId, previous.then(() => current));
  await previous;

  try {
    return await callback();
  } finally {
    release();

    if (productLocks.get(productId) === current) {
      productLocks.delete(productId);
    }
  }
}
