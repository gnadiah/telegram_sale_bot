import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StockImportForm } from "./stock-import-form";

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
});
