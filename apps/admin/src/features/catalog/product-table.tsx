import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";

type Product = {
  availableStock?: number;
  categoryId: string;
  id: string;
  isActive: boolean;
  name: string;
  price: number;
  slug?: string;
  sortOrder: number;
};

type ProductCategory = {
  id: string;
  name: string;
};

type ProductTableProps = {
  categories?: ProductCategory[];
  onUpdate?: (productId: string, input: Omit<Product, "availableStock" | "id">) => Promise<void>;
  products: Product[];
};

export function ProductTable({ categories = [], onUpdate, products }: ProductTableProps) {
  const [drafts, setDrafts] = useState(products);

  useEffect(() => {
    setDrafts(products);
  }, [products]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product list</CardTitle>
        <CardDescription>Adjust category, price, sort order, availability, and inspect live stock counts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sort order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.length ? null : (
              <TableRow>
                <TableCell className="py-10 text-center text-sm text-slate-500" colSpan={8}>
                  No products yet. Create a product to unlock stock import and Telegram catalog listing.
                </TableCell>
              </TableRow>
            )}
            {drafts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Input
                    aria-label={`Product Name ${product.id}`}
                    value={product.name}
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === product.id ? { ...item, name: event.target.value } : item
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    aria-label={`Product Category ${product.id}`}
                    value={product.categoryId}
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === product.id ? { ...item, categoryId: event.target.value } : item
                        )
                      );
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Product Slug ${product.id}`}
                    value={product.slug ?? ""}
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === product.id ? { ...item, slug: event.target.value } : item
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Product Price ${product.id}`}
                    value={String(product.price)}
                    type="number"
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === product.id ? { ...item, price: Number(event.target.value) } : item
                        )
                      );
                    }}
                  />
                  <p className="mt-2 text-xs text-slate-500">{formatCurrency(product.price)} đ</p>
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Product Sort Order ${product.id}`}
                    value={String(product.sortOrder)}
                    type="number"
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === product.id ? { ...item, sortOrder: Number(event.target.value) } : item
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <label className="inline-flex items-center gap-3">
                    <Switch
                      aria-label={`Product Active ${product.id}`}
                      checked={product.isActive}
                      onCheckedChange={(checked) => {
                        setDrafts((current) =>
                          current.map((item) =>
                            item.id === product.id ? { ...item, isActive: checked } : item
                          )
                        );
                      }}
                    />
                    <Badge variant={product.isActive ? "success" : "outline"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </label>
                </TableCell>
                <TableCell>
                  <Badge variant={product.availableStock ? "default" : "warning"}>{product.availableStock ?? 0}</Badge>
                </TableCell>
                <TableCell>
                  {onUpdate ? (
                    <Button
                      type="button"
                      aria-label={`Save Product ${product.id}`}
                      onClick={() =>
                        onUpdate(product.id, {
                          categoryId: product.categoryId,
                          isActive: product.isActive,
                          name: product.name,
                          price: product.price,
                          ...(product.slug === undefined ? {} : { slug: product.slug }),
                          sortOrder: product.sortOrder
                        })
                      }
                    >
                      Save
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
