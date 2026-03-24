import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminUserTable } from "./admin-user-table";

describe("AdminUserTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("patches admin user role and active status", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <AdminUserTable
        adminUsers={[{ id: "admin_2", isActive: true, role: "admin", username: "staff1" }]}
        currentUserRole="super_admin"
        onUpdate={onUpdate}
      />
    );

    fireEvent.change(screen.getByLabelText(/admin role admin_2/i), { target: { value: "super_admin" } });
    fireEvent.click(screen.getByLabelText(/admin active admin_2/i));
    fireEvent.click(screen.getByRole("button", { name: /save admin admin_2/i }));

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith("admin_2", {
        isActive: false,
        role: "super_admin"
      })
    );
  });

  it("hides save actions for non-super-admin users", () => {
    render(
      <AdminUserTable
        adminUsers={[{ id: "admin_2", isActive: true, role: "admin", username: "staff1" }]}
        currentUserRole="admin"
      />
    );

    expect(screen.queryByRole("button", { name: /save admin admin_2/i })).toBeNull();
  });
});
