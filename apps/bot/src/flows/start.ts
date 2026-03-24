import { HOME_BUTTON } from "../keyboards/navigation";

export function renderStartMessage() {
  return {
    buttons: [{ ...HOME_BUTTON, label: "🛍️ Xem sản phẩm" }],
    text: [
      "✨ Chào mừng bạn đến với cửa hàng tự động.",
      "Bạn có thể xem danh mục, chọn sản phẩm phù hợp và nhận hàng ngay trong Telegram.",
      "Nhấn “Xem sản phẩm” để bắt đầu."
    ].join("\n")
  };
}
