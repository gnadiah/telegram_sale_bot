type OrderDetailProps = {
  order: {
    id: string;
    items: string[];
    quantity: number;
    telegramUsername?: string;
    totalPriceSnapshot: number;
  };
};

export function OrderDetail({ order }: OrderDetailProps) {
  return (
    <section>
      <h2>Order {order.id}</h2>
      <p>User: {order.telegramUsername ?? "unknown"}</p>
      <p>Quantity: {order.quantity}</p>
      <p>Total: {order.totalPriceSnapshot}</p>
      <ul>
        {order.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
