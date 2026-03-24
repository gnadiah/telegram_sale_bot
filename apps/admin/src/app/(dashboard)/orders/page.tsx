"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPanel } from "@/components/admin/status-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { OrderTable } from "../../../features/orders/order-table";
import { getOrders } from "../../../lib/api";

type OrderRow = {
  id: string;
  quantity: number;
  telegramUsername?: string;
  totalPriceSnapshot: number;
};

export default function OrdersPage() {
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setOrders(await getOrders());
      return true;
    } catch {
      setErrorMessage("We could not load the order feed right now. Try again in a moment.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function retryRefresh() {
    const didLoad = await refresh();

    if (didLoad) {
      toast({
        description: "Order data has been refreshed.",
        title: "Orders loaded",
        variant: "success"
      });
      return;
    }

    toast({
      description: "We still could not load the order feed. Please try again.",
      title: "Retry failed",
      variant: "error"
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Orders"
        description="Review recent orders and jump into detail pages to inspect the exact delivered account lines."
      />
      {isLoading ? (
        <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : errorMessage ? (
        <StatusPanel
          tone="error"
          title="Orders are temporarily unavailable"
          description={errorMessage}
          actionLabel="Retry"
          onAction={() => {
            void retryRefresh();
          }}
        />
      ) : (
        <OrderTable orders={orders} />
      )}
    </section>
  );
}
