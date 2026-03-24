"use client";

import { useEffect, useState } from "react";
import { OrderTable } from "../../../features/orders/order-table";
import { getOrders } from "../../../lib/api";

type OrderRow = {
  id: string;
  quantity: number;
  telegramUsername?: string;
  totalPriceSnapshot: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    void getOrders().then(setOrders);
  }, []);

  return <OrderTable orders={orders} />;
}
