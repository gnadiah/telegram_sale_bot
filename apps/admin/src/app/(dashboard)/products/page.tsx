"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPanel } from "@/components/admin/status-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ProductForm } from "../../../features/catalog/product-form";
import { StockImportForm } from "../../../features/catalog/stock-import-form";
import { StockList } from "../../../features/catalog/stock-list";
import { ProductTable } from "../../../features/catalog/product-table";
import {
  createProduct,
  getCategories,
  getProductStockItems,
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

type StockItem = {
  content: string;
  createdAt: string;
  id: string;
  productId: string;
  status: string;
};

export default function ProductsPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStockProductId, setSelectedStockProductId] = useState("");
  const [stockErrorMessage, setStockErrorMessage] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockListLoading, setStockListLoading] = useState(false);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [nextCategories, nextProducts] = await Promise.all([getCategories(), getProducts()]);
      setCategories(nextCategories);
      setProducts(nextProducts);
      return true;
    } catch {
      setErrorMessage("We could not load products and stock data right now. Try again in a moment.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshStockList(productId: string) {
    if (!productId) {
      setStockItems([]);
      setStockErrorMessage("");
      return true;
    }

    setStockListLoading(true);
    setStockErrorMessage("");

    try {
      const response = await getProductStockItems(productId);
      setStockItems(response.items);
      return true;
    } catch {
      setStockItems([]);
      setStockErrorMessage("We could not load the stock list for this product right now.");
      return false;
    } finally {
      setStockListLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!products.length) {
      setSelectedStockProductId("");
      setStockItems([]);
      setStockErrorMessage("");
      return;
    }

    setSelectedStockProductId((current) => {
      if (current && products.some((product) => product.id === current)) {
        return current;
      }

      return products[0]?.id ?? "";
    });
  }, [products]);

  useEffect(() => {
    if (!selectedStockProductId) {
      return;
    }

    void refreshStockList(selectedStockProductId);
  }, [selectedStockProductId]);

  async function retryRefresh() {
    const didLoad = await refresh();

    if (didLoad) {
      toast({
        description: "Product and stock data has been refreshed.",
        title: "Products loaded",
        variant: "success"
      });
      return;
    }

    toast({
      description: "We still could not load products and stock data. Please try again.",
      title: "Retry failed",
      variant: "error"
    });
  }

  const stockImportProducts = useMemo(
    () => products.map((product) => ({ id: product.id, name: product.name })),
    [products]
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage product metadata, visibility, stock levels, and import inventory without leaving the dashboard."
      />
      <ProductForm
        categories={categories}
        onSubmit={async (input) => {
          try {
            await createProduct(input);
            toast({
              description: "The product is now ready for stock import and Telegram exposure.",
              title: "Product created",
              variant: "success"
            });
            await refresh();
          } catch {
            toast({
              description: "The product was not created. Please try again.",
              title: "Create product failed",
              variant: "error"
            });
            throw new Error("CREATE_PRODUCT_FAILED");
          }
        }}
      />
      {isLoading ? (
        <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : errorMessage ? (
        <StatusPanel
          tone="error"
          title="Products are temporarily unavailable"
          description={errorMessage}
          actionLabel="Retry"
          onAction={() => {
            void retryRefresh();
          }}
        />
      ) : (
        <ProductTable
          categories={categories}
          onUpdate={async (productId, input) => {
            try {
              await updateProduct(productId, input);
              toast({
                description: "The product metadata and visibility were saved.",
                title: "Product updated",
                variant: "success"
              });
              await refresh();
            } catch {
              toast({
                description: "The product changes were not saved. Please try again.",
                title: "Update product failed",
                variant: "error"
              });
              throw new Error("UPDATE_PRODUCT_FAILED");
            }
          }}
          products={products}
        />
      )}
      {!isLoading && !errorMessage && stockImportProducts.length ? (
        <>
          <StockImportForm
            onImportFile={async (input) => {
              try {
                await importInventoryFile(input);
                toast({
                  description: "The uploaded TXT lines were added to stock.",
                  title: "Stock imported",
                  variant: "success"
                });
                await refresh();
                await refreshStockList(input.productId);
              } catch {
                toast({
                  description: "The TXT upload could not be processed. Please try again.",
                  title: "Stock import failed",
                  variant: "error"
                });
                throw new Error("IMPORT_FILE_FAILED");
              }
            }}
            onImportText={async (input) => {
              try {
                await importInventoryText(input);
                toast({
                  description: "The pasted stock lines were added to inventory.",
                  title: "Stock imported",
                  variant: "success"
                });
                await refresh();
                await refreshStockList(input.productId);
              } catch {
                toast({
                  description: "The pasted stock lines could not be imported. Please try again.",
                  title: "Stock import failed",
                  variant: "error"
                });
                throw new Error("IMPORT_TEXT_FAILED");
              }
            }}
            onProductChange={setSelectedStockProductId}
            products={stockImportProducts}
            selectedProductId={selectedStockProductId}
          />
          <StockList
            errorMessage={stockErrorMessage}
            isLoading={stockListLoading}
            items={stockItems}
            onProductChange={setSelectedStockProductId}
            onRefresh={() => {
              void (async () => {
                const didLoad = await refreshStockList(selectedStockProductId);

                toast({
                  description: didLoad
                    ? "The available stock lines have been refreshed."
                    : "The stock list could not be refreshed. Please try again.",
                  title: didLoad ? "Stock list refreshed" : "Refresh failed",
                  variant: didLoad ? "success" : "error"
                });
              })();
            }}
            products={stockImportProducts}
            selectedProductId={selectedStockProductId}
          />
        </>
      ) : null}
    </section>
  );
}
