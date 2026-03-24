import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryForm } from "./category-form";

describe("CategoryForm", () => {
  it("submits a new category payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CategoryForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/category name/i), { target: { value: "Chat GPT" } });
    fireEvent.change(screen.getByLabelText(/category slug/i), { target: { value: "chat-gpt" } });
    fireEvent.change(screen.getByLabelText(/category sort order/i), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /create category/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        isActive: true,
        name: "Chat GPT",
        slug: "chat-gpt",
        sortOrder: 3
      })
    );
  });
});
