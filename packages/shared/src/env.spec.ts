import { describe, expect, it, vi } from "vitest";
import {
  ensureRelativeEnvFileLoaded,
  parsePositiveIntegerEnv,
  resolveFileRelativePath
} from "./env";

describe("shared env helpers", () => {
  it("parses positive integers with a fallback", () => {
    expect(parsePositiveIntegerEnv(undefined, "PORT", "8080")).toBe(8080);
    expect(parsePositiveIntegerEnv("9090", "PORT", "8080")).toBe(9090);
  });

  it("throws for invalid positive integer values", () => {
    expect(() => parsePositiveIntegerEnv("0", "PORT", "8080")).toThrow(/positive integer/i);
    expect(() => parsePositiveIntegerEnv("abc", "PORT", "8080")).toThrow(/positive integer/i);
  });

  it("resolves a relative path from a file URL", () => {
    expect(resolveFileRelativePath("file:///repo/apps/api/src/config/env.ts", "../../../../.env")).toBe(
      "/repo/.env"
    );
  });

  it("loads a relative env file once when not skipped", () => {
    const loadEnvFile = vi.fn();
    const state = { loaded: false };

    ensureRelativeEnvFileLoaded({
      currentFileUrl: "file:///repo/apps/api/src/config/env.ts",
      loadEnvFile,
      relativePath: "../../../../.env",
      state
    });

    expect(loadEnvFile).toHaveBeenCalledTimes(1);
    expect(loadEnvFile).toHaveBeenCalledWith("/repo/.env");
    expect(state.loaded).toBe(true);
  });
});
