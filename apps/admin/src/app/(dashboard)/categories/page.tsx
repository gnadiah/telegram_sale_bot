"use client";

import { useEffect, useState } from "react";
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
  const [categories, setCategories] = useState<Category[]>([]);

  async function refresh() {
    setCategories(await getCategories());
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <section>
      <CategoryForm
        onSubmit={async (input) => {
          await createCategory(input);
          await refresh();
        }}
      />
      <CategoryTable
        categories={categories}
        onUpdate={async (categoryId, input) => {
          await updateCategory(categoryId, input);
          await refresh();
        }}
      />
    </section>
  );
}
