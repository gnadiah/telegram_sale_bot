"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OrderDetail } from "../../../../features/orders/order-detail";
import { getOrderDetail } from "../../../../lib/api";

type OrderDetailShape = {
  id: string;
  items: string[];
  quantity: number;
  telegramUsername?: string;
  totalPriceSnapshot: number;
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetailShape | null>(null);

  useEffect(() => {
    void getOrderDetail(params.id).then(setOrder);
  }, [params.id]);

  if (!order) {
    return <p>Loading...</p>;
  }

  return <OrderDetail order={order} />;
}
