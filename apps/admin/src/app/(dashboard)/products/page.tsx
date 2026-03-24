"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductForm } from "../../../features/catalog/product-form";
import { StockImportForm } from "../../../features/catalog/stock-import-form";
import { ProductTable } from "../../../features/catalog/product-table";
import {
  createProduct,
  getCategories,
  getProducts,
  importInventoryFile,
  importInventoryText,
  updateProduct
} from "../../../lib/api";

type Category = {
  id: string;
  name: string;
};

type Product = {
  availableStock: number;
  categoryId: string;
  id: string;
  isActive: boolean;
  name: string;
  price: number;
  slug: string;
  sortOrder: number;
};

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  async function refresh() {
    const [nextCategories, nextProducts] = await Promise.all([getCategories(), getProducts()]);
    setCategories(nextCategories);
    setProducts(nextProducts);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const stockImportProducts = useMemo(
    () => products.map((product) => ({ id: product.id, name: product.name })),
    [products]
  );

  return (
    <section>
      <ProductForm
        categories={categories}
        onSubmit={async (input) => {
          await createProduct(input);
          await refresh();
        }}
      />
      <ProductTable
        categories={categories}
        onUpdate={async (productId, input) => {
          await updateProduct(productId, input);
          await refresh();
        }}
        products={products}
      />
      {stockImportProducts.length ? (
        <StockImportForm
          onImportFile={async (input) => {
            await importInventoryFile(input);
            await refresh();
          }}
          onImportText={async (input) => {
            await importInventoryText(input);
            await refresh();
          }}
          products={stockImportProducts}
        />
      ) : null}
    </section>
  );
}
