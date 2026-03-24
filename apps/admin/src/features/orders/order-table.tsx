type OrderRow = {
  id: string;
  quantity: number;
  telegramUsername?: string;
  totalPriceSnapshot: number;
};

export function OrderTable({ orders }: { orders: OrderRow[] }) {
  return (
    <table>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>
              <a href={`/orders/${order.id}`} aria-label={`View Order ${order.id}`}>
                {order.id}
              </a>
            </td>
            <td>{order.telegramUsername ?? "unknown"}</td>
            <td>{order.quantity}</td>
            <td>{order.totalPriceSnapshot}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
