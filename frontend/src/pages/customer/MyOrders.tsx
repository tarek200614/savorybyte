import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Order } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { ShoppingBag, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MyOrders() {
  const { t, getDish, resolveOrderStatus, formatPrice } = useTranslation();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: () => apiRequest<Order[]>('/orders/my-orders'),
  });

  const getStatusBadge = (status: string) => {
    const label = resolveOrderStatus(status);
    switch (status) {
      case 'PENDING':
        return <Badge variant="champagne">{label}</Badge>;
      case 'PREPARING':
        return <Badge variant="saffron">{label}</Badge>;
      case 'READY':
        return <Badge variant="champagne">{label}</Badge>;
      case 'SERVED':
        return <Badge variant="botanical">{label}</Badge>;
      case 'PAID':
        return <Badge variant="neutral">{label}</Badge>;
      case 'CANCELLED':
        return <Badge variant="terracotta">{label}</Badge>;
      default:
        return <Badge variant="neutral">{label}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-ivory flex items-center space-x-3 rtl:space-x-reverse">
          <ShoppingBag className="w-8 h-8 text-champagne" />
          <span>{t.orders.title}</span>
        </h1>
        <Link to="/menu">
          <Button variant="primary" size="sm" className="font-semibold shadow-md shadow-saffron/20">
            {t.orders.orderMenuBtn}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          title={t.orders.noOrdersTitle}
          description={t.orders.noOrdersDesc}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-champagne/15 bg-charcoal shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-champagne/15 pb-3">
                  <div>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="font-mono font-bold text-base text-champagne">
                        #{order.order_number}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-stone-400 font-mono mt-1">
                      {order.table_id ? `${t.orders.table} ${order.table?.table_number || ''}` : t.orders.takeout}
                    </p>
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="text-lg font-bold font-mono text-ivory" dir="ltr">
                      {formatPrice(order.total_amount)}
                    </span>
                    <p className="text-[11px] text-stone-400 flex items-center justify-end rtl:justify-start space-x-1 rtl:space-x-reverse mt-0.5">
                      <Clock className="w-3 h-3 text-champagne" />
                      <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider font-mono">
                    {t.orders.orderSummary}
                  </h4>
                  <div className="divide-y divide-champagne/10">
                    {order.items.map((item) => {
                      const dishName = item.menu_item?.name || 'Dish';
                      const dishDesc = item.menu_item?.description || '';
                      const dishTrans = getDish(dishName, dishDesc);
                      const unitPrice = item.unit_price ?? (item.subtotal && item.quantity ? item.subtotal / item.quantity : 0);
                      return (
                        <div
                          key={item.id}
                          className="py-2 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="font-mono font-bold text-stone-200 bg-midnight px-2 py-0.5 rounded border border-champagne/15">
                              {item.quantity}x
                            </span>
                            <span className="text-stone-200 font-medium">
                              {dishTrans.name}
                            </span>
                            {item.item_notes && (
                              <span className="text-stone-400 italic text-[11px]">
                                ({item.item_notes})
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-champagne" dir="ltr">
                            {formatPrice(Number(unitPrice) * item.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
