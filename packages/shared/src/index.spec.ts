import { describe, expect, it } from "vitest";
import { appName } from "./index";

describe("shared exports", () => {
  it("exports app metadata", () => {
    expect(appName).toBe("telegram-sale-bot");
  });
});
