import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminUserForm } from "./admin-user-form";

describe("AdminUserForm", () => {
  it("submits a new admin user payload", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<AdminUserForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "staff1" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret123" } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: /create admin/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        isActive: true,
        password: "secret123",
        role: "admin",
        username: "staff1"
      })
    );
  });
});
