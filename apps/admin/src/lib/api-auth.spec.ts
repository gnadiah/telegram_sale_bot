import { afterEach, describe, expect, it, vi } from "vitest";
import { authStore, resetAuthStore } from "./auth-store";
import { getOrders, loginAdmin } from "./api";

function jsonResponse(status: number, body: unknown) {
  return {
    json: vi.fn().mockResolvedValue(body),
    ok: status >= 200 && status < 300,
    status
  } satisfies Partial<Response>;
}

describe("admin api auth", () => {
  afterEach(() => {
    resetAuthStore();
    vi.restoreAllMocks();
  });

  it("stores access token from login response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        accessToken: "token-1",
        expiresIn: 900,
        user: {
          id: "admin_1",
          role: "super_admin",
          username: "admin"
        }
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    await loginAdmin({ password: "secret123", username: "admin" });

    expect(authStore.getAccessToken()).toBe("token-1");
    expect(authStore.getCurrentUser()).toEqual({
      id: "admin_1",
      role: "super_admin",
      username: "admin"
    });
  });

  it("refreshes and retries a protected request once after a 401", async () => {
    authStore.setSession({
      accessToken: "expired-token",
      user: {
        id: "admin_1",
        role: "super_admin",
        username: "admin"
      }
    });

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: "expired" }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          accessToken: "fresh-token",
          expiresIn: 900,
          user: {
            id: "admin_1",
            role: "super_admin",
            username: "admin"
          }
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, [{ id: "ord_1", quantity: 1, totalPriceSnapshot: 30000 }]));

    vi.stubGlobal("fetch", fetchMock);

    const orders = await getOrders();
    const firstCall = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const refreshCall = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const retryCall = fetchMock.mock.calls[2]?.[1] as RequestInit;

    expect(orders).toEqual([{ id: "ord_1", quantity: 1, totalPriceSnapshot: 30000 }]);
    expect(authStore.getAccessToken()).toBe("fresh-token");
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(expect.stringContaining("/admin/orders"));
    expect(firstCall.credentials).toBe("include");
    expect((firstCall.headers as Headers).get("Authorization")).toBe("Bearer expired-token");
    expect(fetchMock.mock.calls[1]?.[0]).toEqual(expect.stringContaining("/admin/auth/refresh"));
    expect(refreshCall.credentials).toBe("include");
    expect(refreshCall.method).toBe("POST");
    expect(fetchMock.mock.calls[2]?.[0]).toEqual(expect.stringContaining("/admin/orders"));
    expect(retryCall.credentials).toBe("include");
    expect((retryCall.headers as Headers).get("Authorization")).toBe("Bearer fresh-token");
  });
});
