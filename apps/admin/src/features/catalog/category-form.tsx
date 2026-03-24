"use client";

import { useState } from "react";

type CategoryFormProps = {
  onSubmit: (input: { isActive: boolean; name: string; slug: string; sortOrder: number }) => Promise<void>;
};

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      isActive: true,
      name,
      slug,
      sortOrder: Number(sortOrder)
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Category Name
        <input aria-label="Category Name" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Category Slug
        <input aria-label="Category Slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
      </label>
      <label>
        Category Sort Order
        <input
          aria-label="Category Sort Order"
          type="number"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </label>
      <button type="submit">Tao Category</button>
    </form>
  );
}
