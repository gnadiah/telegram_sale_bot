"use client";

import { useState } from "react";

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
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("0");
  const [sortOrder, setSortOrder] = useState("0");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      categoryId,
      isActive: true,
      name,
      price: Number(price),
      slug,
      sortOrder: Number(sortOrder)
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Product Category
        <select aria-label="Product Category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Product Name
        <input aria-label="Product Name" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Product Slug
        <input aria-label="Product Slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
      </label>
      <label>
        Product Price
        <input aria-label="Product Price" type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
      </label>
      <label>
        Product Sort Order
        <input
          aria-label="Product Sort Order"
          type="number"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </label>
      <button type="submit">Tao Product</button>
    </form>
  );
}
