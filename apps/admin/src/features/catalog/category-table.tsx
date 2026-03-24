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
  return (
    <table>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <td>
              <input
                aria-label={`Category Name ${category.id}`}
                defaultValue={category.name}
                onChange={(event) => {
                  category.name = event.target.value;
                }}
              />
            </td>
            <td>
              <input
                aria-label={`Category Slug ${category.id}`}
                defaultValue={category.slug}
                onChange={(event) => {
                  category.slug = event.target.value;
                }}
              />
            </td>
            <td>
              <input
                aria-label={`Category Sort Order ${category.id}`}
                defaultValue={String(category.sortOrder)}
                type="number"
                onChange={(event) => {
                  category.sortOrder = Number(event.target.value);
                }}
              />
            </td>
            <td>
              <input
                aria-label={`Category Active ${category.id}`}
                defaultChecked={category.isActive}
                type="checkbox"
                onChange={(event) => {
                  category.isActive = event.target.checked;
                }}
              />
            </td>
            <td>
              {onUpdate ? (
                <button
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
                </button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
