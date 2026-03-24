import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StockList } from "./stock-list";

describe("StockList", () => {
  it("renders stock items for the selected product and lets the user switch products", () => {
    const onProductChange = vi.fn();
    const onRefresh = vi.fn();

    render(
      <StockList
        items={[
          {
            content: "mail:pass-1",
            createdAt: "2026-03-24T08:00:00.000Z",
            id: "item_1",
            productId: "prod_1",
            status: "available"
          }
        ]}
        onProductChange={onProductChange}
        onRefresh={onRefresh}
        products={[
          { id: "prod_1", name: "Product One" },
          { id: "prod_2", name: "Product Two" }
        ]}
        selectedProductId="prod_1"
      />
    );

    expect(screen.getByText("mail:pass-1")).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/stock list product/i), { target: { value: "prod_2" } });
    expect(onProductChange).toHaveBeenCalledWith("prod_2");

    fireEvent.click(screen.getByRole("button", { name: /refresh stock list/i }));
    expect(onRefresh).toHaveBeenCalled();
  });
});
