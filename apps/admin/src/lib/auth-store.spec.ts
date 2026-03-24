import { afterEach, describe, expect, it } from "vitest";
import { authStore, resetAuthStore } from "./auth-store";

describe("authStore", () => {
  afterEach(() => {
    resetAuthStore();
  });

  it("stores access token and current user in memory", () => {
    authStore.setSession({
      accessToken: "token-1",
      user: {
        id: "admin_1",
        role: "super_admin",
        username: "admin"
      }
    });

    expect(authStore.getAccessToken()).toBe("token-1");
    expect(authStore.getCurrentUser()).toEqual({
      id: "admin_1",
      role: "super_admin",
      username: "admin"
    });

    authStore.clear();

    expect(authStore.getAccessToken()).toBeNull();
    expect(authStore.getCurrentUser()).toBeNull();
  });
});
