"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type ProductFormProps = {
  categories: Array<{ id: string; name: string }>;
  onSubmit: (input: {
    categoryId: string;
    isActive: boolean;
    name: string;
    price: number;
    slug: string;
    sortOrder: number;
  }) => Promise<void>;
};

export function ProductForm({ categories, onSubmit }: ProductFormProps) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("0");
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    if (!categoryId && categories[0]?.id) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!categories.length) {
      setErrorMessage("Create a category before creating products.");
      return;
    }

    if (!categoryId || !name.trim() || !slug.trim()) {
      setErrorMessage("Product category, name, and slug are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        categoryId,
        isActive: true,
        name: name.trim(),
        price: Number(price),
        slug: slug.trim(),
        sortOrder: Number(sortOrder)
      });
      setName("");
      setSlug("");
      setPrice("0");
      setSortOrder("0");
    } catch {
      setErrorMessage("We could not create the product right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create product</CardTitle>
        <CardDescription>Create a sellable product under a category and control its catalog order.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="product-category">Product Category</Label>
            <Select
              id="product-category"
              aria-label="Product Category"
              disabled={!categories.length || isSubmitting}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {!categories.length ? <option value="">Create a category first</option> : null}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              aria-label="Product Name"
              disabled={!categories.length || isSubmitting}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-slug">Product Slug</Label>
            <Input
              id="product-slug"
              aria-label="Product Slug"
              disabled={!categories.length || isSubmitting}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">Product Price</Label>
            <Input
              id="product-price"
              aria-label="Product Price"
              disabled={!categories.length || isSubmitting}
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-sort-order">Product Sort Order</Label>
            <Input
              id="product-sort-order"
              aria-label="Product Sort Order"
              disabled={!categories.length || isSubmitting}
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </div>
          {!categories.length ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 md:col-span-2 xl:col-span-5">
              Create at least one category before creating products.
            </div>
          ) : null}
          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2 xl:col-span-5">
              {errorMessage}
            </div>
          ) : null}
          <div className="md:col-span-2 xl:col-span-5">
            <Button disabled={!categories.length || isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
