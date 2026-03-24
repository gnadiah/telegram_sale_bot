import { describe, expect, it } from "vitest";
import { renderCategoryMenu, renderProductMenu } from "../flows/catalog";

describe("catalog flow", () => {
  it("shows categories first", () => {
    const view = renderCategoryMenu([
      { id: "cat-1", name: "Chat GPT" },
      { id: "cat-2", name: "Claude" }
    ]);

    expect(view.text).toContain("🛍️ DANH MỤC SẢN PHẨM");
    expect(view.text).toContain("Vui lòng chọn nhóm sản phẩm bạn muốn xem");
    expect(view.buttons.map((button) => button.label)).toEqual([
      "📁 Chat GPT",
      "📁 Claude",
      "🔄 Làm mới",
      "🏠 Trang chủ"
    ]);
  });

  it("shows products in the selected category", () => {
    const view = renderProductMenu("Chat GPT", [
      { id: "prod-1", name: "GPT PLUS 1T", price: 30000, stock: 5 },
      { id: "prod-2", name: "GPT TEAM", price: 50000, stock: 0 }
    ]);

    expect(view.text).toContain("Chat GPT");
    expect(view.text).toContain("Chọn gói phù hợp với nhu cầu của bạn");
    expect(view.text).toContain("👤 GPT PLUS 1T • 30.000đ • 📦 Còn 5");
    expect(view.text).toContain("👤 GPT TEAM • 50.000đ • 📦 Hết hàng");
    expect(view.buttons.map((button) => button.label)).toEqual([
      "👤 GPT PLUS 1T",
      "🚫 GPT TEAM",
      "⬅️ Quay lại",
      "🔄 Làm mới",
      "🏠 Trang chủ"
    ]);
  });
});
