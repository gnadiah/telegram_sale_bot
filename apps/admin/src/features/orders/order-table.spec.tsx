import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderTable } from "./order-table";

describe("OrderTable", () => {
  it("renders a detail link for each order", () => {
    render(
      <OrderTable
        orders={[
          {
            id: "ord_1",
            quantity: 2,
            telegramUsername: "buyer",
            totalPriceSnapshot: 60000
          }
        ]}
      />
    );

    const link = screen.getByRole("link", { name: /view order ord_1/i });
    expect(link.getAttribute("href")).toBe("/orders/ord_1");
  });
});
