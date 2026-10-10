import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Order, OrderStatus, RestaurantTable } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  ChefHat,
  Clock,
  ArrowRight,
  Timer,
  AlertTriangle,
  Flame,
} from 'lucide-react';

const STATUS_BADGE_MAP: Record<string, 'botanical' | 'saffron' | 'champagne' | 'terracotta' | 'neutral'> = {
  PENDING: 'neutral',
  PREPARING: 'saffron',
  READY: 'champagne',
  SERVED: 'botanical',
  PAID: 'botanical',
  CANCELLED: 'terracotta',
};

function formatElapsedTime(createdAt: string, now: number): { text: string; minutes: number; urgency: 'calm' | 'warning' | 'critical' } {
  const elapsedMs = Math.max(0, now - new Date(createdAt).getTime());
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  let urgency: 'calm' | 'warning' | 'critical' = 'calm';
  if (minutes >= 15) {
    urgency = 'critical';
  } else if (minutes >= 5) {
    urgency = 'warning';
  }

  return { text: formatted, minutes, urgency };
}

export function KitchenDisplay() {
  const { t, getDish, formatPrice } = useTranslation();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update clock every second for live ticket elapsed timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['kitchen-orders'],
    queryFn: () => apiRequest<Order[]>('/orders'),
    refetchInterval: 10000, // Auto-refresh every 10 seconds for live KDS
  });

  const { data: tables } = useQuery<RestaurantTable[]>({
    queryKey: ['tables'],
    queryFn: () => apiRequest<RestaurantTable[]>('/tables'),
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

  const getNextAction = (status: OrderStatus): { label: string; next: OrderStatus } | null => {
    switch (status) {
      case 'PENDING':
        return { label: t.kds.startPrepBtn, next: 'PREPARING' };
      case 'PREPARING':
        return { label: t.kds.markReadyBtn, next: 'READY' };
      case 'READY':
        return { label: t.kds.markServedBtn, next: 'SERVED' };
      case 'SERVED':
        return { label: t.kds.markPaidBtn, next: 'PAID' };
      default:
        return null;
    }
  };

  const renderColumn = (title: string, list: Order[], statusKey: OrderStatus, accentColor: string) => (
    <div className="flex flex-col bg-charcoal rounded-2xl border border-champagne/15 overflow-hidden shadow-xl">
      {/* Column Header */}
      <div className="p-4 border-b border-champagne/15 flex items-center justify-between bg-midnight/80">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className={`w-2.5 h-2.5 rounded-full ${accentColor}`} />
          <h3 className="font-mono font-bold text-sm text-ivory tracking-wider">{title}</h3>
        </div>
        <Badge variant={STATUS_BADGE_MAP[statusKey] || 'neutral'} className="font-mono text-xs">
          {list.length}
        </Badge>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-250px)]">
        {list.length === 0 ? (
          <div className="text-center py-8 text-stone-500 font-mono text-xs">
            {t.kds.noTickets}
          </div>
        ) : (
          list.map((order) => {
            const nextAction = getNextAction(order.status);
            const assignedTable = tables?.find((t) => t.id === order.table_id);
            const elapsed = formatElapsedTime(order.created_at, currentTime);

            // Urgency border styles
            const borderStyle =
              elapsed.urgency === 'critical'
                ? 'border-terracotta ring-1 ring-terracotta/40 bg-midnight'
                : elapsed.urgency === 'warning'
                ? 'border-saffron/60 ring-1 ring-saffron/20 bg-midnight'
                : 'border-champagne/15 bg-midnight';

            return (
              <Card
                key={order.id}
                className={`transition shadow-md ${borderStyle}`}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Order Head & Live Elapsed Timer */}
                  <div className="flex items-center justify-between border-b border-champagne/15 pb-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="font-mono font-bold text-sm text-champagne">
                        #{order.order_number}
                      </span>
                      {elapsed.urgency === 'critical' && (
                        <span className="inline-flex items-center text-[10px] font-mono font-bold text-terracotta-light bg-terracotta/20 px-1.5 py-0.5 rounded border border-terracotta/40 animate-pulse">
                          <Flame className="w-3 h-3 mr-0.5 rtl:mr-0 rtl:ml-0.5 text-terracotta" /> {t.kds.over15m}
                        </span>
                      )}
                      {elapsed.urgency === 'warning' && (
                        <span className="inline-flex items-center text-[10px] font-mono font-bold text-saffron bg-saffron/20 px-1.5 py-0.5 rounded border border-saffron/40">
                          <AlertTriangle className="w-3 h-3 mr-0.5 rtl:mr-0 rtl:ml-0.5 text-saffron" /> {t.kds.over5m}
                        </span>
                      )}
                    </div>
                    <span className="font-serif font-bold text-xs text-ivory bg-charcoal px-2 py-0.5 rounded-md border border-champagne/20">
                      {assignedTable ? `${t.kds.table} ${assignedTable.table_number}` : (order.table_id ? t.kds.dineIn : t.kds.takeout)}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 font-mono text-xs">
                    {order.items.map((item) => {
                      const itemTrans = getDish(item.menu_item?.name || 'Dish');
                      return (
                        <div key={item.id} className="flex justify-between text-stone-200">
                          <span className="font-bold text-saffron mr-2 rtl:mr-0 rtl:ml-2">
                            {item.quantity}x
                          </span>
                          <span className="flex-1 text-stone-300">
                            {itemTrans.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="p-2 rounded bg-charcoal text-[11px] text-champagne/90 italic font-mono border border-champagne/15">
                      {t.kds.note}: {order.notes}
                    </div>
                  )}

                  {/* Time & Total with Live Elapsed Counter */}
                  <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="flex items-center space-x-1 rtl:space-x-reverse text-stone-400">
                        <Clock className="w-3 h-3 text-champagne" />
                        <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          elapsed.urgency === 'critical'
                            ? 'bg-terracotta/30 text-terracotta-light border border-terracotta/40'
                            : elapsed.urgency === 'warning'
                            ? 'bg-saffron/30 text-saffron-light border border-saffron/40'
                            : 'bg-charcoal text-stone-300 border border-white/10'
                        }`}
                        dir="ltr"
                      >
                        ⏱ {elapsed.text}
                      </span>
                    </div>
                    <span className="font-bold text-ivory" dir="ltr">{formatPrice(order.total_amount)}</span>
                  </div>

                  {/* Progress Button */}
                  {nextAction && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full text-xs font-semibold mt-2 shadow-md shadow-saffron/20"
                      loading={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: order.id,
                          status: nextAction.next,
                        })
                      }
                    >
                      <span>{nextAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 rtl:ml-0 rtl:mr-1.5 rtl:rotate-180" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-champagne/15 pb-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-midnight border border-champagne/30 flex items-center justify-center text-champagne">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-ivory">
              {t.kds.title}
            </h1>
            <p className="text-xs text-stone-400 font-mono">
              {t.kds.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs font-mono text-stone-400 bg-charcoal px-3 py-1.5 rounded-xl border border-champagne/15">
          <Timer className="w-4 h-4 text-champagne animate-pulse" />
          <span>{t.kds.liveSync}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        /* 4-Column Kanban Pipeline */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderColumn(t.kds.pendingCol, pendingOrders, 'PENDING', 'bg-stone-400')}
          {renderColumn(t.kds.preparingCol, preparingOrders, 'PREPARING', 'bg-saffron animate-pulse')}
          {renderColumn(t.kds.readyCol, readyOrders, 'READY', 'bg-champagne')}
          {renderColumn(t.kds.servedCol, servedOrders, 'SERVED', 'bg-botanical')}
        </div>
      )}
    </div>
  );
}
