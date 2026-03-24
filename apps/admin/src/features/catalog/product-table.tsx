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
  onUpdate?: (
    productId: string,
    input: Omit<Product, "availableStock" | "id">
  ) => Promise<void>;
  products: Product[];
};

export function ProductTable({ categories = [], onUpdate, products }: ProductTableProps) {
  return (
    <table>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>
              <input
                aria-label={`Product Name ${product.id}`}
                defaultValue={product.name}
                onChange={(event) => {
                  product.name = event.target.value;
                }}
              />
            </td>
            <td>
              <select
                aria-label={`Product Category ${product.id}`}
                defaultValue={product.categoryId}
                onChange={(event) => {
                  product.categoryId = event.target.value;
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                aria-label={`Product Slug ${product.id}`}
                defaultValue={product.slug ?? ""}
                onChange={(event) => {
                  product.slug = event.target.value;
                }}
              />
            </td>
            <td>
              <input
                aria-label={`Product Price ${product.id}`}
                defaultValue={String(product.price)}
                type="number"
                onChange={(event) => {
                  product.price = Number(event.target.value);
                }}
              />
            </td>
            <td>
              <input
                aria-label={`Product Sort Order ${product.id}`}
                defaultValue={String(product.sortOrder)}
                type="number"
                onChange={(event) => {
                  product.sortOrder = Number(event.target.value);
                }}
              />
            </td>
            <td>
              <input
                aria-label={`Product Active ${product.id}`}
                defaultChecked={product.isActive}
                type="checkbox"
                onChange={(event) => {
                  product.isActive = event.target.checked;
                }}
              />
            </td>
            <td>{product.availableStock ?? 0}</td>
            <td>
              {onUpdate ? (
                <button
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
                </button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
