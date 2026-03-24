"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StatusPanel } from "@/components/admin/status-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
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
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [order, setOrder] = useState<OrderDetailShape | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setOrder(await getOrderDetail(params.id));
      return true;
    } catch {
      setErrorMessage("We could not load this order right now. Try again in a moment.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [params.id]);

  async function retryRefresh() {
    const didLoad = await refresh();

    if (didLoad) {
      toast({
        description: "The order detail has been refreshed.",
        title: "Order loaded",
        variant: "success"
      });
      return;
    }

    toast({
      description: "We still could not load this order. Please try again.",
      title: "Retry failed",
      variant: "error"
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={order ? `Order ${order.id}` : "Order detail"}
        description="Audit the buyer information, quantity snapshot, and the exact lines delivered to this order."
      />
      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-soft">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      ) : errorMessage ? (
        <StatusPanel
          tone="error"
          title="Order detail is temporarily unavailable"
          description={errorMessage}
          actionLabel="Retry"
          onAction={() => {
            void retryRefresh();
          }}
        />
      ) : order ? (
        <OrderDetail order={order} />
      ) : null}
    </section>
  );
}
