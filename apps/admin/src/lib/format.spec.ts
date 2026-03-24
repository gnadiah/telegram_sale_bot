import { describe, expect, it } from "vitest";
import { formatCurrencyVnd } from "./format";

describe("formatCurrencyVnd", () => {
  it("formats numbers as Vietnamese currency strings", () => {
    expect(formatCurrencyVnd(30000)).toBe("30.000 đ");
    expect(formatCurrencyVnd(160000)).toBe("160.000 đ");
  });
});
