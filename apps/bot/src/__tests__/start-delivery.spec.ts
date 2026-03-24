import { describe, expect, it } from "vitest";
import { renderDeliverySuccess } from "../flows/delivery";
import { renderStartMessage } from "../flows/start";

describe("start and delivery copy", () => {
  it("renders a polished Vietnamese start message", () => {
    const view = renderStartMessage();

    expect(view.buttons[0]?.label).toBe("🛍️ Xem sản phẩm");
    expect(view.text).toContain("✨ Chào mừng bạn đến với cửa hàng tự động");
    expect(view.text).toContain("nhận hàng ngay trong Telegram");
  });

  it("renders a more reassuring delivery success message", () => {
    expect(renderDeliverySuccess("order-123.txt")).toContain("Đơn hàng đã được xử lý thành công");
    expect(renderDeliverySuccess("order-123.txt")).toContain("order-123.txt");
  });
});
