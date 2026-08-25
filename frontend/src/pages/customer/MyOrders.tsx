import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Order } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { ShoppingBag, Clock } from 'lucide-react';

export function MyOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => apiRequest<Order[]>('/orders/my-orders'),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="emerald">PAID</Badge>;
      case 'SERVED':
        return <Badge variant="purple">SERVED</Badge>;
      case 'READY':
        return <Badge variant="blue">READY</Badge>;
      case 'PREPARING':
        return <Badge variant="amber">PREPARING</Badge>;
      case 'PENDING':
        return <Badge variant="amber">PENDING</Badge>;
      default:
        return <Badge variant="rose">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
          <ShoppingBag className="w-8 h-8 text-amber-400" />
          <span>My Food Orders</span>
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="You haven't placed any food or drink orders yet."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono font-bold text-lg text-amber-400">
                      {order.order_number}
                    </span>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(order.created_at).toLocaleString()}</span>
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm font-mono text-slate-300"
                    >
                      <span>
                        {item.quantity}x {item.menu_item?.name || 'Dish'}
                      </span>
                      <span>${Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 font-mono text-sm">
                  <span className="text-slate-400 font-bold">Total Paid:</span>
                  <span className="text-lg font-bold text-slate-100">
                    ${Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
