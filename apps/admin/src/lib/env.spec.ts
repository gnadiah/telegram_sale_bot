import { afterEach, describe, expect, it } from "vitest";
import { getEnv, resetEnv } from "./env";

describe("admin env", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    resetEnv();
  });

  it("reads the public API base URL from env", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
    resetEnv();

    expect(getEnv().apiBaseUrl).toBe("https://api.example.test");
  });
});
