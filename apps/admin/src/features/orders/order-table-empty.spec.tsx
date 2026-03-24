import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderTable } from "./order-table";

describe("OrderTable empty state", () => {
  it("shows a friendly empty state when there are no orders", () => {
    render(<OrderTable orders={[]} />);

    expect(screen.getByText(/no orders yet/i)).toBeTruthy();
  });
});
