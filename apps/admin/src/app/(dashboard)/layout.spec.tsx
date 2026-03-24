import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DashboardLayout from "./layout";
import { ToastProvider } from "@/components/ui/toast";
import { authStore } from "@/lib/auth-store";

const {
  getAdminSession,
  logoutAdmin,
  logoutAllAdminSessions,
  replace,
  restoreAdminSession
} = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  logoutAdmin: vi.fn(),
  logoutAllAdminSessions: vi.fn(),
  replace: vi.fn(),
  restoreAdminSession: vi.fn()
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/categories",
  useRouter: () => ({
    replace
  })
}));

vi.mock("@/lib/api", () => ({
  getAdminSession,
  logoutAdmin,
  logoutAllAdminSessions,
  restoreAdminSession
}));

describe("DashboardLayout", () => {
  afterEach(() => {
    cleanup();
    authStore.clear();
    replace.mockReset();
    getAdminSession.mockReset();
    restoreAdminSession.mockReset();
    logoutAdmin.mockReset();
    logoutAllAdminSessions.mockReset();
  });

  it("renders the admin link for super admins and exposes a mobile menu trigger", async () => {
    authStore.setAccessToken("token-1");
    getAdminSession.mockResolvedValue({
      user: {
        id: "admin_1",
        role: "super_admin",
        username: "admin"
      }
    });

    render(
      <ToastProvider>
        <DashboardLayout>
          <div>Dashboard content</div>
        </DashboardLayout>
      </ToastProvider>
    );

    await waitFor(() => expect(screen.getByText(/dashboard content/i)).toBeTruthy());

    expect(screen.getByRole("link", { name: /admins/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /open navigation/i })).toBeTruthy();
  });

  it("hides the admin link for non-super-admin users", async () => {
    authStore.setAccessToken("token-1");
    getAdminSession.mockResolvedValue({
      user: {
        id: "admin_2",
        role: "admin",
        username: "staff1"
      }
    });

    render(
      <ToastProvider>
        <DashboardLayout>
          <div>Dashboard content</div>
        </DashboardLayout>
      </ToastProvider>
    );

    await waitFor(() => expect(screen.getByText(/dashboard content/i)).toBeTruthy());

    expect(screen.queryByRole("link", { name: /admins/i })).toBeNull();
  });

  it("opens a confirmation dialog before logging out all sessions", async () => {
    authStore.setAccessToken("token-1");
    getAdminSession.mockResolvedValue({
      user: {
        id: "admin_1",
        role: "super_admin",
        username: "admin"
      }
    });
    logoutAllAdminSessions.mockResolvedValue(undefined);

    render(
      <ToastProvider>
        <DashboardLayout>
          <div>Dashboard content</div>
        </DashboardLayout>
      </ToastProvider>
    );

    await waitFor(() => expect(screen.getByText(/dashboard content/i)).toBeTruthy());

    fireEvent.click(screen.getByRole("button", { name: /logout all sessions/i }));

    expect(logoutAllAdminSessions).not.toHaveBeenCalled();
    expect(screen.getByText(/end all admin sessions/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /confirm logout all sessions/i }));

    await waitFor(() => expect(logoutAllAdminSessions).toHaveBeenCalledTimes(1));
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
