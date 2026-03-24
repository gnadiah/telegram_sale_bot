import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyVnd } from "@/lib/format";

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
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Order {order.id}</CardTitle>
          <CardDescription>Snapshot of the order at the moment of delivery.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Telegram user</p>
            <p className="mt-1 text-base text-slate-950">{order.telegramUsername ?? "unknown"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quantity</p>
            <p className="mt-1 text-base text-slate-950">{order.quantity}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="mt-1 text-base text-slate-950">{formatCurrencyVnd(order.totalPriceSnapshot)}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delivered items</CardTitle>
          <CardDescription>Exact lines delivered to the buyer for audit and support handling.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li
                key={`${order.id}-${index}`}
                className="rounded-2xl border border-border bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
