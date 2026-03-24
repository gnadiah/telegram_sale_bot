import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductTable } from "./product-table";

describe("ProductTable", () => {
  it("submits product edits and category changes", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <ProductTable
        categories={[
          { id: "cat_1", name: "Chat GPT" },
          { id: "cat_2", name: "Claude" }
        ]}
        onUpdate={onUpdate}
        products={[
          {
            availableStock: 8,
            categoryId: "cat_1",
            id: "prod_1",
            isActive: true,
            name: "GPT Plus 1T",
            price: 30000,
            sortOrder: 5
          }
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText(/product category prod_1/i), { target: { value: "cat_2" } });
    fireEvent.change(screen.getByLabelText(/product price prod_1/i), { target: { value: "45000" } });
    fireEvent.click(screen.getByRole("button", { name: /save product prod_1/i }));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith("prod_1", {
        categoryId: "cat_2",
        isActive: true,
        name: "GPT Plus 1T",
        price: 45000,
        sortOrder: 5
      })
    );
  });
});
