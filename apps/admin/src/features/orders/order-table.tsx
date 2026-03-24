import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrencyVnd } from "@/lib/format";

type OrderRow = {
  id: string;
  quantity: number;
  telegramUsername?: string;
  totalPriceSnapshot: number;
};

export function OrderTable({ orders }: { orders: OrderRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Track recently created orders and drill into delivered account lines for audit.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Telegram user</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link href={`/orders/${order.id}`} aria-label={`View Order ${order.id}`} className="font-medium text-blue-700 hover:text-blue-800">
                      {order.id}
                    </Link>
                  </TableCell>
                  <TableCell>{order.telegramUsername ?? "unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.quantity}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrencyVnd(order.totalPriceSnapshot)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50 px-6 py-12 text-center">
            <p className="text-base font-medium text-slate-900">No orders yet</p>
            <p className="mt-2 text-sm text-slate-500">Orders will appear here after buyers complete the Telegram flow.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
