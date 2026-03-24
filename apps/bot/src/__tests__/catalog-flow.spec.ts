import { describe, expect, it } from "vitest";
import { renderCategoryMenu, renderProductMenu } from "../flows/catalog";

describe("catalog flow", () => {
  it("shows categories first", () => {
    const view = renderCategoryMenu([
      { id: "cat-1", name: "Chat GPT" },
      { id: "cat-2", name: "Claude" }
    ]);

    expect(view.text).toContain("DANH MUC SAN PHAM");
    expect(view.buttons.map((button) => button.label)).toEqual([
      "Chat GPT",
      "Claude",
      "Lam moi",
      "Trang chu"
    ]);
  });

  it("shows products in the selected category", () => {
    const view = renderProductMenu("Chat GPT", [
      { id: "prod-1", name: "GPT PLUS 1T", price: 30000, stock: 5 },
      { id: "prod-2", name: "GPT TEAM", price: 50000, stock: 0 }
    ]);

    expect(view.text).toContain("Chat GPT");
    expect(view.text).toContain("GPT PLUS 1T - 30.000d - ton 5");
    expect(view.text).toContain("GPT TEAM - 50.000d - ton 0");
    expect(view.buttons.map((button) => button.label)).toEqual([
      "GPT PLUS 1T",
      "GPT TEAM",
      "Quay lai",
      "Lam moi",
      "Trang chu"
    ]);
  });
});
