import { describe, expect, it } from "vitest";
import { parseQuantityInput } from "../flows/quantity";

describe("quantity validation", () => {
  it("accepts integer quantity within stock", () => {
    expect(parseQuantityInput("2", 5)).toEqual({ ok: true, quantity: 2 });
  });

  it("rejects zero and non-integer values", () => {
    expect(parseQuantityInput("0", 5)).toEqual({
      error: "So luong phai la so nguyen duong va khong vuot qua ton kho.",
      ok: false
    });
    expect(parseQuantityInput("1.5", 5)).toEqual({
      error: "So luong phai la so nguyen duong va khong vuot qua ton kho.",
      ok: false
    });
  });
});
