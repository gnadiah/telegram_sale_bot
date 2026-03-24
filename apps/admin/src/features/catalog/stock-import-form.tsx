"use client";

import { useState } from "react";

type StockImportFormProps = {
  onImportFile: (input: { filename: string; productId: string; text: string }) => Promise<void>;
  onImportText: (input: { productId: string; text: string }) => Promise<void>;
  products: Array<{ id: string; name: string }>;
};

export function StockImportForm({ onImportFile, onImportText, products }: StockImportFormProps) {
  const [productId, setProductId] = useState("");
  const [text, setText] = useState("");

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !productId) {
      return;
    }

    await onImportFile({
      filename: file.name,
      productId,
      text: await file.text()
    });
  }

  async function handleImportText() {
    if (!productId) {
      return;
    }

    await onImportText({ productId, text });
  }

  return (
    <section>
      <label>
        Product
        <select aria-label="Product" value={productId} onChange={(event) => setProductId(event.target.value)}>
          <option value="">Chon product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Paste
        <textarea aria-label="Paste" value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <button type="button" disabled={!productId} onClick={handleImportText}>
        Import Text
      </button>
      <label>
        Upload TXT
        <input aria-label="Upload TXT" type="file" accept=".txt" disabled={!productId} onChange={handleFileChange} />
      </label>
    </section>
  );
}
