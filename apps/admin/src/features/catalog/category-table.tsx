import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Category = {
  id: string;
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
};

type CategoryTableProps = {
  categories: Category[];
  onUpdate?: (categoryId: string, input: Omit<Category, "id">) => Promise<void>;
};

export function CategoryTable({ categories, onUpdate }: CategoryTableProps) {
  const [drafts, setDrafts] = useState(categories);

  useEffect(() => {
    setDrafts(categories);
  }, [categories]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category list</CardTitle>
        <CardDescription>Update names, slugs, sort order, and whether each category is visible in the bot.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Sort order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.length ? null : (
              <TableRow>
                <TableCell className="py-10 text-center text-sm text-slate-500" colSpan={5}>
                  No categories yet. Create the first category to organize the product catalog.
                </TableCell>
              </TableRow>
            )}
            {drafts.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <Input
                    aria-label={`Category Name ${category.id}`}
                    value={category.name}
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === category.id ? { ...item, name: event.target.value } : item
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Category Slug ${category.id}`}
                    value={category.slug}
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === category.id ? { ...item, slug: event.target.value } : item
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    aria-label={`Category Sort Order ${category.id}`}
                    value={String(category.sortOrder)}
                    type="number"
                    onChange={(event) => {
                      setDrafts((current) =>
                        current.map((item) =>
                          item.id === category.id ? { ...item, sortOrder: Number(event.target.value) } : item
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <label className="inline-flex items-center gap-3">
                    <Switch
                      aria-label={`Category Active ${category.id}`}
                      checked={category.isActive}
                      onCheckedChange={(checked) => {
                        setDrafts((current) =>
                          current.map((item) =>
                            item.id === category.id ? { ...item, isActive: checked } : item
                          )
                        );
                      }}
                    />
                    <Badge variant={category.isActive ? "success" : "outline"}>
                      {category.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </label>
                </TableCell>
                <TableCell>
                  {onUpdate ? (
                    <Button
                      type="button"
                      aria-label={`Save Category ${category.id}`}
                      onClick={() =>
                        onUpdate(category.id, {
                          isActive: category.isActive,
                          name: category.name,
                          slug: category.slug,
                          sortOrder: category.sortOrder
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
