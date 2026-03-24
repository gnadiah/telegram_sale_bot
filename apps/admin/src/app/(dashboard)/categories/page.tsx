"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPanel } from "@/components/admin/status-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { CategoryForm } from "../../../features/catalog/category-form";
import { CategoryTable } from "../../../features/catalog/category-table";
import { createCategory, getCategories, updateCategory } from "../../../lib/api";

type Category = {
  id: string;
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
};

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setCategories(await getCategories());
      return true;
    } catch {
      setErrorMessage("We could not load categories right now. Try again in a moment.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function retryRefresh() {
    const didLoad = await refresh();

    if (didLoad) {
      toast({
        description: "Category data has been refreshed.",
        title: "Categories loaded",
        variant: "success"
      });
      return;
    }

    toast({
      description: "We still could not load categories. Please try again.",
      title: "Retry failed",
      variant: "error"
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your catalog into clean groups before exposing products in the Telegram bot."
      />
      <CategoryForm
        onSubmit={async (input) => {
          try {
            await createCategory(input);
            toast({
              description: "The category is ready for product assignment and Telegram listing.",
              title: "Category created",
              variant: "success"
            });
            await refresh();
          } catch {
            toast({
              description: "The category was not created. Please try again.",
              title: "Create category failed",
              variant: "error"
            });
            throw new Error("CREATE_CATEGORY_FAILED");
          }
        }}
      />
      {isLoading ? (
        <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : errorMessage ? (
        <StatusPanel
          tone="error"
          title="Categories are temporarily unavailable"
          description={errorMessage}
          actionLabel="Retry"
          onAction={() => {
            void retryRefresh();
          }}
        />
      ) : (
        <CategoryTable
          categories={categories}
          onUpdate={async (categoryId, input) => {
            try {
              await updateCategory(categoryId, input);
              toast({
                description: "Catalog ordering and visibility have been updated.",
                title: "Category updated",
                variant: "success"
              });
              await refresh();
            } catch {
              toast({
                description: "The category changes were not saved. Please try again.",
                title: "Update category failed",
                variant: "error"
              });
              throw new Error("UPDATE_CATEGORY_FAILED");
            }
          }}
        />
      )}
    </section>
  );
}
