import { describe, expect, it } from "vitest";
import { getQuantityPrompt, parseQuantityInput, renderSelectedProductMessage } from "../flows/quantity";

describe("quantity validation", () => {
  it("accepts integer quantity within stock", () => {
    expect(parseQuantityInput("2", 5)).toEqual({ ok: true, quantity: 2 });
  });

  it("rejects zero and non-integer values", () => {
    expect(parseQuantityInput("0", 5)).toEqual({
      error: "Số lượng phải là số nguyên dương và không được vượt quá tồn kho hiện có.",
      ok: false
    });
    expect(parseQuantityInput("1.5", 5)).toEqual({
      error: "Số lượng phải là số nguyên dương và không được vượt quá tồn kho hiện có.",
      ok: false
    });
  });

  it("does not allow quantity entry when a product is out of stock", () => {
    expect(getQuantityPrompt("GPT TEAM", 0)).toEqual({
      message: "Sản phẩm GPT TEAM hiện đã hết hàng. Vui lòng chọn sản phẩm khác hoặc làm mới danh sách.",
      ok: false
    });
  });

  it("shows a valid quantity prompt when stock is available", () => {
    expect(getQuantityPrompt("GPT PLUS 1T", 5)).toEqual({
      message: "Bạn đã chọn GPT PLUS 1T.\nVui lòng nhập số lượng từ 1 đến 5.",
      ok: true
    });
  });

  it("renders a richer selected-product summary with a cancel action cue", () => {
    const message = renderSelectedProductMessage({
      name: "GROK SUPER 1T 70K BHF",
      price: 70000,
      stock: 159
    });

    expect(message).toContain("✅ Bạn đã chọn sản phẩm:");
    expect(message).toContain("📦 GROK SUPER 1T 70K BHF");
    expect(message).toContain("💰 Giá: 70.000đ / tài khoản");
    expect(message).toContain("📦 Tồn kho: 159 tài khoản");
    expect(message).toContain("❌ Hủy chọn");
  });
});
