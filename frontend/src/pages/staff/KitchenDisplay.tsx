import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Order, OrderStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  ChefHat,
  Clock,
  ArrowRight,
  CheckCircle2,
  Timer,
} from 'lucide-react';

const ORDER_STATUS_FLOW: { status: OrderStatus; label: string; next: OrderStatus | null }[] = [
  { status: 'PENDING', label: 'Start Preparing', next: 'PREPARING' },
  { status: 'PREPARING', label: 'Mark Ready', next: 'READY' },
  { status: 'READY', label: 'Mark Served', next: 'SERVED' },
  { status: 'SERVED', label: 'Mark Paid', next: 'PAID' },
  { status: 'PAID', label: '', next: null },
];

const STATUS_BADGE_MAP: Record<string, 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'slate'> = {
  PENDING: 'slate',
  PREPARING: 'amber',
  READY: 'blue',
  SERVED: 'purple',
  PAID: 'emerald',
  CANCELLED: 'rose',
};

export function KitchenDisplay() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['kitchen-orders'],
    queryFn: () => apiRequest<Order[]>('/orders'),
    refetchInterval: 10000, // Auto-refresh every 10 seconds for live KDS
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      apiRequest<Order>(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    },
  });

  // Group orders by status for Kanban-style columns
  const activeOrders = orders?.filter((o) => o.status !== 'PAID' && o.status !== 'CANCELLED') || [];
  const pendingOrders = activeOrders.filter((o) => o.status === 'PENDING');
  const preparingOrders = activeOrders.filter((o) => o.status === 'PREPARING');
  const readyOrders = activeOrders.filter((o) => o.status === 'READY');
  const servedOrders = activeOrders.filter((o) => o.status === 'SERVED');

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow = ORDER_STATUS_FLOW.find((f) => f.status === currentStatus);
    return flow?.next || null;
  };

  const getNextLabel = (currentStatus: OrderStatus): string => {
    const flow = ORDER_STATUS_FLOW.find((f) => f.status === currentStatus);
    return flow?.label || '';
  };

  const renderOrderCard = (order: Order) => {
    const nextStatus = getNextStatus(order.status as OrderStatus);
    const nextLabel = getNextLabel(order.status as OrderStatus);
    const createdAt = new Date(order.created_at);
    const minutesAgo = Math.floor((Date.now() - createdAt.getTime()) / 60000);

    return (
      <Card key={order.id} className="border-l-4 border-l-amber-500/50">
        <CardContent className="p-4 space-y-3">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-amber-400 text-sm">
              {order.order_number}
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant={STATUS_BADGE_MAP[order.status] || 'slate'}>
                {order.status}
              </Badge>
              <span className="text-xs text-slate-500 font-mono flex items-center space-x-1">
                <Timer className="w-3 h-3" />
                <span>{minutesAgo}m ago</span>
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-1.5 border-t border-slate-800 pt-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-200 font-medium">
                  <span className="text-amber-400 font-mono font-bold mr-2">
                    {item.quantity}×
                  </span>
                  {item.menu_item?.name || 'Dish'}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between text-xs font-mono border-t border-slate-800/60 pt-2 text-slate-400">
            <span>Total:</span>
            <span className="text-slate-200 font-bold">
              ${Number(order.total_amount).toFixed(2)}
            </span>
          </div>

          {/* Action Button */}
          {nextStatus && (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              loading={updateStatusMutation.isPending}
              onClick={() =>
                updateStatusMutation.mutate({
                  id: order.id,
                  status: nextStatus,
                })
              }
            >
              {nextLabel} <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderColumn = (
    title: string,
    items: Order[],
    color: string,
    icon: typeof ChefHat
  ) => {
    const Icon = icon;
    return (
      <div className="space-y-3">
        <div className={`flex items-center space-x-2 pb-2 border-b ${color}`}>
          <Icon className="w-5 h-5" />
          <h2 className="font-bold text-sm uppercase tracking-wider">
            {title}
          </h2>
          <span className="ml-auto text-xs font-mono bg-slate-800 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        {items.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4 font-light">
            No orders
          </p>
        ) : (
          items.map(renderOrderCard)
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-3">
            <ChefHat className="w-8 h-8 text-amber-400" />
            <span>Kitchen Display System</span>
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">
            Live order queue — auto-refreshing every 10 seconds
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-500">
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            ● LIVE
          </span>
          <span>{activeOrders.length} Active Orders</span>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : activeOrders.length === 0 ? (
        <EmptyState
          title="Kitchen is Clear"
          description="No active orders in the queue. New orders will appear here automatically."
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {renderColumn('Pending', pendingOrders, 'border-slate-700 text-slate-400', Clock)}
          {renderColumn('Preparing', preparingOrders, 'border-amber-500/50 text-amber-400', ChefHat)}
          {renderColumn('Ready', readyOrders, 'border-blue-500/50 text-blue-400', CheckCircle2)}
          {renderColumn('Served', servedOrders, 'border-purple-500/50 text-purple-400', ArrowRight)}
        </div>
      )}
    </div>
  );
}
