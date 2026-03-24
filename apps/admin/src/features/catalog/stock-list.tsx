"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type StockListItem = {
  content: string;
  createdAt: string;
  id: string;
  productId: string;
  status: string;
};

type StockListProps = {
  errorMessage?: string;
  isLoading?: boolean;
  items: StockListItem[];
  onProductChange: (productId: string) => void;
  onRefresh: () => void;
  products: Array<{ id: string; name: string }>;
  selectedProductId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function StockList({
  errorMessage,
  isLoading = false,
  items,
  onProductChange,
  onRefresh,
  products,
  selectedProductId
}: StockListProps) {
  const selectedProduct = products.find((product) => product.id === selectedProductId);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Stock list</CardTitle>
          <CardDescription>
            Review the latest available inventory lines for the selected product before they are sold.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            aria-label="Stock list product"
            className="min-w-[220px]"
            value={selectedProductId}
            onChange={(event) => onProductChange(event.target.value)}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
          <Button type="button" variant="outline" onClick={onRefresh} aria-label="Refresh stock list">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedProduct ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>Selected product:</span>
            <Badge variant="outline">{selectedProduct.name}</Badge>
            <Badge>{items.length} available</Badge>
          </div>
        ) : null}
        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</div>
        ) : isLoading ? (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50 px-4 py-8 text-sm text-slate-500">
            Loading available stock lines...
          </div>
        ) : items.length ? (
          <div className="max-h-[28rem] overflow-auto rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[220px]">Imported at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[520px] font-mono text-xs text-slate-700">{item.content}</TableCell>
                    <TableCell>
                      <Badge variant="success">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{formatDate(item.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50 px-4 py-8 text-sm text-slate-500">
            No available stock lines for this product yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
