import { BACK_BUTTON, HOME_BUTTON, REFRESH_BUTTON } from "../keyboards/navigation";

type CategoryViewInput = {
  id: string;
  name: string;
};

type ProductViewInput = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export function renderCategoryMenu(categories: CategoryViewInput[]) {
  return {
    buttons: [
      ...categories.map((category) => ({
        action: `category:${category.id}`,
        label: `📁 ${category.name}`
      })),
      { ...REFRESH_BUTTON, action: "refresh:categories" },
      HOME_BUTTON
    ],
    text: "🛍️ DANH MỤC SẢN PHẨM\nVui lòng chọn nhóm sản phẩm bạn muốn xem:"
  };
}

export function renderProductMenu(categoryName: string, products: ProductViewInput[]) {
  return {
    buttons: [
      ...products.map((product) => ({
        action: `product:${product.id}`,
        label: product.stock > 0 ? `👤 ${product.name}` : `🚫 ${product.name}`
      })),
      { ...BACK_BUTTON, action: "back:categories" },
      { ...REFRESH_BUTTON, action: "refresh:products" },
      HOME_BUTTON
    ],
    text: [`${categoryName}`, "Chọn gói phù hợp với nhu cầu của bạn:", "", ...products.map(formatProductLine)].join(
      "\n"
    )
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

function formatProductLine(product: ProductViewInput) {
  const stockText = product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng";

  return `👤 ${product.name} • ${formatCurrency(product.price)}đ • 📦 ${stockText}`;
}
