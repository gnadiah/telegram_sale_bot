import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductForm } from "./product-form";

describe("ProductForm", () => {
  it("submits a new product payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProductForm categories={[{ id: "cat-1", name: "Chat GPT" }]} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/product category/i), { target: { value: "cat-1" } });
    fireEvent.change(screen.getByLabelText(/product name/i), { target: { value: "GPT Plus 1T" } });
    fireEvent.change(screen.getByLabelText(/product slug/i), { target: { value: "gpt-plus-1t" } });
    fireEvent.change(screen.getByLabelText(/product price/i), { target: { value: "30000" } });
    fireEvent.change(screen.getByLabelText(/product sort order/i), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /tao product/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        categoryId: "cat-1",
        isActive: true,
        name: "GPT Plus 1T",
        price: 30000,
        slug: "gpt-plus-1t",
        sortOrder: 5
      })
    );
  });
});
