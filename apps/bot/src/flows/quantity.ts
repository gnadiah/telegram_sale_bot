export function getQuantityPrompt(productName: string, availableStock: number) {
  if (availableStock < 1) {
    return {
      message: `Sản phẩm ${productName} hiện đã hết hàng. Vui lòng chọn sản phẩm khác hoặc làm mới danh sách.`,
      ok: false as const
    };
  }

  return {
    message: `Bạn đã chọn ${productName}.\nVui lòng nhập số lượng từ 1 đến ${availableStock}.`,
    ok: true as const
  };
}

export function renderSelectedProductMessage(input: { name: string; price: number; stock: number }) {
  return [
    "✅ Bạn đã chọn sản phẩm:",
    `📦 ${input.name}`,
    `💰 Giá: ${formatCurrency(input.price)}đ / tài khoản`,
    `📦 Tồn kho: ${input.stock} tài khoản`,
    "",
    `👉 Nhập số lượng bạn muốn mua (từ 1 đến ${input.stock}).`,
    "Hoặc bấm ❌ Hủy chọn để chọn sản phẩm khác."
  ].join("\n");
}

export function parseQuantityInput(input: string, availableStock: number) {
  const quantity = Number(input);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > availableStock) {
    return {
      error: "Số lượng phải là số nguyên dương và không được vượt quá tồn kho hiện có.",
      ok: false as const
    };
  }

  return {
    ok: true as const,
    quantity
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount);
}
