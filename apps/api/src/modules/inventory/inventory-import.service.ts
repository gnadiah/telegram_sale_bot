import { eq } from "drizzle-orm";
import { getDb } from "../../config/db";
import { inventoryImportBatches, inventoryItems, products } from "../../db/schema";

type ImportInventoryInput = {
  originalFilename?: string;
  productId: string;
  sourceType: "paste" | "txt_upload";
  text: string;
};

export async function importInventory(input: ImportInventoryInput) {
  const db = await getDb();
  const product = await db.query.products.findFirst({
    where: eq(products.id, input.productId)
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const rawLines = input.text.split(/\r?\n/).map((line) => line.trim());
  const acceptedLines = rawLines.filter(Boolean);

  const [importBatch] = await db
    .insert(inventoryImportBatches)
    .values({
      id: crypto.randomUUID(),
      originalFilename: input.originalFilename ?? null,
      productId: input.productId,
      sourceType: input.sourceType,
      totalAccepted: acceptedLines.length,
      totalReceived: acceptedLines.length
    })
    .returning();

  if (acceptedLines.length > 0) {
    await db.insert(inventoryItems).values(
      acceptedLines.map((content) => ({
        content,
        id: crypto.randomUUID(),
        importBatchId: importBatch.id,
        productId: input.productId,
        status: "available"
      }))
    );
  }

  return importBatch;
}
