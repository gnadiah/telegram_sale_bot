export function parseQuantityInput(input: string, availableStock: number) {
  const quantity = Number(input);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > availableStock) {
    return {
      error: "So luong phai la so nguyen duong va khong vuot qua ton kho.",
      ok: false as const
    };
  }

  return {
    ok: true as const,
    quantity
  };
}
