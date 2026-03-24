import { and, asc, eq } from "drizzle-orm";
import { NotFound } from "@tsed/exceptions";
import { getDb } from "../../config/db";
import { categories, inventoryItems, products } from "../../db/schema";

export type CreateCategoryInput = {
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
};

export type CreateProductInput = {
  categoryId: string;
  isActive: boolean;
  name: string;
  price: number;
  slug: string;
  sortOrder: number;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type UpdateProductInput = Partial<CreateProductInput>;

export async function createCategory(input: CreateCategoryInput) {
  const db = await getDb();
  const [category] = await db
    .insert(categories)
    .values({
      id: crypto.randomUUID(),
      isActive: input.isActive,
      name: input.name,
      slug: input.slug,
      sortOrder: input.sortOrder
    })
    .returning();

  return category;
}

export async function createProduct(input: CreateProductInput) {
  const db = await getDb();
  const category = await db.query.categories.findFirst({
    where: eq(categories.id, input.categoryId)
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const [product] = await db
    .insert(products)
    .values({
      categoryId: input.categoryId,
      id: crypto.randomUUID(),
      isActive: input.isActive,
      name: input.name,
      price: input.price,
      slug: input.slug,
      sortOrder: input.sortOrder
    })
    .returning();

  return product;
}

export async function listCategoriesForAdmin() {
  const db = await getDb();

  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function listProductsForAdmin() {
  const db = await getDb();
  const adminProducts: Array<typeof products.$inferSelect> = await db
    .select()
    .from(products)
    .orderBy(asc(products.sortOrder));
  const stockMap = await buildAvailableStockMap(adminProducts.map((product) => product.id));

  return adminProducts.map((product: typeof products.$inferSelect) => ({
    ...product,
    availableStock: stockMap.get(product.id) ?? 0
  }));
}

export async function listActiveCategories() {
  const db = await getDb();

  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
}

export async function listActiveProductsByCategory(categoryId: string) {
  const db = await getDb();
  const activeProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
    .orderBy(asc(products.sortOrder));

  return Promise.all(
    activeProducts.map(async (product: typeof products.$inferSelect) => {
      const availableItems = await db.query.inventoryItems.findMany({
        where: and(eq(inventoryItems.productId, product.id), eq(inventoryItems.status, "available"))
      });

      return {
        categoryId: product.categoryId,
        id: product.id,
        isActive: product.isActive,
        name: product.name,
        price: product.price,
        slug: product.slug,
        sortOrder: product.sortOrder,
        stock: availableItems.length
      };
    })
  );
}

export async function updateCategory(categoryId: string, input: UpdateCategoryInput) {
  const db = await getDb();
  const existingCategory = await db.query.categories.findFirst({
    where: eq(categories.id, categoryId)
  });

  if (!existingCategory) {
    throw new NotFound("Category not found");
  }

  const [category] = await db
    .update(categories)
    .set({
      ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.slug === undefined ? {} : { slug: input.slug }),
      ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
      updatedAt: new Date()
    })
    .where(eq(categories.id, categoryId))
    .returning();

  return category;
}

export async function updateProduct(productId: string, input: UpdateProductInput) {
  const db = await getDb();
  const existingProduct = await db.query.products.findFirst({
    where: eq(products.id, productId)
  });

  if (!existingProduct) {
    throw new NotFound("Product not found");
  }

  if (input.categoryId) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, input.categoryId)
    });

    if (!category) {
      throw new NotFound("Category not found");
    }
  }

  const [product] = await db
    .update(products)
    .set({
      ...(input.categoryId === undefined ? {} : { categoryId: input.categoryId }),
      ...(input.isActive === undefined ? {} : { isActive: input.isActive }),
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.price === undefined ? {} : { price: input.price }),
      ...(input.slug === undefined ? {} : { slug: input.slug }),
      ...(input.sortOrder === undefined ? {} : { sortOrder: input.sortOrder }),
      updatedAt: new Date()
    })
    .where(eq(products.id, productId))
    .returning();

  return product;
}

async function buildAvailableStockMap(productIds: string[]) {
  if (productIds.length === 0) {
    return new Map<string, number>();
  }

  const db = await getDb();
  const availableItems = await Promise.all(
    productIds.map(async (productId) => {
      const items = await db.query.inventoryItems.findMany({
        where: and(eq(inventoryItems.productId, productId), eq(inventoryItems.status, "available"))
      });

      return [productId, items.length] as const;
    })
  );

  return new Map<string, number>(availableItems);
}
