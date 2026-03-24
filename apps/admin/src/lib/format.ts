const currencyFormatter = new Intl.NumberFormat("vi-VN");

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatCurrencyVnd(value: number) {
  return `${formatCurrency(value)} đ`;
}
