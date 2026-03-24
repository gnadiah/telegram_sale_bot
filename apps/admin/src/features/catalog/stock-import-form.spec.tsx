import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StockImportForm } from "./stock-import-form";

afterEach(() => {
  cleanup();
});

describe("StockImportForm", () => {
  it("submits pasted stock text for a product", async () => {
    const onImportText = vi.fn().mockResolvedValue(undefined);
    const onImportFile = vi.fn().mockResolvedValue(undefined);

    render(
      <StockImportForm
        onImportFile={onImportFile}
        onImportText={onImportText}
        products={[
          { id: "prod_1", name: "Product One" },
          { id: "prod_2", name: "Product Two" }
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: "prod_2" } });
    fireEvent.change(screen.getByLabelText(/paste/i), { target: { value: "acc1\nacc2" } });
    fireEvent.click(screen.getByRole("button", { name: /import text/i }));

    await waitFor(() =>
      expect(onImportText).toHaveBeenCalledWith({ productId: "prod_2", text: "acc1\nacc2" })
    );
  });

  it("keeps import text disabled until both a product and text are present", () => {
    const onImportText = vi.fn().mockResolvedValue(undefined);
    const onImportFile = vi.fn().mockResolvedValue(undefined);

    render(
      <StockImportForm
        onImportFile={onImportFile}
        onImportText={onImportText}
        products={[{ id: "prod_1", name: "Product One" }]}
      />
    );

    expect(screen.getByRole("button", { name: /import text/i })).toHaveProperty("disabled", true);

    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: "prod_1" } });
    expect(screen.getByRole("button", { name: /import text/i })).toHaveProperty("disabled", true);

    fireEvent.change(screen.getByLabelText(/paste/i), { target: { value: "acc1" } });
    expect(screen.getByRole("button", { name: /import text/i })).toHaveProperty("disabled", false);
  });

  it("supports a controlled selected product", () => {
    const onImportText = vi.fn().mockResolvedValue(undefined);
    const onImportFile = vi.fn().mockResolvedValue(undefined);
    const onProductChange = vi.fn();

    render(
      <StockImportForm
        onImportFile={onImportFile}
        onImportText={onImportText}
        onProductChange={onProductChange}
        products={[
          { id: "prod_1", name: "Product One" },
          { id: "prod_2", name: "Product Two" }
        ]}
        selectedProductId="prod_2"
      />
    );

    expect(screen.getByLabelText(/product/i)).toHaveProperty("value", "prod_2");

    fireEvent.change(screen.getByLabelText(/product/i), { target: { value: "prod_1" } });

    expect(onProductChange).toHaveBeenCalledWith("prod_1");
  });
});
