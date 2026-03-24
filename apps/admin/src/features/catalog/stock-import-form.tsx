"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type StockImportFormProps = {
  onImportFile: (input: { filename: string; productId: string; text: string }) => Promise<void>;
  onImportText: (input: { productId: string; text: string }) => Promise<void>;
  onProductChange?: (productId: string) => void;
  products: Array<{ id: string; name: string }>;
  selectedProductId?: string;
};

export function StockImportForm({
  onImportFile,
  onImportText,
  onProductChange,
  products,
  selectedProductId
}: StockImportFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [internalProductId, setInternalProductId] = useState("");
  const [text, setText] = useState("");
  const productId = selectedProductId ?? internalProductId;

  function handleProductChange(nextProductId: string) {
    if (selectedProductId === undefined) {
      setInternalProductId(nextProductId);
    }

    onProductChange?.(nextProductId);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !productId) {
      return;
    }

    setErrorMessage("");
    setIsImporting(true);

    try {
      await onImportFile({
        filename: file.name,
        productId,
        text: await file.text()
      });
    } catch {
      setErrorMessage("We could not import the TXT file right now.");
    } finally {
      event.target.value = "";
      setIsImporting(false);
    }
  }

  async function handleImportText() {
    if (!productId || !text.trim()) {
      return;
    }

    setErrorMessage("");
    setIsImporting(true);

    try {
      await onImportText({ productId, text });
      setText("");
    } catch {
      setErrorMessage("We could not import the pasted text right now.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import stock</CardTitle>
        <CardDescription>Choose a product first, then paste account lines or upload a TXT file to add inventory.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stock-product">Product</Label>
          <Select
            id="stock-product"
            aria-label="Product"
            disabled={isImporting}
            value={productId}
            onChange={(event) => handleProductChange(event.target.value)}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock-paste">Paste</Label>
          <Textarea
            id="stock-paste"
            aria-label="Paste"
            disabled={isImporting}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </div>
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" disabled={!productId || !text.trim() || isImporting} onClick={handleImportText}>
            {isImporting ? "Importing..." : "Import Text"}
          </Button>
          <div className="w-full sm:w-auto">
            <Label
              htmlFor="upload-txt"
              className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Upload TXT
            </Label>
            <Input
              id="upload-txt"
              aria-label="Upload TXT"
              type="file"
              accept=".txt"
              disabled={!productId || isImporting}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
