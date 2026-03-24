import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderDetail } from "./order-detail";

describe("OrderDetail", () => {
  it("shows sold items for audit", () => {
    render(
      <OrderDetail
        order={{
          id: "ord_1",
          items: ["line-a", "line-b"],
          quantity: 2,
          telegramUsername: "buyer",
          totalPriceSnapshot: 160000
        }}
      />
    );

    expect(screen.getByText(/line-a/i)).toBeTruthy();
    expect(screen.getByText(/line-b/i)).toBeTruthy();
    expect(screen.getByText(/^buyer$/i)).toBeTruthy();
  });
});
