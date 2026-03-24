"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CategoryFormProps = {
  onSubmit: (input: { isActive: boolean; name: string; slug: string; sortOrder: number }) => Promise<void>;
};

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !slug.trim()) {
      setErrorMessage("Category name and slug are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        isActive: true,
        name: name.trim(),
        slug: slug.trim(),
        sortOrder: Number(sortOrder)
      });
      setName("");
      setSlug("");
      setSortOrder("0");
    } catch {
      setErrorMessage("We could not create the category right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create category</CardTitle>
        <CardDescription>Group products by brand or service before exposing them in the Telegram bot.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              aria-label="Category Name"
              disabled={isSubmitting}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-slug">Category Slug</Label>
            <Input
              id="category-slug"
              aria-label="Category Slug"
              disabled={isSubmitting}
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-sort-order">Category Sort Order</Label>
            <Input
              id="category-sort-order"
              aria-label="Category Sort Order"
              disabled={isSubmitting}
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </div>
          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-3">
              {errorMessage}
            </div>
          ) : null}
          <div className="md:col-span-3">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
