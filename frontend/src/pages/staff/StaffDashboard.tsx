import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import { Reservation, ReservationStatus } from '@/types';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  UserCheck,
  LogOut,
  Filter,
} from 'lucide-react';

const STATUS_BADGE_MAP: Record<string, 'botanical' | 'saffron' | 'champagne' | 'terracotta' | 'neutral'> = {
  PENDING: 'champagne',
  CONFIRMED: 'botanical',
  SEATED: 'saffron',
  COMPLETED: 'neutral',
  CANCELLED: 'terracotta',
  NO_SHOW: 'terracotta',
};

type FilterStatus = ReservationStatus | 'ALL';

export function StaffDashboard() {
  const { t, resolveReservationStatus } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ['staff-reservations'],
    queryFn: () => apiRequest<Reservation[]>('/reservations'),
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      apiRequest<Reservation>(`/reservations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-reservations'] });
    },
  });

  const getTransitions = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING':
        return [
          { label: t.common.confirm, next: 'CONFIRMED' as ReservationStatus, icon: CheckCircle2, variant: 'primary' as const },
          { label: t.common.cancel, next: 'CANCELLED' as ReservationStatus, icon: XCircle, variant: 'danger' as const },
        ];
      case 'CONFIRMED':
        return [
          { label: resolveReservationStatus('SEATED'), next: 'SEATED' as ReservationStatus, icon: UserCheck, variant: 'primary' as const },
          { label: resolveReservationStatus('NO_SHOW'), next: 'NO_SHOW' as ReservationStatus, icon: XCircle, variant: 'danger' as const },
          { label: t.common.cancel, next: 'CANCELLED' as ReservationStatus, icon: XCircle, variant: 'danger' as const },
        ];
      case 'SEATED':
        return [
          { label: resolveReservationStatus('COMPLETED'), next: 'COMPLETED' as ReservationStatus, icon: LogOut, variant: 'primary' as const },
        ];
      default:
        return [];
    }
  };

  const filteredReservations = reservations?.filter(
    (res) => statusFilter === 'ALL' || res.status === statusFilter
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ivory flex items-center space-x-3 rtl:space-x-reverse">
            <Calendar className="w-8 h-8 text-champagne" />
            <span>{t.nav.staff}</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {t.admin.subtitle}
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-2 scrollbar-none bg-charcoal p-1.5 rounded-xl border border-champagne/15">
          <Filter className="w-4 h-4 text-stone-400 mx-1.5" />
          {(['ALL', 'PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'] as FilterStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-saffron text-white shadow-sm'
                    : 'text-stone-300 hover:text-ivory hover:bg-white/5'
                }`}
              >
                {status === 'ALL' ? t.menu.allCategories : resolveReservationStatus(status)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid of Reservations */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !filteredReservations || filteredReservations.length === 0 ? (
        <EmptyState
          title={t.bookings.noBookingsTitle}
          description={t.bookings.noBookingsDesc}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map((res) => {
            const transitions = getTransitions(res.status);
            return (
              <Card
                key={res.id}
                className="flex flex-col justify-between border-champagne/15 bg-charcoal hover:border-champagne/40 transition shadow-lg"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Header Info */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-serif font-bold text-lg text-ivory">
                        {t.common.table} {res.table?.table_number || 'Unassigned'}
                      </span>
                      <p className="text-xs text-stone-400 font-medium">
                        {res.customer?.full_name || 'Guest'}
                      </p>
                    </div>
                    <Badge variant={STATUS_BADGE_MAP[res.status] || 'neutral'}>
                      {resolveReservationStatus(res.status)}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-stone-300 font-mono">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <Calendar className="w-3.5 h-3.5 text-champagne" />
                      <span>{res.reservation_date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <Clock className="w-3.5 h-3.5 text-champagne" />
                      <span dir="ltr">
                        {res.start_time} – {res.end_time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <Users className="w-3.5 h-3.5 text-champagne" />
                      <span>{res.party_size} {t.common.guests}</span>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {res.special_requests && (
                    <div className="p-2.5 rounded-lg bg-midnight border border-champagne/15 text-[11px] text-stone-300 italic">
                      "{res.special_requests}"
                    </div>
                  )}
                </CardContent>

                {/* Status Action Buttons */}
                {transitions.length > 0 && (
                  <div className="p-4 bg-midnight/80 border-t border-champagne/15 flex flex-wrap gap-2">
                    {transitions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.next}
                          size="sm"
                          variant={action.variant}
                          loading={updateStatusMutation.isPending}
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: res.id,
                              status: action.next,
                            })
                          }
                          className="text-xs font-semibold flex-1"
                        >
                          <Icon className="w-3.5 h-3.5 mr-1 rtl:mr-0 rtl:ml-1" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
