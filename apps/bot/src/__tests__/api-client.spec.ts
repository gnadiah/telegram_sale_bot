import { afterEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "../api/client";

const env = {
  apiBaseUrl: "http://localhost:8080",
  botApiToken: "bot-secret",
  telegramBotToken: "123456:AA_validToken_12345"
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("bot api client", () => {
  it("includes endpoint, status, and body context in HTTP failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: vi.fn().mockResolvedValue('{"message":"Invalid bot token"}')
      })
    );

    const apiClient = createApiClient(env);

    await expect(apiClient.getCategories()).rejects.toThrow(
      "BOT_CATEGORIES_FAILED GET /bot/categories -> 401 {\"message\":\"Invalid bot token\"}"
    );
  });

  it("includes endpoint context in network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ETIMEDOUT")));

    const apiClient = createApiClient(env);

    await expect(apiClient.getProducts("cat_1")).rejects.toThrow(
      "BOT_PRODUCTS_FAILED GET /bot/categories/cat_1/products -> network error: ETIMEDOUT"
    );
  });
});
