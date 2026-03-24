export function renderDeliverySuccess(filename: string) {
  return [
    "Đơn hàng đã được xử lý thành công.",
    `Tệp giao hàng ${filename} đã được gửi trong cuộc trò chuyện này.`,
    "Nếu cần mua thêm, bạn có thể quay lại menu để tiếp tục chọn sản phẩm."
  ].join("\n");
}
