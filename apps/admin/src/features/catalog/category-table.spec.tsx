import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryTable } from "./category-table";

describe("CategoryTable", () => {
  it("submits category edits", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <CategoryTable
        categories={[
          {
            id: "cat_1",
            isActive: true,
            name: "Chat GPT",
            slug: "chat-gpt",
            sortOrder: 3
          }
        ]}
        onUpdate={onUpdate}
      />
    );

    fireEvent.change(screen.getByLabelText(/category name cat_1/i), { target: { value: "Chat GPT Plus" } });
    fireEvent.click(screen.getByRole("button", { name: /save category cat_1/i }));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith("cat_1", {
        isActive: true,
        name: "Chat GPT Plus",
        slug: "chat-gpt",
        sortOrder: 3
      })
    );
  });
});
